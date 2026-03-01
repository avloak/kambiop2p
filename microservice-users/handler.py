import json
import boto3
import uuid
import hashlib
import os
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ.get('USERS_TABLE', 'kambiop2p-users'))
profiles_table = dynamodb.Table(os.environ.get('PROFILES_TABLE', 'kambiop2p-profiles'))
reputation_table = dynamodb.Table(os.environ.get('REPUTATION_TABLE', 'kambiop2p-reputation'))

def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
        },
        'body': json.dumps(body)
    }

def hash_password(password):
    """Simple password hashing (use bcrypt in production)"""
    return hashlib.sha256(password.encode()).hexdigest()

def register(event, context):
    """POST /auth/register - Register a new user"""
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return response(400, {'message': 'Email and password are required'})
        
        # Check if user already exists
        existing_user = users_table.get_item(Key={'email': email})
        if 'Item' in existing_user:
            return response(400, {'message': 'User already exists'})
        
        # Create user
        user_id = str(uuid.uuid4())
        password_hash = hash_password(password)
        
        user_item = {
            'id': user_id,
            'email': email,
            'password_hash': password_hash,
            'status': 'PENDING_VERIFICATION',
            'createdAt': datetime.utcnow().isoformat()
        }
        
        users_table.put_item(Item=user_item)
        
        # Initialize reputation
        reputation_table.put_item(Item={
            'user_id': user_id,
            'score_avg': Decimal('5.0'),
            'total_trades': 0,
            'total_ratings': 0
        })
        
        # Generate simple token (use JWT in production)
        token = hashlib.sha256(f"{user_id}{email}".encode()).hexdigest()
        
        return response(200, {
            'message': 'User registered successfully',
            'userId': user_id,
            'token': token
        })
        
    except Exception as e:
        print(f"Error in register: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def login(event, context):
    """POST /auth/login - User login"""
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return response(400, {'message': 'Email and password are required'})
        
        # Get user
        user_response = users_table.get_item(Key={'email': email})
        
        if 'Item' not in user_response:
            return response(401, {'message': 'Invalid credentials'})
        
        user = user_response['Item']
        password_hash = hash_password(password)
        
        if user['password_hash'] != password_hash:
            return response(401, {'message': 'Invalid credentials'})
        
        # Generate token
        token = hashlib.sha256(f"{user['id']}{email}".encode()).hexdigest()
        
        return response(200, {
            'message': 'Login successful',
            'userId': user['id'],
            'token': token
        })
        
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def verify_identity(event, context):
    """POST /user/verify-identity - Submit identity documents"""
    try:
        # In production, parse multipart/form-data
        # For now, using JSON simulation
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        
        user_id = body.get('userId')
        dni = body.get('dni')
        full_name = body.get('fullName')
        birth_date = body.get('birthDate')
        phone = body.get('phone', '')
        
        if not all([user_id, dni, full_name, birth_date]):
            return response(400, {'message': 'Missing required fields'})
        
        # Simulate RENIEC/Migraciones verification
        # In production, integrate with actual API
        is_verified = len(dni) == 8 and dni.isdigit()
        
        # Create/update profile
        profile_item = {
            'user_id': user_id,
            'dni': dni,
            'full_name': full_name,
            'birth_date': birth_date,
            'phone': phone,
            'is_verified': is_verified,
            'verifiedAt': datetime.utcnow().isoformat() if is_verified else None
        }
        
        profiles_table.put_item(Item=profile_item)
        
        # Update user status
        users_table.update_item(
            Key={'id': user_id},
            UpdateExpression='SET #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'ACTIVE' if is_verified else 'PENDING_VERIFICATION'
            }
        )
        
        return response(200, {
            'message': 'Identity verification submitted',
            'isVerified': is_verified,
            'status': 'Documents verified successfully' if is_verified else 'Under review'
        })
        
    except Exception as e:
        print(f"Error in verify_identity: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def get_profile(event, context):
    """GET /user/profile/{id} - Get user profile and reputation"""
    try:
        user_id = event['pathParameters']['id']
        
        # Get user
        user_response = users_table.scan(
            FilterExpression='id = :user_id',
            ExpressionAttributeValues={':user_id': user_id}
        )
        
        if not user_response['Items']:
            return response(404, {'message': 'User not found'})
        
        user = user_response['Items'][0]
        
        # Get profile
        profile_response = profiles_table.get_item(Key={'user_id': user_id})
        profile = profile_response.get('Item', {})
        
        # Get reputation
        reputation_response = reputation_table.get_item(Key={'user_id': user_id})
        reputation = reputation_response.get('Item', {})
        
        # Combine data
        profile_data = {
            'id': user['id'],
            'email': user['email'],
            'status': user['status'],
            'createdAt': user.get('createdAt'),
            'dni': profile.get('dni'),
            'fullName': profile.get('full_name'),
            'birthDate': profile.get('birth_date'),
            'phone': profile.get('phone'),
            'isVerified': profile.get('is_verified', False),
            'scoreAvg': float(reputation.get('score_avg', 5.0)),
            'totalTrades': int(reputation.get('total_trades', 0))
        }
        
        return response(200, profile_data)
        
    except Exception as e:
        print(f"Error in get_profile: {str(e)}")
        return response(500, {'message': 'Internal server error'})

def update_reputation(event, context):
    """PATCH /user/reputation - Update user reputation after trade"""
    try:
        body = json.loads(event['body'])
        user_id = body.get('userId')
        score = body.get('score')  # 1-5
        
        if not user_id or not score:
            return response(400, {'message': 'userId and score are required'})
        
        if not (1 <= score <= 5):
            return response(400, {'message': 'Score must be between 1 and 5'})
        
        # Get current reputation
        rep_response = reputation_table.get_item(Key={'user_id': user_id})
        
        if 'Item' in rep_response:
            current_rep = rep_response['Item']
            total_ratings = int(current_rep.get('total_ratings', 0))
            current_avg = float(current_rep.get('score_avg', 5.0))
            total_trades = int(current_rep.get('total_trades', 0))
            
            # Calculate new average
            new_total_ratings = total_ratings + 1
            new_avg = ((current_avg * total_ratings) + score) / new_total_ratings
            
            # Update reputation
            reputation_table.update_item(
                Key={'user_id': user_id},
                UpdateExpression='SET score_avg = :avg, total_ratings = :ratings, total_trades = :trades',
                ExpressionAttributeValues={
                    ':avg': Decimal(str(round(new_avg, 2))),
                    ':ratings': new_total_ratings,
                    ':trades': total_trades + 1
                }
            )
        else:
            # Create new reputation entry
            reputation_table.put_item(Item={
                'user_id': user_id,
                'score_avg': Decimal(str(score)),
                'total_trades': 1,
                'total_ratings': 1
            })
        
        return response(200, {'message': 'Reputation updated successfully'})
        
    except Exception as e:
        print(f"Error in update_reputation: {str(e)}")
        return response(500, {'message': 'Internal server error'})
