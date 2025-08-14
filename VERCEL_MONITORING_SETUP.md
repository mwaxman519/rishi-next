# 🚀 Vercel Deployment Monitoring Setup

## Overview

I've created an automated Vercel deployment monitoring system that watches your deployments and automatically troubleshoots build issues. This system can detect common build failures and attempt fixes automatically.

## Components Created

### 1. **Node.js Monitor Script** (`scripts/vercel-monitor.js`)
Advanced monitoring with automatic troubleshooting:
- Real-time deployment status tracking
- Automatic error detection and diagnosis
- Self-healing fixes for common issues
- Optional webhook notifications

### 2. **Shell Script Monitor** (`scripts/vercel-monitor.sh`)
Lightweight bash-based monitor:
- Simple deployment watching
- Basic error analysis
- Automatic retry logic

### 3. **GitHub Actions Workflow** (`.github/workflows/vercel-monitor.yml`)
Automated CI/CD monitoring:
- Triggers on deployments
- Scheduled checks every 15 minutes
- Creates GitHub issues for failures
- Sends notifications

## 🎯 Features

### Automatic Error Detection & Fixes

The monitor detects and can automatically fix:

1. **Missing Dependencies**
   - Detects: `Module not found: Can't resolve 'package-name'`
   - Fix: Automatically installs missing package

2. **TypeScript Errors**
   - Detects: `Type error: ...`
   - Fix: Runs TypeScript compiler check

3. **Environment Variables**
   - Detects: Missing environment variable errors
   - Fix: Lists required variables (manual setup needed)

4. **Memory Issues**
   - Detects: `JavaScript heap out of memory`
   - Fix: Increases Node.js memory limit

5. **Database Migrations**
   - Detects: Database migration failures
   - Fix: Runs safe migration script

6. **Build Script Failures**
   - Detects: Build command exit errors
   - Fix: Clears cache and reinstalls dependencies

## 📦 Installation & Setup

### Option 1: Local Monitoring

```bash
# Make scripts executable
chmod +x scripts/vercel-monitor.sh

# Install dependencies (if using Node.js version)
npm install

# Start monitoring (choose one):
node scripts/vercel-monitor.js monitor    # Node.js version
./scripts/vercel-monitor.sh               # Shell version
```

### Option 2: GitHub Actions (Recommended)

1. **Add Vercel Secrets to GitHub:**
   Go to your GitHub repo → Settings → Secrets → Actions

   Add these secrets:
   - `VERCEL_TOKEN` - Your Vercel API token
   - `VERCEL_ORG_ID` - Your Vercel organization ID
   - `VERCEL_PROJECT_ID` - Your project ID
   - `DEPLOYMENT_WEBHOOK_URL` (optional) - Slack/Discord webhook

2. **Get Vercel Token:**
   ```bash
   # Go to: https://vercel.com/account/tokens
   # Create a new token with "Full Access" scope
   ```

3. **Get Project IDs:**
   ```bash
   vercel link
   cat .vercel/project.json
   ```

### Option 3: Run Diagnostics Only

```bash
# One-time diagnostic of latest deployment
node scripts/vercel-monitor.js diagnose
```

## 🔧 Usage Examples

### Start Continuous Monitoring
```bash
# With environment variables
VERCEL_TOKEN=xxx node scripts/vercel-monitor.js monitor

# Using CLI authentication
node scripts/vercel-monitor.js monitor
```

### Configure Notifications

For Slack:
```bash
export DEPLOYMENT_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

For Discord:
```bash
export DEPLOYMENT_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK"
```

### Custom Configuration

Edit `scripts/vercel-monitor.js`:
```javascript
const CONFIG = {
  projectName: 'rishi-next',        // Your project name
  checkInterval: 30000,             // Check every 30 seconds
  maxRetries: 3,                    // Max auto-fix attempts
  autoFix: true,                    // Enable automatic fixes
};
```

## 📊 Monitor Output Example

```
🚀 Starting Vercel Deployment Monitor
📦 Project: rishi-next
⏱️ Check interval: 30s
🔧 Auto-fix: Enabled
-------------------------------------------

📦 New deployment detected: dpl_ABC123...
🔗 URL: rishi-next-abc123.vercel.app
📅 Created: 8/12/2025, 3:45:00 PM
📊 Status: BUILDING

⏳ Deployment in progress: BUILDING

❌ Deployment failed: ERROR

🔍 Analyzing deployment logs...

❌ Detected: Module not found
📋 Diagnosis: Missing dependency
🔧 Attempting automatic fix...

📦 Installing missing module: @radix-ui/react-dialog
✅ Fix applied successfully!
🚀 Triggering new deployment...

✅ Deployment successful after fixes!
```

## 🛠️ Troubleshooting

### Monitor Can't Find Deployments
```bash
# Ensure you're logged in to Vercel
vercel login

# Link your project
vercel link
```

### Automatic Fixes Not Working
- Check Git permissions for auto-commit
- Ensure `NODE_OPTIONS` is supported in your Vercel project
- Verify database connection for migration fixes

### GitHub Actions Not Triggering
- Check workflow file is in `.github/workflows/`
- Verify GitHub Actions is enabled for your repo
- Check secret variables are properly set

## 🔐 Security Notes

- **Never commit** `VERCEL_TOKEN` to your repository
- Use GitHub Secrets or environment variables
- Rotate tokens periodically
- Limit token scope to necessary permissions

## 📈 Benefits

1. **Reduced Downtime** - Automatic detection and fixing of issues
2. **Time Savings** - No manual monitoring required
3. **Faster Fixes** - Common issues resolved automatically
4. **Better Visibility** - Real-time deployment status
5. **Peace of Mind** - Notifications for failures

## 🚦 Next Steps

1. Choose your monitoring method (Local/GitHub Actions)
2. Set up authentication (Vercel token or CLI)
3. Configure notifications (optional)
4. Start monitoring!

The system will now automatically watch your Vercel deployments and attempt to fix common build issues without manual intervention!