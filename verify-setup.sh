#!/bin/bash

# Work-flow Project - Quick Start Verification Script
# This script checks if everything is set up correctly

echo "🔍 Work-flow Setup Verification
================================\n"

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  Node.js version: $NODE_VERSION"
else
    echo "  ❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

# Check npm
echo "\n✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  npm version: $NPM_VERSION"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Check if node_modules exists
echo "\n✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ Dependencies installed"
else
    echo "  ⚠️  Dependencies not installed"
    echo "  Run: npm install"
fi

# Check .env.local
echo "\n✓ Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "  ✅  .env.local file exists"
    
    # Check for required vars
    if grep -q "NEXT_PUBLIC_APPWRITE_PROJECT_ID" .env.local; then
        echo "  ✅ NEXT_PUBLIC_APPWRITE_PROJECT_ID is set"
    else
        echo "  ❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID missing from .env.local"
    fi
    
    if grep -q "APPWRITE_API_KEY" .env.local; then
        echo "  ✅ APPWRITE_API_KEY is set"
    else
        echo "  ❌ APPWRITE_API_KEY missing from .env.local"
    fi
else
    echo "  ❌ .env.local not found"
    echo "  Create it with:"
    echo "  cp .env.example .env.local"
    echo "  Then edit with your Appwrite credentials"
fi

# Check key directories
echo "\n✓ Checking project structure..."
DIRS=("src" "src/components" "src/app" "src/hooks" "src/server" "src/stores")
for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir exists"
    else
        echo "  ❌ $dir missing"
    fi
done

# Check key files
echo "\n✓ Checking key files..."
FILES=("package.json" "tailwind.config.ts" "tsconfig.json" ".env.example")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
    fi
done

echo "\n================================
✨ Verification Complete!

Next steps:
1. Set environment variables in .env.local
2. Run: npm run dev
3. Open: http://localhost:3000

For help, see: COMPLETE_SETUP_GUIDE.md
"
