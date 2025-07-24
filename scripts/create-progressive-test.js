#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Creating Progressive Complexity Tests');
console.log('======================================');

// Test 1: Basic HTML + JavaScript (confirmed working)
const test1Dir = 'test1-basic';
const test1www = path.join(test1Dir, 'www');
fs.mkdirSync(test1www, { recursive: true });

fs.writeFileSync(path.join(test1www, 'index.html'), `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Test 1 - Basic</title>
    <style>
        body { background: green; color: white; font-size: 24px; text-align: center; padding: 40px; }
    </style>
</head>
<body>
    <h1>✅ TEST 1: BASIC HTML</h1>
    <p>This works!</p>
    <button onclick="alert('JavaScript OK')">Test JS</button>
</body>
</html>
`);

fs.writeFileSync(path.join(test1Dir, 'voltbuilder.json'), JSON.stringify({
    "id": "com.rishi.test1",
    "DisplayName": "Test 1 Basic",
    "version": "1.0.0"
}, null, 2));

fs.writeFileSync(path.join(test1Dir, 'config.xml'), `
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.rishi.test1" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">
    <name>Test 1 Basic</name>
    <content src="index.html" />
</widget>
`);

// Test 2: Add Capacitor Core (no plugins)
const test2Dir = 'test2-capacitor-core';
const test2www = path.join(test2Dir, 'www');
fs.mkdirSync(test2www, { recursive: true });

fs.writeFileSync(path.join(test2www, 'index.html'), `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Test 2 - Capacitor Core</title>
    <style>
        body { background: blue; color: white; font-size: 24px; text-align: center; padding: 40px; }
    </style>
</head>
<body>
    <h1>🔋 TEST 2: CAPACITOR CORE</h1>
    <p id="status">Loading...</p>
    <button onclick="testCapacitor()">Test Capacitor</button>
    
    <script>
        document.getElementById('status').textContent = 'HTML Loaded';
        
        function testCapacitor() {
            if (window.Capacitor) {
                alert('Capacitor Found: ' + Capacitor.getPlatform());
            } else {
                alert('Capacitor Not Found');
            }
        }
        
        document.addEventListener('deviceready', function() {
            document.getElementById('status').textContent = 'Capacitor Ready';
        });
    </script>
</body>
</html>
`);

fs.writeFileSync(path.join(test2Dir, 'voltbuilder.json'), JSON.stringify({
    "id": "com.rishi.test2",
    "DisplayName": "Test 2 Capacitor",
    "version": "1.0.0",
    "cordova": "12.0.0"
}, null, 2));

fs.writeFileSync(path.join(test2Dir, 'config.xml'), `
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.rishi.test2" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">
    <name>Test 2 Capacitor</name>
    <content src="index.html" />
    <access origin="*" />
    <preference name="DisallowOverscroll" value="true" />
</widget>
`);

// Test 3: Add React (minimal)
const test3Dir = 'test3-react-minimal';
const test3www = path.join(test3Dir, 'www');
fs.mkdirSync(test3www, { recursive: true });

fs.writeFileSync(path.join(test3www, 'index.html'), `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Test 3 - React Minimal</title>
    <style>
        body { background: purple; color: white; font-size: 24px; text-align: center; padding: 40px; }
    </style>
</head>
<body>
    <h1>⚛️ TEST 3: REACT MINIMAL</h1>
    <div id="root">Loading React...</div>
    
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <script>
        const { useState } = React;
        
        function App() {
            const [count, setCount] = useState(0);
            
            return React.createElement('div', null,
                React.createElement('h2', null, 'React is Working!'),
                React.createElement('p', null, 'Count: ' + count),
                React.createElement('button', 
                    { onClick: () => setCount(count + 1) }, 
                    'Click Me'
                )
            );
        }
        
        ReactDOM.render(React.createElement(App), document.getElementById('root'));
    </script>
</body>
</html>
`);

fs.writeFileSync(path.join(test3Dir, 'voltbuilder.json'), JSON.stringify({
    "id": "com.rishi.test3",
    "DisplayName": "Test 3 React",
    "version": "1.0.0"
}, null, 2));

fs.writeFileSync(path.join(test3Dir, 'config.xml'), `
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.rishi.test3" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">
    <name>Test 3 React</name>
    <content src="index.html" />
    <access origin="*" />
</widget>
`);

// Package all tests
const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');

function packageTest(testDir, testName) {
    const packageName = \`progressive-\${testName}-\${timestamp}.zip\`;
    const outputPath = path.join('builds', 'Replit Dev', packageName);
    
    process.chdir(testDir);
    execSync(\`zip -r "../\${outputPath}" ./\`, { stdio: 'pipe' });
    process.chdir('..');
    
    fs.rmSync(testDir, { recursive: true });
    
    return packageName;
}

const test1Package = packageTest(test1Dir, 'test1-basic');
const test2Package = packageTest(test2Dir, 'test2-capacitor');
const test3Package = packageTest(test3Dir, 'test3-react');

console.log('✅ Progressive test packages created:');
console.log(\`📦 \${test1Package} - Basic HTML (should work)\`);
console.log(\`📦 \${test2Package} - + Capacitor Core\`);
console.log(\`📦 \${test3Package} - + React Minimal\`);
console.log('');
console.log('🧪 TESTING STRATEGY:');
console.log('1. Install Test 1 (basic) - should show GREEN screen');
console.log('2. Install Test 2 (capacitor) - if blank, Capacitor is the issue');
console.log('3. Install Test 3 (react) - if blank, React is the issue');
console.log('');
console.log('This will pinpoint exactly what breaks the app!');