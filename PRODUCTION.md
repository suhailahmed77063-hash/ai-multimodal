# AI Multimodal - Production Deployment Guide

## Overview
AI Multimodal is a multi-model AI chat application with Razorpay payment integration.

## Prerequisites
- Node.js 18+ 
- npm or pnpm
- Firebase project
- Clerk account for authentication
- Razorpay account for payments
- Kravix Studio API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key

# Kravix Studio API
KRAVIXSTUDIO_API_KEY=your_kravix_api_key

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Installation

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

## Production Checklist

### 1. Security
- [ ] All environment variables are set
- [ ] Firebase security rules are configured
- [ ] Clerk authentication is properly configured
- [ ] Razorpay webhook secret is configured

### 2. Performance
- [ ] Images are optimized
- [ ] Code splitting is working
- [ ] API routes are properly cached

### 3. Monitoring
- [ ] Error logging is configured
- [ ] Analytics are set up
- [ ] Uptime monitoring is enabled

### 4. Payments
- [ ] Razorpay is in live mode
- [ ] Webhook URL is configured in Razorpay dashboard
- [ ] Payment verification is working

## API Endpoints

### AI Chat
- `POST /api/ai-multi-model` - Send message to AI models

### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment and update credits
- `POST /api/webhook/razorpay` - Handle Razorpay webhooks

## Pricing Plans

| Plan | Price (INR) | Credits | Features |
|------|-------------|---------|----------|
| Free | ₹0 | 100 | Basic AI models, 5 messages/day |
| Pro | ₹299 | 1,000 | All AI models, 100 messages/day |
| Enterprise | ₹999 | 5,000 | All AI models, API access, Priority support |

## Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables
3. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Server
1. Build the application: `npm run build`
2. Start with PM2: `pm2 start npm --name "ai-multimodal" -- start`

## Support
For issues, contact support or create an issue in the repository.
