#!/usr/bin/env node

/**
 * VoltBuilder API Integration for Automated Mobile Builds
 * Automates the upload and compilation process for Rishi Platform mobile apps
 */

import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

class VoltBuilderAPI {
  constructor() {
    // VoltBuilder Pro API credentials
    this.apiKey = '2f45c6b6-393f-4315-9f91-16945fc5977f:6SBjAvKYYLx1+EESEQz31ewrgPARPDxF';
    this.baseUrl = 'https://voltbuilder.com/api';
    this.headers = {
      'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`,
      'Content-Type': 'application/json'
    };
  }

  async uploadAndBuild(packagePath, options = {}) {
    const {
      platforms = ['android', 'ios'],
      buildType = 'release',
      signing = {},
      environment = 'staging'
    } = options;

    console.log(`🚀 Starting VoltBuilder automated build for ${environment}...`);
    console.log(`📦 Package: ${packagePath}`);
    console.log(`📱 Platforms: ${platforms.join(', ')}`);

    try {
      // Step 1: Upload package
      const uploadResult = await this.uploadPackage(packagePath);
      console.log(`✅ Package uploaded successfully: ${uploadResult.uploadId}`);

      // Step 2: Start build
      const buildResult = await this.startBuild(uploadResult.uploadId, {
        platforms,
        buildType,
        signing,
        environment
      });

      console.log(`🏗️ Build started: ${buildResult.buildId}`);
      console.log(`📊 Build URL: https://voltbuilder.com/build/${buildResult.buildId}`);

      // Step 3: Monitor build progress
      return await this.monitorBuild(buildResult.buildId);

    } catch (error) {
      console.error('❌ VoltBuilder API Error:', error.message);
      throw error;
    }
  }

  async uploadPackage(packagePath) {
    if (!fs.existsSync(packagePath)) {
      throw new Error(`Package not found: ${packagePath}`);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(packagePath));
    form.append('type', 'zip');

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': this.headers.Authorization,
        ...form.getHeaders()
      },
      body: form
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async startBuild(uploadId, options) {
    const buildConfig = {
      uploadId,
      platforms: options.platforms,
      buildType: options.buildType,
      environment: options.environment,
      configuration: {
        android: {
          signing: options.signing.android || {},
          buildType: options.buildType
        },
        ios: {
          signing: options.signing.ios || {},
          buildType: options.buildType
        }
      }
    };

    const response = await fetch(`${this.baseUrl}/build`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(buildConfig)
    });

    if (!response.ok) {
      throw new Error(`Build start failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async monitorBuild(buildId) {
    console.log('📊 Monitoring build progress...');
    
    const maxAttempts = 60; // 30 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await this.getBuildStatus(buildId);
        
        console.log(`📈 Build Status: ${status.status} (${status.progress || 0}%)`);
        
        if (status.status === 'completed') {
          console.log('🎉 Build completed successfully!');
          console.log('📱 Download URLs:');
          
          if (status.downloads.android) {
            console.log(`   Android APK: ${status.downloads.android}`);
          }
          if (status.downloads.ios) {
            console.log(`   iOS IPA: ${status.downloads.ios}`);
          }
          
          return status;
        }
        
        if (status.status === 'failed') {
          console.error('❌ Build failed:', status.error);
          throw new Error(`Build failed: ${status.error}`);
        }
        
        // Wait 30 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 30000));
        attempts++;
        
      } catch (error) {
        console.error('Error checking build status:', error.message);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
    
    throw new Error('Build timeout - exceeded maximum wait time');
  }

  async getBuildStatus(buildId) {
    const response = await fetch(`${this.baseUrl}/build/${buildId}/status`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async downloadBuild(buildId, platform, outputPath) {
    const response = await fetch(`${this.baseUrl}/build/${buildId}/download/${platform}`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    
    console.log(`📥 ${platform} app downloaded: ${outputPath}`);
    return outputPath;
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const packagePath = args[0];
  const platforms = args[1] ? args[1].split(',') : ['android', 'ios'];
  
  if (!packagePath) {
    console.error('Usage: node voltbuilder-api.js <package-path> [platforms]');
    console.error('Example: node voltbuilder-api.js builds/staging/rishi-staging-fullscreen-2025-07-27-2224.zip android,ios');
    process.exit(1);
  }

  const voltbuilder = new VoltBuilderAPI();
  
  voltbuilder.uploadAndBuild(packagePath, {
    platforms,
    buildType: 'release',
    environment: 'staging'
  })
  .then(result => {
    console.log('🎉 VoltBuilder automation completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ VoltBuilder automation failed:', error.message);
    process.exit(1);
  });
}

export default VoltBuilderAPI;