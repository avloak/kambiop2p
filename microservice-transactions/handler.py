import json
import boto3
import uuid
import os
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
trades_table = dynamodb.Table(os.environ.get('TRADES_TABLE', 'kambiop2p-trades'))
bank_accounts_table = dynamodb.Table(os.environ.get('BANK_ACCOUNTS_TABLE', 'kambiop2p-bank-accounts'))
offers_table = dynamodb.Table(os.environ.get('OFFERS_TABLE', 'kambiop2p-offers'))

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

def initiate_trade(event, context):
    """POST /trades/initiate - Create a trade contract between two users"""
    try:
        body = json.loads(event['body'])
        offer_id = body.get('offerId')
        buyer_id = body.get('buyerId')
        
        if not offer_id or not buyer_id:
            return response(400, {'message': 'Missing required fields'})
        
        # Get offer details
        offer_response = offers_table.get_item(Key={'id': offer_id})
        
        if 'Item' not in offer_response:
            return response(404, {'message': 'Offer not found'})
        
        offer = offer_response['Item']
        
        if offer['status'] != 'OPEN':
            return response(400, {'message': 'Offer is not available'})
        
        # Prevent self-trading
        if offer['user_id'] == buyer_id:
            return response(400, {'message': 'Cannot trade with yourself'})
        
        # Create trade
        trade_id = str(uuid.uuid4())
        trade_item = {
            'id': trade_id,
            'offer_id': offer_id,
            'buyer_id': buyer_id,
            'seller_id': offer['user_id'],
            'escrow_status': 'IN_ESCROW',
            'amount_fiat': offer['amount'],
            'currency': offer['currency'],
            'rate': offer['rate'],
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        trades_table.put_item(Item=trade_item)
        
        # Update offer status
        offers_table.update_item(
            Key={'id': offer_id},
            UpdateExpression='SET #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': 'IN_TRADE'}
        )
        
        return response(201, {
            'message': 'Trade initiated successfully',
            'tradeId': trade_id,
            'trade': trade_item
        })
        
    except Exception as e:
        print(f"Error in initiate_trade: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def confirm_deposit(event, context):
    """POST /trades/{id}/confirm-deposit - Buyer confirms sending funds"""
    try:
        trade_id = event['pathParameters']['id']
        body = json.loads(event.get('body', '{}'))
        
        # Get trade
        trade_response = trades_table.get_item(Key={'id': trade_id})
        
        if 'Item' not in trade_response:
            return response(404, {'message': 'Trade not found'})
        
        trade = trade_response['Item']
        
        # Verify trade status
        if trade['escrow_status'] != 'IN_ESCROW':
            return response(400, {'message': 'Trade is not in valid state'})
        
        # Update trade status
        trades_table.update_item(
            Key={'id': trade_id},
            UpdateExpression='SET escrow_status = :status, deposit_confirmed_at = :confirmed, updated_at = :updated',
            ExpressionAttributeValues={
                ':status': 'AWAITING_CONFIRMATION',
                ':confirmed': datetime.utcnow().isoformat(),
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        # In production, store proof/receipt in S3
        
        return response(200, {
            'message': 'Deposit confirmed. Waiting for seller confirmation.',
            'status': 'AWAITING_CONFIRMATION'
        })
        
    except Exception as e:
        print(f"Error in confirm_deposit: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def release_funds(event, context):
    """POST /trades/{id}/release-funds - Release funds from escrow"""
    try:
        trade_id = event['pathParameters']['id']
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('userId')
        
        # Get trade
        trade_response = trades_table.get_item(Key={'id': trade_id})
        
        if 'Item' not in trade_response:
            return response(404, {'message': 'Trade not found'})
        
        trade = trade_response['Item']
        
        # Verify user is seller
        if trade['seller_id'] != user_id:
            return response(403, {'message': 'Only seller can release funds'})
        
        # Verify trade status
        if trade['escrow_status'] != 'AWAITING_CONFIRMATION':
            return response(400, {'message': 'Trade is not awaiting confirmation'})
        
        # Release funds and complete trade
        trades_table.update_item(
            Key={'id': trade_id},
            UpdateExpression='SET escrow_status = :status, completed_at = :completed, updated_at = :updated',
            ExpressionAttributeValues={
                ':status': 'COMPLETED',
                ':completed': datetime.utcnow().isoformat(),
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        # In production:
        # 1. Transfer funds from escrow to buyer
        # 2. Generate operation number
        # 3. Send notifications
        
        operation_number = f"OP-{trade_id[:8].upper()}-{datetime.utcnow().strftime('%Y%m%d')}"
        
        return response(200, {
            'message': 'Funds released successfully',
            'status': 'COMPLETED',
            'operationNumber': operation_number
        })
        
    except Exception as e:
        print(f"Error in release_funds: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def get_bank_accounts(event, context):
    """GET /trades/bank-accounts - Get user's linked bank accounts"""
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('userId')
        
        if not user_id:
            return response(400, {'message': 'userId is required'})
        
        # Get bank accounts
        accounts_response = bank_accounts_table.query(
            IndexName='UserAccountsIndex',
            KeyConditionExpression='user_id = :user_id',
            ExpressionAttributeValues={':user_id': user_id}
        )
        
        accounts = accounts_response.get('Items', [])
        
        return response(200, {
            'accounts': accounts,
            'count': len(accounts)
        })
        
    except Exception as e:
        print(f"Error in get_bank_accounts: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def add_bank_account(event, context):
    """POST /trades/bank-accounts - Add a new bank account"""
    try:
        body = json.loads(event['body'])
        
        user_id = body.get('userId')
        bank_name = body.get('bankName')
        account_number = body.get('accountNumber')
        currency_type = body.get('currencyType')
        
        if not all([user_id, bank_name, account_number, currency_type]):
            return response(400, {'message': 'Missing required fields'})
        
        if bank_name not in ['BCP', 'Interbank', 'BBVA', 'Scotiabank']:
            return response(400, {'message': 'Invalid bank name'})
        
        if currency_type not in ['PEN', 'USD']:
            return response(400, {'message': 'Invalid currency type'})
        
        # Create bank account
        account_id = str(uuid.uuid4())
        account_item = {
            'id': account_id,
            'user_id': user_id,
            'bank_name': bank_name,
            'account_number': account_number,
            'currency_type': currency_type,
            'is_verified': False,  # In production, verify with bank API
            'created_at': datetime.utcnow().isoformat()
        }
        
        bank_accounts_table.put_item(Item=account_item)
        
        return response(201, {
            'message': 'Bank account added successfully',
            'accountId': account_id,
            'account': account_item
        })
        
    except Exception as e:
        print(f"Error in add_bank_account: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def get_user_trades(event, context):
    """GET /trades/user - Get user's trades"""
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('userId')
        
        if not user_id:
            return response(400, {'message': 'userId is required'})
        
        # Scan for trades where user is buyer or seller
        # In production, use GSI for better performance
        all_trades = trades_table.scan()
        
        user_trades = []
        for trade in all_trades.get('Items', []):
            if trade.get('buyer_id') == user_id or trade.get('seller_id') == user_id:
                trade['isBuyer'] = (trade.get('buyer_id') == user_id)
                user_trades.append(trade)
        
        # Sort by creation date (newest first)
        user_trades.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return response(200, {
            'trades': user_trades,
            'count': len(user_trades)
        })
        
    except Exception as e:
        print(f"Error in get_user_trades: {str(e)}")
        return response(500, {'message': 'Internal server error'})
