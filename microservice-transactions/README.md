# KambioP2P - Transactions Microservice

**Created with:** GitHub Copilot  
**Creation Date:** February 24, 2026

## Description

The Transactions microservice manages the complete trade lifecycle, including escrow fund management, bank account integration, deposit confirmation, and fund release mechanisms.

## Features

### Trade Management
- **Initiate Trade:** Create trade contracts between buyers and sellers
- **Confirm Deposit:** Buyer confirms fund transfer with proof
- **Release Funds:** Seller releases escrow funds after verification
- **Trade History:** Track all user transactions

### Escrow System
- **Fund Locking:** Automatically lock funds when creating offers
- **Custody Management:** Hold funds securely during transactions
- **Status Tracking:** Monitor escrow states (IN_ESCROW, AWAITING_CONFIRMATION, COMPLETED)
- **Dispute Prevention:** Block unilateral cancellations after deposit

### Bank Account Integration
- **Multi-Bank Support:** BCP, Interbank, BBVA, Scotiabank
- **Account Linking:** Securely store bank account information
- **Account Management:** Add, view, and remove linked accounts
- **Transfer Execution:** Process withdrawals to selected accounts

### Operation Traceability
- **Operation Numbers:** Generate unique identifiers for each transaction
- **Receipt Generation:** Provide transaction proofs
- **Audit Trail:** Complete transaction history

## API Endpoints

### POST /trades/initiate
Create a trade contract between two users.

**Request Body:**
```json
{
  "offerId": "uuid-string",
  "buyerId": "uuid-string"
}
```

**Response:**
```json
{
  "message": "Trade initiated successfully",
  "tradeId": "uuid-string",
  "trade": {
    "id": "uuid-string",
    "escrow_status": "IN_ESCROW",
    "amount_fiat": 1000.00,
    "currency": "USD",
    "rate": 3.720
  }
}
```

### POST /trades/{id}/confirm-deposit
Buyer confirms sending funds with proof.

**Request Body:**
```json
{
  "proof": "base64-encoded-image or file upload"
}
```

**Response:**
```json
{
  "message": "Deposit confirmed. Waiting for seller confirmation.",
  "status": "AWAITING_CONFIRMATION"
}
```

### POST /trades/{id}/release-funds
Seller releases funds from escrow.

**Request Body:**
```json
{
  "userId": "uuid-string"
}
```

**Response:**
```json
{
  "message": "Funds released successfully",
  "status": "COMPLETED",
  "operationNumber": "OP-12345678-20260224"
}
```

### GET /trades/bank-accounts
Get user's linked bank accounts.

**Query Parameters:**
- `userId` (required): User identifier

**Response:**
```json
{
  "accounts": [
    {
      "id": "uuid-string",
      "user_id": "uuid-string",
      "bank_name": "BCP",
      "account_number": "123456789012345",
      "currency_type": "PEN",
      "is_verified": false
    }
  ],
  "count": 2
}
```

### POST /trades/bank-accounts
Add a new bank account.

**Request Body:**
```json
{
  "userId": "uuid-string",
  "bankName": "BCP",
  "accountNumber": "123456789012345",
  "currencyType": "PEN"
}
```

**Response:**
```json
{
  "message": "Bank account added successfully",
  "accountId": "uuid-string",
  "account": {
    "id": "uuid-string",
    "bank_name": "BCP",
    "is_verified": false
  }
}
```

### GET /trades/user
Get user's trade history.

**Query Parameters:**
- `userId` (required): User identifier

**Response:**
```json
{
  "trades": [
    {
      "id": "uuid-string",
      "offer_id": "uuid-string",
      "buyer_id": "uuid-string",
      "seller_id": "uuid-string",
      "escrow_status": "COMPLETED",
      "amount_fiat": 1000.00,
      "rate": 3.720,
      "isBuyer": true,
      "created_at": "2026-02-24T10:00:00Z"
    }
  ],
  "count": 15
}
```

## DynamoDB Tables

### Trades Table
**Table Name:** `kambiop2p-transactions-{stage}-trades`

**Primary Key:** `id` (String)

**Attributes:**
- `id` (String) - Unique trade identifier
- `offer_id` (String) - Reference to offer
- `buyer_id` (String) - Buyer user ID
- `seller_id` (String) - Seller user ID
- `escrow_status` (String) - Trade status
- `amount_fiat` (Decimal) - Trade amount
- `currency` (String) - Currency type
- `rate` (Decimal) - Exchange rate
- `created_at` (String) - ISO timestamp
- `updated_at` (String) - ISO timestamp
- `deposit_confirmed_at` (String) - Deposit confirmation time
- `completed_at` (String) - Completion time

**Escrow Status Values:**
- `PENDING`: Initial state
- `IN_ESCROW`: Funds locked, waiting for buyer deposit
- `AWAITING_CONFIRMATION`: Buyer deposited, waiting for seller confirmation
- `COMPLETED`: Trade successful
- `DISPUTED`: Under dispute review
- `REFUNDED`: Funds returned to buyer
- `PARTIALLY_REFUNDED`: Partial refund processed

**Global Secondary Indexes:**
- `BuyerTradesIndex` on `buyer_id` and `created_at`
- `SellerTradesIndex` on `seller_id` and `created_at`

### Bank Accounts Table
**Table Name:** `kambiop2p-transactions-{stage}-bank-accounts`

**Primary Key:** `id` (String)

**Attributes:**
- `id` (String) - Unique account identifier
- `user_id` (String) - Owner user ID
- `bank_name` (String) - Bank name
- `account_number` (String) - Account number
- `currency_type` (String) - "PEN" or "USD"
- `is_verified` (Boolean) - Verification status
- `created_at` (String) - ISO timestamp

**Supported Banks:**
- BCP (Banco de Crédito del Perú)
- Interbank
- BBVA
- Scotiabank

**Global Secondary Indexes:**
- `UserAccountsIndex` on `user_id`

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

## Installation

1. Navigate to the microservice directory:
```bash
cd microservice-transactions
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
    role: arn:aws:iam::${aws:accountId}:role/LabRole
  httpApi:
    cors: true
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
   - Trades table with buyer/seller indexes
   - Bank Accounts table with user index
3. Create API Gateway endpoints
4. Set up Lambda functions with proper IAM roles
5. Configure CORS for all endpoints
6. Output the API Gateway URL

### Post-Deployment

After deployment, you'll receive the API Gateway endpoints:

```
endpoints:
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/trades/initiate
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/trades/{id}/confirm-deposit
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/trades/{id}/release-funds
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/trades/bank-accounts
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/trades/bank-accounts
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/trades/user
```

## Environment Variables

The following environment variables are automatically configured:

- `TRADES_TABLE`: DynamoDB Trades table name
- `BANK_ACCOUNTS_TABLE`: DynamoDB Bank Accounts table name
- `OFFERS_TABLE`: Reference to Market microservice offers table

## Testing

Test the endpoints using curl:

```bash
# Initiate a trade
curl -X POST https://your-api-url/dev/trades/initiate \
  -H "Content-Type: application/json" \
  -d '{"offerId":"offer-id","buyerId":"buyer-id"}'

# Confirm deposit
curl -X POST https://your-api-url/dev/trades/{trade-id}/confirm-deposit \
  -H "Content-Type: application/json" \
  -d '{}'

# Release funds
curl -X POST https://your-api-url/dev/trades/{trade-id}/release-funds \
  -H "Content-Type: application/json" \
  -d '{"userId":"seller-id"}'

# Get bank accounts
curl "https://your-api-url/dev/trades/bank-accounts?userId=user-id"

# Add bank account
curl -X POST https://your-api-url/dev/trades/bank-accounts \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user-id",
    "bankName":"BCP",
    "accountNumber":"123456789",
    "currencyType":"PEN"
  }'

# Get user trades
curl "https://your-api-url/dev/trades/user?userId=user-id"
```

## Trade Flow

### 1. Trade Initiation
```
User accepts offer → Initiate Trade API
  ↓
Create Trade record (status: IN_ESCROW)
  ↓
Update Offer status to IN_TRADE
  ↓
Lock seller's funds in escrow
```

### 2. Deposit Confirmation
```
Buyer transfers funds → Confirm Deposit API
  ↓
Upload proof of payment
  ↓
Update Trade status to AWAITING_CONFIRMATION
  ↓
Notify seller
```

### 3. Fund Release
```
Seller verifies receipt → Release Funds API
  ↓
Validate trade state
  ↓
Transfer funds from escrow to buyer
  ↓
Update Trade status to COMPLETED
  ↓
Generate operation number
  ↓
Request reputation rating
```

## Escrow System

### Fund Locking
When a trade is initiated:
1. Verify seller has sufficient funds
2. Lock funds in virtual escrow wallet
3. Funds cannot be used for other trades
4. Update user's available balance

### Fund Release
When seller confirms:
1. Verify deposit proof
2. Transfer escrow funds to buyer's wallet
3. Update seller's available balance
4. Generate transaction receipt
5. Trigger reputation update

### Dispute Handling
If dispute is opened:
1. Freeze escrow funds
2. Prevent release or refund
3. Await mediator decision
4. Execute resolution (refund or release)

## Bank Integration

### Current Implementation
- Store bank account information in DynamoDB
- Simulate transfer execution
- Generate mock operation numbers

### Production Integration

1. **Bank API Integration:**
```python
def execute_bank_transfer(account, amount):
    if account['bank_name'] == 'BCP':
        response = bcp_api.transfer({
            'account': account['account_number'],
            'amount': amount,
            'currency': account['currency_type']
        })
        return response['operation_number']
```

2. **Account Verification:**
   - Verify account ownership with micro-deposits
   - Integrate with bank APIs for account validation
   - Use IBAN/account number validation

3. **Transfer Tracking:**
   - Store bank API responses
   - Track transfer status
   - Implement retry mechanism for failed transfers

## Security Considerations

1. **Trade Verification:**
   - Verify user authorization
   - Prevent self-trading
   - Validate trade state transitions

2. **Escrow Protection:**
   - Implement atomic operations
   - Use DynamoDB transactions
   - Add audit logs for all fund movements

3. **Bank Account Security:**
   - Encrypt sensitive account information
   - Implement account verification
   - Rate limit account additions

4. **Proof of Payment:**
   - Validate file uploads
   - Store proofs in S3 with encryption
   - Generate pre-signed URLs for access

## Monitoring

### CloudWatch Logs
Lambda logs are automatically sent to CloudWatch:
- Log group: `/aws/lambda/kambiop2p-transactions-{stage}-{function}`

### Metrics to Monitor
- Trade initiation rate
- Average time to complete trades
- Escrow fund volume
- Failed transactions
- Dispute rate

### Alarms to Configure
- High failure rate in fund transfers
- Unusual escrow balance changes
- Trades stuck in AWAITING_CONFIRMATION > 1 hour

## Troubleshooting

### Common Issues

**Issue:** Cannot initiate trade - offer not available

**Solution:** Verify offer status is "OPEN" and not already in another trade.

**Issue:** Cannot release funds - not authorized

**Solution:** Verify the user is the seller and trade status is AWAITING_CONFIRMATION.

**Issue:** Bank account not saving

**Solution:** Check bankName is one of the supported banks and account number format is valid.

## Future Enhancements

1. Automated bank transfers via API
2. Multi-signature escrow for high-value trades
3. Installment payment support
4. Escrow insurance  
5. Automated refund after timeout
6. Payment gateway integration (credit cards)
7. Cryptocurrency support
8. International wire transfers

## License

Proprietary - KambioP2P

---

## Reference: Original Prompt

**Considera para el microservicio de Transacciones:**
- Métodos (API):
  - POST /trades/initiate: Crea un contrato de intercambio entre dos usuarios.
  - POST /trades/{id}/confirm-deposit: El usuario notifica que envió el dinero (adjunta comprobante).
  - POST /trades/{id}/release-funds: Libera los fondos del Escrow tras validación.
  - GET /trades/bank-accounts: Gestiona las cuentas bancarias vinculadas.
- Tablas:
  - Trades: {id, offer_id, buyer_id, seller_id, escrow_status, amount_fiat, created_at}
  - BankAccounts: {id, user_id, bank_name, account_number, currency_type}
