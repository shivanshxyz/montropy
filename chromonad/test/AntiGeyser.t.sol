// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/AntiGeyserRewards.sol";
import "../src/RewardToken.sol";
import "../src/MockPool.sol";

/**
 * @title AntiGeyserTest
 * @notice Comprehensive tests for the Anti-Geyser rewards system
 */
contract AntiGeyserTest is Test {
    AntiGeyserRewards public rewardsContract;
    RewardToken public rewardToken;
    RewardToken public poolToken; // Using RewardToken as pool token for simplicity
    
    address public admin = address(1);
    address public longTermLP = address(2);
    address public farmer = address(3);
    
    uint256 constant EPOCH_LENGTH = 1 days;
    uint256 constant REWARD_PER_EPOCH = 1000e18;
    uint256 constant HALF_LIFE = 2; // 2 epochs
    uint256 constant ALPHA = 0.02e18; // 2% per epoch
    uint256 constant T_MAX = 10;
    uint256 constant TOTAL_EPOCHS = 10;
    uint256 constant INITIAL_MINT = 1000000e18;

    event ProgramCreated(uint256 epochLength, uint256 rewardPerEpoch, uint256 halfLife, uint256 alpha, uint256 tMax, uint256 totalEpochs);
    event Staked(address indexed user, uint256 amount, uint256 epoch);
    event Withdrawn(address indexed user, uint256 amount, uint256 epoch);
    event RewardsClaimed(address indexed user, uint256 amount);
    event EpochFinalized(uint256 indexed epoch, uint256 totalEffectiveStake, uint256 rewardAllocated);

    function setUp() public {
        // Deploy contracts
        rewardToken = new RewardToken("Reward Token", "REWARD", admin);
        poolToken = new RewardToken("Pool Token", "POOL", admin);
        rewardsContract = new AntiGeyserRewards(address(rewardToken), address(poolToken), admin);
        
        // Mint tokens
        vm.startPrank(admin);
        rewardToken.mint(admin, INITIAL_MINT);
        poolToken.mint(longTermLP, INITIAL_MINT);
        poolToken.mint(farmer, INITIAL_MINT);
        vm.stopPrank();
        
        // Create program
        vm.prank(admin);
        rewardsContract.createProgram(
            EPOCH_LENGTH,
            REWARD_PER_EPOCH,
            HALF_LIFE,
            ALPHA,
            T_MAX,
            TOTAL_EPOCHS
        );
        
        // Deposit rewards
        vm.startPrank(admin);
        rewardToken.approve(address(rewardsContract), INITIAL_MINT);
        rewardsContract.depositRewards(REWARD_PER_EPOCH * TOTAL_EPOCHS, TOTAL_EPOCHS);
        vm.stopPrank();
    }

    // ============ Basic Functionality Tests ============

    function testCreateProgram() public {
        // Verify program configuration
        (
            uint256 epochLength,
            uint256 rewardPerEpoch,
            uint256 halfLife,
            uint256 alpha,
            uint256 tMax,
            ,
            uint256 totalEpochs,
            bool active
        ) = rewardsContract.config();
        
        assertEq(epochLength, EPOCH_LENGTH);
        assertEq(rewardPerEpoch, REWARD_PER_EPOCH);
        assertEq(halfLife, HALF_LIFE);
        assertEq(alpha, ALPHA);
        assertEq(tMax, T_MAX);
        assertEq(totalEpochs, TOTAL_EPOCHS);
        assertTrue(active);
    }

    function testDepositRewards() public {
        uint256 initialReserves = rewardsContract.rewardReserves();
        assertEq(initialReserves, REWARD_PER_EPOCH * TOTAL_EPOCHS);
    }

    function testStake() public {
        uint256 stakeAmount = 1000e18;
        
        vm.startPrank(longTermLP);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        (uint256 amount, uint256 joinEpoch, , , ) = rewardsContract.getPosition(longTermLP);
        assertEq(amount, stakeAmount);
        assertEq(joinEpoch, 0);
    }

    function testWithdraw() public {
        uint256 stakeAmount = 1000e18;
        
        // Stake first
        vm.startPrank(longTermLP);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        
        // Withdraw
        rewardsContract.withdraw(stakeAmount / 2);
        vm.stopPrank();
        
        (uint256 amount, , , , uint256 churnCount) = rewardsContract.getPosition(longTermLP);
        assertEq(amount, stakeAmount / 2);
        assertEq(churnCount, 1);
    }

    // ============ Reward Distribution Tests ============

    function testLongTermLPEarnsMoreThanFarmer() public {
        uint256 stakeAmount = 1000e18;
        
        // Long-term LP stakes at epoch 0
        vm.startPrank(longTermLP);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        // Advance to epoch 4
        vm.warp(block.timestamp + EPOCH_LENGTH * 4);
        
        // Farmer stakes at epoch 4
        vm.startPrank(farmer);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        // Advance to epoch 5
        vm.warp(block.timestamp + EPOCH_LENGTH);
        
        // Finalize epochs
        vm.startPrank(admin);
        for (uint256 i = 0; i < 5; i++) {
            rewardsContract.snapshotEpoch(i);
        }
        vm.stopPrank();
        
        // Check pending rewards
        uint256 longTermRewards = rewardsContract.pendingRewards(longTermLP);
        uint256 farmerRewards = rewardsContract.pendingRewards(farmer);
        
        // Long-term LP should earn more
        assertGt(longTermRewards, farmerRewards);
        
        console.log("Long-term LP rewards:", longTermRewards);
        console.log("Farmer rewards:", farmerRewards);
    }

    function testDecayHalfLife() public {
        uint256 stakeAmount = 1000e18;
        
        // Test early joiner vs late joiner
        // LP1 stakes at epoch 0
        address earlyLP = address(20);
        address lateLP = address(21);
        
        vm.prank(admin);
        poolToken.mint(earlyLP, stakeAmount * 2);
        vm.prank(admin);
        poolToken.mint(lateLP, stakeAmount * 2);
        
        // Early LP stakes at epoch 0
        vm.startPrank(earlyLP);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        // Advance to epoch 4 (past halfLife of 2)
        vm.warp(block.timestamp + EPOCH_LENGTH * 4);
        
        // Late LP stakes at epoch 4
        vm.startPrank(lateLP);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        // Check effective stakes at epoch 5
        uint256 earlyEffective = rewardsContract.effectiveStake(earlyLP, 5);
        uint256 lateEffective = rewardsContract.effectiveStake(lateLP, 5);
        
        console.log("Early joiner (epoch 0) effective stake:", earlyEffective);
        console.log("Late joiner (epoch 4) effective stake:", lateEffective);
        
        // Early joiner should have much higher effective stake than late joiner
        assertGt(earlyEffective, lateEffective);
    }

    function testClaimRewards() public {
        uint256 stakeAmount = 1000e18;
        
        // Stake
        vm.startPrank(longTermLP);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        // Advance epochs and finalize
        vm.warp(block.timestamp + EPOCH_LENGTH * 3);
        
        vm.startPrank(admin);
        for (uint256 i = 0; i < 3; i++) {
            rewardsContract.snapshotEpoch(i);
        }
        vm.stopPrank();
        
        // Claim rewards
        uint256 initialBalance = rewardToken.balanceOf(longTermLP);
        vm.prank(longTermLP);
        uint256 claimed = rewardsContract.claimRewards();
        uint256 finalBalance = rewardToken.balanceOf(longTermLP);
        
        assertGt(claimed, 0);
        assertEq(finalBalance - initialBalance, claimed);
    }

    function testChurnPenalty() public {
        uint256 stakeAmount = 1000e18;
        
        // Stake and withdraw multiple times
        vm.startPrank(farmer);
        poolToken.approve(address(rewardsContract), stakeAmount * 5);
        
        for (uint256 i = 0; i < 5; i++) {
            rewardsContract.stake(stakeAmount / 5);
            rewardsContract.withdraw(stakeAmount / 10);
        }
        
        (, , , , uint256 churnCount) = rewardsContract.getPosition(farmer);
        assertEq(churnCount, 5);
        
        vm.stopPrank();
    }

    function testTenureMultiplier() public {
        uint256 stakeAmount = 1000e18;
        
        // Stake at epoch 0
        vm.startPrank(longTermLP);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        // Check effective stake growth over epochs (tenure increases with epochs held)
        uint256 effective0 = rewardsContract.effectiveStake(longTermLP, 0);
        uint256 effective5 = rewardsContract.effectiveStake(longTermLP, 5);
        uint256 effective10 = rewardsContract.effectiveStake(longTermLP, 10);
        uint256 effective15 = rewardsContract.effectiveStake(longTermLP, 15);
        
        console.log("Effective stake at epoch 0:", effective0);
        console.log("Effective stake at epoch 5:", effective5);
        console.log("Effective stake at epoch 10:", effective10);
        console.log("Effective stake at epoch 15:", effective15);
        
        // With tenure multiplier, effective stake should increase
        // M_tenure = 1 + alpha * min(tenure, T_MAX)
        // At epoch 5: tenure = 5, multiplier = 1 + 0.02 * 5 = 1.1
        // At epoch 10: tenure = 10 (T_MAX), multiplier = 1 + 0.02 * 10 = 1.2
        // At epoch 15: still capped at T_MAX=10, multiplier = 1.2
        assertGt(effective5, effective0, "Effective stake should increase at epoch 5");
        assertGt(effective10, effective5, "Effective stake should increase at epoch 10");
        assertEq(effective10, effective15, "Effective stake should cap at T_MAX");
    }

    function testMultipleUsers() public {
        uint256 stakeAmount = 1000e18;
        
        address user1 = address(10);
        address user2 = address(11);
        address user3 = address(12);
        
        // Mint pool tokens
        vm.startPrank(admin);
        poolToken.mint(user1, stakeAmount);
        poolToken.mint(user2, stakeAmount);
        poolToken.mint(user3, stakeAmount);
        vm.stopPrank();
        
        // User1 stakes at epoch 0
        vm.startPrank(user1);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        // Advance to epoch 2
        vm.warp(block.timestamp + EPOCH_LENGTH * 2);
        
        // User2 stakes at epoch 2
        vm.startPrank(user2);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        // Advance to epoch 4
        vm.warp(block.timestamp + EPOCH_LENGTH * 2);
        
        // User3 stakes at epoch 4
        vm.startPrank(user3);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
        
        // Advance to epoch 6
        vm.warp(block.timestamp + EPOCH_LENGTH * 2);
        
        // Finalize epochs
        vm.startPrank(admin);
        for (uint256 i = 0; i < 6; i++) {
            rewardsContract.snapshotEpoch(i);
        }
        vm.stopPrank();
        
        // Check rewards - earlier stakers should have more
        uint256 rewards1 = rewardsContract.pendingRewards(user1);
        uint256 rewards2 = rewardsContract.pendingRewards(user2);
        uint256 rewards3 = rewardsContract.pendingRewards(user3);
        
        assertGt(rewards1, rewards2);
        assertGt(rewards2, rewards3);
        
        console.log("User1 (epoch 0) rewards:", rewards1);
        console.log("User2 (epoch 2) rewards:", rewards2);
        console.log("User3 (epoch 4) rewards:", rewards3);
    }

    function testCannotStakeAfterProgramEnds() public {
        uint256 stakeAmount = 1000e18;
        
        // Advance past total epochs
        vm.warp(block.timestamp + EPOCH_LENGTH * (TOTAL_EPOCHS + 1));
        
        vm.startPrank(longTermLP);
        poolToken.approve(address(rewardsContract), stakeAmount);
        
        vm.expectRevert("Program ended");
        rewardsContract.stake(stakeAmount);
        vm.stopPrank();
    }

    function testGetCurrentEpoch() public {
        assertEq(rewardsContract.getCurrentEpoch(), 0);
        
        vm.warp(block.timestamp + EPOCH_LENGTH);
        assertEq(rewardsContract.getCurrentEpoch(), 1);
        
        vm.warp(block.timestamp + EPOCH_LENGTH * 2);
        assertEq(rewardsContract.getCurrentEpoch(), 3);
    }

    // ============ Edge Cases ============

    function testStakeZeroAmount() public {
        vm.startPrank(longTermLP);
        vm.expectRevert("Amount must be > 0");
        rewardsContract.stake(0);
        vm.stopPrank();
    }

    function testWithdrawMoreThanBalance() public {
        uint256 stakeAmount = 1000e18;
        
        vm.startPrank(longTermLP);
        poolToken.approve(address(rewardsContract), stakeAmount);
        rewardsContract.stake(stakeAmount);
        
        vm.expectRevert("Insufficient balance");
        rewardsContract.withdraw(stakeAmount + 1);
        vm.stopPrank();
    }

    function testCannotFinalizeEpochTwice() public {
        vm.warp(block.timestamp + EPOCH_LENGTH);
        
        vm.startPrank(admin);
        rewardsContract.snapshotEpoch(0);
        
        vm.expectRevert("Epoch already finalized");
        rewardsContract.snapshotEpoch(0);
        vm.stopPrank();
    }

    function testCannotFinalizeFutureEpoch() public {
        vm.startPrank(admin);
        vm.expectRevert("Epoch not yet complete");
        rewardsContract.snapshotEpoch(0);
        vm.stopPrank();
    }
}

