// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockPool
 * @notice Simple staking pool that tracks LP deposits and withdrawals
 * @dev Minimal AMM mock for demo purposes - interacts with AntiGeyserRewards
 */
contract MockPool {
    using SafeERC20 for IERC20;

    // Pool token (e.g., stablecoin pair LP token or simple token for demo)
    IERC20 public immutable poolToken;
    
    // Total tokens staked in pool
    uint256 public totalStaked;
    
    // User stakes
    mapping(address => uint256) public stakes;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _poolToken) {
        poolToken = IERC20(_poolToken);
    }

    /**
     * @notice Deposit tokens into the pool
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "MockPool: amount must be > 0");
        
        poolToken.safeTransferFrom(msg.sender, address(this), amount);
        stakes[msg.sender] += amount;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Withdraw tokens from the pool
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "MockPool: amount must be > 0");
        require(stakes[msg.sender] >= amount, "MockPool: insufficient balance");
        
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        poolToken.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Get user's staked balance
     * @param user Address to query
     * @return Staked amount
     */
    function balanceOf(address user) external view returns (uint256) {
        return stakes[user];
    }
}

