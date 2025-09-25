# Wild Pictures Studio - Photography Website

A complete photography studio website with booking system, contract management, and payment processing.

## Features

- 📸 Portfolio showcase
- 📅 Online booking system
- 📄 Digital contract generation
- 💳 Payment processing (Mercado Pago)
- 📅 Google Calendar integration
- 🛍️ Additional services store
- 👤 Client dashboard
- 🔐 Admin panel

## Setup Instructions

### 1. Google Calendar Integration

To enable calendar booking functionality:

esto es una nota

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Calendar API**
   - Navigate to "APIs & Services" → "Library"
   - Search and enable "Google Calendar API"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Choose "Web application"
   - Add your domain to "Authorized redirect URIs"
   - Required scope: `https://www.googleapis.com/auth/calendar.events`

4. **Get Access Token**
   - Use [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Or implement proper OAuth flow for production

5. **Configure Token**
   - For development: Open browser console and run:
     ```javascript
     window.__GCAL_TOKEN = 'your_access_token_here'
     ```
   - For production: Implement secure OAuth callback

### 2. Mercado Pago Integration

1. **Get Credentials**
   - Create account at [Mercado Pago Developers](https://www.mercadopago.com.br/developers/)
   - Get your Access Token (starts with `APP_USR-`)
   - Get your Public Key (optional, for SDK)

2. **Configure Environment Variables**

   For Firebase Functions, set secrets via Firebase config or environment variables:
   ```bash
   firebase functions:config:set mp.access_token=APP_USR-your-access-token-here
   ```
   Or set MP_ACCESS_TOKEN in your Functions environment.

3. **Test Integration**
   - Use sandbox credentials for testing
   - Switch to production credentials when ready

### 3. Firebase Setup

The project uses Firebase for:
- Authentication
- Firestore database
- File storage

Configure your Firebase project and update the config in `src/utils/firebaseClient.ts`.

### 4. Deployment

Deploy to Firebase Hosting and Functions:

1. Install Firebase CLI and login
2. Run `firebase init` (select Hosting and Functions if not initialized)
3. Set Functions config for Mercado Pago (see above)
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## Usage

### For Clients

1. Browse photography packages
2. Add services to cart
3. Fill booking form
4. Sign digital contract
5. Complete payment via Mercado Pago
6. Event automatically added to calendar

### For Admin

1. Access admin panel with password: `1234`
2. Manage products and packages
3. View contracts and orders
4. Track financial performance
5. Configure calendar integration

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```env
# Firebase (required)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Mercado Pago (for payments)
MP_ACCESS_TOKEN=APP_USR-your-access-token
VITE_MP_PUBLIC_KEY=your-public-key

# Google Calendar (configured via console for now)
# window.__GCAL_TOKEN = 'your_oauth_token'
```

## Security Notes

- Never commit access tokens or secrets to the repository
- Use environment variables for all sensitive configuration
- Implement proper OAuth flows for production
- Validate all user inputs
- Use HTTPS in production

## Support

For technical support or questions about the photography services, contact:
- Email: wildpicturesstudio@gmail.com
- WhatsApp: +55 41 98487-5565
- Instagram: @wild_pictures_studio
