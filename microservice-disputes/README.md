# KambioP2P - Disputes Microservice

**Created with:** GitHub Copilot  
**Creation Date:** February 24, 2026

## Description

The Disputes microservice handles conflict resolution between users, manages support tickets, and provides mediation tools for trade disputes. It includes automated incident detection and manual resolution workflows.

## Features

### Dispute Management
- **Open Dispute:** Create dispute tickets for problematic trades
- **Dispute Tracking:** Monitor dispute status and progress
- **Evidence Upload:** Attach proof and documentation
- **Status Updates:** Track resolution progress

### Automated Incident Detection
- **Timeout Detection:** Automatically enable dispute option after 15 minutes
- **Escrow Freeze:** Lock funds when dispute is opened
- **Notification System:** Alert support team and both parties

### Mediation & Resolution
- **Support Agent Tools:** Interface for mediators to review cases
- **Resolution Options:** Refund buyer, release to seller, or partial refund
- **Decision Execution:** Automatically execute mediator decisions
- **Audit Trail:** Complete history of dispute actions

### User Protection
- **Unilateral Cancellation Block:** Prevent one-sided cancellations
- **Evidence Preservation:** Store all submitted proofs
- **Fair Resolution:** Neutral mediation process

## API Endpoints

### POST /disputes/open
Open a dispute for a trade.

**Request Body:**
```json
{
  "tradeId": "uuid-string",
  "reporterId": "uuid-string",
  "reason": "Funds not received after 30 minutes",
  "evidenceUrl": "https://s3.amazonaws.com/evidence.jpg"
}
```

**Response:**
```json
{
  "message": "Dispute opened successfully. Support team has been notified.",
  "disputeId": "uuid-string",
  "dispute": {
    "id": "uuid-string",
    "trade_id": "uuid-string",
    "status": "PENDING",
    "created_at": "2026-02-24T10:00:00Z"
  }
}
```

### GET /disputes/{id}
Get dispute details and current status.

**Response:**
```json
{
  "id": "uuid-string",
  "trade_id": "uuid-string",
  "reporter_id": "uuid-string",
  "reason": "Funds not received",
  "status": "PENDING",
  "evidence_url": "https://...",
  "created_at": "2026-02-24T10:00:00Z",
  "trade": {
    "id": "uuid-string",
    "amount": 1000.00,
    "currency": "USD",
    "rate": 3.720,
    "escrow_status": "DISPUTED"
  }
}
```

### POST /disputes/{id}/resolve
Resolve a dispute (admin/mediator only).

**Request Body:**
```json
{
  "resolution": "REFUND_BUYER",
  "mediatorId": "mediator-uuid",
  "notes": "Evidence shows buyer transferred funds but seller did not confirm."
}
```

**Resolution Options:**
- `REFUND_BUYER`: Return funds to buyer
- `RELEASE_TO_SELLER`: Release escrow to seller
- `PARTIAL_REFUND`: Split funds between parties

**Response:**
```json
{
  "message": "Dispute resolved successfully",
  "resolution": "REFUND_BUYER",
  "actionTaken": "Funds returned to buyer",
  "tradeStatus": "REFUNDED"
}
```

### GET /disputes/user
Get user's disputes.

**Query Parameters:**
- `userId` (required): User identifier

**Response:**
```json
{
  "disputes": [
    {
      "id": "uuid-string",
      "trade_id": "uuid-string",
      "reason": "Delayed confirmation",
      "status": "RESOLVED",
      "created_at": "2026-02-24T10:00:00Z"
    }
  ],
  "count": 3
}
```

### GET /disputes/all
Get all disputes (admin only).

**Query Parameters:**
- `status` (optional): Filter by status ("PENDING" or "RESOLVED")

**Response:**
```json
{
  "disputes": [...],
  "count": 25,
  "pending": 5,
  "resolved": 20
}
```

## DynamoDB Tables

### Disputes Table
**Table Name:** `kambiop2p-disputes-{stage}-disputes`

**Primary Key:** `id` (String)

**Attributes:**
- `id` (String) - Unique dispute identifier
- `trade_id` (String) - Reference to trade
- `reporter_id` (String) - User who opened dispute
- `reason` (String) - Dispute description
- `status` (String) - "PENDING" or "RESOLVED"
- `evidence_url` (String) - Link to uploaded evidence
- `resolution` (String) - Resolution type (if resolved)
- `mediator_id` (String) - Assigned mediator ID
- `resolution_notes` (String) - Mediator's notes
- `created_at` (String) - ISO timestamp
- `updated_at` (String) - ISO timestamp
- `resolved_at` (String) - Resolution timestamp

**Status Values:**
- `PENDING`: Awaiting mediator review
- `UNDER_REVIEW`: Mediator is investigating
- `RESOLVED`: Decision made and executed

**Global Secondary Indexes:**
- `TradeDisputesIndex` on `trade_id`
- `UserDisputesIndex` on `reporter_id` and `created_at`

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
cd microservice-disputes
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
   - Disputes table with trade and user indexes
3. Create API Gateway endpoints
4. Set up Lambda functions with proper IAM roles
5. Configure CORS for all endpoints
6. Output the API Gateway URL

### Post-Deployment

After deployment, you'll receive the API Gateway endpoints:

```
endpoints:
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/disputes/open
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/disputes/{id}
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/disputes/{id}/resolve
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/disputes/user
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/disputes/all
```

## Environment Variables

The following environment variables are automatically configured:

- `DISPUTES_TABLE`: DynamoDB Disputes table name
- `TRADES_TABLE`: Reference to Transactions microservice trades table

## Testing

Test the endpoints using curl:

```bash
# Open a dispute
curl -X POST https://your-api-url/dev/disputes/open \
  -H "Content-Type: application/json" \
  -d '{
    "tradeId":"trade-id",
    "reporterId":"user-id",
    "reason":"Funds not received after confirmation",
    "evidenceUrl":"https://s3.../evidence.jpg"
  }'

# Get dispute details
curl https://your-api-url/dev/disputes/{dispute-id}

# Resolve dispute (admin)
curl -X POST https://your-api-url/dev/disputes/{dispute-id}/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "resolution":"REFUND_BUYER",
    "mediatorId":"mediator-id",
    "notes":"Buyer provided valid proof of transfer"
  }'

# Get user disputes
curl "https://your-api-url/dev/disputes/user?userId=user-id"

# Get all disputes (admin)
curl "https://your-api-url/dev/disputes/all?status=PENDING"
```

## Dispute Flow

### 1. Incident Detection
```
Trade > 15 minutes without confirmation
  ↓
Frontend enables "Report Incident" button
  ↓
User clicks button and describes issue
```

### 2. Dispute Opening
```
User submits dispute → Open Dispute API
  ↓
Create Dispute record (status: PENDING)
  ↓
Update Trade escrow_status to DISPUTED
  ↓
Freeze escrow funds
  ↓
Notify support team
  ↓
Notify both parties (buyer and seller)
```

### 3. Mediation Process
```
Support agent reviews case
  ↓
Request additional evidence if needed
  ↓
Analyze transaction history
  ↓
Verify bank transfers and proofs
  ↓
Make resolution decision
```

### 4. Resolution Execution
```
Mediator calls Resolve API
  ↓
Update Dispute status to RESOLVED
  ↓
Execute fund transfer based on decision
  ↓
Update Trade status
  ↓
Send notifications to both parties
  ↓
Update user reputations if fraud detected
```

## 15-Minute Rule

### Implementation
The frontend implements the 15-minute timeout check:

```javascript
const canOpenDispute = (trade) => {
  if (trade.status !== 'AWAITING_CONFIRMATION') return false;
  
  const createdTime = new Date(trade.createdAt).getTime();
  const now = Date.now();
  const minutesElapsed = (now - createdTime) / (1000 * 60);
  
  return minutesElapsed > 15;
};
```

### Purpose
- Gives users reasonable time to confirm transactions
- Prevents premature disputes
- Establishes clear expectations
- Reduces false reports

## Evidence Management

### Current Implementation
- Store evidence URLs in DynamoDB
- Accept file uploads via multipart/form-data

### Production Implementation

1. **S3 Upload:**
```python
import boto3
s3 = boto3.client('s3')

def upload_evidence(file, dispute_id):
    key = f"disputes/{dispute_id}/evidence_{timestamp}.jpg"
    s3.upload_fileobj(file, 'kambiop2p-evidence', key)
    return f"https://s3.amazonaws.com/kambiop2p-evidence/{key}"
```

2. **Security:**
   - Generate pre-signed URLs for uploads
   - Validate file types (images, PDFs only)
   - Limit file size (max 5MB)
   - Scan for malware

3. **Privacy:**
   - Encrypt evidence at rest
   - Limit access to dispute parties and mediators
   - Auto-delete after resolution period

## Mediation Tools

### Admin Dashboard Features (Future)
1. **Dispute Queue:**
   - List all pending disputes
   - Priority sorting (amount, age)
   - Assignment to mediators

2. **Investigation Tools:**
   - Timeline view of trade
   - Chat history between parties
   - Bank transfer verification
   - User reputation history

3. **Quick Actions:**
   - Request more evidence
   - Contact users
   - Escalate to senior mediator
   - Apply resolution templates

## Resolution Guidelines

### When to Refund Buyer
- Buyer provided valid proof of transfer
- Seller did not respond for > 24 hours
- Seller admitted to receiving funds but won't release

### When to Release to Seller
- Seller provided proof of non-receipt
- Buyer admitted to not sending funds
- Evidence shows false claim

### When to Partial Refund
- Both parties partially at fault
- Some funds were transferred but not full amount
- Compromise agreement

## Security Considerations

1. **Dispute Creation:**
   - Verify user is part of the trade
   - Check trade is in valid state
   - Rate limit dispute creation
   - Prevent duplicate disputes

2. **Resolution Authorization:**
   - Implement admin authentication
   - Require mediator credentials
   - Log all resolution actions
   - Two-factor auth for high-value disputes

3. **Evidence Security:**
   - Encrypt uploaded files
   - Scan for malicious content
   - Audit access to evidence
   - Automatic cleanup after resolution

4. **Fraud Prevention:**
   - Flag users with multiple disputes
   - Analyze dispute patterns
   - Ban repeat offenders
   - Share fraud data across trades

## Monitoring

### CloudWatch Logs
Lambda logs are automatically sent to CloudWatch:
- Log group: `/aws/lambda/kambiop2p-disputes-{stage}-{function}`

### Metrics to Monitor
- Dispute opening rate
- Average resolution time
- Resolution type distribution
- Repeat disputers
- Mediator performance

### Alarms to Configure
- Spike in dispute creation
- Long pending disputes (> 48 hours)
- High refund rate
- Unusual resolution patterns

## Troubleshooting

### Common Issues

**Issue:** Cannot open dispute - unauthorized

**Solution:** Verify the reporter is either the buyer or seller in the trade.

**Issue:** Trade not found when opening dispute

**Solution:** Check trade ID is correct and trade exists in transactions microservice.

**Issue:** Cannot resolve dispute - already resolved

**Solution:** Check dispute status is PENDING before attempting resolution.

## Analytics & Reporting

### Metrics to Track
1. **Dispute Rate:** Disputes per 100 trades
2. **Resolution Time:** Average hours to resolution
3. **Resolution Outcomes:** Refund vs Release percentages
4. **User Behavior:** Users with multiple disputes
5. **Mediator Performance:** Cases handled per mediator

### Reports to Generate
- Daily dispute summary
- Weekly resolution report
- Monthly fraud analysis
- Quarterly trend analysis

## Future Enhancements

1. **Automated Resolution:**
   - AI-powered decision assistance
   - Pattern recognition for similar cases
   - Automatic resolution for clear-cut cases

2. **Communication Tools:**
   - In-app chat between parties and mediator
   - Video call integration
   - Document sharing

3. **Appeals Process:**
   - Allow users to appeal decisions
   - Second-level review
   - Escalation workflow

4. **Arbitration:**
   - Binding arbitration option
   - Third-party arbitrator integration
   - Legal documentation

5. **Insurance:**
   - Optional trade insurance
   - Automatic instant payouts
   - Premium collection

## Compliance & Legal

- Maintain dispute records for 7 years
- Comply with consumer protection laws
- Document mediation process
- Provide transparency reports
- Enable regulator access

## License

Proprietary - KambioP2P

---

## Reference: Original Prompt

**Considera para el microservicio de Disputas:**
- Métodos (API):
  - POST /disputes/open: Abre un ticket vinculado a un trade_id.
  - GET /disputes/{id}: Seguimiento del estado de la disputa.
  - POST /disputes/{id}/resolve: El mediador dicta una resolución (devolver fondos o liberar).
- Tablas:
  - Disputes: {id, trade_id, reporter_id, reason, status: "PENDING|RESOLVED", evidence_url}

**Reputación y Soporte:** Si pasan más de 15 minutos sin confirmación, habilitar un botón de "Reportar Incidencia". Esto debe notificar a un agente de soporte y congelar el proceso de liberación de fondos en el sistema Escrow hasta una revisión manual.
