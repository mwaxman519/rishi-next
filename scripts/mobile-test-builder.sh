#!/bin/bash

# Rishi Platform Mobile Test Builder
# Systematic progressive complexity testing

TEST_DIR="mobile-tests"
BUILD_DIR="builds/Mobile-Tests"

mkdir -p "$TEST_DIR" "$BUILD_DIR"

# Function to create test builds
create_test() {
    local TEST_NUM=$1
    local TEST_NAME=$2
    local TEST_DESC=$3
    
    echo "=== Creating Test $TEST_NUM: $TEST_NAME ==="
    echo "Description: $TEST_DESC"
    
    TEST_FOLDER="$TEST_DIR/test-$TEST_NUM-$TEST_NAME"
    rm -rf "$TEST_FOLDER"
    mkdir -p "$TEST_FOLDER"
    
    # Create test based on number
    case $TEST_NUM in
        4)
            # React + Routing
            create_react_routing_test "$TEST_FOLDER"
            ;;
        5)
            # React + Capacitor
            create_react_capacitor_test "$TEST_FOLDER"
            ;;
        6)
            # Minimal Next.js
            create_minimal_nextjs_test "$TEST_FOLDER"
            ;;
        7)
            # Next.js + Pages
            create_nextjs_pages_test "$TEST_FOLDER"
            ;;
        8)
            # Next.js + Tailwind
            create_nextjs_tailwind_test "$TEST_FOLDER"
            ;;
        9)
            # Next.js + Auth UI
            create_nextjs_auth_test "$TEST_FOLDER"
            ;;
        10)
            # Next.js + API Mocking
            create_nextjs_api_test "$TEST_FOLDER"
            ;;
    esac
    
    # Package the test
    TIMESTAMP=$(date +"%H%M")
    ZIP_NAME="test-$TEST_NUM-$TEST_NAME-$TIMESTAMP.zip"
    
    cd "$TEST_FOLDER"
    zip -r "../../$BUILD_DIR/$ZIP_NAME" . >/dev/null 2>&1
    cd ../..
    
    echo "✅ Created: $ZIP_NAME ($(du -h "$BUILD_DIR/$ZIP_NAME" | cut -f1))"
    echo ""
}

# Test 4: React + Routing
create_react_routing_test() {
    local DIR=$1
    
    cat > "$DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test 4: React + Routing</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { margin: 0; font-family: Arial; }
        nav { background: #333; padding: 10px; }
        nav a { color: white; margin: 0 10px; text-decoration: none; }
        .page { padding: 20px; text-align: center; }
        .home { background: #e3f2fd; }
        .about { background: #f3e5f5; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { BrowserRouter, Routes, Route, Link } = ReactRouterDOM;
        
        function HomePage() {
            return <div className="page home">
                <h1>Home Page</h1>
                <p>React Router is working!</p>
            </div>;
        }
        
        function AboutPage() {
            return <div className="page about">
                <h1>About Page</h1>
                <p>Navigation successful!</p>
            </div>;
        }
        
        function App() {
            return (
                <BrowserRouter>
                    <nav>
                        <Link to="/">Home</Link>
                        <Link to="/about">About</Link>
                    </nav>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                    </Routes>
                </BrowserRouter>
            );
        }
        
        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
</body>
</html>
EOF

    cat > "$DIR/voltbuilder.json" << 'EOF'
{
    "title": "Test 4: React Routing",
    "package": "com.rishi.test4",
    "version": "1.0.0"
}
EOF
}

# Test 5: React + Capacitor
create_react_capacitor_test() {
    local DIR=$1
    
    mkdir -p "$DIR/www"
    
    cat > "$DIR/www/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test 5: React + Capacitor</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { margin: 0; font-family: Arial; background: #f0f0f0; }
        .container { padding: 20px; text-align: center; }
        button { padding: 10px 20px; margin: 10px; font-size: 16px; }
        .status { margin: 20px; padding: 15px; background: white; border-radius: 8px; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        import { Capacitor } from 'https://unpkg.com/@capacitor/core@latest';
        window.Capacitor = Capacitor;
    </script>
    <script type="text/babel">
        function App() {
            const [platform, setPlatform] = React.useState('Unknown');
            const [native, setNative] = React.useState(false);
            
            React.useEffect(() => {
                if (window.Capacitor) {
                    setPlatform(window.Capacitor.getPlatform());
                    setNative(window.Capacitor.isNative);
                }
            }, []);
            
            return (
                <div className="container">
                    <h1>Test 5: React + Capacitor</h1>
                    <div className="status">
                        <p>Platform: {platform}</p>
                        <p>Native: {native ? 'Yes' : 'No'}</p>
                        <p>Capacitor Loaded: {window.Capacitor ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            );
        }
        
        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
</body>
</html>
EOF

    cat > "$DIR/capacitor.config.json" << 'EOF'
{
    "appId": "com.rishi.test5",
    "appName": "Test 5",
    "webDir": "www"
}
EOF

    cat > "$DIR/package.json" << 'EOF'
{
    "name": "test5",
    "version": "1.0.0",
    "dependencies": {
        "@capacitor/core": "5.0.0",
        "@capacitor/android": "5.0.0"
    }
}
EOF

    cat > "$DIR/voltbuilder.json" << 'EOF'
{
    "title": "Test 5: Capacitor",
    "package": "com.rishi.test5",
    "version": "1.0.0"
}
EOF
}

# Test 6: Minimal Next.js
create_minimal_nextjs_test() {
    local DIR=$1
    
    mkdir -p "$DIR/out"
    
    cat > "$DIR/out/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test 6: Minimal Next.js</title>
    <style>
        body { margin: 0; font-family: -apple-system, Arial; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #0070f3; }
        .next-badge { background: #000; color: white; padding: 5px 10px; border-radius: 4px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <span class="next-badge">Next.js</span>
        <h1>Test 6: Minimal Next.js Export</h1>
        <p>This simulates a Next.js static export without the full framework.</p>
        <div id="__next">
            <div>
                <h2>Static Page Content</h2>
                <p>If you see this, the minimal Next.js structure is working.</p>
            </div>
        </div>
    </div>
    <script>
        console.log('Minimal Next.js test loaded');
        // Simulate Next.js runtime
        window.__NEXT_DATA__ = { props: { pageProps: {} } };
    </script>
</body>
</html>
EOF

    cat > "$DIR/voltbuilder.json" << 'EOF'
{
    "title": "Test 6: Next.js",
    "package": "com.rishi.test6",
    "version": "1.0.0"
}
EOF
}

# Main execution
echo "🚀 Rishi Platform Mobile Test Builder"
echo "======================================"
echo ""

# Build specific test or all tests
if [ -n "$1" ]; then
    # Build specific test
    case $1 in
        4) create_test 4 "react-routing" "React with client-side routing" ;;
        5) create_test 5 "react-capacitor" "React with Capacitor integration" ;;
        6) create_test 6 "minimal-nextjs" "Minimal Next.js static export" ;;
        7) create_test 7 "nextjs-pages" "Next.js with multiple pages" ;;
        8) create_test 8 "nextjs-tailwind" "Next.js with Tailwind CSS" ;;
        9) create_test 9 "nextjs-auth" "Next.js with auth UI" ;;
        10) create_test 10 "nextjs-api" "Next.js with API mocking" ;;
        *) echo "Invalid test number. Use 4-10." ;;
    esac
else
    # Build all remaining tests
    echo "Building all progressive tests..."
    for i in {4..6}; do
        case $i in
            4) create_test 4 "react-routing" "React with client-side routing" ;;
            5) create_test 5 "react-capacitor" "React with Capacitor integration" ;;
            6) create_test 6 "minimal-nextjs" "Minimal Next.js static export" ;;
        esac
    done
fi

echo ""
echo "📦 Test builds created in: $BUILD_DIR"
echo "📋 Upload these to VoltBuilder in sequence to identify failure point"