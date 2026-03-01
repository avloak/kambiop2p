# KambioP2P - Users Microservice

**Created with:** GitHub Copilot  
**Creation Date:** February 24, 2026

## Description

The Users microservice handles user authentication, identity verification, profile management, and reputation tracking for the KambioP2P platform.

## Features

### Authentication
- **User Registration:** Create new user accounts with email and password
- **User Login:** Authenticate users and generate access tokens
- Token-based authentication with session management

### Identity Verification
- **Document Upload:** Accept DNI photos and selfies for verification
- **RENIEC/Migraciones Integration:** Simulated identity verification (ready for real API integration)
- **Biometric Validation:** Support for OCR and facial recognition (simulation)
- **Verification Status Tracking:** Monitor verification progress

### Profile Management
- **Get User Profile:** Retrieve complete user profile including personal data and reputation
- **Profile Updates:** Modify user information
- **Status Management:** Track user account status (PENDING, ACTIVE, SUSPENDED)

### Reputation System
- **Reputation Tracking:** Maintain average score and total trades
- **Score Updates:** Update reputation after each completed transaction
- **Public Profile:** Share reputation data with other users

## API Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "uuid-string",
  "token": "auth-token"
}
```

### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "userId": "uuid-string",
  "token": "auth-token"
}
```

### POST /user/verify-identity
Submit identity verification documents.

**Request Body:**
```json
{
  "userId": "uuid-string",
  "dni": "12345678",
  "fullName": "Juan Pérez García",
  "birthDate": "1990-01-15",
  "phone": "999888777"
}
```

**Response:**
```json
{
  "message": "Identity verification submitted",
  "isVerified": true,
  "status": "Documents verified successfully"
}
```

### GET /user/profile/{id}
Get user profile and reputation.

**Response:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "status": "ACTIVE",
  "dni": "12345678",
  "fullName": "Juan Pérez",
  "isVerified": true,
  "scoreAvg": 4.8,
  "totalTrades": 25
}
```

### PATCH /user/reputation
Update user reputation after a trade.

**Request Body:**
```json
{
  "userId": "uuid-string",
  "score": 5
}
```

**Response:**
```json
{
  "message": "Reputation updated successfully"
}
```

## DynamoDB Tables

### Users Table
**Table Name:** `kambiop2p-users-{stage}-users`

**Primary Key:** `email` (String)

**Attributes:**
- `id` (String) - Unique user identifier
- `email` (String) - User email address
- `password_hash` (String) - Hashed password
- `status` (String) - Account status
- `createdAt` (String) - ISO timestamp

**Global Secondary Indexes:**
- `UserIdIndex` on `id`

### Profiles Table
**Table Name:** `kambiop2p-users-{stage}-profiles`

**Primary Key:** `user_id` (String)

**Attributes:**
- `user_id` (String) - Reference to Users table
- `dni` (String) - National ID number
- `full_name` (String) - User's full name
- `birth_date` (String) - Date of birth
- `phone` (String) - Phone number
- `is_verified` (Boolean) - Verification status
- `verifiedAt` (String) - Verification timestamp

### Reputation Table
**Table Name:** `kambiop2p-users-{stage}-reputation`

**Primary Key:** `user_id` (String)

**Attributes:**
- `user_id` (String) - Reference to Users table
- `score_avg` (Decimal) - Average rating (1-5)
- `total_trades` (Number) - Total completed trades
- `total_ratings` (Number) - Total ratings received

## Technology Stack

- **Runtime:** Python 3.9
- **Framework:** AWS Lambda
- **API Gateway:** AWS API Gateway (HTTP API)
- **Database:** AWS DynamoDB
- **Deployment:** Serverless Framework
- **Dependencies:** boto3

## Prerequisites

- Python 3.9 or higher
- AWS CLI configured with credentials
- Serverless Framework installed: `npm install -g serverless`
- boto3 library

## Installation

1. Navigate to the microservice directory:
```bash
cd microservice-users
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

The `serverless.yml` file is configured to use the existing `LabRole` IAM role:

```yaml
provider:
  iam:
    arn:aws:iam::${aws:accountId}:role/LabRole
```

## Deployment

### Automatic Deployment

Deploy the microservice to AWS:

```bash
serverless deploy --stage dev
```

For production:
```bash
serverless deploy --stage prod
```

### Deployment Process

The deployment will:
1. Package the Lambda function code
2. Create/update DynamoDB tables:
   - Users table with email as primary key
   - Profiles table with user_id as primary key
   - Reputation table with user_id as primary key
3. Create API Gateway endpoints
4. Set up Lambda functions with proper IAM roles
5. Configure CORS for all endpoints
6. Output the API Gateway URL

### Post-Deployment

After deployment, you'll receive the API Gateway endpoints:

```
endpoints:
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/register
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/login
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/user/verify-identity
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/user/profile/{id}
  PATCH - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/user/reputation
```

## Environment Variables

The following environment variables are automatically configured:

- `USERS_TABLE`: DynamoDB Users table name
- `PROFILES_TABLE`: DynamoDB Profiles table name
- `REPUTATION_TABLE`: DynamoDB Reputation table name

## Testing

Test the endpoints using curl:

```bash
# Register a new user
curl -X POST https://your-api-url/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# Login
curl -X POST https://your-api-url/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# Get profile
curl https://your-api-url/dev/user/profile/{userId}
```

## Security Considerations

### Current Implementation (Development)
- Simple SHA-256 password hashing
- Basic token generation
- No token expiration

### Production Recommendations
1. **Password Security:**
   - Use bcrypt or Argon2 for password hashing
   - Implement password complexity requirements
   - Add rate limiting for login attempts

2. **Token Management:**
   - Implement JWT with proper signing
   - Add token expiration and refresh tokens
   - Store tokens securely in DynamoDB

3. **Identity Verification:**
   - Integrate with actual RENIEC/Migraciones API
   - Implement OCR for document reading
   - Add facial recognition for selfie validation

4. **API Security:**
   - Implement API key authentication
   - Add request signing
   - Enable AWS WAF for DDoS protection

## Monitoring

### CloudWatch Logs

Lambda logs are automatically sent to CloudWatch:
- Log group: `/aws/lambda/kambiop2p-users-{stage}-{function}`

### Metrics to Monitor

- Lambda invocations
- Lambda errors
- Lambda duration
- DynamoDB read/write capacity
- API Gateway 4xx/5xx errors

## Troubleshooting

### Common Issues

**Issue:** User registration fails with "User already exists"

**Solution:** Check if the email is already registered in the Users table.

**Issue:** DynamoDB access denied

**Solution:** Verify that the LabRole has DynamoDB permissions (GetItem, PutItem, UpdateItem, Query, Scan).

**Issue:** Identity verification always returns false

**Solution:** The current implementation validates DNI format (8 digits). Integrate with real RENIEC API for production.

## Future Enhancements

1. Email verification with OTP
2. Two-factor authentication (2FA)
3. Social login integration (Google, Facebook)
4. Advanced fraud detection
5. Automated document verification with AI/ML
6. Password reset functionality
7. User activity logging

## License

Proprietary - KambioP2P

---

## Reference: Original Prompt

[Same prompt text as in frontend README.md]

**Considera para el microservicio de Usuarios:**
- Métodos (API):
  - POST /auth/register: Registro inicial de usuario.
  - POST /user/verify-identity: Envío de documentos y selfie (Integración con OCR/Biometría).
  - GET /user/profile/{id}: Obtiene perfil y reputación.
  - PATCH /user/reputation: Actualiza el score tras una transacción.
- Tablas:
  - Users {id, email, password_hash, status}
  - Profiles {user_id, dni, full_name, birth_date, is_verified}
  - Reputation {user_id, score_avg, total_trades}
