# KambioP2P - Frontend

**Created with:** GitHub Copilot  
**Creation Date:** February, 2026

## Description

KambioP2P is a peer-to-peer exchange platform that facilitates the exchange of dollars and soles in the Peruvian market. This is the React-based frontend application that provides a responsive web interface for users to interact with the platform.

## Features

### 1. Landing Page & Savings Calculator
- Exchange rate calculator showing savings compared to banks
- Real-time comparison with external bank rates
- Call-to-action for user registration

### 2. Secure Registration (Multi-step)
- **Step 1:** Email and password setup
- **Step 2:** Personal information (DNI, full name, birth date, phone)
- **Step 3:** Identity verification (DNI photo and selfie upload)
- Simulated RENIEC/Migraciones integration for identity verification
- Mobile-optimized multi-step form

### 3. User Authentication
- Secure login system
- JWT token management
- Protected routes for authenticated users

### 4. Real-Time P2P Marketplace
- Live offers display with auto-refresh every 5 seconds
- Create new buy/sell offers
- View offer details: exchange rate, amount, user reputation
- Automatic escrow fund locking when creating offers
- Guest users can view offers (login required to participate)

### 5. Transaction Management
- Accept and initiate trades
- Confirm deposit with proof upload
- Release funds with escrow protection
- View transaction history and status
- Automatic status updates: "Pending", "In Escrow", "Awaiting Confirmation", "Completed"

### 6. Multi-Bank Integration
- Link bank accounts from BCP, Interbank, BBVA, Scotiabank
- Manage multiple bank accounts
- Select account for fund withdrawals
- Operation number generation for traceability

### 7. Reputation System
- Star rating system (1-5 stars)
- Automatic reputation updates after completed trades
- Public profile with average score and total trades

### 8. Dispute & Support System
- Report incidents after 15+ minutes without confirmation
- Freeze escrow funds during dispute
- Evidence upload support
- Support agent notification system

## Technology Stack

- **Framework:** React 18.2
- **Routing:** React Router DOM 6.20
- **HTTP Client:** Axios 1.6
- **Real-time Updates:** Socket.io Client 4.6
- **Hosting:** AWS S3 (static website hosting)
- **Deployment:** Serverless Framework

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   │   ├── LandingPage.js
│   │   ├── Register.js
│   │   ├── Login.js
│   │   ├── Market.js
│   │   ├── Transactions.js
│   │   └── Profile.js
│   ├── services/          # API service modules
│   │   ├── api.js
│   │   ├── userService.js
│   │   ├── marketService.js
│   │   ├── transactionService.js
│   │   └── disputeService.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── serverless.yml
└── README.md
```

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- AWS CLI configured with credentials
- Serverless Framework installed globally: `npm install -g serverless`
- Serverless S3 Sync plugin: `npm install --save-dev serverless-s3-sync`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Install Serverless S3 Sync plugin:
```bash
npm install --save-dev serverless-s3-sync
```

## Configuration

1. Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/dev
```

2. Update the `serverless.yml` file if needed to match your AWS region and stage.

## Local Development

Run the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Build

Create a production build:
```bash
npm run build
```

## Deployment

### Automatic Deployment with Serverless Framework

This project uses the Serverless Framework to automate the creation of an S3 bucket and deploy the application.

1. Ensure you have AWS credentials configured:
```bash
aws configure
```

2. Build the production bundle:
```bash
npm run build
```

3. Deploy to AWS S3:
```bash
npm run deploy
# or
serverless deploy
```

### Deployment Process

The serverless deployment will:
1. Create an S3 bucket named `kambiop2p-frontend-{stage}` (e.g., `kambiop2p-frontend-dev`)
2. Configure the bucket for static website hosting
3. Set up public read access policies
4. Upload all files from the `build/` directory to the bucket
5. Output the website URL

### Using LabRole IAM Role

This configuration uses the existing `LabRole` IAM role instead of creating new roles. The `serverless.yml` is configured to use:

```yaml
provider:
  iam:
    role: arn:aws:iam::${aws:accountId}:role/LabRole
  httpApi:
    cors: true
```

### Post-Deployment

After deployment, you'll receive the website URL in the format:
```
http://kambiop2p-frontend-{stage}.s3-website-{region}.amazonaws.com
```

Example:
```
http://kambiop2p-frontend-dev.s3-website-us-east-1.amazonaws.com
```

## Environment Variables

- `REACT_APP_API_URL`: Base URL for the backend API (API Gateway endpoint)

## API Integration

The frontend integrates with 4 microservices:

1. **Users Service:** Authentication, identity verification, profile management
2. **Market Service:** Exchange offers, rate comparison
3. **Transactions Service:** Trade execution, bank account management
4. **Disputes Service:** Dispute reporting and resolution

## Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

The registration process automatically adjusts to a multi-step wizard on mobile devices for better usability.

## Security Features

- JWT token authentication
- Protected routes
- Secure password handling (hashed before transmission)
- File upload validation
- CORS enabled for API communication

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Deployment Issues

**Issue:** Serverless deployment fails with permission errors

**Solution:** Ensure your AWS credentials have the necessary permissions or verify that LabRole has S3 and CloudFormation access.

**Issue:** Website shows 403 Forbidden

**Solution:** Check that the S3 bucket policy allows public read access. The serverless.yml should have the correct bucket policy configuration.

### Runtime Issues

**Issue:** API calls fail with CORS errors

**Solution:** Ensure the backend API Gateway has CORS enabled and the frontend is using the correct API URL.

**Issue:** Real-time updates not working

**Solution:** Check that the market page is refreshing offers every 5 seconds. WebSocket connection may need to be configured if using Socket.io.

## Development Notes

- The application uses auto-refresh (polling) for real-time updates instead of WebSockets to simplify deployment
- Identity verification is simulated; integrate with actual RENIEC/Migraciones API in production
- Authentication uses simple token-based auth; upgrade to JWT with proper signing in production
- File uploads are handled as FormData; configure S3 pre-signed URLs for direct uploads in production

## License

Proprietary - KambioP2P

---

## Reference: Original Prompt

This project was created based on the following requirements:

**Rol/Persona:** 
Actúa como un programador Full Stack.

**Contexto:** 
KambioP2P, una plataforma digital P2P que facilita el intercambio de dólares y soles en el mercado peruano.

**Tarea/Objetivo:** 
Crea una web responsiva con estas funcionalidades:
- Landing Page y Registro Seguro: En la página de inicio, implementar un formulario donde el usuario ingrese el monto a cambiar. El sistema debe consultar un API de tipos de cambio bancarios y mostrar un mensaje comparativo: "Estás ahorrando S/ [monto] comparado con el banco". El login permite registrar los datos de un nuevo usuario, subir una foto del documento de identidad y una selfie de validación. El sistema debe simular el cruce de datos con RENIEC/Migraciones para confirmar la cuenta.
- Marketplace P2P en Tiempo Real: Una sección de "Mercado" donde el usuario visualice las mejores ofertas de compra y venta. Cuando el sistema detecte nuevas ofertas, la lista debe actualizarse automáticamente mostrando: tipo de cambio, monto disponible y reputación del ofertante. Tambien debe permitir al usuario crear su propia oferta ingresando monto y tipo de cambio deseado. Al hacer clic en "Publicar Oferta", esta debe ser visible para la comunidad y los fondos deben quedar bloqueados en un saldo de billetera virtual (Escrow). Un visitante podra visualizar el mercado de ofertas mas no participar mientras no se encuentre logueado.
- Gestión de Transacciones y Garantía: Al aceptar una oferta, una vez que el sistema confirme la recepción de fondos de una parte, el estado debe cambiar a "Fondos en Custodia" y bloquear la cancelación unilateral.
Integración Multi-Banco: Opción para vincular cuentas de BCP, Interbank, BBVA y Scotiabank. Al retirar fondos, el usuario selecciona su cuenta guardada y el sistema debe ejecutar la transferencia mostrando el número de operación para trazabilidad.
- Reputación y Soporte: Al finalizar una transacción con éxito, solicitar una valoración de 1 a 5 estrellas. El puntaje promedio del perfil público de la contraparte debe actualizarse de inmediato. Si pasan más de 15 minutos sin confirmación, habilitar un botón de "Reportar Incidencia". Esto debe notificar a un agente de soporte y congelar el proceso de liberación de fondos en el sistema Escrow hasta una revisión manual.

**Requisitos de la respuesta:**
- Para la web responsiva (FrontEnd) utiliza React. Utiliza el servicio S3 de AWS para alojar la web. Automatiza la creación de un bucket S3 público y el despliegue de la web con el framework serverless considerando el uso del rol de IAM LabRole existente.
- Para el BackEnd crea 4 microservicios o apis rest (usuarios, mercado, transacciones, disputas). Utiliza estos servicios de AWS (Api Gateway, Lambda y DynamoDB) para cada microservicio. Utiliza lenguaje de programación python. Automatiza el despliegue de cada microservicio con el framework serverless considerando el uso del rol de IAM LabRole existente.

**Elementos adicionales:**
- Si es mucha información en pantalla de celular para el registro de un nuevo paciente, considera partirlo en pasos.
