# KambioP2P - Market Microservice

**Created with:** GitHub Copilot  
**Creation Date:** February 24, 2026

## Description

The Market microservice manages exchange offers, provides real-time marketplace functionality, and integrates external bank exchange rates for price comparison.

## Features

### Offer Management
- **List Active Offers:** Browse available buy/sell offers with filtering
- **Create Offers:** Publish new exchange intentions
- **Delete/Pause Offers:** Cancel or pause active offers
- **Real-time Updates:** Support for automatic offer list refresh

### Exchange Rate Comparison
- **External Rates:** Fetch rates from multiple banks (BCP, Interbank, BBVA, Scotiabank)
- **Savings Calculator:** Compare platform rates with bank rates
- **Rate History:** Track historical exchange rates

### Marketplace Features
- **Sorting:** Best price, newest first, amount filters
- **User Reputation Display:** Show seller/buyer ratings with each offer
- **Escrow Integration:** Automatic fund locking when creating offers

## API Endpoints

### GET /offers
List active offers with optional filters.

**Query Parameters:**
- `type` (optional): "BUY" or "SELL"
- `sort` (optional): "best_price" or "newest"
- `limit` (optional): Maximum results (default: 50)

**Response:**
```json
{
  "offers": [
    {
      "id": "uuid-string",
      "user_id": "uuid-string",
      "type": "SELL",
      "currency": "USD",
      "amount": 1000.00,
      "rate": 3.720,
      "status": "OPEN",
      "created_at": "2026-02-24T10:00:00Z"
    }
  ],
  "count": 10
}
```

### POST /offers/create
Create a new exchange offer.

**Request Body:**
```json
{
  "userId": "uuid-string",
  "type": "SELL",
  "currency": "USD",
  "amount": 1000.00,
  "rate": 3.720
}
```

**Response:**
```json
{
  "message": "Offer created successfully",
  "offerId": "uuid-string",
  "offer": {
    "id": "uuid-string",
    "status": "OPEN",
    "created_at": "2026-02-24T10:00:00Z"
  }
}
```

### DELETE /offers/{id}
Delete or cancel an offer.

**Request Body:**
```json
{
  "userId": "uuid-string"
}
```

**Response:**
```json
{
  "message": "Offer cancelled successfully"
}
```

### GET /market/rates
Get external bank exchange rates and platform comparison.

**Response:**
```json
{
  "banks": [
    {
      "bank_name": "BCP",
      "buy_rate": 3.720,
      "sell_rate": 3.760,
      "timestamp": "2026-02-24T10:00:00Z"
    }
  ],
  "bankAverage": 3.740,
  "bankBuyAverage": 3.719,
  "bankSellAverage": 3.759,
  "bestOffer": 3.690,
  "timestamp": "2026-02-24T10:00:00Z"
}
```

## DynamoDB Tables

### Offers Table
**Table Name:** `kambiop2p-market-{stage}-offers`

**Primary Key:** `id` (String)

**Attributes:**
- `id` (String) - Unique offer identifier
- `user_id` (String) - Offer creator ID
- `type` (String) - "BUY" or "SELL"
- `currency` (String) - "USD" or "PEN"
- `amount` (Decimal) - Offer amount
- `rate` (Decimal) - Exchange rate
- `status` (String) - "OPEN", "IN_TRADE", "CANCELLED", "COMPLETED"
- `created_at` (String) - ISO timestamp
- `updated_at` (String) - ISO timestamp

**Global Secondary Indexes:**
- `UserOffersIndex` on `user_id` and `created_at`

### External Rates Table
**Table Name:** `kambiop2p-market-{stage}-external-rates`

**Primary Key:** `id` (String)

**Attributes:**
- `id` (String) - Composite key: "{bank_name}_{timestamp}"
- `bank_name` (String) - Name of the bank
- `buy_rate` (Decimal) - Bank's buy rate
- `sell_rate` (Decimal) - Bank's sell rate
- `timestamp` (String) - ISO timestamp
- `ttl` (Number) - Time to live for automatic cleanup

**Time To Live:** Enabled on `ttl` attribute (rates expire after 24 hours)

## Technology Stack

- **Runtime:** Python 3.9
- **Framework:** AWS Lambda
- **API Gateway:** AWS API Gateway (HTTP API)
- **Database:** AWS DynamoDB
- **Deployment:** Serverless Framework
- **Dependencies:** boto3, requests

## Prerequisites

- Python 3.9 or higher
- AWS CLI configured with credentials
- Serverless Framework installed: `npm install -g serverless`

## Installation

1. Navigate to the microservice directory:
```bash
cd microservice-market
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
    role: LabRole
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
   - Offers table with offer filtering capabilities
   - External Rates table with TTL for automatic cleanup
3. Create API Gateway endpoints
4. Set up Lambda functions with proper IAM roles
5. Configure CORS for all endpoints
6. Output the API Gateway URL

### Post-Deployment

After deployment, you'll receive the API Gateway endpoints:

```
endpoints:
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/offers
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/offers/create
  DELETE - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/offers/{id}
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/market/rates
```

## Environment Variables

The following environment variables are automatically configured:

- `OFFERS_TABLE`: DynamoDB Offers table name
- `EXTERNAL_RATES_TABLE`: DynamoDB External Rates table name

## Testing

Test the endpoints using curl:

```bash
# Get all offers
curl https://your-api-url/dev/offers

# Get filtered offers
curl "https://your-api-url/dev/offers?type=SELL&sort=best_price"

# Create an offer
curl -X POST https://your-api-url/dev/offers/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user-id",
    "type":"SELL",
    "currency":"USD",
    "amount":1000,
    "rate":3.72
  }'

# Get exchange rates
curl https://your-api-url/dev/market/rates

# Delete an offer
curl -X DELETE https://your-api-url/dev/offers/{offer-id} \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}'
```

## Real-Time Updates

### Current Implementation
The frontend polls the `/offers` endpoint every 5 seconds to get updated offers.

### Production Recommendations
1. **WebSocket Integration:**
   - Implement AWS API Gateway WebSocket API
   - Push real-time updates when offers are created/updated
   - Reduce polling overhead

2. **Event-Driven Architecture:**
   - Use DynamoDB Streams to detect offer changes
   - Trigger Lambda to broadcast updates via WebSocket
   - Implement EventBridge for cross-service communication

## External Rate Integration

### Current Implementation
The microservice simulates bank rates with static data that updates on each request.

### Production Integration Steps

1. **Integrate Real Bank APIs:**
```python
def fetch_real_rates():
    rates = []
    
    # BCP API
    bcp_response = requests.get('https://api.bcp.com.pe/exchange-rate')
    rates.append({
        'bank_name': 'BCP',
        'buy_rate': bcp_response.json()['buy'],
        'sell_rate': bcp_response.json()['sell']
    })
    
    # Add more banks...
    return rates
```

2. **Scheduled Rate Updates:**
   - Add a CloudWatch Events rule to trigger rate updates every 15 minutes
   - Store rates in DynamoDB with timestamps
   - Use TTL to automatically clean old rates

3. **Fallback Mechanism:**
   - Cache the last known rates
   - Use cached rates if API calls fail
   - Implement circuit breaker pattern

## Performance Optimization

### Offer Listing
- Use DynamoDB GSI for efficient querying
- Implement pagination for large result sets
- Cache frequently accessed offers in ElastiCache

### Rate Comparison
- Cache bank rates for 15 minutes
- Implement edge caching with CloudFront
- Use DynamoDB DAX for faster reads

## Security Considerations

1. **Offer Creation:**
   - Validate user authentication
   - Verify user has sufficient funds
   - Prevent duplicate offers
   - Rate limiting to prevent spam

2. **Offer Deletion:**
   - Verify ownership before deletion
   - Check offer is not in active trade
   - Log all cancellation attempts

3. **Rate Fetching:**
   - Validate and sanitize bank API responses
   - Implement timeout mechanisms
   - Use API keys for authenticated requests

## Monitoring

### CloudWatch Logs
Lambda logs are automatically sent to CloudWatch:
- Log group: `/aws/lambda/kambiop2p-market-{stage}-{function}`

### Metrics to Monitor
- Offer creation rate
- Offer cancellation rate
- Average offer completion time
- External API call success rate
- DynamoDB throttling events

### Alarms to Configure
- High error rate in rate fetching
- Unusual spike in offer creation
- DynamoDB capacity issues

## Troubleshooting

### Common Issues

**Issue:** Offers not appearing in list

**Solution:** Check offer status is "OPEN" and verify DynamoDB scan filters.

**Issue:** Exchange rates showing as null

**Solution:** Ensure external rate fetching is working. Check CloudWatch logs for API errors.

**Issue:** Cannot delete offer

**Solution:** Verify user owns the offer and it's not in "IN_TRADE" status.

## Future Enhancements

1. Advanced filtering (price range, amount range, user rating)
2. Favorite offers watchlist
3. Price alerts and notifications
4. Historical price charts
5. Offer expiration with automatic cleanup
6. Multi-currency support beyond USD/PEN
7. Bulk offer creation
8. Offer templates for frequent traders

## License

Proprietary - KambioP2P

---

## Reference: Original Prompt

**Considera para el microservicio de Mercado:**
- Métodos (API):
  - GET /offers: Lista ofertas activas con filtros (mejor precio, monto).
  - POST /offers/create: Publica una nueva intención de cambio.
  - GET /market/rates: Consulta tipos de cambio externos para la Calculadora de Ahorro.
  - DELETE /offers/{id}: Elimina o pausa una oferta.
- Tablas:
  - Offers: {user_id, type: "BUY|SELL", currency, amount, rate, status: "OPEN", created_at}
  - ExternalRates: {bank_name, buy_rate, sell_rate, timestamp}
