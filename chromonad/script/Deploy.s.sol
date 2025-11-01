// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AntiGeyserRewards.sol";
import "../src/RewardToken.sol";
import "../src/MockPool.sol";

/**
 * @title Deploy
 * @notice Deployment script for Anti-Geyser rewards system
 */
contract Deploy is Script {
    function run() external {
        address deployer = msg.sender;
        
        console.log("Deploying contracts with:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast();
        
        // 1. Deploy tokens
        RewardToken rewardToken = new RewardToken("Reward Token", "REWARD", deployer);
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
        
        // 4. Mint initial supply
        uint256 initialSupply = 10_000_000 * 1e18; // 10M tokens
        rewardToken.mint(deployer, initialSupply);
        poolToken.mint(deployer, initialSupply);
        
        console.log("Minted tokens to deployer");
        
        vm.stopBroadcast();
        
        // Save deployment addresses
        console.log("\n=== Deployment Summary ===");
        console.log("RewardToken:", address(rewardToken));
        console.log("PoolToken:", address(poolToken));
        console.log("AntiGeyserRewards:", address(rewardsContract));
        console.log("MockPool:", address(mockPool));
        console.log("Deployer:", deployer);
    }
}

