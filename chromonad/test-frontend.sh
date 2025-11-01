#!/bin/bash

# Quick Frontend Test Script
# Checks if everything is set up correctly

echo "🔍 Checking Anti-Geyser Frontend Setup..."
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root"
    exit 1
fi

# Check if Anvil is running
echo "1. Checking if Anvil is running..."
if curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null 2>&1; then
    echo "   ✅ Anvil is running"
else
    echo "   ❌ Anvil is NOT running"
    echo "   → Start with: anvil"
    exit 1
fi

# Check if contracts are deployed
echo ""
echo "2. Checking if contracts are deployed..."
if [ -f "frontend/.env.local" ]; then
    source frontend/.env.local
    if [ ! -z "$NEXT_PUBLIC_REWARDS_CONTRACT" ]; then
        echo "   ✅ Contract addresses configured"
        echo "   → Rewards: $NEXT_PUBLIC_REWARDS_CONTRACT"
    else
        echo "   ⚠️  Contract addresses not configured"
        echo "   → Run: ./deploy-and-simulate.sh"
    fi
else
    echo "   ⚠️  .env.local not found"
    echo "   → File will be created on first deploy"
fi

# Check if frontend dependencies are installed
echo ""
echo "3. Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ⚠️  Dependencies not installed"
    echo "   → Run: cd frontend && npm install"
fi

# Check if frontend is running
echo ""
echo "4. Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on http://localhost:3000"
else
    echo "   ⚠️  Frontend is NOT running"
    echo "   → Start with: cd frontend && npm run dev"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
echo "📋 SETUP CHECKLIST:"
echo ""
echo "Prerequisites:"
echo "  □ Anvil running (localhost:8545)"
echo "  □ Contracts deployed"
echo "  □ Frontend dependencies installed"
echo "  □ Frontend server running (localhost:3000)"
echo ""
echo "Quick Start Commands:"
echo "  1. Terminal 1: anvil"
echo "  2. Terminal 2: ./deploy-and-simulate.sh"
echo "  3. Terminal 3: cd frontend && npm install && npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "📖 For help, see: FRONTEND_GUIDE.md"
echo ""

