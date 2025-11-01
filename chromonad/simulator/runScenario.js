#!/usr/bin/env node

/**
 * Anti-Geyser Rewards Simulator
 * 
 * Runs predefined scenarios to demonstrate anti-farming behavior
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Contract ABIs (simplified for demo)
const REWARDS_ABI = [
  "function getCurrentEpoch() view returns (uint256)",
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function claimRewards() external returns (uint256)",
  "function snapshotEpoch(uint256 epoch) external",
  "function pendingRewards(address user) view returns (uint256)",
  "function effectiveStake(address user, uint256 epoch) view returns (uint256)",
  "function getPosition(address user) view returns (uint256 amount, uint256 joinEpoch, uint256 lastClaimEpoch, uint256 tenureEpochs, uint256 churnCount)",
  "function epochs(uint256) view returns (uint256 totalEffectiveStake, uint256 rewardAllocated, bool finalized)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external"
];

async function loadScenario(scenarioPath) {
  const data = fs.readFileSync(scenarioPath, 'utf8');
  return JSON.parse(data);
}

async function runSimulation(scenarioPath) {
  console.log('\n=== Anti-Geyser Rewards Simulator ===\n');
  
  // Load scenario
  const scenario = await loadScenario(scenarioPath);
  console.log(`Running scenario: ${scenario.name || 'Unnamed'}`);
  console.log(`Description: ${scenario.description || 'N/A'}\n`);
  
  // Connect to provider (disable caching for fresh nonces)
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL || 'http://localhost:8545',
    undefined,
    { cacheTimeout: -1 } // Disable caching to prevent nonce issues
  );
  
  // Get deployer wallet (Anvil default)
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Contract instances
  const rewardsContract = new ethers.Contract(
    process.env.REWARDS_CONTRACT,
    REWARDS_ABI,
    deployer
  );
  
  const poolToken = new ethers.Contract(
    process.env.POOL_TOKEN,
    ERC20_ABI,
    deployer
  );
  
  const rewardToken = new ethers.Contract(
    process.env.REWARD_TOKEN,
    ERC20_ABI,
    deployer
  );
  
  // Create wallets for actors
  const actors = {};
  for (const actor of scenario.actors) {
    const wallet = ethers.Wallet.createRandom().connect(provider);
    actors[actor.name] = {
      wallet,
      config: actor
    };
    
    // Fund with ETH for gas (fetch fresh nonce to avoid conflicts)
    const nonce1 = await provider.getTransactionCount(deployer.address, 'latest');
    const fundTx = await deployer.sendTransaction({
      to: wallet.address,
      value: ethers.parseEther("10"),
      nonce: nonce1
    });
    await fundTx.wait();
    
    // Transfer pool tokens from deployer (who has initial supply)
    const totalNeeded = actor.deposits.reduce(
      (sum, d) => sum + ethers.parseEther(d.amount.toString()), 
      0n
    );
    const nonce2 = await provider.getTransactionCount(deployer.address, 'latest');
    const transferTx = await poolToken.transfer(wallet.address, totalNeeded, { nonce: nonce2 });
    await transferTx.wait();
    
    console.log(`✓ Created actor: ${actor.name} (${wallet.address.slice(0, 8)}...)`);
  }
  
  console.log('\n--- Simulating epochs ---\n');
  
  const results = [];
  const epochLength = scenario.program.epochLength || 86400; // 1 day default
  
  // Run through epochs
  for (let epoch = 0; epoch < scenario.program.epochs; epoch++) {
    console.log(`\nEpoch ${epoch}:`);
    
    // Process deposits for this epoch
    for (const [actorName, actorData] of Object.entries(actors)) {
      const deposits = actorData.config.deposits.filter(d => d.epoch === epoch);
      
      for (const deposit of deposits) {
        const wallet = actorData.wallet;
        const amount = ethers.parseEther(deposit.amount.toString());
        
        // Check balance before staking
        const poolTokenWithSigner = poolToken.connect(wallet);
        const balance = await poolTokenWithSigner.balanceOf(wallet.address);
        
        if (balance < amount) {
          throw new Error(`${actorName} has insufficient balance: ${ethers.formatEther(balance)} < ${deposit.amount}`);
        }
        
        // Approve with max uint256 to avoid multiple approvals
        const approveTx = await poolTokenWithSigner.approve(
          rewardsContract.target, 
          ethers.MaxUint256
        );
        await approveTx.wait();
        
        // Verify approval
        const allowance = await poolTokenWithSigner.allowance(wallet.address, rewardsContract.target);
        console.log(`  ${actorName} approved: ${ethers.formatEther(allowance)} tokens`);
        
        // Stake
        const rewardsWithSigner = rewardsContract.connect(wallet);
        const stakeTx = await rewardsWithSigner.stake(amount);
        await stakeTx.wait();
        
        console.log(`  ${actorName} staked ${deposit.amount} tokens`);
      }
    }
    
    // Process withdrawals for this epoch
    for (const [actorName, actorData] of Object.entries(actors)) {
      const withdrawals = actorData.config.withdraws.filter(w => w.epoch === epoch);
      
      for (const withdrawal of withdrawals) {
        const wallet = actorData.wallet;
        const amount = withdrawal.amount 
          ? ethers.parseEther(withdrawal.amount.toString())
          : (await rewardsContract.getPosition(wallet.address))[0]; // Withdraw all
        
        const rewardsWithSigner = rewardsContract.connect(wallet);
        const withdrawTx = await rewardsWithSigner.withdraw(amount);
        await withdrawTx.wait();
        
        console.log(`  ${actorName} withdrew ${ethers.formatEther(amount)} tokens`);
      }
    }
    
    // Advance time to complete this epoch
    await provider.send("evm_increaseTime", [epochLength]);
    await provider.send("evm_mine", []);
    
    // Snapshot the previous epoch (if not first epoch)
    if (epoch > 0) {
      // Check if epoch is already finalized
      const prevEpochData = await rewardsContract.epochs(epoch - 1);
      if (!prevEpochData.finalized) {
        const nonce = await provider.getTransactionCount(deployer.address, 'latest');
        const snapshotTx = await rewardsContract.snapshotEpoch(epoch - 1, { nonce });
        await snapshotTx.wait();
        console.log(`  ✓ Finalized epoch ${epoch - 1}`);
      } else {
        console.log(`  ℹ Epoch ${epoch - 1} already finalized (skipping)`);
      }
    }
    
    // Collect stats
    const epochStats = {
      epoch,
      actors: {}
    };
    
    for (const [actorName, actorData] of Object.entries(actors)) {
      const wallet = actorData.wallet;
      const position = await rewardsContract.getPosition(wallet.address);
      const pending = epoch > 0 ? await rewardsContract.pendingRewards(wallet.address) : 0n;
      const effective = position[0] > 0 ? await rewardsContract.effectiveStake(wallet.address, epoch) : 0n;
      
      epochStats.actors[actorName] = {
        staked: ethers.formatEther(position[0]),
        effectiveStake: ethers.formatEther(effective),
        pendingRewards: ethers.formatEther(pending),
        joinEpoch: position[1].toString(),
        tenureEpochs: position[3].toString(),
        churnCount: position[4].toString()
      };
    }
    
    results.push(epochStats);
  }
  
  // Finalize last epoch
  const lastEpochData = await rewardsContract.epochs(scenario.program.epochs - 1);
  if (!lastEpochData.finalized) {
    const finalNonce = await provider.getTransactionCount(deployer.address, 'latest');
    const finalSnapshotTx = await rewardsContract.snapshotEpoch(scenario.program.epochs - 1, { nonce: finalNonce });
    await finalSnapshotTx.wait();
    console.log(`✓ Finalized last epoch (${scenario.program.epochs - 1})`);
  } else {
    console.log(`ℹ Last epoch (${scenario.program.epochs - 1}) already finalized`);
  }
  
  console.log('\n\n=== SIMULATION RESULTS ===\n');
  
  // Calculate final rewards
  for (const [actorName, actorData] of Object.entries(actors)) {
    const wallet = actorData.wallet;
    const pending = await rewardsContract.pendingRewards(wallet.address);
    const position = await rewardsContract.getPosition(wallet.address);
    
    console.log(`${actorName}:`);
    console.log(`  Address: ${wallet.address}`);
    console.log(`  Final Staked: ${ethers.formatEther(position[0])} tokens`);
    console.log(`  Join Epoch: ${position[1]}`);
    console.log(`  Tenure: ${position[3]} epochs`);
    console.log(`  Churn Count: ${position[4]}`);
    console.log(`  Total Rewards: ${ethers.formatEther(pending)} tokens`);
    console.log('');
  }
  
  // Calculate anti-farm metrics
  const totalRewards = Object.values(actors).reduce(async (sum, actorData) => {
    const pending = await rewardsContract.pendingRewards(actorData.wallet.address);
    return (await sum) + pending;
  }, Promise.resolve(0n));
  
  console.log('\n=== ANTI-FARM METRICS ===\n');
  
  const rewardsByActor = {};
  for (const [actorName, actorData] of Object.entries(actors)) {
    const pending = await rewardsContract.pendingRewards(actorData.wallet.address);
    rewardsByActor[actorName] = pending;
  }
  
  const total = Object.values(rewardsByActor).reduce((sum, r) => sum + r, 0n);
  
  for (const [actorName, rewards] of Object.entries(rewardsByActor)) {
    const percentage = total > 0 ? Number((rewards * 10000n) / total) / 100 : 0;
    console.log(`${actorName}: ${percentage.toFixed(2)}% of total rewards`);
  }
  
  // Save results
  const outputPath = path.join(__dirname, 'results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Results saved to ${outputPath}`);
  
  console.log('\n=== Simulation Complete ===\n');
}

// Main execution
const scenarioPath = process.argv[2] || path.join(__dirname, 'scenarios', 'sample.json');

runSimulation(scenarioPath)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Simulation failed:', error);
    process.exit(1);
  });

