#!/usr/bin/env node

/**
 * Build Compatibility Check
 * Simulates Vercel build environment locally
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildCompatibilityChecker {
  constructor() {
    this.issues = [];
    this.testsPassed = 0;
    this.testsTotal = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      error: '\x1b[31m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    
    const prefix = {
      info: '📋',
      error: '❌',
      success: '✅',
      warning: '⚠️'
    }[type];
    
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  async runTest(testName, testFunction) {
    this.testsTotal++;
    this.log(`Testing: ${testName}`, 'info');
    
    try {
      await testFunction();
      this.testsPassed++;
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.issues.push({
        test: testName,
        error: error.message,
        fix: error.fix || 'Manual fix required'
      });
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 1: TypeScript Compilation
  async testTypeScriptCompilation() {
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    } catch (error) {
      const err = new Error('TypeScript compilation failed');
      err.fix = 'Fix TypeScript errors shown above';
      throw err;
    }
  }

  // Test 2: Next.js Build (without database)
  async testNextJsBuild() {
    try {
      // Set environment variable to skip database operations
      process.env.SKIP_DATABASE_OPERATIONS = 'true';
      execSync('npx next build --debug', { stdio: 'pipe', timeout: 300000 });
    } catch (error) {
      const err = new Error('Next.js build failed');
      err.fix = 'Check Next.js configuration and fix build errors';
      throw err;
    }
  }

  // Test 3: Module Resolution
  async testModuleResolution() {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
    
    // Check path aliases
    if (!tsconfig.compilerOptions?.paths) {
      const err = new Error('Missing path aliases in tsconfig.json');
      err.fix = 'Add path mappings to tsconfig.json';
      throw err;
    }
    
    // Check for correct aliases
    const requiredAliases = ['@/*', '@shared/*', '@db/*'];
    const configuredAliases = Object.keys(tsconfig.compilerOptions.paths);
    
    for (const alias of requiredAliases) {
      if (!configuredAliases.includes(alias)) {
        const err = new Error(`Missing path alias: ${alias}`);
        err.fix = `Add "${alias}" to tsconfig.json paths`;
        throw err;
      }
    }
  }

  // Test 4: Package Dependencies
  async testPackageDependencies() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    
    // Check for TypeScript in dependencies (not devDependencies)
    if (packageJson.devDependencies?.typescript && !packageJson.dependencies?.typescript) {
      const err = new Error('TypeScript should be in dependencies for Vercel builds');
      err.fix = 'Move typescript from devDependencies to dependencies';
      throw err;
    }
    
    // Check for required React types
    if (packageJson.devDependencies?.['@types/react'] && !packageJson.dependencies?.['@types/react']) {
      const err = new Error('@types/react should be in dependencies for Vercel builds');
      err.fix = 'Move @types/react from devDependencies to dependencies';
      throw err;
    }
  }

  // Test 5: API Routes Structure
  async testApiRoutesStructure() {
    const apiDir = path.join(process.cwd(), 'app', 'api');
    const routes = this.findApiRoutes(apiDir);
    
    for (const route of routes) {
      const content = fs.readFileSync(route, 'utf-8');
      
      // Check for proper Next.js 15 async params
      if (content.includes('[') && content.includes(']')) {
        if (!content.includes('Promise<{') && content.includes('params: {')) {
          const err = new Error(`Route ${route} uses old params pattern`);
          err.fix = 'Update to Promise<{ id: string }> pattern';
          throw err;
        }
        
        if (content.includes('= params;') && !content.includes('await params')) {
          const err = new Error(`Route ${route} missing await for params`);
          err.fix = 'Add await: const { id } = await params;';
          throw err;
        }
      }
    }
  }

  // Test 6: Environment Variables
  async testEnvironmentVariables() {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];
    
    // Check .env.production file
    const envFile = path.join(process.cwd(), '.env.production');
    if (!fs.existsSync(envFile)) {
      const err = new Error('Missing .env.production file');
      err.fix = 'Create .env.production with required variables';
      throw err;
    }
    
    const envContent = fs.readFileSync(envFile, 'utf-8');
    
    for (const envVar of requiredEnvVars) {
      if (!envContent.includes(envVar)) {
        const err = new Error(`Missing environment variable: ${envVar}`);
        err.fix = `Add ${envVar} to .env.production`;
        throw err;
      }
    }
  }

  // Test 7: Build Output Analysis
  async testBuildOutput() {
    const buildDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(buildDir)) {
      const err = new Error('No build output found');
      err.fix = 'Run npm run build first';
      throw err;
    }
    
    // Check for large bundles
    const staticDir = path.join(buildDir, 'static');
    if (fs.existsSync(staticDir)) {
      const chunks = this.findFiles(staticDir, '.js');
      const largeBundles = chunks.filter(chunk => {
        const stats = fs.statSync(chunk);
        return stats.size > 250000; // 250KB limit for Azure
      });
      
      if (largeBundles.length > 0) {
        const err = new Error(`Large bundles detected: ${largeBundles.length} files > 250KB`);
        err.fix = 'Enable bundle splitting in next.config.mjs';
        throw err;
      }
    }
  }

  // Utility methods
  findApiRoutes(dir) {
    const routes = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        routes.push(...this.findApiRoutes(filePath));
      } else if (file === 'route.ts' || file === 'route.js') {
        routes.push(filePath);
      }
    }
    
    return routes;
  }

  findFiles(dir, extension) {
    const files = [];
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findFiles(fullPath, extension));
      } else if (entry.endsWith(extension)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Main test runner
  async runAllTests() {
    this.log('🚀 Starting Build Compatibility Check', 'info');
    this.log('Simulating Vercel build environment...', 'info');
    
    await this.runTest('TypeScript Compilation', () => this.testTypeScriptCompilation());
    await this.runTest('Module Resolution', () => this.testModuleResolution());
    await this.runTest('Package Dependencies', () => this.testPackageDependencies());
    await this.runTest('API Routes Structure', () => this.testApiRoutesStructure());
    await this.runTest('Environment Variables', () => this.testEnvironmentVariables());
    await this.runTest('Next.js Build', () => this.testNextJsBuild());
    await this.runTest('Build Output Analysis', () => this.testBuildOutput());
    
    this.generateReport();
    
    return this.issues.length === 0;
  }

  generateReport() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('BUILD COMPATIBILITY REPORT', 'info');
    this.log('='.repeat(60), 'info');
    
    this.log(`Tests Passed: ${this.testsPassed}/${this.testsTotal}`, 'info');
    
    if (this.issues.length === 0) {
      this.log('🎉 All tests passed! Build is compatible with Vercel.', 'success');
    } else {
      this.log(`\n❌ ${this.issues.length} issues found:`, 'error');
      this.issues.forEach((issue, i) => {
        this.log(`\n${i + 1}. ${issue.test}`, 'error');
        this.log(`   Error: ${issue.error}`, 'error');
        this.log(`   Fix: ${issue.fix}`, 'warning');
      });
    }
    
    this.log('\n' + '='.repeat(60), 'info');
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new BuildCompatibilityChecker();
  checker.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Build compatibility check failed:', error);
    process.exit(1);
  });
}

module.exports = BuildCompatibilityChecker;