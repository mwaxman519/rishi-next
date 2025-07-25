#!/bin/bash

# Investigate React Router Issue with Capacitor
# Create proper test builds to identify the real problem

echo "=== INVESTIGATING REACT ROUTER + CAPACITOR ISSUE ==="

TEST_DIR="mobile-debug-tests"
BUILD_DIR="builds/Mobile-Tests"

mkdir -p "$TEST_DIR" "$BUILD_DIR"

# Test 4C: React Router with Proper Capacitor Structure
create_proper_router_test() {
    local DIR="$TEST_DIR/test-4c-router-proper"
    rm -rf "$DIR"
    mkdir -p "$DIR/www"
    
    # Create proper index.html in www directory (Capacitor requirement)
    cat > "$DIR/www/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test 4C: Proper Router</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { margin: 0; font-family: Arial; background: #f0f0f0; }
        .debug { position: fixed; bottom: 0; left: 0; right: 0; background: black; color: lime; 
                 padding: 10px; font-family: monospace; font-size: 12px; max-height: 200px; 
                 overflow-y: auto; z-index: 1000; }
        .content { padding: 20px; text-align: center; margin-bottom: 100px; }
        nav { background: #333; padding: 10px; }
        nav a { color: white; margin: 0 10px; text-decoration: none; padding: 5px 10px; }
        nav a:hover { background: rgba(255,255,255,0.1); }
        .page { padding: 20px; }
        .home { background: #e3f2fd; }
        .about { background: #f3e5f5; }
        .contact { background: #e8f5e8; }
    </style>
</head>
<body>
    <div id="root"></div>
    <div id="debug" class="debug">Debug Console:</div>
    
    <script>
        // Enhanced debug logging
        window.debugLog = function(msg) {
            const debug = document.getElementById('debug');
            const time = new Date().toTimeString().split(' ')[0];
            debug.innerHTML += '<br>' + time + ' - ' + msg;
            debug.scrollTop = debug.scrollHeight;
            console.log('DEBUG:', msg);
        };
        
        // Comprehensive error handling
        window.onerror = function(msg, url, line, col, error) {
            debugLog('ERROR: ' + msg + ' at line ' + line);
            return true;
        };
        
        window.addEventListener('unhandledrejection', function(event) {
            debugLog('PROMISE ERROR: ' + event.reason);
        });
        
        debugLog('Page loaded');
        debugLog('React: ' + (window.React ? 'Loaded' : 'Missing'));
        debugLog('ReactDOM: ' + (window.ReactDOM ? 'Loaded' : 'Missing'));
        debugLog('ReactRouter: ' + (window.ReactRouterDOM ? 'Loaded' : 'Missing'));
        debugLog('User Agent: ' + navigator.userAgent.substring(0, 50) + '...');
    </script>
    
    <script type="text/babel">
        debugLog('Starting React Router app...');
        
        try {
            const { BrowserRouter, Routes, Route, Link, useLocation } = ReactRouterDOM;
            
            function DebugInfo() {
                const location = useLocation();
                React.useEffect(() => {
                    debugLog('Location changed to: ' + location.pathname);
                }, [location]);
                return null;
            }
            
            function HomePage() {
                React.useEffect(() => {
                    debugLog('HomePage component mounted');
                }, []);
                
                return (
                    <div className="page home">
                        <h1>Home Page</h1>
                        <p>React Router is working!</p>
                        <p>Current path: {window.location.pathname}</p>
                    </div>
                );
            }
            
            function AboutPage() {
                React.useEffect(() => {
                    debugLog('AboutPage component mounted');
                }, []);
                
                return (
                    <div className="page about">
                        <h1>About Page</h1>
                        <p>Navigation successful!</p>
                        <p>Router is functioning correctly.</p>
                    </div>
                );
            }
            
            function ContactPage() {
                React.useEffect(() => {
                    debugLog('ContactPage component mounted');
                }, []);
                
                return (
                    <div className="page contact">
                        <h1>Contact Page</h1>
                        <p>Third page test!</p>
                        <p>All routing working.</p>
                    </div>
                );
            }
            
            function App() {
                React.useEffect(() => {
                    debugLog('App component mounted');
                    debugLog('Initial location: ' + window.location.pathname);
                }, []);
                
                return (
                    <BrowserRouter>
                        <DebugInfo />
                        <div className="content">
                            <nav>
                                <Link to="/">Home</Link>
                                <Link to="/about">About</Link>
                                <Link to="/contact">Contact</Link>
                            </nav>
                            
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/about" element={<AboutPage />} />
                                <Route path="/contact" element={<ContactPage />} />
                            </Routes>
                        </div>
                    </BrowserRouter>
                );
            }
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
            debugLog('React Router app rendered successfully');
            
        } catch(err) {
            debugLog('FATAL ERROR: ' + err.message);
            debugLog('Error stack: ' + (err.stack || 'No stack trace'));
            document.getElementById('root').innerHTML = 
                '<div style="color:red; padding:20px;">Failed to load: ' + err.message + '</div>';
        }
    </script>
</body>
</html>
EOF

    # Create proper Capacitor config
    cat > "$DIR/capacitor.config.json" << 'EOF'
{
    "appId": "com.rishi.test4c",
    "appName": "Test 4C Router",
    "webDir": "www",
    "server": {
        "androidScheme": "https"
    }
}
EOF

    # Create package.json with stable versions
    cat > "$DIR/package.json" << 'EOF'
{
    "name": "test4c-router",
    "version": "1.0.0",
    "dependencies": {
        "@capacitor/core": "5.0.0",
        "@capacitor/android": "5.0.0"
    }
}
EOF

    cat > "$DIR/voltbuilder.json" << 'EOF'
{
    "title": "Test 4C: Proper Router",
    "package": "com.rishi.test4c",
    "version": "1.0.0"
}
EOF

    cd "$DIR"
    zip -r "../../$BUILD_DIR/test-4c-router-proper-$(date +%H%M).zip" . >/dev/null 2>&1
    cd ../..
    echo "✅ Created: test-4c-router-proper with proper Capacitor structure"
}

# Test 4D: Hash Router (Mobile-Safe Alternative)
create_hash_router_test() {
    local DIR="$TEST_DIR/test-4d-hash-router"
    rm -rf "$DIR"
    mkdir -p "$DIR/www"
    
    cat > "$DIR/www/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test 4D: Hash Router</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { margin: 0; font-family: Arial; background: #f0f0f0; }
        .debug { position: fixed; bottom: 0; left: 0; right: 0; background: black; color: lime; 
                 padding: 10px; font-family: monospace; font-size: 12px; max-height: 200px; 
                 overflow-y: auto; z-index: 1000; }
        .content { padding: 20px; text-align: center; margin-bottom: 100px; }
        nav { background: #333; padding: 10px; }
        nav a { color: white; margin: 0 10px; text-decoration: none; padding: 5px 10px; }
        .page { padding: 20px; }
        .hash { background: #fff3cd; }
    </style>
</head>
<body>
    <div id="root"></div>
    <div id="debug" class="debug">Debug Console (Hash Router):</div>
    
    <script>
        window.debugLog = function(msg) {
            const debug = document.getElementById('debug');
            const time = new Date().toTimeString().split(' ')[0];
            debug.innerHTML += '<br>' + time + ' - ' + msg;
            debug.scrollTop = debug.scrollHeight;
            console.log('DEBUG:', msg);
        };
        
        window.onerror = function(msg, url, line, col, error) {
            debugLog('ERROR: ' + msg);
            return true;
        };
        
        debugLog('Hash Router test started');
    </script>
    
    <script type="text/babel">
        try {
            // Use HashRouter instead of BrowserRouter
            const { HashRouter, Routes, Route, Link, useLocation } = ReactRouterDOM;
            
            function HomePage() {
                return (
                    <div className="page hash">
                        <h1>Hash Router Home</h1>
                        <p>Using HashRouter for mobile compatibility</p>
                        <p>Current hash: {window.location.hash}</p>
                    </div>
                );
            }
            
            function AboutPage() {
                return (
                    <div className="page hash">
                        <h1>Hash Router About</h1>
                        <p>Hash-based routing works in mobile!</p>
                    </div>
                );
            }
            
            function App() {
                React.useEffect(() => {
                    debugLog('HashRouter App mounted');
                }, []);
                
                return (
                    <HashRouter>
                        <div className="content">
                            <nav>
                                <Link to="/">Home</Link>
                                <Link to="/about">About</Link>
                            </nav>
                            
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/about" element={<AboutPage />} />
                            </Routes>
                        </div>
                    </HashRouter>
                );
            }
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
            debugLog('HashRouter app rendered successfully');
            
        } catch(err) {
            debugLog('HashRouter ERROR: ' + err.message);
        }
    </script>
</body>
</html>
EOF

    cat > "$DIR/capacitor.config.json" << 'EOF'
{
    "appId": "com.rishi.test4d",
    "appName": "Test 4D Hash Router",
    "webDir": "www",
    "server": {
        "androidScheme": "https"
    }
}
EOF

    cat > "$DIR/package.json" << 'EOF'
{
    "name": "test4d-hash-router",
    "version": "1.0.0",
    "dependencies": {
        "@capacitor/core": "5.0.0",
        "@capacitor/android": "5.0.0"
    }
}
EOF

    cat > "$DIR/voltbuilder.json" << 'EOF'
{
    "title": "Test 4D: Hash Router",
    "package": "com.rishi.test4d",
    "version": "1.0.0"
}
EOF

    cd "$DIR"
    zip -r "../../$BUILD_DIR/test-4d-hash-router-$(date +%H%M).zip" . >/dev/null 2>&1
    cd ../..
    echo "✅ Created: test-4d-hash-router for mobile-safe routing"
}

# Execute tests
echo "Creating proper React Router tests..."
create_proper_router_test
create_hash_router_test

echo ""
echo "📱 Investigation builds created:"
echo "- test-4c-router-proper: React Router with proper Capacitor structure"
echo "- test-4d-hash-router: HashRouter (mobile-safe alternative)"
echo ""
echo "These will help identify if the issue is:"
echo "1. Improper Capacitor structure (missing www/ directory)"
echo "2. BrowserRouter vs HashRouter compatibility"
echo "3. React Router version conflicts"