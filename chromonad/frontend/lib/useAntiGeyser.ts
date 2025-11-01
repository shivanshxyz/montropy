/**
 * useAntiGeyser Hook
 * 
 * Easy-to-use React hook for integrating Anti-Geyser rewards in your frontend
 * 
 * Example usage:
 * 
 * ```tsx
 * import { useAntiGeyser } from '@/lib/useAntiGeyser';
 * 
 * function StakingComponent() {
 *   const { position, rewards, stake, withdraw, claim, loading } = useAntiGeyser();
 *   
 *   return (
 *     <div>
 *       <p>Staked: {position?.amount} tokens</p>
 *       <p>Pending: {rewards} tokens</p>
 *       <button onClick={() => stake('100')}>Stake 100</button>
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  getUserPosition,
  getPendingRewards,
  getTokenBalances,
  getProgramConfig,
  getCurrentEpoch,
  stakeTokens,
  withdrawTokens,
  claimRewards,
  checkAllowance
} from './contractHelpers';

interface Position {
  amount: string;
  joinEpoch: string;
  lastClaimEpoch: string;
  tenureEpochs: string;
  churnCount: string;
}

interface TokenBalances {
  poolToken: string;
  rewardToken: string;
}

interface ProgramConfig {
  epochLength: string;
  rewardPerEpoch: string;
  halfLife: string;
  alpha: string;
  tMax: string;
  startTime: string;
  totalEpochs: string;
  active: boolean;
}

export function useAntiGeyser() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  const [position, setPosition] = useState<Position | null>(null);
  const [rewards, setRewards] = useState<string>('0');
  const [balances, setBalances] = useState<TokenBalances | null>(null);
  const [config, setConfig] = useState<ProgramConfig | null>(null);
  const [currentEpoch, setCurrentEpoch] = useState<string>('0');
  const [allowance, setAllowance] = useState<string>('0');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider and signer
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      
      // Get signer and address
      browserProvider.getSigner().then(async (s) => {
        setSigner(s);
        const addr = await s.getAddress();
        setAddress(addr);
      }).catch(console.error);
    }
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!provider || !address) return;
    
    try {
      const [pos, rew, bal, cfg, epoch, allow] = await Promise.all([
        getUserPosition(address, provider),
        getPendingRewards(address, provider),
        getTokenBalances(address, provider),
        getProgramConfig(provider),
        getCurrentEpoch(provider),
        checkAllowance(address, provider)
      ]);
      
      setPosition(pos);
      setRewards(rew);
      setBalances(bal);
      setConfig(cfg);
      setCurrentEpoch(epoch);
      setAllowance(allow);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching data:', err);
    }
  }, [provider, address]);

  // Auto-refresh data
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not installed');
      return;
    }
    
    try {
      setLoading(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const s = await browserProvider.getSigner();
      const addr = await s.getAddress();
      
      setProvider(browserProvider);
      setSigner(s);
      setAddress(addr);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Stake tokens
  const stake = useCallback(async (amount: string) => {
    if (!signer) {
      setError('No signer available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await stakeTokens(amount, signer);
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, fetchData]);

  // Withdraw tokens
  const withdraw = useCallback(async (amount: string) => {
    if (!signer) {
      setError('No signer available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await withdrawTokens(amount, signer);
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, fetchData]);

  // Claim rewards
  const claim = useCallback(async () => {
    if (!signer) {
      setError('No signer available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await claimRewards(signer);
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, fetchData]);

  return {
    // State
    address,
    connected: !!address,
    position,
    rewards,
    balances,
    config,
    currentEpoch,
    allowance,
    loading,
    error,
    
    // Actions
    connect,
    stake,
    withdraw,
    claim,
    refresh: fetchData
  };
}

// Type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

