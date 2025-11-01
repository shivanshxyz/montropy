// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AntiGeyserRewards.sol";
import "../src/RewardToken.sol";
import "../src/MockPool.sol";

/**
 * @title DeployTestnet
 * @notice Deployment script for testnet deployment (Sepolia, etc.)
 */
contract DeployTestnet is Script {
    function run() external {
        address deployer = msg.sender;
        
        console.log("Deploying contracts to testnet...");
        console.log("Deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast();
        
        // 1. Deploy tokens
        RewardToken rewardToken = new RewardToken("Chromonad Reward Token", "CHROM", deployer);
        RewardToken poolToken = new RewardToken("Pool Token", "POOL", deployer);
        
        console.log("RewardToken deployed at:", address(rewardToken));
        console.log("PoolToken deployed at:", address(poolToken));
        
        // 2. Deploy rewards contract
        AntiGeyserRewards rewardsContract = new AntiGeyserRewards(
            address(rewardToken),
            address(poolToken),
            deployer
        );
        
        console.log("AntiGeyserRewards deployed at:", address(rewardsContract));
        
        // 3. Deploy mock pool (optional for demo)
        MockPool mockPool = new MockPool(address(poolToken));
        console.log("MockPool deployed at:", address(mockPool));
        
        // 4. Mint initial supply (adjust as needed for testnet)
        uint256 initialSupply = 1_000_000 * 1e18; // 1M tokens
        rewardToken.mint(deployer, initialSupply);
        poolToken.mint(deployer, initialSupply);
        
        console.log("Minted tokens to deployer");
        
        // 5. Setup initial program
        uint256 epochLength = 1 days;
        uint256 rewardPerEpoch = 1000 * 1e18; // 1000 tokens per epoch
        uint256 halfLife = 2;
        uint256 alpha = 0.02 * 1e18; // 2% per epoch
        uint256 tMax = 10;
        uint256 totalEpochs = 30; // Longer for testnet demo
        
        rewardsContract.createProgram(
            epochLength,
            rewardPerEpoch,
            halfLife,
            alpha,
            tMax,
            totalEpochs
        );
        
        console.log("Created rewards program");
        
        // 6. Deposit rewards
        uint256 totalRewards = rewardPerEpoch * totalEpochs;
        rewardToken.approve(address(rewardsContract), totalRewards);
        rewardsContract.depositRewards(totalRewards, totalEpochs);
        
        console.log("Deposited", totalRewards, "reward tokens");
        
        vm.stopBroadcast();
        
        // Save deployment addresses
        console.log("\n=== Testnet Deployment Summary ===");
        console.log("Network: See RPC URL");
        console.log("RewardToken:", address(rewardToken));
        console.log("PoolToken:", address(poolToken));
        console.log("AntiGeyserRewards:", address(rewardsContract));
        console.log("MockPool:", address(mockPool));
        console.log("Deployer:", deployer);
        console.log("\nUpdate your .env file with these addresses!");
    }
}

