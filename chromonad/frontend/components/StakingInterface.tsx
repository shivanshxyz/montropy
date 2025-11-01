'use client';

import { useState } from 'react';
import { useAntiGeyser } from '../lib/useAntiGeyser';

export default function StakingInterface() {
  const {
    address,
    connected,
    position,
    rewards,
    balances,
    config,
    currentEpoch,
    loading,
    error,
    connect,
    stake,
    withdraw,
    claim
  } = useAntiGeyser();

  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    try {
      setTxLoading(true);
      await stake(stakeAmount);
      setStakeAmount('');
      alert('Stake successful!');
    } catch (err: any) {
      alert(`Stake failed: ${err.message}`);
    } finally {
      setTxLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    try {
      setTxLoading(true);
      await withdraw(withdrawAmount);
      setWithdrawAmount('');
      alert('Withdrawal successful!');
    } catch (err: any) {
      alert(`Withdrawal failed: ${err.message}`);
    } finally {
      setTxLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      setTxLoading(true);
      await claim();
      alert('Rewards claimed!');
    } catch (err: any) {
      alert(`Claim failed: ${err.message}`);
    } finally {
      setTxLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-8">
          Connect your wallet to start staking and earning rewards
        </p>
        <button
          onClick={connect}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-lg text-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Connecting...' : '🔗 Connect Wallet'}
        </button>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Your Account</h3>
          <div className="bg-white/20 px-4 py-2 rounded-lg font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-indigo-200 text-sm">Staked</div>
            <div className="text-2xl font-bold">{position?.amount || '0'}</div>
          </div>
          <div>
            <div className="text-indigo-200 text-sm">Rewards</div>
            <div className="text-2xl font-bold">{parseFloat(rewards || '0').toFixed(2)}</div>
          </div>
          <div>
            <div className="text-indigo-200 text-sm">Epoch</div>
            <div className="text-2xl font-bold">{currentEpoch}</div>
          </div>
          <div>
            <div className="text-indigo-200 text-sm">Tenure</div>
            <div className="text-2xl font-bold">{position?.tenureEpochs || '0'}</div>
          </div>
        </div>
      </div>

      {/* Position Details */}
      {position && parseFloat(position.amount) > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Your Position Details</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Join Epoch:</span>
              <span className="font-semibold">#{position.joinEpoch}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Last Claim:</span>
              <span className="font-semibold">Epoch #{position.lastClaimEpoch}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Churn Count:</span>
              <span className={`font-semibold ${parseInt(position.churnCount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {position.churnCount} {parseInt(position.churnCount) === 0 && '✓'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Pool Balance:</span>
              <span className="font-semibold">{balances?.poolToken ? parseFloat(balances.poolToken).toFixed(2) : '0'}</span>
            </div>
          </div>
          
          {parseInt(position.churnCount) === 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <span className="text-2xl">✨</span>
                <div>
                  <strong>Clean Record!</strong>
                  <p className="text-sm">No withdrawals yet - you're maximizing your rewards!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Staking Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Stake */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">💎 Stake Tokens</h3>
          <p className="text-sm text-gray-600 mb-4">
            Lock your LP tokens to start earning rewards. Earlier = better returns!
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Stake
            </label>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
              />
              <button
                onClick={() => setStakeAmount(balances?.poolToken || '0')}
                className="absolute right-3 top-3 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                MAX
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Available: {balances?.poolToken ? parseFloat(balances.poolToken).toFixed(2) : '0'} tokens
            </div>
          </div>
          <button
            onClick={handleStake}
            disabled={!stakeAmount || txLoading || loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {txLoading ? '⏳ Staking...' : '✓ Stake Tokens'}
          </button>
        </div>

        {/* Withdraw */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">📤 Withdraw Tokens</h3>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            ⚠️ Withdrawing increases your churn count and resets tenure
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Withdraw
            </label>
            <div className="relative">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
              />
              <button
                onClick={() => setWithdrawAmount(position?.amount || '0')}
                className="absolute right-3 top-3 text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                MAX
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Staked: {position?.amount || '0'} tokens
            </div>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={!withdrawAmount || txLoading || loading || !position || parseFloat(position.amount) === 0}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {txLoading ? '⏳ Withdrawing...' : '✓ Withdraw Tokens'}
          </button>
        </div>
      </div>

      {/* Claim Rewards */}
      {rewards && parseFloat(rewards) > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">🎁 Rewards Available</h3>
              <p className="text-3xl font-bold">{parseFloat(rewards).toFixed(4)} tokens</p>
            </div>
            <button
              onClick={handleClaim}
              disabled={txLoading || loading}
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold py-4 px-8 rounded-lg text-lg transition-all disabled:opacity-50"
            >
              {txLoading ? '⏳ Claiming...' : '💰 Claim Rewards'}
            </button>
          </div>
        </div>
      )}

      {/* Program Info */}
      {config && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">📊 Program Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-gray-600 mb-1">Reward/Epoch</div>
              <div className="font-bold">{config.rewardPerEpoch}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-gray-600 mb-1">Total Epochs</div>
              <div className="font-bold">{config.totalEpochs}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-gray-600 mb-1">Half-Life</div>
              <div className="font-bold">{config.halfLife} epochs</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-gray-600 mb-1">Tenure α</div>
              <div className="font-bold">{(parseFloat(config.alpha) * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

