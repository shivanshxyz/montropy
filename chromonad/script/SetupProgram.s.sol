// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AntiGeyserRewards.sol";
import "../src/RewardToken.sol";

/**
 * @title SetupProgram
 * @notice Script to create and fund a rewards program
 */
contract SetupProgram is Script {
    function run() external {
        address rewardsAddress = vm.envAddress("REWARDS_CONTRACT");
        address rewardTokenAddress = vm.envAddress("REWARD_TOKEN");
        
        AntiGeyserRewards rewards = AntiGeyserRewards(rewardsAddress);
        RewardToken rewardToken = RewardToken(rewardTokenAddress);
        
        vm.startBroadcast();
        
        // Program parameters (can be customized)
        uint256 epochLength = 1 days;
        uint256 rewardPerEpoch = 1000 * 1e18; // 1000 tokens per epoch
        uint256 halfLife = 2; // 2 epochs
        uint256 alpha = 0.02 * 1e18; // 2% per epoch (WAD-scaled)
        uint256 tMax = 10; // Cap at 10 epochs
        uint256 totalEpochs = 10;
        
        console.log("Creating program with parameters:");
        console.log("  Epoch Length:", epochLength);
        console.log("  Reward Per Epoch:", rewardPerEpoch);
        console.log("  Half Life:", halfLife);
        console.log("  Alpha:", alpha);
        console.log("  T Max:", tMax);
        console.log("  Total Epochs:", totalEpochs);
        
        // Create program
        rewards.createProgram(
            epochLength,
            rewardPerEpoch,
            halfLife,
            alpha,
            tMax,
            totalEpochs
        );
        
        console.log("Program created!");
        
        // Deposit rewards
        uint256 totalRewards = rewardPerEpoch * totalEpochs;
        rewardToken.approve(address(rewards), totalRewards);
        rewards.depositRewards(totalRewards, totalEpochs);
        
        console.log("Deposited", totalRewards, "reward tokens");
        
        vm.stopBroadcast();
        
        console.log("\n=== Program Setup Complete ===");
    }
}

