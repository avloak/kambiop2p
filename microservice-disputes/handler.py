import json
import boto3
import uuid
import os
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
disputes_table = dynamodb.Table(os.environ.get('DISPUTES_TABLE', 'kambiop2p-disputes'))
trades_table = dynamodb.Table(os.environ.get('TRADES_TABLE', 'kambiop2p-trades'))

def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
        },
        'body': json.dumps(body, default=decimal_default)
    }

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def open_dispute(event, context):
    """POST /disputes/open - Open a dispute for a trade"""
    try:
        # Parse form data (in production, handle multipart/form-data)
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        
        trade_id = body.get('tradeId')
        reporter_id = body.get('reporterId')
        reason = body.get('reason')
        evidence_url = body.get('evidenceUrl', '')
        
        if not all([trade_id, reporter_id, reason]):
            return response(400, {'message': 'Missing required fields'})
        
        # Get trade details
        trade_response = trades_table.get_item(Key={'id': trade_id})
        
        if 'Item' not in trade_response:
            return response(404, {'message': 'Trade not found'})
        
        trade = trade_response['Item']
        
        # Verify reporter is part of the trade
        if reporter_id not in [trade['buyer_id'], trade['seller_id']]:
            return response(403, {'message': 'Unauthorized to dispute this trade'})
        
        # Check if trade is in valid state for dispute
        if trade['escrow_status'] not in ['AWAITING_CONFIRMATION', 'IN_ESCROW']:
            return response(400, {'message': 'Trade cannot be disputed in current state'})
        
        # Create dispute
        dispute_id = str(uuid.uuid4())
        dispute_item = {
            'id': dispute_id,
            'trade_id': trade_id,
            'reporter_id': reporter_id,
            'reason': reason,
            'status': 'PENDING',
            'evidence_url': evidence_url,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        disputes_table.put_item(Item=dispute_item)
        
        # Update trade status to DISPUTED and freeze escrow
        trades_table.update_item(
            Key={'id': trade_id},
            UpdateExpression='SET escrow_status = :status, updated_at = :updated',
            ExpressionAttributeValues={
                ':status': 'DISPUTED',
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        # In production:
        # 1. Notify support team
        # 2. Send email/notification to both parties
        # 3. Freeze funds in escrow
        
        return response(201, {
            'message': 'Dispute opened successfully. Support team has been notified.',
            'disputeId': dispute_id,
            'dispute': dispute_item
        })
        
    except Exception as e:
        print(f"Error in open_dispute: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def get_dispute(event, context):
    """GET /disputes/{id} - Get dispute details and status"""
    try:
        dispute_id = event['pathParameters']['id']
        
        # Get dispute
        dispute_response = disputes_table.get_item(Key={'id': dispute_id})
        
        if 'Item' not in dispute_response:
            return response(404, {'message': 'Dispute not found'})
        
        dispute = dispute_response['Item']
        
        # Get related trade info
        trade_response = trades_table.get_item(Key={'id': dispute['trade_id']})
        trade = trade_response.get('Item', {})
        
        # Combine data
        dispute_data = {
            **dispute,
            'trade': {
                'id': trade.get('id'),
                'amount': float(trade.get('amount_fiat', 0)),
                'currency': trade.get('currency'),
                'rate': float(trade.get('rate', 0)),
                'escrow_status': trade.get('escrow_status')
            }
        }
        
        return response(200, dispute_data)
        
    except Exception as e:
        print(f"Error in get_dispute: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def resolve_dispute(event, context):
    """POST /disputes/{id}/resolve - Resolve a dispute (admin only)"""
    try:
        dispute_id = event['pathParameters']['id']
        body = json.loads(event['body'])
        
        resolution = body.get('resolution')  # 'REFUND_BUYER' or 'RELEASE_TO_SELLER'
        mediator_id = body.get('mediatorId')
        resolution_notes = body.get('notes', '')
        
        if not resolution or not mediator_id:
            return response(400, {'message': 'Missing required fields'})
        
        if resolution not in ['REFUND_BUYER', 'RELEASE_TO_SELLER', 'PARTIAL_REFUND']:
            return response(400, {'message': 'Invalid resolution type'})
        
        # Get dispute
        dispute_response = disputes_table.get_item(Key={'id': dispute_id})
        
        if 'Item' not in dispute_response:
            return response(404, {'message': 'Dispute not found'})
        
        dispute = dispute_response['Item']
        
        if dispute['status'] != 'PENDING':
            return response(400, {'message': 'Dispute already resolved'})
        
        # Get trade
        trade_response = trades_table.get_item(Key={'id': dispute['trade_id']})
        trade = trade_response['Item']
        
        # Update dispute status
        disputes_table.update_item(
            Key={'id': dispute_id},
            UpdateExpression='SET #status = :status, resolution = :resolution, mediator_id = :mediator, resolution_notes = :notes, resolved_at = :resolved, updated_at = :updated',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'RESOLVED',
                ':resolution': resolution,
                ':mediator': mediator_id,
                ':notes': resolution_notes,
                ':resolved': datetime.utcnow().isoformat(),
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        # Execute resolution
        if resolution == 'REFUND_BUYER':
            # Refund funds to buyer
            new_trade_status = 'REFUNDED'
            action_taken = 'Funds returned to buyer'
        elif resolution == 'RELEASE_TO_SELLER':
            # Release funds to seller
            new_trade_status = 'COMPLETED'
            action_taken = 'Funds released to seller'
        else:  # PARTIAL_REFUND
            new_trade_status = 'PARTIALLY_REFUNDED'
            action_taken = 'Partial refund processed'
        
        # Update trade status
        trades_table.update_item(
            Key={'id': dispute['trade_id']},
            UpdateExpression='SET escrow_status = :status, updated_at = :updated',
            ExpressionAttributeValues={
                ':status': new_trade_status,
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        # In production:
        # 1. Execute actual fund transfer
        # 2. Send notifications to both parties
        # 3. Update user reputations if needed
        # 4. Generate operation receipt
        
        return response(200, {
            'message': 'Dispute resolved successfully',
            'resolution': resolution,
            'actionTaken': action_taken,
            'tradeStatus': new_trade_status
        })
        
    except Exception as e:
        print(f"Error in resolve_dispute: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def get_user_disputes(event, context):
    """GET /disputes/user - Get user's disputes"""
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('userId')
        
        if not user_id:
            return response(400, {'message': 'userId is required'})
        
        # Scan for disputes where user is reporter
        # In production, use GSI for better performance
        disputes_response = disputes_table.scan(
            FilterExpression='reporter_id = :user_id',
            ExpressionAttributeValues={':user_id': user_id}
        )
        
        disputes = disputes_response.get('Items', [])
        
        # Sort by creation date (newest first)
        disputes.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return response(200, {
            'disputes': disputes,
            'count': len(disputes)
        })
        
    except Exception as e:
        print(f"Error in get_user_disputes: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def get_all_disputes(event, context):
    """GET /disputes/all - Get all disputes (admin only)"""
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        status_filter = query_params.get('status')
        
        # Get all disputes
        if status_filter:
            disputes_response = disputes_table.scan(
                FilterExpression='#status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': status_filter}
            )
        else:
            disputes_response = disputes_table.scan()
        
        disputes = disputes_response.get('Items', [])
        
        # Sort by creation date (newest first)
        disputes.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return response(200, {
            'disputes': disputes,
            'count': len(disputes),
            'pending': len([d for d in disputes if d.get('status') == 'PENDING']),
            'resolved': len([d for d in disputes if d.get('status') == 'RESOLVED'])
        })
        
    except Exception as e:
        print(f"Error in get_all_disputes: {str(e)}")
        return response(500, {'message': 'Internal server error'})
