#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔋 Injecting Capacitor JavaScript bridge into static HTML...');

const indexPath = path.join('out', 'index.html');

if (!fs.existsSync(indexPath)) {
    console.error('❌ Error: out/index.html not found');
    process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Capacitor scripts to inject
const capacitorScripts = `
    <!-- Capacitor Core -->
    <script type="module" src="https://unpkg.com/@capacitor/core@7.4.2/dist/capacitor.js"></script>
    <script type="module">
        import { Capacitor } from 'https://unpkg.com/@capacitor/core@7.4.2/dist/capacitor.js';
        window.Capacitor = Capacitor;
        console.log('Capacitor bridge loaded:', Capacitor.getPlatform());
    </script>
    
    <!-- Capacitor Plugins -->
    <script type="module" src="https://unpkg.com/@capacitor/app@7.0.1/dist/plugin.js"></script>
    <script type="module" src="https://unpkg.com/@capacitor/splash-screen@7.0.1/dist/plugin.js"></script>
    <script type="module" src="https://unpkg.com/@capacitor/status-bar@7.0.1/dist/plugin.js"></script>
    <script type="module" src="https://unpkg.com/@capacitor/keyboard@7.0.1/dist/plugin.js"></script>
    <script type="module" src="https://unpkg.com/@capacitor/local-notifications@7.0.1/dist/plugin.js"></script>
    <script type="module" src="https://unpkg.com/@capacitor/push-notifications@7.0.1/dist/plugin.js"></script>
`;

// Inject before closing head tag
html = html.replace('</head>', capacitorScripts + '\n</head>');

// Also add deviceready event trigger
const deviceReadyScript = `
    <script>
        // Trigger deviceready event when Capacitor is loaded
        document.addEventListener('DOMContentLoaded', function() {
            if (window.Capacitor) {
                setTimeout(() => {
                    const event = new Event('deviceready');
                    document.dispatchEvent(event);
                    console.log('deviceready event dispatched');
                }, 100);
            }
        });
    </script>
`;

html = html.replace('</body>', deviceReadyScript + '\n</body>');

fs.writeFileSync(indexPath, html);

console.log('✅ Capacitor bridge injected successfully');
console.log('🔋 Added Capacitor core and plugin scripts');
console.log('📱 Added deviceready event trigger');