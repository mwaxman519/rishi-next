#!/usr/bin/env node

/**
 * Validate Autoscale Deployment Readiness
 */

import { existsSync, readFileSync } from 'fs';

console.log('🔍 Validating Autoscale Deployment Readiness...');

const checks = [
  {
    name: 'testConnection export exists',
    check: () => {
      const content = readFileSync('db/index.ts', 'utf8');
      return content.includes('export { testConnection }') || content.includes('export async function testConnection');
    }
  },
  {
    name: 'Dynamic exports in API routes',
    check: () => {
      const routes = ['app/api/admin/dev-tools/download/route.ts'];
      return routes.every(route => {
        if (!existsSync(route)) return true;
        const content = readFileSync(route, 'utf8');
        return content.includes('export const dynamic');
      });
    }
  },
  {
    name: 'Next.js config for Autoscale',
    check: () => {
      const content = readFileSync('next.config.mjs', 'utf8');
      return content.includes('isVoltBuilderBuild = process.env.VOLTBUILDER_BUILD');
    }
  },
  {
    name: 'Build scripts exist',
    check: () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      return packageJson.scripts['build:autoscale'] && packageJson.scripts['build:static'];
    }
  }
];

let allPassed = true;
checks.forEach(check => {
  try {
    const passed = check.check();
    console.log(`${passed ? '✅' : '❌'} ${check.name}`);
    if (!passed) allPassed = false;
  } catch (error) {
    console.log(`❌ ${check.name} - Error: ${error.message}`);
    allPassed = false;
  }
});

console.log('');
if (allPassed) {
  console.log('🚀 All checks passed! Ready for Autoscale deployment.');
} else {
  console.log('❌ Some checks failed. Please fix issues before deploying.');
  process.exit(1);
}