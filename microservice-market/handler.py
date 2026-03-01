import json
import boto3
import uuid
import os
from datetime import datetime
from decimal import Decimal
import requests

dynamodb = boto3.resource('dynamodb')
offers_table = dynamodb.Table(os.environ.get('OFFERS_TABLE', 'kambiop2p-offers'))
external_rates_table = dynamodb.Table(os.environ.get('EXTERNAL_RATES_TABLE', 'kambiop2p-external-rates'))

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

def get_offers(event, context):
    """GET /offers - List active offers with optional filters"""
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        
        # Scan offers (in production, use better indexing)
        scan_params = {
            'FilterExpression': '#status = :status',
            'ExpressionAttributeNames': {'#status': 'status'},
            'ExpressionAttributeValues': {':status': 'OPEN'}
        }
        
        # Apply filters
        if query_params.get('type'):
            scan_params['FilterExpression'] += ' AND #type = :type'
            scan_params['ExpressionAttributeNames']['#type'] = 'type'
            scan_params['ExpressionAttributeValues'][':type'] = query_params['type']
        
        result = offers_table.scan(**scan_params)
        offers = result.get('Items', [])
        
        # Sort by rate (best price first)
        if query_params.get('sort') == 'best_price':
            offers.sort(key=lambda x: float(x.get('rate', 0)), 
                       reverse=(query_params.get('type') == 'BUY'))
        else:
            # Sort by creation date (newest first)
            offers.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        # Limit results
        limit = int(query_params.get('limit', 50))
        offers = offers[:limit]
        
        return response(200, {
            'offers': offers,
            'count': len(offers)
        })
        
    except Exception as e:
        print(f"Error in get_offers: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def create_offer(event, context):
    """POST /offers/create - Create a new exchange offer"""
    try:
        body = json.loads(event['body'])
        
        user_id = body.get('userId')
        offer_type = body.get('type')  # BUY or SELL
        currency = body.get('currency')  # USD or PEN
        amount = body.get('amount')
        rate = body.get('rate')
        
        if not all([user_id, offer_type, currency, amount, rate]):
            return response(400, {'message': 'Missing required fields'})
        
        if offer_type not in ['BUY', 'SELL']:
            return response(400, {'message': 'Invalid offer type'})
        
        if currency not in ['USD', 'PEN']:
            return response(400, {'message': 'Invalid currency'})
        
        # Create offer
        offer_id = str(uuid.uuid4())
        offer_item = {
            'id': offer_id,
            'user_id': user_id,
            'type': offer_type,
            'currency': currency,
            'amount': Decimal(str(amount)),
            'rate': Decimal(str(rate)),
            'status': 'OPEN',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        offers_table.put_item(Item=offer_item)
        
        # In production, lock funds in escrow here
        
        return response(201, {
            'message': 'Offer created successfully',
            'offerId': offer_id,
            'offer': offer_item
        })
        
    except Exception as e:
        print(f"Error in create_offer: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def delete_offer(event, context):
    """DELETE /offers/{id} - Delete or pause an offer"""
    try:
        offer_id = event['pathParameters']['id']
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('userId')
        
        # Get offer
        offer_response = offers_table.get_item(Key={'id': offer_id})
        
        if 'Item' not in offer_response:
            return response(404, {'message': 'Offer not found'})
        
        offer = offer_response['Item']
        
        # Verify ownership
        if offer['user_id'] != user_id:
            return response(403, {'message': 'Unauthorized'})
        
        # Check if offer can be cancelled
        if offer['status'] != 'OPEN':
            return response(400, {'message': 'Offer cannot be cancelled'})
        
        # Update status to CANCELLED
        offers_table.update_item(
            Key={'id': offer_id},
            UpdateExpression='SET #status = :status, updated_at = :updated',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'CANCELLED',
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        # In production, release funds from escrow here
        
        return response(200, {'message': 'Offer cancelled successfully'})
        
    except Exception as e:
        print(f"Error in delete_offer: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def get_market_rates(event, context):
    """GET /market/rates - Get external exchange rates"""
    try:
        # Simulate fetching rates from multiple banks
        # In production, integrate with real bank APIs
        
        banks_data = [
            {
                'bank_name': 'BCP',
                'buy_rate': Decimal('3.720'),
                'sell_rate': Decimal('3.760')
            },
            {
                'bank_name': 'Interbank',
                'buy_rate': Decimal('3.715'),
                'sell_rate': Decimal('3.755')
            },
            {
                'bank_name': 'BBVA',
                'buy_rate': Decimal('3.718'),
                'sell_rate': Decimal('3.758')
            },
            {
                'bank_name': 'Scotiabank',
                'buy_rate': Decimal('3.722'),
                'sell_rate': Decimal('3.762')
            }
        ]
        
        # Store in database with timestamp
        timestamp = datetime.utcnow().isoformat()
        
        for bank in banks_data:
            bank['timestamp'] = timestamp
            bank['id'] = f"{bank['bank_name']}_{timestamp}"
            external_rates_table.put_item(Item=bank)
        
        # Calculate averages
        avg_buy = sum(float(b['buy_rate']) for b in banks_data) / len(banks_data)
        avg_sell = sum(float(b['sell_rate']) for b in banks_data) / len(banks_data)
        
        # Get best offer from our platform
        offers_response = offers_table.scan(
            FilterExpression='#status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': 'OPEN'},
            Limit=10
        )
        
        best_offer_rate = None
        if offers_response['Items']:
            rates = [float(o['rate']) for o in offers_response['Items']]
            best_offer_rate = min(rates) if rates else None
        
        return response(200, {
            'banks': banks_data,
            'bankAverage': round((avg_buy + avg_sell) / 2, 3),
            'bankBuyAverage': round(avg_buy, 3),
            'bankSellAverage': round(avg_sell, 3),
            'bestOffer': best_offer_rate or round(avg_buy - 0.03, 3),
            'timestamp': timestamp
        })
        
    except Exception as e:
        print(f"Error in get_market_rates: {str(e)}")
        return response(500, {'message': 'Internal server error'})
