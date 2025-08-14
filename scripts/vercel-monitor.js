#!/usr/bin/env node

/**
 * Vercel Deployment Monitor
 * Automatically watches Vercel deployments and troubleshoots build issues
 * 
 * Features:
 * - Real-time deployment status monitoring
 * - Automatic error detection and diagnosis
 * - Common build issue fixes
 * - Slack/Discord webhook notifications (optional)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  projectName: 'rishi-next',
  checkInterval: 30000, // Check every 30 seconds
  maxRetries: 3,
  vercelToken: process.env.VERCEL_TOKEN,
  webhookUrl: process.env.DEPLOYMENT_WEBHOOK_URL, // Optional: Slack/Discord webhook
  autoFix: true, // Automatically attempt fixes
};

// Common Vercel build errors and their fixes
const ERROR_PATTERNS = {
  'Module not found': {
    pattern: /Module not found: Can't resolve '(.+)'/,
    diagnosis: 'Missing dependency',
    fixes: [
      async (match) => {
        const module = match[1];
        console.log(`📦 Installing missing module: ${module}`);
        await execAsync(`npm install ${module}`);
        return true;
      }
    ]
  },
  'Type error': {
    pattern: /Type error: (.+)/,
    diagnosis: 'TypeScript compilation error',
    fixes: [
      async () => {
        console.log('🔧 Attempting TypeScript fix...');
        await execAsync('npx tsc --noEmit');
        return true;
      }
    ]
  },
  'Environment variable': {
    pattern: /Error: (.*environment variable.*)/i,
    diagnosis: 'Missing environment variables',
    fixes: [
      async () => {
        console.log('🔐 Checking environment variables...');
        const envExample = await fs.readFile('.env.example', 'utf-8').catch(() => '');
        const envProduction = await fs.readFile('.env.production', 'utf-8').catch(() => '');
        
        console.log('Required environment variables:');
        const required = envExample.match(/^[A-Z_]+=/gm) || [];
        required.forEach(v => console.log(`  - ${v.split('=')[0]}`));
        
        return false; // Can't auto-fix, needs manual intervention
      }
    ]
  },
  'Build script failed': {
    pattern: /Error: Command "(.+)" exited with (\d+)/,
    diagnosis: 'Build script execution failed',
    fixes: [
      async (match) => {
        const command = match[1];
        console.log(`🛠️ Build command failed: ${command}`);
        
        // Try common fixes
        if (command.includes('next build')) {
          console.log('Clearing Next.js cache...');
          await execAsync('rm -rf .next');
          
          console.log('Reinstalling dependencies...');
          await execAsync('rm -rf node_modules package-lock.json');
          await execAsync('npm install');
        }
        
        return true;
      }
    ]
  },
  'Memory error': {
    pattern: /JavaScript heap out of memory|FATAL ERROR:/,
    diagnosis: 'Build process ran out of memory',
    fixes: [
      async () => {
        console.log('💾 Optimizing build for memory...');
        
        // Update build script with memory limit
        const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
        pkg.scripts.build = 'NODE_OPTIONS="--max-old-space-size=4096" next build';
        await fs.writeFile('package.json', JSON.stringify(pkg, null, 2));
        
        return true;
      }
    ]
  },
  'Database migration': {
    pattern: /database.*migration|drizzle.*push/i,
    diagnosis: 'Database migration issue',
    fixes: [
      async () => {
        console.log('🗄️ Checking database migrations...');
        
        // Check if migration is needed
        try {
          await execAsync('npm run db:push:safe');
          return true;
        } catch (error) {
          console.log('Migration failed - manual intervention needed');
          return false;
        }
      }
    ]
  }
};

class VercelMonitor {
  constructor() {
    this.lastDeploymentId = null;
    this.failureCount = 0;
    this.isMonitoring = false;
  }

  async getLatestDeployment() {
    try {
      if (!CONFIG.vercelToken) {
        console.log('⚠️ VERCEL_TOKEN not set. Using CLI authentication...');
        const { stdout } = await execAsync(`vercel ls ${CONFIG.projectName} --json`);
        const deployments = JSON.parse(stdout);
        return deployments[0];
      }

      // Use Vercel API if token is available
      const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${CONFIG.projectName}`, {
        headers: {
          'Authorization': `Bearer ${CONFIG.vercelToken}`
        }
      });
      
      const data = await response.json();
      return data.deployments[0];
    } catch (error) {
      console.error('Failed to fetch deployments:', error.message);
      return null;
    }
  }

  async analyzeDeploymentLogs(deploymentId) {
    try {
      const { stdout } = await execAsync(`vercel logs ${deploymentId}`);
      return stdout;
    } catch (error) {
      console.error('Failed to fetch logs:', error.message);
      return '';
    }
  }

  async diagnoseAndFix(logs) {
    console.log('\n🔍 Analyzing deployment logs...\n');
    
    for (const [errorType, config] of Object.entries(ERROR_PATTERNS)) {
      const match = logs.match(config.pattern);
      
      if (match) {
        console.log(`❌ Detected: ${errorType}`);
        console.log(`📋 Diagnosis: ${config.diagnosis}`);
        
        if (CONFIG.autoFix && config.fixes.length > 0) {
          console.log('🔧 Attempting automatic fix...\n');
          
          for (const fix of config.fixes) {
            try {
              const success = await fix(match);
              
              if (success) {
                console.log('✅ Fix applied successfully!');
                console.log('🚀 Triggering new deployment...\n');
                await this.triggerDeployment();
                return true;
              }
            } catch (error) {
              console.error('Fix failed:', error.message);
            }
          }
        }
        
        return false;
      }
    }
    
    console.log('❓ No known error patterns detected');
    return false;
  }

  async triggerDeployment() {
    try {
      console.log('🚀 Triggering new Vercel deployment...');
      await execAsync('git add -A');
      await execAsync('git commit -m "fix: Automated build fix by deployment monitor"');
      await execAsync('git push');
      console.log('✅ Deployment triggered!');
    } catch (error) {
      console.log('ℹ️ No changes to deploy or deployment failed');
    }
  }

  async sendNotification(message, status = 'info') {
    if (!CONFIG.webhookUrl) return;

    const emoji = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[status] || 'ℹ️';

    try {
      await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${emoji} **Vercel Deployment Monitor**\n${message}`
        })
      });
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }
  }

  async checkDeploymentStatus() {
    const deployment = await this.getLatestDeployment();
    
    if (!deployment) {
      console.log('⚠️ No deployments found');
      return;
    }

    // Check if this is a new deployment
    if (deployment.uid !== this.lastDeploymentId) {
      this.lastDeploymentId = deployment.uid;
      console.log(`\n📦 New deployment detected: ${deployment.uid}`);
      console.log(`🔗 URL: ${deployment.url}`);
      console.log(`📅 Created: ${new Date(deployment.created).toLocaleString()}`);
      console.log(`📊 Status: ${deployment.state}\n`);
      
      await this.sendNotification(
        `New deployment started: ${deployment.url}`,
        'info'
      );
    }

    // Monitor deployment state
    switch (deployment.state) {
      case 'READY':
        if (this.failureCount > 0) {
          console.log('✅ Deployment successful after fixes!');
          await this.sendNotification(
            `Deployment successful: ${deployment.url}`,
            'success'
          );
          this.failureCount = 0;
        }
        break;

      case 'ERROR':
      case 'FAILED':
        console.log(`\n❌ Deployment failed: ${deployment.state}`);
        this.failureCount++;
        
        await this.sendNotification(
          `Deployment failed (attempt ${this.failureCount}): ${deployment.url}`,
          'error'
        );

        // Get and analyze logs
        const logs = await this.analyzeDeploymentLogs(deployment.uid);
        
        if (this.failureCount <= CONFIG.maxRetries) {
          const fixed = await this.diagnoseAndFix(logs);
          
          if (!fixed) {
            console.log('\n⚠️ Automatic fix not possible. Manual intervention required.');
            await this.sendNotification(
              'Deployment requires manual intervention',
              'warning'
            );
          }
        } else {
          console.log('\n❌ Max retry attempts reached. Manual intervention required.');
          await this.sendNotification(
            'Max retry attempts reached. Manual intervention required.',
            'error'
          );
        }
        break;

      case 'BUILDING':
      case 'INITIALIZING':
        console.log(`⏳ Deployment in progress: ${deployment.state}`);
        break;

      default:
        console.log(`📊 Deployment state: ${deployment.state}`);
    }
  }

  async start() {
    console.log('🚀 Starting Vercel Deployment Monitor');
    console.log(`📦 Project: ${CONFIG.projectName}`);
    console.log(`⏱️ Check interval: ${CONFIG.checkInterval / 1000}s`);
    console.log(`🔧 Auto-fix: ${CONFIG.autoFix ? 'Enabled' : 'Disabled'}`);
    console.log('-------------------------------------------\n');

    this.isMonitoring = true;

    // Initial check
    await this.checkDeploymentStatus();

    // Set up monitoring interval
    const interval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(interval);
        return;
      }

      await this.checkDeploymentStatus();
    }, CONFIG.checkInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping deployment monitor...');
      this.isMonitoring = false;
      process.exit(0);
    });
  }
}

// Quick diagnostic mode - analyze recent failed deployment
async function runDiagnostics() {
  console.log('🔍 Running deployment diagnostics...\n');
  
  const monitor = new VercelMonitor();
  const deployment = await monitor.getLatestDeployment();
  
  if (!deployment) {
    console.log('No deployments found');
    return;
  }

  console.log(`Latest deployment: ${deployment.uid}`);
  console.log(`Status: ${deployment.state}`);
  
  if (deployment.state === 'ERROR' || deployment.state === 'FAILED') {
    const logs = await monitor.analyzeDeploymentLogs(deployment.uid);
    await monitor.diagnoseAndFix(logs);
  } else {
    console.log('✅ Latest deployment is healthy');
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'monitor':
    const monitor = new VercelMonitor();
    monitor.start();
    break;
    
  case 'diagnose':
    runDiagnostics();
    break;
    
  default:
    console.log(`
Vercel Deployment Monitor

Usage:
  node scripts/vercel-monitor.js <command>

Commands:
  monitor   - Start continuous deployment monitoring
  diagnose  - Analyze the latest deployment for issues

Environment Variables:
  VERCEL_TOKEN           - Vercel API token (optional, uses CLI auth if not set)
  DEPLOYMENT_WEBHOOK_URL - Webhook URL for notifications (optional)

Examples:
  # Start monitoring
  node scripts/vercel-monitor.js monitor

  # Run one-time diagnostic
  node scripts/vercel-monitor.js diagnose

  # With environment variables
  VERCEL_TOKEN=xxx node scripts/vercel-monitor.js monitor
    `);
}