---
description: Deploy RentAI MVP to GoDaddy
---

# Deploying RentAI to GoDaddy - Step by Step Guide

## Important Context

Your RentAI app is a **Next.js application** with:
- Server-side API routes (`/api/scan`)
- Firebase integration
- Google Gemini AI integration
- Dynamic server-side rendering

GoDaddy shared hosting **does not support Node.js applications** by default. You have **three main options**:

---

## Option 1: GoDaddy VPS (Recommended for Full Features)

This option preserves all your app's functionality including API routes and server-side rendering.

### Step 1: Purchase/Access GoDaddy VPS
1. Log into your GoDaddy account
2. Navigate to "Servers" or "VPS Hosting"
3. If you don't have a VPS, you'll need to purchase one (starts around $5-10/month)
4. Choose a Linux-based VPS (Ubuntu 22.04 LTS recommended)

### Step 2: Connect to Your VPS
```bash
# SSH into your VPS (GoDaddy will provide these credentials)
ssh root@your-vps-ip-address
```

### Step 3: Install Node.js and npm
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Install Git
```bash
sudo apt install git -y
```

### Step 5: Clone Your Repository or Upload Files
**Option A - Using Git:**
```bash
cd /var/www
git clone <your-repository-url> rentapp
cd rentapp
```

**Option B - Using SCP (from your local machine):**
```bash
# Run this from your local machine, not the VPS
scp -r /home/miqueas/Desktop/rentapp root@your-vps-ip:/var/www/
```

### Step 6: Install Dependencies
```bash
cd /var/www/rentapp
npm install
```

### Step 7: Set Up Environment Variables
```bash
# Create .env.local file
nano .env.local
```

Copy your environment variables from your local `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

Save with `Ctrl+X`, then `Y`, then `Enter`

### Step 8: Build Your Application
```bash
npm run build
```

### Step 9: Install PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start your app with PM2
pm2 start npm --name "rentapp" -- start

# Set PM2 to start on system boot
pm2 startup
pm2 save
```

### Step 10: Install and Configure Nginx
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/rentapp
```

Add this configuration (replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and exit, then:
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/rentapp /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 11: Point Your Domain to VPS
1. Log into GoDaddy DNS Management
2. Go to your domain's DNS settings
3. Add/Edit an **A Record**:
   - Type: `A`
   - Name: `@` (for root domain)
   - Value: Your VPS IP address
   - TTL: 600 (or default)
4. Add another **A Record** for www:
   - Type: `A`
   - Name: `www`
   - Value: Your VPS IP address
   - TTL: 600

**Note:** DNS changes can take 1-48 hours to propagate

### Step 12: Install SSL Certificate (HTTPS)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts, enter your email, agree to terms
```

Certbot will automatically configure Nginx for HTTPS and set up auto-renewal.

### Step 13: Configure Firewall
```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Step 14: Verify Deployment
1. Visit `http://yourdomain.com` (should redirect to HTTPS)
2. Test the search functionality
3. Check PM2 status: `pm2 status`
4. Check logs if needed: `pm2 logs rentapp`

---

## Option 2: Static Export to GoDaddy Shared Hosting

This option requires modifying your app to work as a static site (loses API routes and server-side features).

### Step 1: Modify Next.js for Static Export

**Update `next.config.mjs`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
```

### Step 2: Move API Logic to Client-Side
You'll need to:
- Move `/api/scan` logic to client-side
- Call external APIs directly from the browser (may have CORS issues)
- Or use a separate backend service (Firebase Functions, Vercel Serverless, etc.)

### Step 3: Build Static Site
```bash
npm run build
```

This creates an `out` folder with static files.

### Step 4: Upload to GoDaddy
1. Log into GoDaddy cPanel
2. Open File Manager
3. Navigate to `public_html` (or your domain's root folder)
4. Upload all files from the `out` folder
5. Ensure `index.html` is in the root

**Note:** This approach has significant limitations for your app.

---

## Option 3: Use Vercel + Point GoDaddy Domain (Easiest)

This is the **easiest and most recommended** option for Next.js apps.

### Step 1: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts:
- Set up and deploy? `Y`
- Which scope? Choose your account
- Link to existing project? `N`
- Project name? `rentapp`
- Directory? `./`
- Override settings? `N`

### Step 2: Add Environment Variables in Vercel
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all your environment variables from `.env.local`

### Step 3: Deploy to Production
```bash
vercel --prod
```

Vercel will give you a URL like `rentapp.vercel.app`

### Step 4: Point GoDaddy Domain to Vercel
1. Log into GoDaddy DNS Management
2. Go to your domain's DNS settings
3. Add a **CNAME Record**:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: 600
4. Add an **A Record** for root domain:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21` (Vercel's IP)
   - TTL: 600

### Step 5: Add Domain in Vercel
1. In Vercel dashboard, go to your project
2. Go to Settings → Domains
3. Add your GoDaddy domain (e.g., `yourdomain.com`)
4. Add `www.yourdomain.com` as well
5. Vercel will automatically configure SSL

**Wait 24-48 hours for DNS propagation**

---

## Recommended Approach

**For MVP and ease of deployment:** Use **Option 3 (Vercel)** - it's free, handles Next.js perfectly, includes automatic SSL, and requires minimal configuration.

**For full control and learning:** Use **Option 1 (VPS)** - gives you complete control but requires more setup and maintenance.

**Avoid:** Option 2 (Static Export) - loses too much functionality for your app.

---

## Troubleshooting

### DNS Not Propagating
- Check DNS propagation: https://dnschecker.org
- Clear browser cache
- Try incognito mode
- Wait up to 48 hours

### PM2 App Not Starting
```bash
pm2 logs rentapp
pm2 restart rentapp
```

### Nginx Errors
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues
```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

---

## Post-Deployment Checklist

- [ ] App loads on your domain
- [ ] HTTPS is working (green padlock)
- [ ] Search functionality works
- [ ] Firebase authentication works
- [ ] Images load correctly
- [ ] Mobile responsive design works
- [ ] Check browser console for errors
- [ ] Test on different browsers
- [ ] Monitor performance and errors

---

## Updating Your App (After Initial Deployment)

### For VPS:
```bash
ssh root@your-vps-ip
cd /var/www/rentapp
git pull  # or upload new files
npm install
npm run build
pm2 restart rentapp
```

### For Vercel:
```bash
# Just deploy again
vercel --prod
```

---

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [GoDaddy VPS Guide](https://www.godaddy.com/help/vps-hosting-27785)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
