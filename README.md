# 🏠 RentAI - AI-Powered Rental Search Platform

**Live at:** [www.encontraralquiler.com](https://www.encontraralquiler.com)

RentAI is an intelligent rental property search platform that uses AI to analyze and present rental listings from across the web. Built with Next.js, Google Gemini AI, and deployed on Vercel.

---

## ✨ Features

- 🤖 **AI-Powered Analysis** - Google Gemini analyzes listings for quality, pricing, and details
- 🔍 **Smart Search** - Google Custom Search API finds rentals across the web
- 🔐 **Google Authentication** - Secure login with Firebase Auth
- 💳 **Payment Integration** - MercadoPago for premium access
- 🎨 **Modern UI** - Responsive design with Framer Motion animations
- ⚡ **Fast & Scalable** - Deployed on Vercel with serverless functions

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16
- **AI:** Google Gemini 2.0 Flash
- **Search:** Google Custom Search API
- **Authentication:** Firebase Auth
- **Payments:** MercadoPago
- **Hosting:** Vercel
- **Styling:** CSS Modules + Framer Motion

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- Google Cloud project with Gemini & Custom Search APIs enabled
- MercadoPago account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/rentapp.git
   cd rentapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   
   # Google Custom Search
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
   
   # MercadoPago
   MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_token
   
   # Firebase (optional - for client-side config)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

---

## 📁 Project Structure

```
rentapp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/route.js          # Search & AI analysis endpoint
│   │   │   └── payment/
│   │   │       └── create-preference/route.js  # MercadoPago integration
│   │   ├── page.js                     # Main page
│   │   ├── layout.js                   # Root layout
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── Navbar.js                   # Navigation bar
│   │   ├── ListingCard.js              # Rental listing card
│   │   ├── FilterBar.js                # Search filters
│   │   ├── PaymentModal.js             # Payment UI
│   │   └── ListingDetailsModal.js      # Listing details
│   └── lib/
│       ├── firebase.js                 # Firebase config
│       └── ai-analyzer.js              # AI utilities
├── public/                             # Static assets
├── .env.local                          # Environment variables (not in git)
└── package.json
```

---

## 🔑 API Endpoints

### `GET /api/scan?query={search_term}`

Searches for rental listings and analyzes them with AI.

**Parameters:**
- `query` - Search term (e.g., "palermo 2 ambientes")

**Response:**
```json
{
  "listings": [
    {
      "id": "unique_id",
      "title": "Departamento 2 ambientes en Palermo",
      "price": 150000,
      "currency": "ARS",
      "location": "Palermo, CABA",
      "bedrooms": 2,
      "bathrooms": 1,
      "amenities": ["WiFi", "Cocina"],
      "aiAnalysis": {
        "summary": "Buena relación precio-calidad...",
        "priceRating": "Razonable"
      },
      "url": "https://...",
      "source": "MercadoLibre"
    }
  ]
}
```

### `POST /api/payment/create-preference`

Creates a MercadoPago payment preference.

**Response:**
```json
{
  "id": "preference_id",
  "init_point": "https://mercadopago.com/checkout/..."
}
```

---

## 🌍 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Add environment variables** in Vercel dashboard

5. **Connect custom domain** (optional)

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📊 Service Limits

| Service | Free Tier Limit | Notes |
|---------|----------------|-------|
| Google Custom Search | 100 queries/day | Main bottleneck |
| Google Gemini API | 666 searches/day | 1M tokens/day |
| Vercel | 100 GB bandwidth/month | ~50k visits |
| Firebase Auth | Unlimited (Google) | Using Google Auth |
| MercadoPago | Transaction fees only | ~4% per transaction |

For detailed limits and costs, see [service_limits.md](docs/service_limits.md)

---

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Google Authentication
3. Add your domain to authorized domains
4. Copy config to `.env.local`

### Google Cloud Setup

1. Enable Gemini API
2. Enable Custom Search API
3. Create a Custom Search Engine
4. Get API keys and add to `.env.local`

### MercadoPago Setup

1. Create a MercadoPago account
2. Get production access token
3. Add to `.env.local`

---

## 📝 License

This project is private and proprietary.

---

## 👤 Author

**Miqueas Garay**
- Email: miqueasgaray4@gmail.com
- Website: [www.encontraralquiler.com](https://www.encontraralquiler.com)

---

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Vercel for hosting
- Firebase for authentication
- MercadoPago for payment processing
