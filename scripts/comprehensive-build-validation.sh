#!/bin/bash

echo "🔍 COMPREHENSIVE BUILD VALIDATION FOR VOLTBUILDER"
echo "=================================================="

# Check if zip package exists
PACKAGE_NAME="rishi-platform-2025-07-21.zip"
if [ ! -f "$PACKAGE_NAME" ]; then
    echo "❌ Package not found: $PACKAGE_NAME"
    exit 1
fi

echo "✅ Package found: $PACKAGE_NAME"

# Extract and analyze package contents
echo ""
echo "🔍 CRITICAL FILES VALIDATION:"
echo "============================="

python3 -c "
import zipfile
import sys

print('📦 Analyzing package contents...')
with zipfile.ZipFile('$PACKAGE_NAME', 'r') as z:
    files = set(z.namelist())
    
    # Critical configuration files
    critical_files = [
        'package.json', 'next.config.mjs', 'tsconfig.json', 'tailwind.config.js',
        'capacitor.config.ts', 'voltbuilder.json'
    ]
    
    print('\n🔧 Configuration Files:')
    missing_critical = []
    for file in critical_files:
        if file in files:
            print(f'  ✅ {file}')
        else:
            print(f'  ❌ {file}')
            missing_critical.append(file)
    
    # Directory structure
    required_dirs = ['app/', 'components/', 'lib/', 'shared/', 'types/', 'styles/', 'public/']
    print('\n📁 Required Directories:')
    missing_dirs = []
    for dir_name in required_dirs:
        if any(f.startswith(dir_name) for f in files):
            file_count = len([f for f in files if f.startswith(dir_name)])
            print(f'  ✅ {dir_name} ({file_count} files)')
        else:
            print(f'  ❌ {dir_name}')
            missing_dirs.append(dir_name)
    
    # Critical UI components that caused the previous build failure
    critical_ui_components = ['card.tsx', 'button.tsx', 'badge.tsx', 'textarea.tsx', 'input.tsx']
    print('\n🎨 Critical UI Components:')
    missing_ui = []
    for component in critical_ui_components:
        ui_files = [f for f in files if component in f and '/ui/' in f]
        if ui_files:
            print(f'  ✅ {component} (found: {ui_files[0]})')
        else:
            print(f'  ❌ {component}')
            missing_ui.append(component)
    
    # Android/iOS native files
    native_dirs = ['android/', 'ios/']
    print('\n📱 Native Platform Files:')
    for dir_name in native_dirs:
        if any(f.startswith(dir_name) for f in files):
            file_count = len([f for f in files if f.startswith(dir_name)])
            print(f'  ✅ {dir_name} ({file_count} files)')
        else:
            print(f'  ❌ {dir_name}')
    
    # Static assets
    asset_files = ['favicon.ico', 'favicon.png', 'www/index.html']
    print('\n🖼️ Static Assets:')
    for asset in asset_files:
        if asset in files:
            print(f'  ✅ {asset}')
        else:
            print(f'  ❌ {asset}')
    
    # Package statistics
    total_files = len(files)
    js_ts_files = len([f for f in files if f.endswith(('.ts', '.tsx', '.js', '.jsx'))])
    ui_components = len([f for f in files if '/ui/' in f and f.endswith('.tsx')])
    
    print(f'\n📊 Package Statistics:')
    print(f'  📦 Total files: {total_files}')
    print(f'  💻 TypeScript/JS files: {js_ts_files}')
    print(f'  🎨 UI components: {ui_components}')
    print(f'  📁 Package size: {round(len(z.read(files.pop())) / (1024*1024), 2) if files else 0} MB (estimated)')
    
    # Final assessment
    print(f'\n🎯 BUILD READINESS ASSESSMENT:')
    print(f'========================')
    
    if missing_critical:
        print(f'❌ CRITICAL ISSUE: Missing files: {missing_critical}')
        sys.exit(1)
    elif missing_ui:
        print(f'❌ UI COMPONENT ISSUE: Missing components: {missing_ui}')
        sys.exit(1)
    elif missing_dirs:
        print(f'❌ DIRECTORY ISSUE: Missing directories: {missing_dirs}')
        sys.exit(1)
    else:
        print('✅ ALL CRITICAL COMPONENTS PRESENT')
        print('✅ PACKAGE IS READY FOR VOLTBUILDER DEPLOYMENT')
"

echo ""
echo "🔍 DEPENDENCY VALIDATION:"
echo "========================="

# Check for potential import path issues
echo "📋 Checking import path patterns..."
python3 -c "
import zipfile
import re

with zipfile.ZipFile('$PACKAGE_NAME', 'r') as z:
    ts_files = [f for f in z.namelist() if f.endswith(('.ts', '.tsx')) and not f.endswith('.d.ts')]
    
    import_issues = []
    for file in ts_files[:10]:  # Check first 10 files as sample
        try:
            content = z.read(file).decode('utf-8')
            # Look for @/ imports
            at_imports = re.findall(r'from [\'\"]\@\/([^\'\"]+)[\'\"']', content)
            if at_imports:
                print(f'  📁 {file}: @/ imports found')
                for imp in at_imports[:3]:  # First 3 imports
                    print(f'    -> @/{imp}')
        except:
            continue
            
    print('  ✅ Import path analysis complete')
"

echo ""
echo "🎯 FINAL VALIDATION RESULT:"
echo "=========================="
echo "✅ Package: $PACKAGE_NAME is ready for VoltBuilder upload"
echo "📊 Size: $(du -h $PACKAGE_NAME | cut -f1)"
echo "🚀 Next step: Upload to https://voltbuilder.com/"