# RentAI Deployment Guide

Complete guide for deploying RentAI to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Domain Configuration](#domain-configuration)
5. [MercadoPago Webhook Setup](#mercadopago-webhook-setup)
6. [Firebase Configuration](#firebase-configuration)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Vercel account (free tier works)
- ✅ Domain name (e.g., from GoDaddy)
- ✅ Firebase project with Firestore enabled
- ✅ Google Cloud project with APIs enabled
- ✅ MercadoPago production credentials
- ✅ Git repository (GitHub recommended)

---

## Vercel Deployment

### Option 1: Deploy via CLI (Recommended)

**Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

**Step 2: Login to Vercel**

```bash
vercel login
```

Follow the prompts to authenticate.

**Step 3: Deploy**

```bash
# From project directory
cd /path/to/rentapp

# Deploy to production
vercel --prod
```

**Step 4: Note the deployment URL**

Vercel will provide a URL like: `rentapp-xyz123.vercel.app`

---

### Option 2: Deploy via GitHub Integration

**Step 1: Push code to GitHub**

```bash
git remote add origin https://github.com/yourusername/rentapp.git
git push -u origin main
```

**Step 2: Connect to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click "Deploy"

**Step 3: Automatic Deployments**

- Every push to `main` → Production deployment
- Every push to other branches → Preview deployment

---

## Environment Variables

### Required Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `GEMINI_API_KEY` | Your Gemini API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `GOOGLE_SEARCH_ENGINE_ID` | Your search engine ID | [Programmable Search](https://programmablesearchengine.google.com/) |
| `MERCADOPAGO_ACCESS_TOKEN` | Production access token | [MercadoPago Dashboard](https://www.mercadopago.com.ar/developers/panel) |

### Optional Firebase Variables

If using real Firebase (not mock):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |

### Adding Variables in Vercel

1. Go to: https://vercel.com/miqueas-garays-projects/rentapp/settings/environment-variables
2. Click "Add New"
3. Enter variable name and value
4. Select environments: **Production**, **Preview**, **Development**
5. Click "Save"
6. Repeat for all variables

### After Adding Variables

**Redeploy:**

```bash
vercel --prod
```

Or trigger a redeploy in Vercel dashboard.

---

## Domain Configuration

### Step 1: Add Domain in Vercel

1. Go to: Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `encontraralquiler.com`
4. Click "Add"

Vercel will show DNS configuration instructions.

### Step 2: Configure DNS in GoDaddy

**For Root Domain (`encontraralquiler.com`):**

Add A records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 600 |

**For WWW Subdomain (`www.encontraralquiler.com`):**

Add CNAME record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | `[your-vercel-dns].vercel-dns.com` | 600 |

> **Note**: Vercel provides the exact CNAME value in the dashboard.

### Step 3: Wait for DNS Propagation

- **Time**: 5 minutes to 48 hours (usually 1-2 hours)
- **Check**: https://dnschecker.org

### Step 4: SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

**Status**: Check in Vercel dashboard → Domains

When you see ✅ next to your domain, SSL is ready!

---

## MercadoPago Webhook Setup

**Critical**: This must be configured for payments to work!

### Step 1: Get Webhook URL

Your webhook URL is:
```
https://www.encontraralquiler.com/api/payment/webhook
```

(Or your Vercel deployment URL if not using custom domain)

### Step 2: Configure in MercadoPago

1. Go to: https://www.mercadopago.com.ar/developers/panel
2. Select your application
3. Navigate to **"Webhooks"** or **"Notificaciones"**
4. Click **"Configurar notificaciones"**
5. Enter webhook URL: `https://www.encontraralquiler.com/api/payment/webhook`
6. Select events:
   - ✅ `payment.created`
   - ✅ `payment.updated`
7. Click "Guardar"

### Step 3: Test Webhook

**Test endpoint is active:**

```bash
curl https://www.encontraralquiler.com/api/payment/webhook
```

Should return:
```json
{
  "message": "MercadoPago Webhook Endpoint",
  "status": "active",
  "url": "https://www.encontraralquiler.com/api/payment/webhook"
}
```

### Step 4: Test Payment Flow

1. Make a test purchase (use sandbox if available)
2. Check Vercel logs for webhook notification
3. Verify credits added to user in Firestore

---

## Firebase Configuration

### Step 1: Enable Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **"Create database"**
5. Choose **"Start in production mode"**
6. Select location (choose closest to your users)

### Step 2: Set Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to search cache
    match /searchCache/{query} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
    
    // User data - users can only read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only server can write
    }
  }
}
```

**To update rules:**
1. Go to Firestore → Rules tab
2. Paste the rules above
3. Click "Publish"

### Step 3: Enable Authentication

1. Navigate to **Authentication**
2. Click **"Get started"**
3. Enable **"Google"** sign-in method
4. Add authorized domains:
   - `localhost` (for development)
   - `encontraralquiler.com`
   - `www.encontraralquiler.com`
   - Your Vercel deployment domain

---

## Post-Deployment Checklist

### Functionality Tests

- [ ] **Homepage loads** - Visit your domain
- [ ] **Search works** - Try a search query
- [ ] **Results display** - Check listings appear
- [ ] **Caching works** - Search same query twice, check logs
- [ ] **Authentication works** - Sign in with Google
- [ ] **Payment flow works** - Create payment preference
- [ ] **Webhook receives notifications** - Complete test payment
- [ ] **Credits added** - Verify in Firestore after payment
- [ ] **SSL active** - Check for HTTPS and padlock icon

### Performance Tests

- [ ] **Page load time** - Should be < 3 seconds
- [ ] **Search response time** - First search < 5s, cached < 1s
- [ ] **Mobile responsive** - Test on phone/tablet
- [ ] **Cross-browser** - Test Chrome, Firefox, Safari

### Monitoring Setup

- [ ] **Vercel Analytics** - Enable in dashboard
- [ ] **Error tracking** - Check Vercel logs
- [ ] **API quota monitoring** - Check Google Cloud Console
- [ ] **Firestore usage** - Monitor in Firebase Console

---

## Monitoring & Maintenance

### Vercel Dashboard

**URL**: https://vercel.com/miqueas-garays-projects/rentapp

**Monitor:**
- Deployments
- Analytics (page views, performance)
- Logs (errors, API calls)
- Bandwidth usage

### Google Cloud Console

**URL**: https://console.cloud.google.com

**Monitor:**
- Gemini API usage (quota)
- Custom Search API usage (100/day limit!)
- API errors

### Firebase Console

**URL**: https://console.firebase.google.com

**Monitor:**
- Firestore reads/writes
- Storage usage
- Authentication users

### MercadoPago Dashboard

**URL**: https://www.mercadopago.com.ar/developers/panel

**Monitor:**
- Transactions
- Webhook deliveries
- API errors

---

## Updating the Application

### For Code Changes

**Via CLI:**

```bash
# Make your changes
git add .
git commit -m "Your changes"

# Deploy to preview first (test)
vercel

# If good, deploy to production
vercel --prod
```

**Via GitHub:**

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel auto-deploys to production
```

### For Environment Variable Changes

1. Update in Vercel dashboard
2. Redeploy:
   ```bash
   vercel --prod
   ```

### Rollback

**If deployment breaks:**

1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

---

## Troubleshooting

### Deployment Fails

**Error**: Build failed

**Solutions:**
1. Check build logs in Vercel
2. Test build locally: `npm run build`
3. Check for missing dependencies
4. Verify environment variables

---

### Domain Not Working

**Error**: DNS not found

**Solutions:**
1. Check DNS propagation: https://dnschecker.org
2. Verify DNS records in GoDaddy
3. Wait longer (up to 48 hours)
4. Clear browser cache
5. Try incognito mode

---

### SSL Certificate Issues

**Error**: Not secure / No HTTPS

**Solutions:**
1. Wait for Vercel to provision certificate (can take 5-10 minutes)
2. Verify DNS is correctly configured
3. Check Vercel dashboard for SSL status
4. Try forcing HTTPS renewal in Vercel settings

---

### Webhook Not Working

**Error**: Payments succeed but no credits added

**Solutions:**
1. Verify webhook URL in MercadoPago dashboard
2. Check Vercel logs for webhook calls
3. Test webhook endpoint manually
4. Verify MERCADOPAGO_ACCESS_TOKEN is correct
5. Check Firestore rules allow writes

---

### API Quota Exceeded

**Error**: Google Search API returns 429

**Solutions:**
1. You've hit 100 queries/day limit
2. Wait 24 hours for reset
3. Upgrade to paid tier ($5/1000 queries)
4. Implement stricter caching (already done)

---

### Firestore Permission Denied

**Error**: Missing or insufficient permissions

**Solutions:**
1. Check Firestore rules
2. Verify user is authenticated
3. Check server-side code has proper credentials
4. Review Firebase Console → Firestore → Rules

---

## Scaling Considerations

### When to Upgrade

**Vercel Free Tier Limits:**
- 100 GB bandwidth/month
- 100 GB-hours serverless execution

**Upgrade to Pro ($20/month) when:**
- Exceeding bandwidth (>50k visits/month)
- Need team collaboration
- Want advanced analytics

**Google APIs:**
- Custom Search: Upgrade at 100 queries/day ($5/1000)
- Gemini: Upgrade at 666 searches/day (~$5-10/month)

### Cost Projections

**1,000 searches/month:**
- Vercel: FREE
- Google Search: $5/month
- Gemini: FREE
- **Total: ~$5/month**

**10,000 searches/month:**
- Vercel: FREE
- Google Search: $50/month
- Gemini: ~$10/month
- **Total: ~$60/month**

---

## Backup & Recovery

### Code Backup

- ✅ Code is in Git (GitHub)
- ✅ Vercel keeps deployment history
- ✅ Can rollback anytime

### Database Backup

**Firestore:**
1. Go to Firebase Console
2. Firestore → Import/Export
3. Export to Google Cloud Storage
4. Schedule regular backups

### Environment Variables

**Backup `.env.local`:**
- Store securely (password manager, encrypted file)
- Never commit to Git
- Keep production and development separate

---

## Security Best Practices

### Production Checklist

- [ ] All API keys are server-side only
- [ ] `.env.local` is in `.gitignore`
- [ ] Firestore rules restrict access
- [ ] HTTPS enabled (SSL certificate)
- [ ] Webhook signature verification (TODO)
- [ ] Rate limiting implemented (TODO)
- [ ] CORS configured properly
- [ ] No sensitive data in client code

### Regular Maintenance

- **Weekly**: Check error logs
- **Monthly**: Review API usage and costs
- **Quarterly**: Update dependencies
- **Annually**: Rotate API keys

---

## Support

For deployment issues:

📧 **Email**: miqueasgaray4@gmail.com

**Include:**
- Error messages
- Deployment logs
- Steps to reproduce
- Environment (production/preview)

---

*Last updated: December 2024*
