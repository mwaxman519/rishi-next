#!/usr/bin/env node

/**
 * Navigation Audit Script
 * Comprehensive audit of navigation structure vs existing pages
 * Identifies 404s, missing pages, and broken internal links
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Navigation items from the structure files
const NAVIGATION_PAGES = {
  // Super Admin Navigation
  superAdmin: [
    '/',
    '/bookings',
    '/bookings/calendar', 
    '/bookings/regions',
    '/bookings/assignments',
    '/bookings/reports',
    '/staff/managers',
    '/staff/agents', 
    '/staff/schedule',
    '/locations',
    '/locations/directory',
    '/admin/locations',
    '/admin/organizations',
    '/contacts',
    '/analytics',
    '/inventory/templates',
    '/inventory/kit-instances',
    '/inventory/stock',
    '/reports',
    '/admin/analytics',
    '/training',
    '/admin/users',
    '/admin/rbac',
    '/admin/settings',
    '/admin/system-settings'
  ],
  
  // Field Manager Navigation
  fieldManager: [
    '/',
    '/brand-agents',
    '/schedule',
    '/availability',
    '/bookings',
    '/locations',
    '/tasks',
    '/inventory/templates',
    '/inventory/kit-instances',
    '/reports'
  ],
  
  // Brand Agent Navigation
  brandAgent: [
    '/',
    '/schedule',
    '/availability', 
    '/bookings',
    '/tasks',
    '/event-data',
    '/training'
  ],
  
  // Client User Navigation
  clientUser: [
    '/',
    '/bookings',
    '/bookings/calendar',
    '/schedule',
    '/locations',
    '/locations/directory',
    '/staff',
    '/roster',
    '/timetracking'
  ]
};

// Internal action links mentioned by user
const INTERNAL_ACTION_LINKS = [
  'Add Staff Member',
  'Deploy New Kit', 
  'Add Item',
  'Create Booking',
  'Add Location',
  'Add User',
  'Create Template'
];

function findExistingPages() {
  const appDir = path.join(__dirname, '..', 'app');
  const pages = [];
  
  function scanDirectory(dir, basePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip API routes and special directories
          if (item === 'api' || item.startsWith('_') || item.startsWith('.')) {
            continue;
          }
          
          const newBasePath = basePath + '/' + item;
          scanDirectory(fullPath, newBasePath);
        } else if (item === 'page.tsx') {
          // Found a page
          const pagePath = basePath || '/';
          pages.push(pagePath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dir}:`, error.message);
    }
  }
  
  scanDirectory(appDir);
  return pages.sort();
}

function auditNavigation() {
  console.log('🔍 Starting comprehensive navigation audit...\n');
  
  const existingPages = findExistingPages();
  console.log(`📄 Found ${existingPages.length} existing pages:`);
  existingPages.forEach(page => console.log(`   ✓ ${page}`));
  
  console.log('\n' + '='.repeat(80));
  console.log('🚨 MISSING PAGES AUDIT');
  console.log('='.repeat(80));
  
  // Check each role's navigation
  Object.entries(NAVIGATION_PAGES).forEach(([role, navPages]) => {
    console.log(`\n📋 ${role.toUpperCase()} NAVIGATION AUDIT:`);
    console.log('-'.repeat(50));
    
    const missingPages = [];
    const existingNavPages = [];
    
    navPages.forEach(navPage => {
      if (existingPages.includes(navPage)) {
        existingNavPages.push(navPage);
      } else {
        missingPages.push(navPage);
      }
    });
    
    if (existingNavPages.length > 0) {
      console.log(`✅ EXISTING (${existingNavPages.length}):`);
      existingNavPages.forEach(page => console.log(`   ✓ ${page}`));
    }
    
    if (missingPages.length > 0) {
      console.log(`❌ MISSING (${missingPages.length}):`);
      missingPages.forEach(page => console.log(`   ✗ ${page}`));
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('🔗 INTERNAL ACTION LINKS AUDIT');
  console.log('='.repeat(80));
  
  console.log('\n❓ INTERNAL ACTIONS THAT NEED IMPLEMENTATION:');
  INTERNAL_ACTION_LINKS.forEach(action => {
    console.log(`   🔧 ${action}`);
  });
  
  // Check for common redirect issues
  console.log('\n' + '='.repeat(80));
  console.log('🔄 POTENTIAL REDIRECT ISSUES');
  console.log('='.repeat(80));
  
  const commonRedirectTargets = [
    '/dashboard',  // Many nav items point to this but we only have /
    '/admin/system-status', // vs /admin/system-settings
    '/team-calendar',
    '/agent-dashboard'
  ];
  
  commonRedirectTargets.forEach(target => {
    if (!existingPages.includes(target)) {
      console.log(`   🔄 ${target} - needs redirect or implementation`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(80));
  
  const allNavPages = [...new Set(Object.values(NAVIGATION_PAGES).flat())];
  const totalMissing = allNavPages.filter(page => !existingPages.includes(page));
  
  console.log(`\n📈 STATISTICS:`);
  console.log(`   • Total navigation pages defined: ${allNavPages.length}`);
  console.log(`   • Total existing pages: ${existingPages.length}`);
  console.log(`   • Total missing pages: ${totalMissing.length}`);
  console.log(`   • Coverage: ${Math.round((existingPages.length / allNavPages.length) * 100)}%`);
  
  console.log(`\n🎯 TOP PRIORITY MISSING PAGES:`);
  const highPriorityMissing = [
    '/staff/managers',
    '/staff/agents', 
    '/admin/locations',
    '/admin/organizations',
    '/inventory/templates',
    '/reports',
    '/tasks',
    '/event-data'
  ].filter(page => totalMissing.includes(page));
  
  highPriorityMissing.forEach(page => console.log(`   🚩 ${page}`));
  
  return {
    existingPages,
    missingPages: totalMissing,
    highPriorityMissing,
    actionLinks: INTERNAL_ACTION_LINKS
  };
}

// Run the audit if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  auditNavigation();
}

export { auditNavigation };