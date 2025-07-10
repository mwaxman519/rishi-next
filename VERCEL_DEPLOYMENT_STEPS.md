# 🚀 Vercel Deployment - Complete Guide

## Option 1: Terminal Deployment (Recommended)

### Step 1: Open Terminal on Your Computer
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 2: Clone/Download Your Project
```bash
# If using Git
git clone [your-repo-url]
cd rishi-platform

# Or download the project files to your computer
```

### Step 3: Deploy
```bash
# Deploy to production
vercel --prod
```

## Option 2: GitHub Integration (Easiest)

### Step 1: Push to GitHub
1. Create a new GitHub repository
2. Push your Rishi Platform code to GitHub
3. Make sure all files are committed

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect Next.js

### Step 3: Configure Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: Leave default
- **Install Command**: `npm install`

## 🔧 Environment Variables to Set

In your Vercel project dashboard, add these:

### Required:
```
DATABASE_URL = postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishinext?sslmode=require&channel_binding=require

JWT_SECRET = your-secure-jwt-secret-here

JWT_REFRESH_SECRET = 7a8b9c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f

NODE_ENV = production

NEXT_PUBLIC_APP_ENV = production
```

### Optional:
```
NEXT_PUBLIC_APP_NAME = Rishi Platform
NEXT_PUBLIC_ENABLE_ANALYTICS = true
NEXT_PUBLIC_ENABLE_MONITORING = true
```

## 📋 What Happens During Deployment

1. **Vercel detects** Next.js project
2. **Installs** all dependencies
3. **Builds** the application
4. **Converts** 156+ API routes to serverless functions
5. **Deploys** to global CDN
6. **Provides** deployment URL

## 🎯 Expected Results

- **URL**: https://rishi-platform-[random].vercel.app
- **API Routes**: All functional as serverless functions
- **Database**: Connected to Neon PostgreSQL
- **Authentication**: JWT-based login system
- **Features**: Full cannabis workforce management

## 🔍 Testing After Deployment

1. Visit your deployment URL
2. Login with: mike/wrench519
3. Test calendar functionality
4. Verify API endpoints work
5. Check organization switching

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Ensure database connection is working
4. Review serverless function logs

## 🚀 Ready for Production!

Your Rishi Platform is configured and ready for deployment. Choose the method that works best for you!