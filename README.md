# KambioP2P - P2P Exchange Platform

**Created with:** GitHub Copilot  
**Creation Date:** February 24, 2026

![KambioP2P](https://via.placeholder.com/800x200/4CAF50/FFFFFF?text=KambioP2P+-+P2P+Exchange+Platform)

## Overview

KambioP2P is a complete peer-to-peer exchange platform that facilitates the secure exchange of dollars (USD) and soles (PEN) in the Peruvian market. The platform connects buyers and sellers directly, offering better exchange rates than traditional banks while maintaining security through an escrow system.

## Architecture

The platform is built using a modern serverless microservices architecture on AWS:

### Frontend
- **Technology:** React 18.2
- **Hosting:** AWS S3 (Static Website)
- **Deployment:** Serverless Framework

### Backend (4 Microservices)
All microservices use:
- **Runtime:** Python 3.9
- **API:** AWS API Gateway (HTTP API)
- **Compute:** AWS Lambda
- **Database:** AWS DynamoDB
- **Deployment:** Serverless Framework

#### 1. Users Microservice
Handles authentication, identity verification, and reputation management.

#### 2. Market Microservice
Manages exchange offers and external rate comparison.

#### 3. Transactions Microservice
Controls trade execution, escrow, and bank account integration.

#### 4. Disputes Microservice
Manages conflict resolution and support tickets.

## Project Structure

```
kambiop2p/
├── frontend/                      # React web application
│   ├── src/
│   │   ├── pages/                # Page components
│   │   ├── services/             # API integration
│   │   └── components/           # Reusable components
│   ├── public/
│   ├── package.json
│   ├── serverless.yml            # S3 deployment config
│   └── README.md
│
├── microservice-users/           # Authentication & Profiles
│   ├── handler.py                # Lambda functions
│   ├── serverless.yml            # Infrastructure config
│   ├── requirements.txt
│   └── README.md
│
├── microservice-market/          # Offers & Exchange Rates
│   ├── handler.py
│   ├── serverless.yml
│   ├── requirements.txt
│   └── README.md
│
├── microservice-transactions/    # Trades & Escrow
│   ├── handler.py
│   ├── serverless.yml
│   ├── requirements.txt
│   └── README.md
│
├── microservice-disputes/        # Conflict Resolution
│   ├── handler.py
│   ├── serverless.yml
│   ├── requirements.txt
│   └── README.md
│
└── README.md                     # This file
```

## Key Features

### 🔐 Secure Registration
- Multi-step registration form (optimized for mobile)
- Document verification (DNI photo and selfie)
- Simulated RENIEC/Migraciones integration
- Identity confirmation before trading

### 💰 Savings Calculator
- Real-time bank rate comparison
- Instant savings calculation
- Shows potential savings: "You're saving S/ X compared to banks"

### 📊 Real-Time Marketplace
- Live offer updates (auto-refresh every 5 seconds)
- Create buy/sell offers
- View trader reputation and history
- Automatic escrow fund locking
- Guest viewing (login required to trade)

### 🔒 Secure Escrow System
- Funds locked when creating offers
- "Funds in Custody" status after deposit confirmation
- Prevents unilateral cancellation
- Automatic release after verification

### 🏦 Multi-Bank Integration
- Support for 4 major Peruvian banks:
  - BCP (Banco de Crédito del Perú)
  - Interbank
  - BBVA
  - Scotiabank
- Link multiple bank accounts
- Operation number for traceability

### ⭐ Reputation System
- 1-5 star rating after each trade
- Public profile with average score
- Total trades counter
- Immediate reputation updates

### 🛠️ Support & Disputes
- Automatic "Report Incident" button after 15 minutes
- Evidence upload support
- Escrow freeze during disputes
- Mediator resolution workflow
- Support agent notifications

## Technology Stack

### Frontend
- React 18.2
- React Router DOM 6.20
- Axios 1.6
- Socket.io Client 4.6

### Backend
- Python 3.9
- boto3 (AWS SDK)
- AWS Lambda
- AWS API Gateway
- AWS DynamoDB
- AWS S3

### DevOps
- Serverless Framework 3.38+
- AWS CLI
- Node.js 18+

## Prerequisites

Before deploying the platform, ensure you have:

1. **AWS Account** with appropriate credentials
2. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```
3. **Node.js** 18.x or higher
   ```bash
   node --version
   ```
4. **Python** 3.9 or higher
   ```bash
   python --version
   ```
5. **Serverless Framework** installed globally
   ```bash
   npm install -g serverless
   ```
6. **LabRole IAM Role** exists in your AWS account (or modify serverless.yml files to use a different role)

## Quick Start

### 1. Clone/Download the Project

Navigate to the project directory:
```bash
cd C:/Users/Intel/kambiop2p
```

### 2. Deploy Backend Microservices

Deploy each microservice in order:

#### Users Microservice
```bash
cd microservice-users
pip install -r requirements.txt
serverless deploy --stage dev
cd ..
```

#### Market Microservice
```bash
cd microservice-market
pip install -r requirements.txt
serverless deploy --stage dev
cd ..
```

#### Transactions Microservice
```bash
cd microservice-transactions
pip install -r requirements.txt
serverless deploy --stage dev
cd ..
```

#### Disputes Microservice
```bash
cd microservice-disputes
pip install -r requirements.txt
serverless deploy --stage dev
cd ..
```

**Important:** Save the API Gateway URLs from each deployment output. You'll need them for frontend configuration.

### 3. Configure Frontend

Create a `.env` file in the frontend directory:

```bash
cd frontend
```

Create `.env`:
```
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/dev
```

### 4. Deploy Frontend

Install dependencies and deploy:

```bash
npm install
npm run build
serverless deploy --stage dev
```

After deployment, you'll receive the S3 website URL:
```
http://kambiop2p-frontend-dev.s3-website-us-east-1.amazonaws.com
```

### 5. Access the Application

Open the provided S3 website URL in your browser and start using KambioP2P!

## Deployment Details

### IAM Role Configuration

All services are configured to use the existing `LabRole` IAM role. If you need to use a different role, update the `serverless.yml` files:

```yaml
provider:
  iam:
    role: YourRoleName
```

### Environment Stages

The platform supports multiple deployment stages:

- **dev** (development): `serverless deploy --stage dev`
- **staging**: `serverless deploy --stage staging`
- **prod** (production): `serverless deploy --stage prod`

Each stage creates separate AWS resources with stage-specific names.

### Resource Naming

Resources are automatically named with the pattern:
```
{service-name}-{stage}-{resource-type}
```

Example:
- `kambiop2p-users-dev-users` (DynamoDB table)
- `kambiop2p-frontend-dev` (S3 bucket)

## API Endpoints

After deployment, you'll have the following endpoints:

### Users Service
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /user/verify-identity` - Submit verification documents
- `GET /user/profile/{id}` - Get user profile
- `PATCH /user/reputation` - Update reputation

### Market Service
- `GET /offers` - List active offers
- `POST /offers/create` - Create new offer
- `DELETE /offers/{id}` - Cancel offer
- `GET /market/rates` - Get exchange rates

### Transactions Service
- `POST /trades/initiate` - Start trade
- `POST /trades/{id}/confirm-deposit` - Confirm deposit
- `POST /trades/{id}/release-funds` - Release escrow
- `GET /trades/bank-accounts` - Get bank accounts
- `POST /trades/bank-accounts` - Add bank account
- `GET /trades/user` - Get user trades

### Disputes Service
- `POST /disputes/open` - Open dispute
- `GET /disputes/{id}` - Get dispute details
- `POST /disputes/{id}/resolve` - Resolve dispute (admin)
- `GET /disputes/user` - Get user disputes
- `GET /disputes/all` - Get all disputes (admin)

## Testing

### Test User Registration
```bash
curl -X POST https://your-users-api/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

### Test Market Rates
```bash
curl https://your-market-api/dev/market/rates
```

### Test Offer Creation
```bash
curl -X POST https://your-market-api/dev/offers/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId":"user-id",
    "type":"SELL",
    "currency":"USD",
    "amount":1000,
    "rate":3.72
  }'
```

## Monitoring

### CloudWatch Logs

Each Lambda function automatically logs to CloudWatch:
- `/aws/lambda/kambiop2p-users-{stage}-{function}`
- `/aws/lambda/kambiop2p-market-{stage}-{function}`
- `/aws/lambda/kambiop2p-transactions-{stage}-{function}`
- `/aws/lambda/kambiop2p-disputes-{stage}-{function}`

### CloudWatch Metrics

Monitor key metrics:
- Lambda invocations and errors
- API Gateway requests and latency
- DynamoDB read/write capacity
- S3 bandwidth usage

### Alarms

Configure CloudWatch alarms for:
- High error rates
- Slow response times
- DynamoDB throttling
- Unusual traffic patterns

## Security Best Practices

### Current Implementation (Development)
- Basic password hashing (SHA-256)
- Simple token authentication
- Public S3 bucket for website
- CORS enabled for all endpoints

### Production Recommendations

1. **Authentication:**
   - Implement JWT with proper signing
   - Add token expiration and refresh tokens
   - Use AWS Cognito for user management

2. **Encryption:**
   - Enable encryption at rest for DynamoDB
   - Use S3 encryption for uploaded files
   - Encrypt sensitive data in transit

3. **Authorization:**
   - Implement API Gateway authorizers
   - Add role-based access control (RBAC)
   - Use AWS WAF for API protection

4. **Secrets Management:**
   - Store API keys in AWS Secrets Manager
   - Use Parameter Store for configuration
   - Rotate credentials regularly

5. **Compliance:**
   - Enable CloudTrail for audit logging
   - Implement data retention policies
   - Add GDPR compliance features

## Cost Estimation

### Monthly Cost (Approximate)
Based on 1,000 active users with 10,000 trades/month:

- **Lambda:** $10-20 (1M invocations free tier)
- **API Gateway:** $3.50 (REST API)
- **DynamoDB:** $5-15 (on-demand pricing)
- **S3:** $1-5 (hosting + storage)
- **Data Transfer:** $5-10

**Total:** ~$25-55/month (small to medium scale)

### Cost Optimization Tips
1. Use DynamoDB on-demand for variable traffic
2. Enable S3 lifecycle policies for old files
3. Implement API caching to reduce Lambda calls
4. Use CloudFront CDN for frontend (additional cost but better performance)

## Troubleshooting

### Deployment Issues

**Issue:** Permission denied during deployment

**Solution:** Verify AWS credentials and LabRole permissions.

**Issue:** DynamoDB table already exists

**Solution:** Delete existing table or use a different stage name.

**Issue:** API Gateway timeout

**Solution:** Increase Lambda timeout in serverless.yml (max 29 seconds for API Gateway).

### Runtime Issues

**Issue:** CORS errors in browser

**Solution:** Verify API Gateway has CORS enabled in serverless.yml.

**Issue:** Frontend can't connect to API

**Solution:** Check REACT_APP_API_URL in .env file is correct.

**Issue:** Offers not updating in real-time

**Solution:** Check browser console for errors and verify polling is working (should refresh every 5 seconds).

## Cleanup

To remove all resources and avoid AWS charges:

```bash
# Remove frontend
cd frontend
serverless remove --stage dev

# Remove each microservice
cd ../microservice-users
serverless remove --stage dev

cd ../microservice-market
serverless remove --stage dev

cd ../microservice-transactions
serverless remove --stage dev

cd ../microservice-disputes
serverless remove --stage dev
```

**Note:** This will permanently delete all DynamoDB tables and their data.

## Future Enhancements

### Phase 2
- [ ] WebSocket integration for real-time updates
- [ ] Email notifications
- [ ] SMS verification
- [ ] Mobile app (React Native)

### Phase 3
- [ ] Actual bank API integration
- [ ] Real RENIEC/Migraciones verification
- [ ] Payment gateway integration
- [ ] KYC/AML compliance features

### Phase 4
- [ ] Multi-currency support (EUR, BRL, etc.)
- [ ] Cryptocurrency integration
- [ ] Trading bots and API access
- [ ] Advanced analytics dashboard

## Support

For questions or issues:
- Check individual README files in each service directory
- Review CloudWatch logs for errors
- Consult AWS documentation for service-specific issues

## Contributing

This is a proprietary project. For contributions or modifications, contact the development team.

## License

Proprietary - KambioP2P  
All rights reserved.

---

## Reference: Original Prompt

This entire project was created based on the following requirements:

**Rol/Persona:** 
Actúa como un programador Full Stack.

**Contexto:** 
KambioP2P, una plataforma digital P2P que facilita el intercambio de dólares y soles en el mercado peruano.

**Tarea/Objetivo:** 
Crea una web responsiva con estas funcionalidades:

- **Landing Page y Registro Seguro:** En la página de inicio, implementar un formulario donde el usuario ingrese el monto a cambiar. El sistema debe consultar un API de tipos de cambio bancarios y mostrar un mensaje comparativo: "Estás ahorrando S/ [monto] comparado con el banco". El login permite registrar los datos de un nuevo usuario, subir una foto del documento de identidad y una selfie de validación. El sistema debe simular el cruce de datos con RENIEC/Migraciones para confirmar la cuenta.

- **Marketplace P2P en Tiempo Real:** Una sección de "Mercado" donde el usuario visualice las mejores ofertas de compra y venta. Cuando el sistema detecte nuevas ofertas, la lista debe actualizarse automáticamente mostrando: tipo de cambio, monto disponible y reputación del ofertante. Tambien debe permitir al usuario crear su propia oferta ingresando monto y tipo de cambio deseado. Al hacer clic en "Publicar Oferta", esta debe ser visible para la comunidad y los fondos deben quedar bloqueados en un saldo de billetera virtual (Escrow). Un visitante podra visualizar el mercado de ofertas mas no participar mientras no se encuentre logueado.

- **Gestión de Transacciones y Garantía:** Al aceptar una oferta, una vez que el sistema confirme la recepción de fondos de una parte, el estado debe cambiar a "Fondos en Custodia" y bloquear la cancelación unilateral.

- **Integración Multi-Banco:** Opción para vincular cuentas de BCP, Interbank, BBVA y Scotiabank. Al retirar fondos, el usuario selecciona su cuenta guardada y el sistema debe ejecutar la transferencia mostrando el número de operación para trazabilidad.

- **Reputación y Soporte:** Al finalizar una transacción con éxito, solicitar una valoración de 1 a 5 estrellas. El puntaje promedio del perfil público de la contraparte debe actualizarse de inmediato. Si pasan más de 15 minutos sin confirmación, habilitar un botón de "Reportar Incidencia". Esto debe notificar a un agente de soporte y congelar el proceso de liberación de fondos en el sistema Escrow hasta una revisión manual.

**Requisitos de la respuesta:**

- Para la web responsiva (FrontEnd) utiliza React. Utiliza el servicio S3 de AWS para alojar la web. Automatiza la creación de un bucket S3 público y el despliegue de la web con el framework serverless considerando el uso del rol de IAM LabRole existente.

- Para el BackEnd crea 4 microservicios o apis rest (usuarios, mercado, transacciones, disputas). Utiliza estos servicios de AWS (Api Gateway, Lambda y DynamoDB) para cada microservicio. Utiliza lenguaje de programación python. Automatiza el despliegue de cada microservicio con el framework serverless considerando el uso del rol de IAM LabRole existente.

**Microservicio de Usuarios:**
- Métodos (API):
  - POST /auth/register: Registro inicial de usuario.
  - POST /user/verify-identity: Envío de documentos y selfie (Integración con OCR/Biometría).
  - GET /user/profile/{id}: Obtiene perfil y reputación.
  - PATCH /user/reputation: Actualiza el score tras una transacción.
- Tablas:
  - Users {id, email, password_hash, status}
  - Profiles {user_id, dni, full_name, birth_date, is_verified}
  - Reputation {user_id, score_avg, total_trades}

**Microservicio de Mercado:**
- Métodos (API):
  - GET /offers: Lista ofertas activas con filtros (mejor precio, monto).
  - POST /offers/create: Publica una nueva intención de cambio.
  - GET /market/rates: Consulta tipos de cambio externos para la Calculadora de Ahorro.
  - DELETE /offers/{id}: Elimina o pausa una oferta.
- Tablas:
  - Offers: {user_id, type: "BUY|SELL", currency, amount, rate, status: "OPEN", created_at}
  - ExternalRates: {bank_name, buy_rate, sell_rate, timestamp}

**Microservicio de Transacciones:**
- Métodos (API):
  - POST /trades/initiate: Crea un contrato de intercambio entre dos usuarios.
  - POST /trades/{id}/confirm-deposit: El usuario notifica que envió el dinero (adjunta comprobante).
  - POST /trades/{id}/release-funds: Libera los fondos del Escrow tras validación.
  - GET /trades/bank-accounts: Gestiona las cuentas bancarias vinculadas.
- Tablas:
  - Trades: {id, offer_id, buyer_id, seller_id, escrow_status, amount_fiat, created_at}
  - BankAccounts: {id, user_id, bank_name, account_number, currency_type}

**Microservicio de Disputas:**
- Métodos (API):
  - POST /disputes/open: Abre un ticket vinculado a un trade_id.
  - GET /disputes/{id}: Seguimiento del estado de la disputa.
  - POST /disputes/{id}/resolve: El mediador dicta una resolución (devolver fondos o liberar).
- Tablas:
  - Disputes: {id, trade_id, reporter_id, reason, status: "PENDING|RESOLVED", evidence_url}

**Elementos adicionales:**
- Si es mucha información en pantalla de celular para el registro de un nuevo paciente, considera partirlo en pasos.

---

**Created with GitHub Copilot on February, 2026**
