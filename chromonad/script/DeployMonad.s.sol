// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AntiGeyserRewards.sol";
import "../src/RewardToken.sol";
import "../src/MockPool.sol";

/**
 * @title DeployMonad
 * @notice Deployment script for Monad Testnet
 * @dev Monad Testnet Chain ID: 10143
 */
contract DeployMonad is Script {
    function run() external {
        address deployer = msg.sender;
        
        console.log("================================================================================");
        console.log("Deploying Anti-Geyser Rewards to Monad Testnet");
        console.log("================================================================================");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast();
        
        // 1. Deploy tokens
        console.log("\n[1/5] Deploying Reward Token...");
        RewardToken rewardToken = new RewardToken("Chromonad Reward Token", "CHROM", deployer);
        console.log("    -> RewardToken deployed at:", address(rewardToken));
        
        console.log("[2/5] Deploying Pool Token...");
        RewardToken poolToken = new RewardToken("Chromonad Pool Token", "CPOOL", deployer);
        console.log("    -> PoolToken deployed at:", address(poolToken));
        
        // 2. Deploy rewards contract
        console.log("[3/5] Deploying AntiGeyserRewards...");
        AntiGeyserRewards rewardsContract = new AntiGeyserRewards(
            address(rewardToken),
            address(poolToken),
            deployer
        );
        console.log("    -> AntiGeyserRewards deployed at:", address(rewardsContract));
        
        // 3. Deploy mock pool (optional for demo)
        console.log("[4/5] Deploying MockPool...");
        MockPool mockPool = new MockPool(address(poolToken));
        console.log("    -> MockPool deployed at:", address(mockPool));
        
        // 4. Mint initial supply
        console.log("[5/5] Minting initial token supply...");
        uint256 initialSupply = 10_000_000 * 1e18; // 10M tokens
        rewardToken.mint(deployer, initialSupply);
        poolToken.mint(deployer, initialSupply);
        console.log("    -> Minted 10M tokens each to deployer");
        
        // 5. Setup initial program (optional - can be done separately)
        console.log("\n[Optional] Setting up initial rewards program...");
        uint256 epochLength = 1 days;
        uint256 rewardPerEpoch = 1000 * 1e18; // 1000 tokens per epoch
        uint256 halfLife = 2; // 2 epochs
        uint256 alpha = 0.02 * 1e18; // 2% per epoch
        uint256 tMax = 10; // Cap at 10 epochs
        uint256 totalEpochs = 30; // 30 days for testnet
        
        rewardsContract.createProgram(
            epochLength,
            rewardPerEpoch,
            halfLife,
            alpha,
            tMax,
            totalEpochs
        );
        console.log("    -> Program created (30 epochs)");
        
        // 6. Deposit rewards
        uint256 totalRewards = rewardPerEpoch * totalEpochs;
        rewardToken.approve(address(rewardsContract), totalRewards);
        rewardsContract.depositRewards(totalRewards, totalEpochs);
        console.log("    -> Deposited", totalRewards / 1e18, "tokens for rewards");
        
        vm.stopBroadcast();
        
        // Print deployment summary
        console.log("\n");
        console.log("================================================================================");
        console.log("MONAD TESTNET DEPLOYMENT SUMMARY");
        console.log("================================================================================");
        console.log("Network:              Monad Testnet");
        console.log("Chain ID:             10143");
        console.log("Explorer:             https://explorer.testnet.monad.xyz");
        console.log("");
        console.log("CONTRACT ADDRESSES:");
        console.log("  RewardToken:        ", address(rewardToken));
        console.log("  PoolToken:          ", address(poolToken));
        console.log("  AntiGeyserRewards:  ", address(rewardsContract));
        console.log("  MockPool:           ", address(mockPool));
        console.log("");
        console.log("DEPLOYER INFO:");
        console.log("  Address:            ", deployer);
        console.log("  Initial Supply:     ", initialSupply / 1e18, "tokens each");
        console.log("");
        console.log("PROGRAM CONFIG:");
        console.log("  Epoch Length:       ", epochLength / 86400, "days");
        console.log("  Reward per Epoch:   ", rewardPerEpoch / 1e18, "tokens");
        console.log("  Total Epochs:       ", totalEpochs);
        console.log("  Half-Life:          ", halfLife, "epochs");
        console.log("  Tenure Alpha:       ", (alpha * 100) / 1e18, "%");
        console.log("  Max Tenure:         ", tMax, "epochs");
        console.log("================================================================================");
        console.log("");
        console.log("NEXT STEPS:");
        console.log("1. Verify contracts on Monad Explorer");
        console.log("2. Update frontend/.env.local with these addresses");
        console.log("3. Share contract addresses with users");
        console.log("4. Test staking on https://testnet.monad.xyz");
        console.log("================================================================================");
    }
}

