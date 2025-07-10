#!/usr/bin/env node

/**
 * Proactive Build Validation Script
 * Identifies and fixes common build issues before deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BuildValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      error: '❌',
      warning: '⚠️',
      success: '✅',
      fix: '🔧'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // 1. Check for Next.js 15 async params pattern
  validateAsyncParams() {
    this.log('Checking for Next.js 15 async params patterns...', 'info');
    
    const apiDir = path.join(process.cwd(), 'app', 'api');
    const dynamicRoutes = this.findDynamicRoutes(apiDir);
    
    for (const route of dynamicRoutes) {
      const content = fs.readFileSync(route, 'utf-8');
      
      // Check for old pattern: { params: { id: string } }
      const oldPattern = /\{\s*params\s*\}:\s*\{\s*params:\s*\{[^}]+\}\s*\}/g;
      const newPattern = /\{\s*params\s*\}:\s*\{\s*params:\s*Promise<\{[^}]+\}>\s*\}/g;
      
      if (oldPattern.test(content) && !newPattern.test(content)) {
        this.errors.push({
          file: route,
          issue: 'Missing Next.js 15 async params pattern',
          fix: 'Convert params: { id: string } to params: Promise<{ id: string }>'
        });
      }
      
      // Check for missing await params
      if (content.includes('const { ') && content.includes('} = params;')) {
        this.errors.push({
          file: route,
          issue: 'Missing await for params destructuring',
          fix: 'Change "const { id } = params;" to "const { id } = await params;"'
        });
      }
    }
  }

  // 2. Check for async/await mismatches
  validateAsyncAwaitPatterns() {
    this.log('Checking for async/await pattern mismatches...', 'info');
    
    const files = this.findFiles(['app/**/*.ts', 'app/**/*.tsx'], ['.next', 'node_modules']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for Promise<boolean> used in if conditions
      const promiseBooleanPattern = /if\s*\(\s*\!?\s*\w+\([^)]*\)\s*\)/g;
      const matches = content.match(promiseBooleanPattern);
      
      if (matches) {
        // Check if functions return Promise<boolean>
        const functionNames = this.extractFunctionNames(content);
        for (const funcName of functionNames) {
          if (content.includes(`${funcName}(`) && content.includes('Promise<boolean>')) {
            this.errors.push({
              file: file,
              issue: `Function ${funcName} returns Promise<boolean> but used synchronously`,
              fix: `Add await: if (await ${funcName}(...)) or if (!(await ${funcName}(...)))`
            });
          }
        }
      }
      
      // Check for missing async keywords
      if (content.includes('await ') && !content.includes('async ')) {
        this.errors.push({
          file: file,
          issue: 'Using await without async function',
          fix: 'Add async keyword to function declaration'
        });
      }
    }
  }

  // 3. Check for module resolution issues
  validateModuleResolution() {
    this.log('Checking for module resolution issues...', 'info');
    
    const files = this.findFiles(['app/**/*.ts', 'app/**/*.tsx'], ['.next', 'node_modules']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for relative imports that should use path aliases
      if (content.includes('from "../') || content.includes("from '../")) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes('import') && (line.includes('from "../') || line.includes("from '../"))) {
            if (line.includes('lib/auth-options')) {
              this.errors.push({
                file: file,
                issue: 'Relative import should use path alias',
                fix: 'Change relative import to "@/lib/auth-options"'
              });
            }
          }
        }
      }
      
      // Check for missing path aliases
      if (content.includes('../../shared/') && !content.includes('@shared/')) {
        this.warnings.push({
          file: file,
          issue: 'Consider using @shared path alias',
          fix: 'Replace "../../shared/" with "@shared/"'
        });
      }
    }
  }

  // 4. Check TypeScript configuration
  validateTypeScriptConfig() {
    this.log('Checking TypeScript configuration...', 'info');
    
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      this.errors.push({
        file: 'tsconfig.json',
        issue: 'Missing tsconfig.json',
        fix: 'Create tsconfig.json with proper configuration'
      });
      return;
    }
    
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    
    // Check for strict mode
    if (!tsconfig.compilerOptions?.strict) {
      this.warnings.push({
        file: 'tsconfig.json',
        issue: 'TypeScript strict mode disabled',
        fix: 'Enable strict mode for better type checking'
      });
    }
    
    // Check for proper path mapping
    if (!tsconfig.compilerOptions?.paths) {
      this.warnings.push({
        file: 'tsconfig.json',
        issue: 'Missing path mappings',
        fix: 'Add path mappings for better import resolution'
      });
    }
  }

  // 5. Check for build environment compatibility
  validateBuildEnvironment() {
    this.log('Checking build environment compatibility...', 'info');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    // Check for required dependencies in production
    const requiredProdDeps = ['typescript', '@types/react', '@types/node'];
    for (const dep of requiredProdDeps) {
      if (packageJson.devDependencies?.[dep] && !packageJson.dependencies?.[dep]) {
        this.errors.push({
          file: 'package.json',
          issue: `${dep} in devDependencies should be in dependencies for Vercel builds`,
          fix: `Move ${dep} to dependencies section`
        });
      }
    }
    
    // Check Next.js configuration
    const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
    if (fs.existsSync(nextConfigPath)) {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
      
      if (nextConfig.includes('ignoreBuildErrors') && !nextConfig.includes('false')) {
        this.warnings.push({
          file: 'next.config.mjs',
          issue: 'Build errors are being ignored',
          fix: 'Set ignoreBuildErrors: false for production builds'
        });
      }
    }
  }

  // 6. Run local build test
  async testLocalBuild() {
    this.log('Testing local build...', 'info');
    
    try {
      // Run TypeScript check
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('TypeScript check passed', 'success');
    } catch (error) {
      this.errors.push({
        file: 'TypeScript',
        issue: 'TypeScript compilation failed',
        fix: 'Fix TypeScript errors before deployment'
      });
      this.log(`TypeScript errors: ${error.stdout || error.message}`, 'error');
    }
    
    try {
      // Run ESLint check
      execSync('npx eslint app/ --ext .ts,.tsx --quiet', { stdio: 'pipe' });
      this.log('ESLint check passed', 'success');
    } catch (error) {
      this.warnings.push({
        file: 'ESLint',
        issue: 'ESLint warnings found',
        fix: 'Fix ESLint warnings for cleaner code'
      });
    }
  }

  // Utility methods
  findDynamicRoutes(dir) {
    const routes = [];
    if (!fs.existsSync(dir)) return routes;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && file.includes('[') && file.includes(']')) {
        const routeFile = path.join(filePath, 'route.ts');
        if (fs.existsSync(routeFile)) {
          routes.push(routeFile);
        }
        routes.push(...this.findDynamicRoutes(filePath));
      } else if (stat.isDirectory()) {
        routes.push(...this.findDynamicRoutes(filePath));
      }
    }
    
    return routes;
  }

  findFiles(patterns, exclude = []) {
    const files = [];
    // Basic file finder for app directory
    const appDir = path.join(process.cwd(), 'app');
    if (fs.existsSync(appDir)) {
      const findInDir = (dir) => {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && !exclude.some(ex => fullPath.includes(ex))) {
            findInDir(fullPath);
          } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
            files.push(fullPath);
          }
        }
      };
      findInDir(appDir);
    }
    return files;
  }

  extractFunctionNames(content) {
    const functionNames = [];
    const regex = /function\s+(\w+)|const\s+(\w+)\s*=|export\s+(?:async\s+)?function\s+(\w+)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const funcName = match[1] || match[2] || match[3];
      if (funcName) {
        functionNames.push(funcName);
      }
    }
    
    return functionNames;
  }

  // Generate report
  generateReport() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('BUILD VALIDATION REPORT', 'info');
    this.log('='.repeat(60), 'info');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('✅ No issues found - Build ready for deployment!', 'success');
      return true;
    }
    
    if (this.errors.length > 0) {
      this.log(`\n❌ ERRORS (${this.errors.length}):`, 'error');
      this.errors.forEach((error, i) => {
        this.log(`${i + 1}. ${error.file}`, 'error');
        this.log(`   Issue: ${error.issue}`, 'error');
        this.log(`   Fix: ${error.fix}`, 'fix');
      });
    }
    
    if (this.warnings.length > 0) {
      this.log(`\n⚠️ WARNINGS (${this.warnings.length}):`, 'warning');
      this.warnings.forEach((warning, i) => {
        this.log(`${i + 1}. ${warning.file}`, 'warning');
        this.log(`   Issue: ${warning.issue}`, 'warning');
        this.log(`   Fix: ${warning.fix}`, 'fix');
      });
    }
    
    this.log('\n' + '='.repeat(60), 'info');
    
    return this.errors.length === 0;
  }

  // Main validation runner
  async runValidation() {
    this.log('Starting proactive build validation...', 'info');
    
    this.validateAsyncParams();
    this.validateAsyncAwaitPatterns();
    this.validateModuleResolution();
    this.validateTypeScriptConfig();
    this.validateBuildEnvironment();
    await this.testLocalBuild();
    
    return this.generateReport();
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new BuildValidator();
  validator.runValidation().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export default BuildValidator;