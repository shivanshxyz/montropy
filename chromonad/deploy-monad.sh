#!/bin/bash

# Deploy Anti-Geyser Rewards to Monad Testnet
# Simple one-command deployment script

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║         🚀 DEPLOYING TO MONAD TESTNET 🚀                                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.monad exists
if [ ! -f ".env.monad" ]; then
    echo "❌ Error: .env.monad file not found"
    echo ""
    echo "Create it with:"
    echo "  cp .env.monad.example .env.monad"
    echo "  nano .env.monad  # Add your PRIVATE_KEY"
    echo ""
    exit 1
fi

# Load environment variables
source .env.monad

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "0x..." ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env.monad"
    echo ""
    echo "Edit .env.monad and add your private key:"
    echo "  PRIVATE_KEY=0xYourActualPrivateKeyHere"
    echo ""
    exit 1
fi

echo "✅ Configuration loaded"
echo ""

# Check balance
echo "📊 Checking your balance on Monad Testnet..."
DEPLOYER_ADDRESS=$(cast wallet address $PRIVATE_KEY)
BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $MONAD_RPC_URL)

echo "   Deployer: $DEPLOYER_ADDRESS"
echo "   Balance:  $BALANCE MON"
echo ""

if [ "$BALANCE" = "0" ]; then
    echo "⚠️  WARNING: Your balance is 0!"
    echo "   Get testnet MON from: https://testnet.monad.xyz"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ask for confirmation
echo "🎯 Ready to deploy to Monad Testnet"
echo "   Network: Monad Testnet (Chain ID: 10143)"
echo "   RPC:     $MONAD_RPC_URL"
echo ""
read -p "Proceed with deployment? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy contracts
forge script script/DeployMonad.s.sol:DeployMonad \
  --rpc-url $MONAD_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --slow \
  -vvv

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "📋 NEXT STEPS:"
    echo ""
    echo "1. Copy contract addresses from the output above"
    echo ""
    echo "2. Update .env.monad with your contract addresses:"
    echo "   nano .env.monad"
    echo ""
    echo "3. Update frontend configuration:"
    echo "   cd frontend"
    echo "   cp .env.local.example .env.local"
    echo "   nano .env.local  # Add Monad addresses"
    echo ""
    echo "4. Verify contracts on Monad Explorer:"
    echo "   https://explorer.testnet.monad.xyz"
    echo ""
    echo "5. Test your deployment:"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "6. Add Monad Testnet to MetaMask:"
    echo "   Network: Monad Testnet"
    echo "   RPC: https://testnet-rpc.monad.xyz"
    echo "   Chain ID: 10143"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
else
    echo ""
    echo "❌ DEPLOYMENT FAILED"
    echo ""
    echo "Common issues:"
    echo "  - Insufficient balance → Get testnet MON from https://testnet.monad.xyz"
    echo "  - Wrong network → Check RPC URL in .env.monad"
    echo "  - Invalid private key → Verify PRIVATE_KEY in .env.monad"
    echo ""
    echo "For help, see: MONAD_DEPLOYMENT.md"
    echo ""
    exit 1
fi

