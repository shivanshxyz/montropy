#!/usr/bin/env node

/**
 * Run multiple scenarios and compare results
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const scenariosDir = path.join(__dirname, 'scenarios');
const scenarios = fs.readdirSync(scenariosDir)
  .filter(f => f.endsWith('.json'))
  .map(f => path.join(scenariosDir, f));

console.log('🔬 Anti-Geyser Scenario Comparison Tool\n');
console.log(`Found ${scenarios.length} scenarios to run:\n`);

scenarios.forEach((s, i) => {
  const data = JSON.parse(fs.readFileSync(s, 'utf8'));
  console.log(`${i + 1}. ${data.name}`);
  console.log(`   ${data.description}\n`);
});

console.log('─'.repeat(80));
console.log('\n⚠️  NOTE: You must restart Anvil between scenario runs!');
console.log('Press Ctrl+C to cancel, or any key to continue...\n');

// Wait for user input (simplified for non-interactive)
console.log('Starting in 3 seconds...\n');

setTimeout(() => {
  const allResults = [];

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    const scenarioName = path.basename(scenario, '.json');
    
    console.log('\n' + '='.repeat(80));
    console.log(`Running Scenario ${i + 1}/${scenarios.length}: ${scenarioName}`);
    console.log('='.repeat(80) + '\n');

    if (i > 0) {
      console.log('⚠️  IMPORTANT: Restart Anvil now!');
      console.log('   1. Press Ctrl+C in Anvil terminal');
      console.log('   2. Run: anvil');
      console.log('   3. Press Enter here to continue...\n');
      console.log('Waiting 5 seconds for manual restart...\n');
      // In production, you'd pause for user input here
      execSync('sleep 5');
    }

    try {
      // Deploy contracts
      console.log('📝 Deploying contracts...');
      execSync('forge script script/Deploy.s.sol:Deploy --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --silent', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });

      // Setup program
      console.log('📝 Setting up rewards program...');
      execSync('forge script script/SetupProgram.s.sol:SetupProgram --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --silent', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });

      // Run simulation
      console.log('📝 Running simulation...\n');
      execSync(`node simulator/runScenario.js ${scenario}`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });

      // Load results
      const resultsPath = path.join(__dirname, 'results.json');
      if (fs.existsSync(resultsPath)) {
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        allResults.push({
          scenario: scenarioName,
          results
        });
      }

    } catch (error) {
      console.error(`\n❌ Scenario failed: ${error.message}`);
      console.log('Continuing to next scenario...\n');
    }
  }

  // Save comparison results
  const comparisonPath = path.join(__dirname, 'comparison.json');
  fs.writeFileSync(comparisonPath, JSON.stringify(allResults, null, 2));
  console.log(`\n✅ Comparison results saved to ${comparisonPath}`);

}, 3000);

