#!/usr/bin/env node

/**
 * Visualize simulation results in the terminal
 */

const fs = require('fs');
const path = require('path');

function createBarChart(data, maxWidth = 50) {
  const max = Math.max(...data.map(d => d.value));
  return data.map(d => {
    const barLength = Math.round((d.value / max) * maxWidth);
    const bar = '█'.repeat(barLength);
    const percentage = ((d.value / max) * 100).toFixed(1);
    return `${d.label.padEnd(15)} ${bar} ${percentage}%`;
  }).join('\n');
}

function visualizeResults(resultsPath) {
  if (!fs.existsSync(resultsPath)) {
    console.error(`❌ Results file not found: ${resultsPath}`);
    console.log('Run a simulation first: npm run simulate');
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 ANTI-GEYSER SIMULATION VISUALIZATION');
  console.log('='.repeat(80) + '\n');

  // Extract final epoch data
  const finalEpoch = results[results.length - 1];
  
  // Create reward distribution chart
  const rewardData = Object.entries(finalEpoch.actors).map(([name, data]) => ({
    label: name,
    value: parseFloat(data.pendingRewards)
  })).sort((a, b) => b.value - a.value);

  console.log('💰 REWARD DISTRIBUTION\n');
  console.log(createBarChart(rewardData));
  console.log('');

  // Calculate total rewards
  const totalRewards = rewardData.reduce((sum, d) => sum + d.value, 0);
  
  console.log('\n📈 DETAILED METRICS\n');
  rewardData.forEach(actor => {
    const actorData = finalEpoch.actors[actor.label];
    const percentage = ((actor.value / totalRewards) * 100).toFixed(2);
    
    console.log(`${actor.label}:`);
    console.log(`  └─ Rewards: ${actor.value.toFixed(2)} tokens (${percentage}%)`);
    console.log(`  └─ Staked: ${actorData.staked} tokens`);
    console.log(`  └─ Effective Stake: ${actorData.effectiveStake} tokens`);
    console.log(`  └─ Join Epoch: ${actorData.joinEpoch}`);
    console.log(`  └─ Tenure: ${actorData.tenureEpochs} epochs`);
    console.log(`  └─ Churn Count: ${actorData.churnCount}`);
    console.log('');
  });

  // Show epoch progression
  console.log('\n📊 EPOCH PROGRESSION\n');
  console.log('Epoch | ' + Object.keys(finalEpoch.actors).map(a => a.padEnd(12)).join(' | '));
  console.log('─'.repeat(80));
  
  results.slice(0, 10).forEach(epoch => {
    const row = [epoch.epoch.toString().padEnd(5)];
    Object.entries(finalEpoch.actors).forEach(([name]) => {
      const actorData = epoch.actors[name];
      const rewards = parseFloat(actorData.pendingRewards).toFixed(0);
      row.push(rewards.padEnd(12));
    });
    console.log(row.join(' | '));
  });

  // Anti-Farm Effectiveness Score
  const churners = [];
  const longTermLPs = [];
  
  rewardData.forEach(d => {
    const actorData = finalEpoch.actors[d.label];
    if (actorData.churnCount > 0) {
      churners.push(d);
    } else {
      longTermLPs.push(d);
    }
  });
  
  const churnerRewards = churners.reduce((sum, c) => sum + c.value, 0);
  const lpRewards = longTermLPs.reduce((sum, lp) => sum + lp.value, 0);
  
  const antiFarmScore = totalRewards > 0 ? ((lpRewards / totalRewards) * 100).toFixed(2) : 0;
  
  console.log('\n' + '='.repeat(80));
  console.log('🛡️  ANTI-FARM EFFECTIVENESS SCORE');
  console.log('='.repeat(80));
  console.log(`\n✅ ${antiFarmScore}% of rewards went to long-term LPs (no churning)`);
  console.log(`❌ ${(100 - antiFarmScore).toFixed(2)}% of rewards went to churners\n`);
  console.log(`📊 Long-term LPs: ${longTermLPs.length} actors, ${lpRewards.toFixed(2)} tokens`);
  console.log(`📊 Churners: ${churners.length} actors, ${churnerRewards.toFixed(2)} tokens\n`);
  
  if (antiFarmScore > 90) {
    console.log('✅ EXCELLENT: System strongly discourages farming behavior');
  } else if (antiFarmScore > 70) {
    console.log('✅ GOOD: System effectively discourages farming');
  } else if (antiFarmScore > 50) {
    console.log('⚠️  MODERATE: Some farming resistance');
  } else {
    console.log('❌ WEAK: Low farming resistance');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Main execution
const resultsPath = process.argv[2] || path.join(__dirname, 'results.json');
visualizeResults(resultsPath);

