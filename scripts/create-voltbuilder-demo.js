#!/usr/bin/env node

/**
 * Create a known working VoltBuilder demo package
 * Based on official VoltBuilder examples and documentation
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating VoltBuilder Demo Package');
console.log('===================================');

// Create demo directory structure
const demoDir = 'voltbuilder-demo';
const wwwDir = path.join(demoDir, 'www');

// Clean and create directories
if (fs.existsSync(demoDir)) {
    fs.rmSync(demoDir, { recursive: true });
}
fs.mkdirSync(demoDir);
fs.mkdirSync(wwwDir);

// Create basic HTML app (known to work with VoltBuilder)
const indexHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>VoltBuilder Demo</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
            text-align: center;
        }
        .button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 8px;
            width: 80%;
        }
        .info {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 VoltBuilder Demo</h1>
        <p>This is a working VoltBuilder demo app</p>
        
        <button class="button" onclick="showDeviceInfo()">Show Device Info</button>
        <button class="button" onclick="testFeatures()">Test Features</button>
        <button class="button" onclick="copyReport()">Copy Debug Report</button>
        
        <div id="info" class="info">
            <strong>App Status:</strong> Ready<br>
            <strong>Platform:</strong> <span id="platform">Loading...</span><br>
            <strong>User Agent:</strong> <span id="userAgent">Loading...</span><br>
        </div>
        
        <div id="results" class="info" style="display:none;">
            <h3>Test Results:</h3>
            <div id="testOutput"></div>
        </div>
    </div>

    <script>
        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('platform').textContent = navigator.platform;
            document.getElementById('userAgent').textContent = navigator.userAgent.substring(0, 60) + '...';
        });
        
        function showDeviceInfo() {
            const info = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    availWidth: screen.availWidth,
                    availHeight: screen.availHeight
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                location: {
                    protocol: window.location.protocol,
                    hostname: window.location.hostname,
                    pathname: window.location.pathname
                }
            };
            
            const results = document.getElementById('results');
            const output = document.getElementById('testOutput');
            output.innerHTML = '<pre>' + JSON.stringify(info, null, 2) + '</pre>';
            results.style.display = 'block';
        }
        
        function testFeatures() {
            const tests = [];
            
            // Test basic JavaScript features
            tests.push('✅ JavaScript: Working');
            tests.push('✅ DOM: Working');
            tests.push('✅ Events: Working');
            
            // Test storage
            try {
                localStorage.setItem('test', 'working');
                tests.push('✅ localStorage: Working');
            } catch(e) {
                tests.push('❌ localStorage: Failed - ' + e.message);
            }
            
            // Test network
            tests.push('🌐 Network: ' + (navigator.onLine ? 'Online' : 'Offline'));
            
            // Test geolocation
            if ('geolocation' in navigator) {
                tests.push('✅ Geolocation: Available');
            } else {
                tests.push('❌ Geolocation: Not available');
            }
            
            const results = document.getElementById('results');
            const output = document.getElementById('testOutput');
            output.innerHTML = tests.join('<br>');
            results.style.display = 'block';
        }
        
        function copyReport() {
            const report = {
                app: 'VoltBuilder Demo',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                location: window.location.href,
                features: {
                    localStorage: !!window.localStorage,
                    geolocation: 'geolocation' in navigator,
                    onLine: navigator.onLine
                }
            };
            
            const reportText = JSON.stringify(report, null, 2);
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(reportText).then(() => {
                    alert('Debug report copied to clipboard!');
                }).catch(() => {
                    console.log('Report:', reportText);
                    alert('Report logged to console');
                });
            } else {
                console.log('Report:', reportText);
                alert('Report logged to console (clipboard not available)');
            }
        }
    </script>
</body>
</html>`;

// Create VoltBuilder.json (essential for VoltBuilder)
const voltbuilderJson = {
    "id": "com.rishi.demo",
    "DisplayName": "VoltBuilder Demo",
    "version": "1.0.0",
    "description": "Working VoltBuilder demo app",
    "author": "Rishi Platform",
    "phonegapbuild": false,
    "AndroidKeystore": "",
    "AndroidKeystorePassword": "",
    "AndroidKeyname": "",
    "AndroidKeyPassword": "",
    "iosPackageType": "development",
    "iosDevelopmentTeam": "",
    "iosDistributionCertificate": "",
    "iosDistributionCertificatePassword": "",
    "iosProvisioningProfile": "",
    "cordova": "12.0.0",
    "template": "minimum",
    "jquery": false,
    "jquerymobile": false,
    "bootstrap": false,
    "fontawesome": false
};

// Write files
fs.writeFileSync(path.join(wwwDir, 'index.html'), indexHtml);
fs.writeFileSync(path.join(demoDir, 'voltbuilder.json'), JSON.stringify(voltbuilderJson, null, 2));

// Create simple config.xml for Cordova compatibility
const configXml = `<?xml version='1.0' encoding='utf-8'?>
<widget id="com.rishi.demo" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>VoltBuilder Demo</name>
    <description>Working VoltBuilder demo app</description>
    <author email="support@rishiplatform.com" href="https://rishiplatform.com">Rishi Platform</author>
    <content src="index.html" />
    <access origin="*" />
    <preference name="DisallowOverscroll" value="true" />
    <preference name="android-minSdkVersion" value="22" />
    <preference name="BackupWebStorage" value="none" />
    <platform name="android">
        <preference name="Scheme" value="https" />
    </platform>
</widget>`;

fs.writeFileSync(path.join(demoDir, 'config.xml'), configXml);

// Create ZIP package
const { execSync } = require('child_process');
const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
const packageName = `voltbuilder-demo-${timestamp}.zip`;
const outputPath = path.join('builds', 'Replit Dev', packageName);

try {
    execSync(`zip -r "${outputPath}" ${demoDir}/`, { stdio: 'pipe' });
    
    console.log('✅ VoltBuilder demo package created successfully!');
    console.log(`📦 Package: ${packageName}`);
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📏 Size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)}KB`);
    
    console.log('\n📋 Package Contents:');
    console.log('   • www/index.html - Working HTML app');
    console.log('   • voltbuilder.json - VoltBuilder configuration');
    console.log('   • config.xml - Cordova configuration');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Upload this package to VoltBuilder');
    console.log('   2. Build for Android');
    console.log('   3. Install on device');
    console.log('   4. Verify it works (should show colorful demo app)');
    console.log('   5. Use this as baseline for fixing main app');
    
    // Clean up demo directory
    fs.rmSync(demoDir, { recursive: true });
    
} catch (error) {
    console.error('❌ Failed to create package:', error.message);
}