# KambioP2P - Project File List

This document lists all files created for the KambioP2P platform.

## Project Root
- `README.md` - Main project documentation

## Frontend (`frontend/`)
- `README.md` - Frontend documentation and deployment guide
- `package.json` - Node.js dependencies
- `serverless.yml` - S3 deployment configuration
- `public/index.html` - HTML template
- `src/index.js` - React entry point
- `src/index.css` - Global styles
- `src/App.js` - Main App component with routing
- `src/App.css` - App styles

### Pages (`frontend/src/pages/`)
- `LandingPage.js` - Landing page with savings calculator
- `LandingPage.css` - Landing page styles
- `Register.js` - Multi-step registration form
- `Register.css` - Registration styles
- `Login.js` - Login page
- `Login.css` - Login styles
- `Market.js` - P2P marketplace with real-time offers
- `Market.css` - Market styles
- `Transactions.js` - Transaction management and bank accounts
- `Transactions.css` - Transaction styles
- `Profile.js` - User profile and reputation
- `Profile.css` - Profile styles

### Services (`frontend/src/services/`)
- `api.js` - Base API configuration with Axios
- `userService.js` - User authentication and profile APIs
- `marketService.js` - Market and offers APIs
- `transactionService.js` - Trade and bank account APIs
- `disputeService.js` - Dispute management APIs

## Users Microservice (`microservice-users/`)
- `README.md` - Service documentation
- `handler.py` - Lambda functions (register, login, verify, profile, reputation)
- `serverless.yml` - Infrastructure as code
- `requirements.txt` - Python dependencies

**DynamoDB Tables:**
- Users
- Profiles
- Reputation

**API Endpoints:**
- POST /auth/register
- POST /auth/login
- POST /user/verify-identity
- GET /user/profile/{id}
- PATCH /user/reputation

## Market Microservice (`microservice-market/`)
- `README.md` - Service documentation
- `handler.py` - Lambda functions (offers, rates)
- `serverless.yml` - Infrastructure as code
- `requirements.txt` - Python dependencies

**DynamoDB Tables:**
- Offers
- ExternalRates

**API Endpoints:**
- GET /offers
- POST /offers/create
- DELETE /offers/{id}
- GET /market/rates

## Transactions Microservice (`microservice-transactions/`)
- `README.md` - Service documentation
- `handler.py` - Lambda functions (trades, bank accounts, escrow)
- `serverless.yml` - Infrastructure as code
- `requirements.txt` - Python dependencies

**DynamoDB Tables:**
- Trades
- BankAccounts

**API Endpoints:**
- POST /trades/initiate
- POST /trades/{id}/confirm-deposit
- POST /trades/{id}/release-funds
- GET /trades/bank-accounts
- POST /trades/bank-accounts
- GET /trades/user

## Disputes Microservice (`microservice-disputes/`)
- `README.md` - Service documentation
- `handler.py` - Lambda functions (disputes, resolution)
- `serverless.yml` - Infrastructure as code
- `requirements.txt` - Python dependencies

**DynamoDB Tables:**
- Disputes

**API Endpoints:**
- POST /disputes/open
- GET /disputes/{id}
- POST /disputes/{id}/resolve
- GET /disputes/user
- GET /disputes/all

## Total Files Created

### Code Files: 26
- React Components: 13 (6 pages + 7 styles)
- API Services: 5
- Lambda Handlers: 4
- Serverless Configs: 5
- Package/Requirements: 5

### Documentation Files: 6
- Main README: 1
- Frontend README: 1
- Microservice READMEs: 4
- File List: 1 (this file)

### Total: 33 files

## Technology Summary

**Frontend:**
- React 18.2
- React Router DOM 6.20
- Axios 1.6
- AWS S3 (Static Website Hosting)

**Backend:**
- Python 3.9
- AWS Lambda
- AWS API Gateway
- AWS DynamoDB
- Serverless Framework

**Features Implemented:**
✅ Landing page with savings calculator
✅ Multi-step registration (mobile optimized)
✅ Identity verification (DNI + selfie)
✅ Real-time P2P marketplace
✅ Offer creation with escrow
✅ Trade execution and management
✅ Multi-bank account integration (BCP, Interbank, BBVA, Scotiabank)
✅ Reputation system (1-5 stars)
✅ Dispute system (15-minute rule)
✅ Automatic deployment with Serverless Framework
✅ Complete documentation for all components

## Deployment Order

1. **Backend Microservices:**
   - microservice-users
   - microservice-market
   - microservice-transactions
   - microservice-disputes

2. **Frontend:**
   - frontend (after configuring API URLs)

---

**Created with GitHub Copilot on February, 2026**
