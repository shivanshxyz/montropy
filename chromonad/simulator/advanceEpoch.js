#!/usr/bin/env node

/**
 * Utility to advance blockchain time by N epochs
 */

const { ethers } = require('ethers');
require('dotenv').config();

async function advanceEpoch(numEpochs = 1, epochLength = 86400) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log(`Advancing ${numEpochs} epoch(s)...`);
  
  const timeToAdvance = numEpochs * epochLength;
  
  await provider.send("evm_increaseTime", [timeToAdvance]);
  await provider.send("evm_mine", []);
  
  console.log(`✓ Advanced ${numEpochs} epoch(s) (${timeToAdvance} seconds)`);
  
  // Get current block timestamp
  const block = await provider.getBlock('latest');
  console.log(`Current block timestamp: ${block.timestamp}`);
}

// Parse command line arguments
const numEpochs = parseInt(process.argv[2]) || 1;
const epochLength = parseInt(process.argv[3]) || 86400;

advanceEpoch(numEpochs, epochLength)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Failed to advance time:', error);
    process.exit(1);
  });

