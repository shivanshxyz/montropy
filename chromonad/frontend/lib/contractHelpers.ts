/**
 * Contract Helper Functions for Anti-Geyser Frontend
 * 
 * These helpers make it easy to interact with the Anti-Geyser contracts
 * from your Next.js frontend.
 */

import { ethers } from 'ethers';

// Contract ABIs
export const REWARDS_ABI = [
  "function getCurrentEpoch() view returns (uint256)",
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function claimRewards() external returns (uint256)",
  "function pendingRewards(address user) view returns (uint256)",
  "function effectiveStake(address user, uint256 epoch) view returns (uint256)",
  "function getPosition(address user) view returns (uint256 amount, uint256 joinEpoch, uint256 lastClaimEpoch, uint256 tenureEpochs, uint256 churnCount)",
  "function epochs(uint256) view returns (uint256 totalEffectiveStake, uint256 rewardAllocated, bool finalized)",
  "function config() view returns (uint256 epochLength, uint256 rewardPerEpoch, uint256 halfLife, uint256 alpha, uint256 tMax, uint256 startTime, uint256 totalEpochs, bool active)"
];

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// Contract addresses (update these after deployment)
export const CONTRACT_ADDRESSES = {
  REWARDS: process.env.NEXT_PUBLIC_REWARDS_CONTRACT || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  POOL_TOKEN: process.env.NEXT_PUBLIC_POOL_TOKEN || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  REWARD_TOKEN: process.env.NEXT_PUBLIC_REWARD_TOKEN || "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};

/**
 * Get contract instances
 */
export function getContracts(provider: ethers.Provider | ethers.Signer) {
  return {
    rewards: new ethers.Contract(CONTRACT_ADDRESSES.REWARDS, REWARDS_ABI, provider),
    poolToken: new ethers.Contract(CONTRACT_ADDRESSES.POOL_TOKEN, ERC20_ABI, provider),
    rewardToken: new ethers.Contract(CONTRACT_ADDRESSES.REWARD_TOKEN, ERC20_ABI, provider)
  };
}

/**
 * Fetch user's position data
 */
export async function getUserPosition(address: string, provider: ethers.Provider) {
  const { rewards } = getContracts(provider);
  const position = await rewards.getPosition(address);
  
  return {
    amount: ethers.formatEther(position[0]),
    joinEpoch: position[1].toString(),
    lastClaimEpoch: position[2].toString(),
    tenureEpochs: position[3].toString(),
    churnCount: position[4].toString()
  };
}

/**
 * Fetch user's pending rewards
 */
export async function getPendingRewards(address: string, provider: ethers.Provider) {
  const { rewards } = getContracts(provider);
  const pending = await rewards.pendingRewards(address);
  return ethers.formatEther(pending);
}

/**
 * Fetch user's token balances
 */
export async function getTokenBalances(address: string, provider: ethers.Provider) {
  const { poolToken, rewardToken } = getContracts(provider);
  
  const [poolBalance, rewardBalance] = await Promise.all([
    poolToken.balanceOf(address),
    rewardToken.balanceOf(address)
  ]);
  
  return {
    poolToken: ethers.formatEther(poolBalance),
    rewardToken: ethers.formatEther(rewardBalance)
  };
}

/**
 * Fetch program configuration
 */
export async function getProgramConfig(provider: ethers.Provider) {
  const { rewards } = getContracts(provider);
  const config = await rewards.config();
  
  return {
    epochLength: config[0].toString(),
    rewardPerEpoch: ethers.formatEther(config[1]),
    halfLife: config[2].toString(),
    alpha: ethers.formatEther(config[3]),
    tMax: config[4].toString(),
    startTime: config[5].toString(),
    totalEpochs: config[6].toString(),
    active: config[7]
  };
}

/**
 * Get current epoch number
 */
export async function getCurrentEpoch(provider: ethers.Provider) {
  const { rewards } = getContracts(provider);
  const epoch = await rewards.getCurrentEpoch();
  return epoch.toString();
}

/**
 * Stake tokens
 */
export async function stakeTokens(amount: string, signer: ethers.Signer) {
  const { rewards, poolToken } = getContracts(signer);
  const amountWei = ethers.parseEther(amount);
  
  // First approve
  const approveTx = await poolToken.approve(CONTRACT_ADDRESSES.REWARDS, amountWei);
  await approveTx.wait();
  
  // Then stake
  const stakeTx = await rewards.stake(amountWei);
  return await stakeTx.wait();
}

/**
 * Withdraw tokens
 */
export async function withdrawTokens(amount: string, signer: ethers.Signer) {
  const { rewards } = getContracts(signer);
  const amountWei = ethers.parseEther(amount);
  
  const tx = await rewards.withdraw(amountWei);
  return await tx.wait();
}

/**
 * Claim rewards
 */
export async function claimRewards(signer: ethers.Signer) {
  const { rewards } = getContracts(signer);
  const tx = await rewards.claimRewards();
  return await tx.wait();
}

/**
 * Check if user has approved spending
 */
export async function checkAllowance(address: string, provider: ethers.Provider) {
  const { poolToken } = getContracts(provider);
  const allowance = await poolToken.allowance(address, CONTRACT_ADDRESSES.REWARDS);
  return ethers.formatEther(allowance);
}

/**
 * Calculate APY estimate (simplified)
 */
export async function estimateAPY(provider: ethers.Provider) {
  const config = await getProgramConfig(provider);
  const currentEpoch = await getCurrentEpoch(provider);
  
  // Simplified APY calculation
  const epochsPerYear = Math.floor((365 * 24 * 60 * 60) / Number(config.epochLength));
  const annualRewards = Number(config.rewardPerEpoch) * epochsPerYear;
  
  // This is a rough estimate - actual APY depends on total staked and timing
  return {
    baseAPY: 0, // Would need total staked to calculate
    currentEpoch: currentEpoch,
    epochsRemaining: Number(config.totalEpochs) - Number(currentEpoch),
    annualRewardPool: annualRewards
  };
}

/**
 * Format time remaining in epoch
 */
export function getEpochTimeRemaining(config: { epochLength: string; startTime: string }, currentEpoch: number) {
  const epochLength = Number(config.epochLength);
  const startTime = Number(config.startTime);
  const now = Math.floor(Date.now() / 1000);
  
  const epochStart = startTime + (currentEpoch * epochLength);
  const epochEnd = epochStart + epochLength;
  const timeRemaining = Math.max(0, epochEnd - now);
  
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  
  return {
    seconds: timeRemaining,
    formatted: `${hours}h ${minutes}m`
  };
}

