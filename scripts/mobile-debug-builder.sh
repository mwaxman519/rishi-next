#!/bin/bash

# Mobile Debug Builder - Creates tests with extensive debugging

DEBUG_DIR="mobile-debug-tests"
BUILD_DIR="builds/Mobile-Tests"

mkdir -p "$DEBUG_DIR" "$BUILD_DIR"

# Test 4B: React Router with Debug Logging
create_test_4b() {
    local DIR="$DEBUG_DIR/test-4b-router-debug"
    rm -rf "$DIR"
    mkdir -p "$DIR"
    
    cat > "$DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test 4B: Router Debug</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <style>
        body { margin: 0; font-family: Arial; background: #f0f0f0; }
        .debug { position: fixed; bottom: 0; left: 0; right: 0; background: black; color: lime; 
                 padding: 10px; font-family: monospace; font-size: 12px; max-height: 200px; 
                 overflow-y: auto; }
        .content { padding: 20px; text-align: center; }
        .error { color: red; font-weight: bold; }
        button { padding: 10px 20px; margin: 5px; }
    </style>
</head>
<body>
    <div id="root"></div>
    <div id="debug" class="debug">Debug Console:</div>
    
    <script>
        // Debug logging
        window.debugLog = function(msg) {
            const debug = document.getElementById('debug');
            const time = new Date().toTimeString().split(' ')[0];
            debug.innerHTML += '<br>' + time + ' - ' + msg;
            console.log('DEBUG:', msg);
        };
        
        // Error handling
        window.onerror = function(msg, url, line, col, error) {
            debugLog('ERROR: ' + msg + ' at line ' + line);
            return true;
        };
        
        debugLog('Page loaded');
        debugLog('React: ' + (window.React ? 'Loaded' : 'Missing'));
        debugLog('ReactDOM: ' + (window.ReactDOM ? 'Loaded' : 'Missing'));
    </script>
    
    <script type="text/javascript">
        debugLog('Starting React app...');
        
        try {
            const e = React.createElement;
            
            // Simple routing without react-router
            function App() {
                const [page, setPage] = React.useState('home');
                
                React.useEffect(() => {
                    debugLog('App mounted, current page: ' + page);
                }, [page]);
                
                const HomePage = () => e('div', {className: 'content'}, 
                    e('h1', null, 'Home Page'),
                    e('p', null, 'Simple routing test'),
                    e('button', {onClick: () => setPage('about')}, 'Go to About')
                );
                
                const AboutPage = () => e('div', {className: 'content'},
                    e('h1', null, 'About Page'),
                    e('p', null, 'Navigation works!'),
                    e('button', {onClick: () => setPage('home')}, 'Go to Home')
                );
                
                return e('div', null,
                    e('div', {style: {background: '#333', color: 'white', padding: '10px'}},
                        e('span', null, 'Current: ' + page)
                    ),
                    page === 'home' ? HomePage() : AboutPage()
                );
            }
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(e(App));
            debugLog('React app rendered successfully');
            
        } catch(err) {
            debugLog('FATAL ERROR: ' + err.message);
            document.getElementById('root').innerHTML = 
                '<div class="error">Failed to load: ' + err.message + '</div>';
        }
    </script>
</body>
</html>
EOF

    cat > "$DIR/voltbuilder.json" << 'EOF'
{
    "title": "Test 4B: Router Debug",
    "package": "com.rishi.test4b",
    "version": "1.0.0"
}
EOF

    # Package it
    cd "$DIR"
    zip -r "../../$BUILD_DIR/test-4b-router-debug-$(date +%H%M).zip" . >/dev/null 2>&1
    cd ../..
    echo "✅ Created: test-4b-router-debug with extensive logging"
}

# Test 7: Next.js Static with Debug
create_test_7() {
    local DIR="$DEBUG_DIR/test-7-nextjs-debug"
    rm -rf "$DIR"
    mkdir -p "$DIR/www"
    
    cat > "$DIR/www/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test 7: Next.js Debug</title>
    <style>
        body { margin: 0; font-family: -apple-system, Arial; }
        #__next { padding: 20px; }
        .debug-info { background: #f0f0f0; padding: 10px; margin: 10px 0; font-family: monospace; }
    </style>
</head>
<body>
    <div id="__next">
        <h1>Next.js Static Export Test</h1>
        <div class="debug-info" id="debug">Loading...</div>
    </div>
    
    <script>
        // Minimal Next.js runtime simulation
        window.__NEXT_DATA__ = {
            props: { pageProps: { test: true } },
            page: '/',
            query: {},
            buildId: 'test-build'
        };
        
        // Debug info
        const debug = document.getElementById('debug');
        debug.innerHTML = `
            Platform: ${navigator.platform}<br>
            UserAgent: ${navigator.userAgent}<br>
            Window.__NEXT_DATA__: ${JSON.stringify(window.__NEXT_DATA__)}<br>
            Scripts loaded: Success
        `;
        
        console.log('Next.js test loaded successfully');
    </script>
    
    <!-- Simulate Next.js chunk loading -->
    <script>
        // This simulates how Next.js loads chunks
        window._app = { loaded: true };
        console.log('App chunk loaded');
    </script>
</body>
</html>
EOF

    # Add multiple pages to test routing
    cat > "$DIR/www/about.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - Next.js Test</title>
</head>
<body>
    <div id="__next">
        <h1>About Page</h1>
        <a href="index.html">Back to Home</a>
    </div>
</body>
</html>
EOF

    cat > "$DIR/capacitor.config.json" << 'EOF'
{
    "appId": "com.rishi.test7",
    "appName": "Test 7 NextJS",
    "webDir": "www"
}
EOF

    cat > "$DIR/voltbuilder.json" << 'EOF'
{
    "title": "Test 7: NextJS Debug",
    "package": "com.rishi.test7",
    "version": "1.0.0"
}
EOF

    cd "$DIR"
    zip -r "../../$BUILD_DIR/test-7-nextjs-debug-$(date +%H%M).zip" . >/dev/null 2>&1
    cd ../..
    echo "✅ Created: test-7-nextjs-debug with Capacitor structure"
}

# Main execution
echo "🔍 Mobile Debug Test Builder"
echo "============================"

create_test_4b
create_test_7

echo ""
echo "📱 Debug builds created:"
echo "- test-4b-router-debug: React with simple state-based routing (no react-router)"
echo "- test-7-nextjs-debug: Next.js static with debug info"
echo ""
echo "These builds include extensive debug logging to identify issues."