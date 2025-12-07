# RentAI Technical Documentation

**Version:** 1.0.0  
**Last Updated:** December 2024

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Authentication Flow](#authentication-flow)
7. [Payment Flow](#payment-flow)
8. [Caching Strategy](#caching-strategy)
9. [Environment Variables](#environment-variables)
10. [Development Setup](#development-setup)

---

## Architecture Overview

RentAI is a serverless Next.js application deployed on Vercel with the following architecture:

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌─────────────────┐                  ┌──────────────┐
│  Next.js App    │                  │   Firebase   │
│  (Vercel)       │                  │   Auth       │
│                 │                  └──────────────┘
│  ┌───────────┐  │
│  │ API Routes│  │
│  │           │  │
│  │ /scan     │──┼──► Google Custom Search API
│  │           │  │
│  │           │──┼──► Google Gemini AI
│  │           │  │
│  │ /payment  │──┼──► MercadoPago API
│  │           │  │
│  │ /webhook  │◄─┼─── MercadoPago Webhooks
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │ Firestore │◄─┼──► Cache & User Data
│  └───────────┘  │
└─────────────────┘
```

### Key Components:

1. **Frontend**: Next.js React app with server-side rendering
2. **API Layer**: Serverless functions on Vercel
3. **Authentication**: Firebase Google Auth
4. **Database**: Firestore for caching and user data
5. **AI Processing**: Google Gemini 2.0 Flash
6. **Search**: Google Custom Search API
7. **Payments**: MercadoPago integration

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: CSS Modules
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes (Serverless)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth

### External Services
- **AI**: Google Gemini 2.0 Flash API
- **Search**: Google Custom Search API
- **Payments**: MercadoPago SDK
- **Hosting**: Vercel
- **Domain**: GoDaddy DNS

---

## Project Structure

```
rentapp/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API Routes (Serverless Functions)
│   │   │   ├── scan/
│   │   │   │   └── route.js        # Search & AI analysis endpoint
│   │   │   └── payment/
│   │   │       ├── create-preference/
│   │   │       │   └── route.js    # Create MercadoPago payment
│   │   │       └── webhook/
│   │   │           └── route.js    # Receive payment notifications
│   │   ├── layout.js               # Root layout
│   │   ├── page.js                 # Home page
│   │   ├── globals.css             # Global styles
│   │   └── favicon.ico             # Favicon
│   │
│   ├── components/                 # React Components
│   │   ├── Navbar.js               # Navigation bar with auth
│   │   ├── FilterBar.js            # Search filters
│   │   ├── ListingCard.js          # Rental listing card
│   │   ├── ListingDetailsModal.js  # Listing details popup
│   │   └── PaymentModal.js         # Payment UI
│   │
│   └── lib/                        # Utility Libraries
│       ├── firebase.js             # Firebase initialization
│       ├── cache.js                # Search caching utilities
│       ├── userCredits.js          # User credit management
│       └── ai-analyzer.js          # AI utilities (legacy)
│
├── public/                         # Static assets
│   ├── *.svg                       # Icons
│   └── favicon.ico
│
├── docs/                           # Documentation
│   ├── TECHNICAL.md                # This file
│   ├── USER_GUIDE.md               # User-friendly guide
│   └── DEPLOYMENT.md               # Deployment instructions
│
├── .env.local                      # Environment variables (gitignored)
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
├── next.config.mjs                 # Next.js configuration
└── README.md                       # Project overview
```

---

## API Endpoints

### 1. Search & Analysis: `GET /api/scan`

Searches for rental listings and analyzes them with AI.

**Query Parameters:**
- `query` (string, required): Search term (e.g., "palermo 2 ambientes")

**Response:**
```json
{
  "listings": [
    {
      "id": "https://example.com/listing",
      "title": "Departamento 2 ambientes en Palermo",
      "description": "Hermoso departamento...",
      "price": 150000,
      "currency": "ARS",
      "location": "Palermo, CABA",
      "bedrooms": 2,
      "bathrooms": 1,
      "amenities": ["WiFi", "Cocina", "Balcón"],
      "images": [],
      "contact": null,
      "source": "MercadoLibre",
      "url": "https://example.com/listing",
      "aiAnalysis": {
        "summary": "Buena relación precio-calidad para la zona...",
        "priceRating": "Razonable"
      },
      "postedAt": "2024-12-07T00:00:00.000Z"
    }
  ],
  "cached": false
}
```

**Caching:**
- Results are cached for 24 hours in Firestore
- Subsequent identical searches return cached results
- `cached: true` indicates cache hit

**Flow:**
1. Check Firestore cache for query
2. If cache hit and valid → return cached results
3. If cache miss → call Google Custom Search API
4. Process results with Gemini AI
5. Store results in cache
6. Return listings

---

### 2. Create Payment: `POST /api/payment/create-preference`

Creates a MercadoPago payment preference.

**Request Body:**
```json
{
  "userId": "firebase_user_id"
}
```

**Response:**
```json
{
  "id": "preference_id_123",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

**Flow:**
1. Validate user ID
2. Create payment preference with MercadoPago SDK
3. Include user ID in metadata
4. Set notification URL for webhook
5. Return checkout URL

---

### 3. Payment Webhook: `POST /api/payment/webhook`

Receives MercadoPago payment notifications.

**Request Body** (from MercadoPago):
```json
{
  "type": "payment",
  "action": "payment.updated",
  "data": {
    "id": "payment_id_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Credits added successfully"
}
```

**Flow:**
1. Receive webhook notification
2. Fetch payment details from MercadoPago API
3. Check if payment is approved
4. Extract user ID from metadata
5. Add 10 credits to user in Firestore
6. Return success

**Configuration Required:**
- Set webhook URL in MercadoPago dashboard
- URL: `https://www.encontraralquiler.com/api/payment/webhook`

---

## Database Schema

### Firestore Collections

#### `searchCache`

Stores cached search results to reduce API calls.

```javascript
{
  // Document ID: normalized query (lowercase, trimmed)
  query: "palermo 2 ambientes",
  results: [...],  // Array of listing objects
  timestamp: 1733529600000,
  expiresAt: 1733616000000,  // timestamp + 24 hours
  createdAt: "2024-12-07T00:00:00.000Z"
}
```

**Indexes:**
- `expiresAt` (for cleanup queries)

---

#### `users`

Tracks user credits and purchase history.

```javascript
{
  // Document ID: Firebase user UID
  uid: "firebase_user_id",
  email: "user@example.com",
  credits: 10,
  totalPurchased: 10,
  lastPurchase: "2024-12-07T00:00:00.000Z",
  createdAt: "2024-12-07T00:00:00.000Z",
  lastUpdated: "2024-12-07T00:00:00.000Z"
}
```

**Fields:**
- `credits`: Current available credits
- `totalPurchased`: Lifetime total credits purchased
- `lastPurchase`: ISO timestamp of last purchase
- `createdAt`: User creation timestamp
- `lastUpdated`: Last modification timestamp

---

## Authentication Flow

### Google Sign-In

```
User clicks "Iniciar Sesión"
    ↓
Firebase Auth popup opens
    ↓
User selects Google account
    ↓
Google authenticates user
    ↓
Firebase creates/retrieves user
    ↓
App receives user object
    ↓
User state stored in React context
    ↓
UI updates with user info
```

### Implementation

```javascript
// lib/firebase.js
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign in
const result = await signInWithPopup(auth, googleProvider);
const user = result.user;

// Sign out
await signOut(auth);
```

### User Object

```javascript
{
  uid: "firebase_unique_id",
  displayName: "User Name",
  email: "user@example.com",
  photoURL: "https://..."
}
```

---

## Payment Flow

### Complete Payment Cycle

```
1. User clicks "Comprar más vistas"
    ↓
2. PaymentModal opens
    ↓
3. User clicks "Pagar con MercadoPago"
    ↓
4. Frontend calls /api/payment/create-preference
   with userId
    ↓
5. Backend creates MercadoPago preference
   - Includes userId in metadata
   - Sets notification_url for webhook
    ↓
6. User redirected to MercadoPago checkout
    ↓
7. User completes payment
    ↓
8. MercadoPago sends webhook to /api/payment/webhook
    ↓
9. Webhook handler:
   - Fetches payment details
   - Verifies payment approved
   - Extracts userId from metadata
   - Adds 10 credits to user in Firestore
    ↓
10. User redirected back to app
    ↓
11. App shows success message
    ↓
12. User can now search with new credits
```

### MercadoPago Configuration

**Required in Dashboard:**
1. Go to: https://www.mercadopago.com.ar/developers/panel
2. Select your application
3. Navigate to "Webhooks"
4. Add webhook URL: `https://www.encontraralquiler.com/api/payment/webhook`
5. Select events: `payment.created`, `payment.updated`

---

## Caching Strategy

### Why Caching?

Google Custom Search API has a strict limit of **100 queries/day** on the free tier. Caching dramatically extends this limit.

### Implementation

**Cache Key:** Normalized query (lowercase, trimmed)

**Cache Duration:** 24 hours

**Cache Storage:** Firestore `searchCache` collection

### Cache Hit Scenario

```
User searches "Palermo 2 ambientes"
    ↓
Normalize query: "palermo 2 ambientes"
    ↓
Check Firestore for document ID: "palermo 2 ambientes"
    ↓
Document exists and not expired
    ↓
Return cached results
    ↓
✅ API calls saved: 2 (Google Search + Gemini)
```

### Cache Miss Scenario

```
User searches "Recoleta 3 ambientes"
    ↓
Normalize query: "recoleta 3 ambientes"
    ↓
Check Firestore - no document found
    ↓
Call Google Custom Search API
    ↓
Process with Gemini AI
    ↓
Store results in Firestore
    ↓
Return results to user
```

### Benefits

- **Extends API limits**: 100 unique searches → potentially thousands of total searches
- **Faster responses**: Cached results return in ~100ms vs ~3-5s for API calls
- **Cost savings**: Reduces paid API usage when scaled
- **Better UX**: Instant results for popular searches

---

## Environment Variables

### Required Variables

```env
# Google Gemini AI
GEMINI_API_KEY=AIza...

# Google Custom Search
GOOGLE_SEARCH_ENGINE_ID=abc123...

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...

# Firebase (Client-side - optional if using mock)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

### Where to Get Them

| Variable | Source |
|----------|--------|
| `GEMINI_API_KEY` | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `GOOGLE_SEARCH_ENGINE_ID` | [Programmable Search Engine](https://programmablesearchengine.google.com/) |
| `MERCADOPAGO_ACCESS_TOKEN` | [MercadoPago Developers](https://www.mercadopago.com.ar/developers/panel) |
| Firebase variables | [Firebase Console](https://console.firebase.google.com/) → Project Settings |

### Vercel Configuration

Add all variables in Vercel dashboard:
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development
4. Redeploy after adding

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Google Cloud project
- MercadoPago account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/rentapp.git
cd rentapp

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

### Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Deploy to Vercel
vercel --prod
```

### Testing Locally

**Test Search:**
```bash
curl "http://localhost:3000/api/scan?query=palermo"
```

**Test Payment Creation:**
```bash
curl -X POST http://localhost:3000/api/payment/create-preference \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123"}'
```

**Test Webhook:**
```bash
curl http://localhost:3000/api/payment/webhook
```

---

## Performance Considerations

### Serverless Function Limits

- **Execution time**: 10 seconds max on Vercel free tier
- **Memory**: 1024 MB default
- **Concurrent executions**: Unlimited

### Optimization Strategies

1. **Caching**: Reduces API calls and response time
2. **Lazy loading**: Components load on demand
3. **Image optimization**: Next.js automatic image optimization
4. **Code splitting**: Automatic with Next.js App Router

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local`
2. **API Keys**: Use server-side only (not `NEXT_PUBLIC_`)
3. **Webhook Verification**: Verify MercadoPago signatures (TODO)
4. **Firebase Rules**: Restrict Firestore access
5. **CORS**: Configure allowed origins
6. **Rate Limiting**: Implement for API routes (TODO)

---

## Monitoring & Debugging

### Vercel Logs

View real-time logs:
```bash
vercel logs --follow
```

Or in dashboard: https://vercel.com/miqueas-garays-projects/rentapp/logs

### Firestore Console

Monitor database: https://console.firebase.google.com/

### API Usage

Check quotas:
- Google Cloud Console: https://console.cloud.google.com/apis/dashboard
- MercadoPago: https://www.mercadopago.com.ar/developers/panel

---

## Troubleshooting

### Common Issues

**Issue**: "Google Search API failed: 429"
- **Cause**: Exceeded 100 queries/day limit
- **Solution**: Wait 24 hours or upgrade to paid tier

**Issue**: "Firebase initialization failed"
- **Cause**: Missing or invalid Firebase config
- **Solution**: Check environment variables

**Issue**: "Webhook not receiving notifications"
- **Cause**: Webhook URL not configured in MercadoPago
- **Solution**: Add URL in MercadoPago dashboard

**Issue**: "Payment successful but no credits added"
- **Cause**: User ID not in payment metadata
- **Solution**: Ensure client sends userId in create-preference request

---

## Future Enhancements

- [ ] Webhook signature verification
- [ ] Rate limiting on API routes
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Favorite listings
- [ ] Price alerts
- [ ] Mobile app (React Native)

---

## Support

For technical issues, contact: miqueasgaray4@gmail.com
