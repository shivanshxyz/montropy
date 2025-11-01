'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [currentEpoch, setCurrentEpoch] = useState(5);

  // Mock data for demonstration
  const programConfig = {
    epochLength: '1 day',
    rewardPerEpoch: '1000',
    halfLife: '2',
    alpha: '2%',
    tMax: '10',
    totalEpochs: '30',
  };

  const topStakers = [
    { address: '0x1234...5678', type: 'Long-term LP', staked: '10000', rewards: '2847', joinEpoch: 0, tenure: 5, multiplier: '1.10x' },
    { address: '0xabcd...ef00', type: 'Long-term LP', staked: '8000', rewards: '2198', joinEpoch: 0, tenure: 5, multiplier: '1.10x' },
    { address: '0x9876...5432', type: 'Moderate LP', staked: '5000', rewards: '986', joinEpoch: 2, tenure: 3, multiplier: '1.06x' },
    { address: '0x1111...2222', type: 'Farmer', staked: '15000', rewards: '142', joinEpoch: 4, tenure: 1, multiplier: '0.52x' },
    { address: '0x3333...4444', type: 'Farmer', staked: '12000', rewards: '98', joinEpoch: 4, tenure: 1, multiplier: '0.52x' },
  ];

  const epochData = [
    { epoch: 0, totalStaked: '18000', totalEffective: '18000', rewards: '1000', participants: 2 },
    { epoch: 1, totalStaked: '18000', totalEffective: '18360', rewards: '1000', participants: 2 },
    { epoch: 2, totalStaked: '23000', totalEffective: '23468', rewards: '1000', participants: 3 },
    { epoch: 3, totalStaked: '23000', totalEffective: '23928', rewards: '1000', participants: 3 },
    { epoch: 4, totalStaked: '50000', totalEffective: '31860', rewards: '1000', participants: 5 },
  ];

  const antiFarmMetrics = {
    longTermPercentage: 73.2,
    moderatePercentage: 18.5,
    farmerPercentage: 8.3,
    effectiveTVLQuality: 'High',
    retentionScore: 85,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Rewards Dashboard</h1>
            <p className="text-gray-600">Real-time metrics and anti-farm analytics</p>
          </div>

          {/* Current Epoch */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-indigo-100 mb-2">Current Epoch</p>
                <p className="text-5xl font-bold">{currentEpoch}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-100 mb-2">Time Remaining</p>
                <p className="text-3xl font-bold">18h 32m</p>
              </div>
            </div>
          </div>

          {/* Anti-Farm Metrics */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🎯 Anti-Farm Metrics</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Reward Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Long-term LPs</span>
                      <span className="font-semibold text-green-600">{antiFarmMetrics.longTermPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{width: `${antiFarmMetrics.longTermPercentage}%`}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Moderate LPs</span>
                      <span className="font-semibold text-blue-600">{antiFarmMetrics.moderatePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{width: `${antiFarmMetrics.moderatePercentage}%`}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Farmers</span>
                      <span className="font-semibold text-red-600">{antiFarmMetrics.farmerPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{width: `${antiFarmMetrics.farmerPercentage}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Quality Indicators</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">TVL Quality</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                      {antiFarmMetrics.effectiveTVLQuality}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Retention Score</span>
                    <span className="text-2xl font-bold text-indigo-600">{antiFarmMetrics.retentionScore}/100</span>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-900">
                      ✅ Farmers capturing <strong>&lt;10%</strong> of rewards despite <strong>54%</strong> of nominal TVL
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Program Configuration */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">⚙️ Program Configuration</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Epoch Length</p>
                <p className="text-xl font-semibold">{programConfig.epochLength}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reward/Epoch</p>
                <p className="text-xl font-semibold">{programConfig.rewardPerEpoch} tokens</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Epochs</p>
                <p className="text-xl font-semibold">{programConfig.totalEpochs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Half Life</p>
                <p className="text-xl font-semibold">{programConfig.halfLife} epochs</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tenure Boost</p>
                <p className="text-xl font-semibold">{programConfig.alpha}/epoch</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Max Tenure</p>
                <p className="text-xl font-semibold">{programConfig.tMax} epochs</p>
              </div>
            </div>
          </div>

          {/* Top Stakers */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">👥 Top Stakers</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2">Address</th>
                    <th className="text-left py-3 px-2">Type</th>
                    <th className="text-right py-3 px-2">Staked</th>
                    <th className="text-right py-3 px-2">Rewards</th>
                    <th className="text-right py-3 px-2">Join</th>
                    <th className="text-right py-3 px-2">Tenure</th>
                    <th className="text-right py-3 px-2">Multiplier</th>
                  </tr>
                </thead>
                <tbody>
                  {topStakers.map((staker, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-mono text-sm">{staker.address}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          staker.type === 'Long-term LP' ? 'bg-green-100 text-green-800' :
                          staker.type === 'Moderate LP' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {staker.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">{staker.staked}</td>
                      <td className="py-3 px-2 text-right font-semibold">{staker.rewards}</td>
                      <td className="py-3 px-2 text-right">Ep {staker.joinEpoch}</td>
                      <td className="py-3 px-2 text-right">{staker.tenure}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`font-semibold ${parseFloat(staker.multiplier) < 0.8 ? 'text-red-600' : 'text-green-600'}`}>
                          {staker.multiplier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Epoch History */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📊 Epoch History</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2">Epoch</th>
                    <th className="text-right py-3 px-2">Total Staked</th>
                    <th className="text-right py-3 px-2">Effective Stake</th>
                    <th className="text-right py-3 px-2">Rewards</th>
                    <th className="text-right py-3 px-2">Participants</th>
                    <th className="text-right py-3 px-2">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {epochData.map((epoch, idx) => {
                    const efficiency = ((parseFloat(epoch.totalEffective) / parseFloat(epoch.totalStaked)) * 100).toFixed(1);
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-semibold">{epoch.epoch}</td>
                        <td className="py-3 px-2 text-right">{epoch.totalStaked}</td>
                        <td className="py-3 px-2 text-right font-semibold text-indigo-600">{epoch.totalEffective}</td>
                        <td className="py-3 px-2 text-right">{epoch.rewards}</td>
                        <td className="py-3 px-2 text-right">{epoch.participants}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`font-semibold ${parseFloat(efficiency) < 70 ? 'text-red-600' : 'text-green-600'}`}>
                            {efficiency}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Efficiency:</strong> Ratio of effective stake to nominal stake. Lower values indicate more farmers in the pool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

