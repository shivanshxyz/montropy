#!/bin/bash

# Complete deployment and simulation script
# This script deploys contracts, sets up the program, and runs the simulation

set -e  # Exit on any error

echo "🚀 Starting complete deployment and simulation..."
echo ""

# Step 1: Deploy contracts
echo "📝 Step 1: Deploying contracts..."
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast \
  --silent

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi
echo "✅ Contracts deployed successfully"
echo ""

# Step 2: Setup rewards program
echo "📝 Step 2: Setting up rewards program..."
forge script script/SetupProgram.s.sol:SetupProgram \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast \
  --silent

if [ $? -ne 0 ]; then
    echo "❌ Setup failed"
    exit 1
fi
echo "✅ Rewards program configured successfully"
echo ""

# Step 3: Run simulation
echo "📝 Step 3: Running simulation..."
echo ""
npm run simulate

if [ $? -ne 0 ]; then
    echo "❌ Simulation failed"
    exit 1
fi

echo ""
echo "✅ All steps completed successfully!"

