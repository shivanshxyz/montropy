// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AntiGeyserRewards
 * @notice Capital-efficient rewards engine that discourages transient farming
 * @dev Implements time-decay and tenure multipliers to favor long-term LPs
 */
contract AntiGeyserRewards is Ownable {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 private constant WAD = 1e18; // Fixed point precision
    uint256 private constant MAX_EPOCHS = 1000; // Safety limit

    // ============ Structs ============

    struct ProgramConfig {
        uint256 epochLength; // Duration of each epoch in seconds
        uint256 rewardPerEpoch; // R_e: rewards allocated per epoch
        uint256 halfLife; // Decay half-life in epochs (h)
        uint256 alpha; // Tenure boost per epoch (scaled by WAD, e.g., 0.02e18 = 2%)
        uint256 tMax; // Max tenure epochs for multiplier cap
        uint256 startTime; // Program start timestamp
        uint256 totalEpochs; // Total number of epochs in program
        bool active; // Program active status
    }

    struct Position {
        uint256 amount; // Staked amount
        uint256 joinEpoch; // Epoch when first deposited (t_join)
        uint256 lastClaimEpoch; // Last epoch rewards were claimed
        uint256 tenureEpochs; // Continuous epochs held
        uint256 churnCount; // Number of withdrawals (for churn penalty)
    }

    struct EpochSnapshot {
        uint256 totalEffectiveStake; // S_e: sum of all effective stakes
        uint256 rewardAllocated; // R_e: rewards for this epoch
        bool finalized; // Whether epoch has been snapshotted
    }

    // ============ State Variables ============

    IERC20 public immutable rewardToken;
    IERC20 public immutable poolToken;

    ProgramConfig public config;
    
    // User positions
    mapping(address => Position) public positions;
    
    // Epoch snapshots
    mapping(uint256 => EpochSnapshot) public epochs;
    
    // Total raw stakes (for quick reference)
    uint256 public totalRawStake;
    
    // Reward reserves
    uint256 public rewardReserves;

    // ============ Events ============

    event ProgramCreated(
        uint256 epochLength,
        uint256 rewardPerEpoch,
        uint256 halfLife,
        uint256 alpha,
        uint256 tMax,
        uint256 totalEpochs
    );
    event RewardsDeposited(address indexed admin, uint256 amount, uint256 epochs);
    event Staked(address indexed user, uint256 amount, uint256 epoch);
    event Withdrawn(address indexed user, uint256 amount, uint256 epoch);
    event RewardsClaimed(address indexed user, uint256 amount);
    event EpochFinalized(uint256 indexed epoch, uint256 totalEffectiveStake, uint256 rewardAllocated);

    // ============ Constructor ============

    constructor(
        address _rewardToken,
        address _poolToken,
        address initialOwner
    ) Ownable(initialOwner) {
        rewardToken = IERC20(_rewardToken);
        poolToken = IERC20(_poolToken);
    }

    // ============ Admin Functions ============

    /**
     * @notice Create a new rewards program
     * @param _epochLength Duration of each epoch in seconds
     * @param _rewardPerEpoch Rewards allocated per epoch
     * @param _halfLife Decay half-life in epochs
     * @param _alpha Tenure boost per epoch (WAD-scaled)
     * @param _tMax Max tenure epochs for multiplier
     * @param _totalEpochs Total epochs in program
     */
    function createProgram(
        uint256 _epochLength,
        uint256 _rewardPerEpoch,
        uint256 _halfLife,
        uint256 _alpha,
        uint256 _tMax,
        uint256 _totalEpochs
    ) external onlyOwner {
        require(!config.active, "Program already active");
        require(_epochLength > 0, "Invalid epoch length");
        require(_rewardPerEpoch > 0, "Invalid reward amount");
        require(_totalEpochs > 0 && _totalEpochs <= MAX_EPOCHS, "Invalid epoch count");

        config = ProgramConfig({
            epochLength: _epochLength,
            rewardPerEpoch: _rewardPerEpoch,
            halfLife: _halfLife,
            alpha: _alpha,
            tMax: _tMax,
            startTime: block.timestamp,
            totalEpochs: _totalEpochs,
            active: true
        });

        emit ProgramCreated(_epochLength, _rewardPerEpoch, _halfLife, _alpha, _tMax, _totalEpochs);
    }

    /**
     * @notice Deposit reward tokens for distribution
     * @param amount Amount of reward tokens to deposit
     * @param epochCount Number of epochs this deposit covers
     */
    function depositRewards(uint256 amount, uint256 epochCount) external onlyOwner {
        require(config.active, "Program not active");
        require(amount > 0, "Amount must be > 0");
        require(epochCount > 0, "Epoch count must be > 0");

        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardReserves += amount;

        emit RewardsDeposited(msg.sender, amount, epochCount);
    }

    /**
     * @notice Finalize an epoch and snapshot effective stakes
     * @param epoch Epoch number to finalize
     */
    function snapshotEpoch(uint256 epoch) external onlyOwner {
        require(config.active, "Program not active");
        require(!epochs[epoch].finalized, "Epoch already finalized");
        require(epoch < config.totalEpochs, "Epoch out of range");
        require(getCurrentEpoch() > epoch, "Epoch not yet complete");

        // Calculate total effective stake for this epoch
        // Note: In production, this would aggregate from all positions
        // For MVP, we calculate on-demand during claims
        uint256 totalEffective = _calculateTotalEffectiveStake(epoch);
        uint256 rewardAmount = config.rewardPerEpoch;

        epochs[epoch] = EpochSnapshot({
            totalEffectiveStake: totalEffective,
            rewardAllocated: rewardAmount,
            finalized: true
        });

        emit EpochFinalized(epoch, totalEffective, rewardAmount);
    }

    // ============ User Functions ============

    /**
     * @notice Stake tokens into the pool
     * @param amount Amount to stake
     */
    function stake(uint256 amount) external {
        require(config.active, "Program not active");
        require(amount > 0, "Amount must be > 0");

        uint256 currentEpoch = getCurrentEpoch();
        require(currentEpoch < config.totalEpochs, "Program ended");

        Position storage pos = positions[msg.sender];

        // If first stake, initialize position
        if (pos.amount == 0) {
            pos.joinEpoch = currentEpoch;
            pos.lastClaimEpoch = currentEpoch > 0 ? currentEpoch - 1 : 0;
            pos.tenureEpochs = 0;
        } else {
            // Increment tenure if continuously staking
            pos.tenureEpochs++;
        }

        pos.amount += amount;
        totalRawStake += amount;

        poolToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount, currentEpoch);
    }

    /**
     * @notice Withdraw staked tokens
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        
        Position storage pos = positions[msg.sender];
        require(pos.amount >= amount, "Insufficient balance");

        uint256 currentEpoch = getCurrentEpoch();

        // Update position
        pos.amount -= amount;
        pos.churnCount++;
        totalRawStake -= amount;

        // If fully withdrawn, reset tenure
        if (pos.amount == 0) {
            pos.tenureEpochs = 0;
        }

        poolToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, currentEpoch);
    }

    /**
     * @notice Claim accumulated rewards
     * @return claimed Amount of rewards claimed
     */
    function claimRewards() external returns (uint256 claimed) {
        Position storage pos = positions[msg.sender];
        require(pos.amount > 0 || pos.lastClaimEpoch < getCurrentEpoch(), "No rewards to claim");

        uint256 currentEpoch = getCurrentEpoch();
        uint256 pending = _calculatePendingRewards(msg.sender, currentEpoch);

        if (pending > 0) {
            pos.lastClaimEpoch = currentEpoch > 0 ? currentEpoch - 1 : 0;
            rewardReserves -= pending;
            rewardToken.safeTransfer(msg.sender, pending);
            
            emit RewardsClaimed(msg.sender, pending);
        }

        return pending;
    }

    // ============ View Functions ============

    /**
     * @notice Get current epoch number
     * @return Current epoch index
     */
    function getCurrentEpoch() public view returns (uint256) {
        if (!config.active) return 0;
        if (block.timestamp < config.startTime) return 0;
        return (block.timestamp - config.startTime) / config.epochLength;
    }

    /**
     * @notice Calculate pending rewards for a user
     * @param user User address
     * @return Pending reward amount
     */
    function pendingRewards(address user) external view returns (uint256) {
        return _calculatePendingRewards(user, getCurrentEpoch());
    }

    /**
     * @notice Calculate effective stake for a user at a specific epoch
     * @param user User address
     * @param epoch Epoch number
     * @return Effective stake amount
     */
    function effectiveStake(address user, uint256 epoch) external view returns (uint256) {
        return _calculateEffectiveStake(user, epoch);
    }

    // ============ Internal Functions ============

    /**
     * @notice Calculate pending rewards for a user up to a given epoch
     * @param user User address
     * @param toEpoch Calculate up to this epoch (exclusive)
     * @return Total pending rewards
     */
    function _calculatePendingRewards(address user, uint256 toEpoch) internal view returns (uint256) {
        Position storage pos = positions[user];
        if (pos.amount == 0 && pos.lastClaimEpoch >= toEpoch) return 0;

        uint256 totalReward = 0;
        uint256 fromEpoch = pos.lastClaimEpoch + 1;

        // Iterate through unclaimed epochs
        for (uint256 e = fromEpoch; e < toEpoch && e < config.totalEpochs; e++) {
            if (!epochs[e].finalized) continue;

            uint256 userEffectiveStake = _calculateEffectiveStake(user, e);
            if (userEffectiveStake == 0 || epochs[e].totalEffectiveStake == 0) continue;

            // reward_i_e = R_e * LP_i_e / S_e
            uint256 epochReward = (epochs[e].rewardAllocated * userEffectiveStake) / epochs[e].totalEffectiveStake;
            totalReward += epochReward;
        }

        return totalReward;
    }

    /**
     * @notice Calculate effective stake for a user at a specific epoch
     * @dev LP_i_e = stake_i_e * M_tenure(i, e) * D_join(i, e) * (1 - churnPenalty)
     * @param user User address
     * @param epoch Epoch number
     * @return Effective stake
     */
    function _calculateEffectiveStake(address user, uint256 epoch) internal view returns (uint256) {
        Position storage pos = positions[user];
        if (pos.amount == 0) return 0;
        if (epoch < pos.joinEpoch) return 0;

        uint256 stakedAmount = pos.amount;

        // Calculate tenure multiplier: M_tenure(i, e) = 1 + alpha * min(tenure_i_e, T_max)
        // alpha is already WAD-scaled, so: WAD + (alpha * cappedTenure)
        uint256 tenureAtEpoch = epoch - pos.joinEpoch;
        uint256 cappedTenure = tenureAtEpoch > config.tMax ? config.tMax : tenureAtEpoch;
        uint256 tenureMultiplier = WAD + (config.alpha * cappedTenure);

        // Calculate decay multiplier: D_join(i, e) = 2^(-(e - t_join_i) / h)
        // Simplified: use linear decay for gas efficiency in MVP
        uint256 decayMultiplier = _calculateDecayMultiplier(epoch, pos.joinEpoch);

        // Apply churn penalty (simple version: 5% penalty per churn event, max 50%)
        uint256 churnPenalty = pos.churnCount * 5;
        if (churnPenalty > 50) churnPenalty = 50;
        uint256 churnMultiplier = WAD - (churnPenalty * WAD / 100);

        // Calculate effective stake
        uint256 effective = (stakedAmount * tenureMultiplier * decayMultiplier * churnMultiplier) / (WAD * WAD * WAD);

        return effective;
    }

    /**
     * @notice Calculate decay multiplier based on join epoch
     * @dev Early joiners get full multiplier; late joiners get penalized
     *      This discourages mercenary farmers who join late
     * @param currentEpoch Current epoch (unused in this version)
     * @param joinEpoch Join epoch
     * @return Decay multiplier (WAD-scaled)
     */
    function _calculateDecayMultiplier(uint256 currentEpoch, uint256 joinEpoch) internal view returns (uint256) {
        // Silence unused variable warning
        currentEpoch;
        
        if (config.halfLife == 0) return WAD;
        
        // Penalize late joiners: decay based on how late they joined
        // Join at epoch 0 = 1.0x multiplier
        // Join at epoch halfLife = 0.5x multiplier
        // Join at epoch 2*halfLife = 0.25x multiplier (floor at 0.1x)
        
        if (joinEpoch >= config.halfLife * 2) {
            return WAD / 10; // 10% floor for very late joiners
        }
        
        uint256 decayFactor = (joinEpoch * WAD) / (config.halfLife * 2);
        uint256 multiplier = WAD - decayFactor;
        
        return multiplier > WAD / 10 ? multiplier : WAD / 10;
    }

    /**
     * @notice Calculate total effective stake across all users for an epoch
     * @dev In production, this would be cached or computed incrementally
     * @param epoch Epoch number
     * @return Total effective stake
     */
    function _calculateTotalEffectiveStake(uint256 epoch) internal view returns (uint256) {
        // For MVP, we return the raw total stake as a placeholder
        // In production, iterate through all positions or maintain running totals
        return totalRawStake;
    }

    /**
     * @notice Get position details for a user
     * @param user User address
     * @return amount Staked amount
     * @return joinEpoch Epoch when first deposited
     * @return lastClaimEpoch Last claimed epoch
     * @return tenureEpochs Continuous epochs held
     * @return churnCount Number of withdrawals
     */
    function getPosition(address user) external view returns (
        uint256 amount,
        uint256 joinEpoch,
        uint256 lastClaimEpoch,
        uint256 tenureEpochs,
        uint256 churnCount
    ) {
        Position storage pos = positions[user];
        return (pos.amount, pos.joinEpoch, pos.lastClaimEpoch, pos.tenureEpochs, pos.churnCount);
    }
}

