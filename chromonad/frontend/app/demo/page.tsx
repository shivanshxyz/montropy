'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Demo scenarios to show
const scenarios = [
  {
    name: "Long-Term LP",
    description: "Joins early (Epoch 0) and holds until the end",
    deposits: [{ epoch: 0, amount: 1000 }],
    withdraws: [],
    expectedRewards: "~70%",
    color: "bg-green-500"
  },
  {
    name: "Moderate LP",
    description: "Joins mid-way (Epoch 2) and holds",
    deposits: [{ epoch: 2, amount: 1000 }],
    withdraws: [],
    expectedRewards: "~30%",
    color: "bg-blue-500"
  },
  {
    name: "Farmer/Churner",
    description: "Joins late (Epoch 4), withdraws quickly (Epoch 5)",
    deposits: [{ epoch: 4, amount: 1000 }],
    withdraws: [{ epoch: 5 }],
    expectedRewards: "0%",
    color: "bg-red-500"
  }
];

export default function DemoPage() {
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actorStates, setActorStates] = useState(scenarios.map(() => ({ staked: 0, rewards: 0 })));

  // Simplified reward calculation for visualization
  const calculateRewards = (actor: typeof scenarios[0], epoch: number) => {
    const hasDeposited = actor.deposits.some(d => d.epoch <= epoch);
    const hasWithdrawn = actor.withdraws.some(w => w.epoch && w.epoch <= epoch);
    
    if (!hasDeposited || hasWithdrawn) return 0;
    
    const deposit = actor.deposits[0];
    const timeHeld = epoch - deposit.epoch;
    const decayPenalty = Math.pow(0.7, deposit.epoch); // Simplified decay
    const tenureBonus = 1 + (0.02 * timeHeld); // 2% per epoch
    
    return deposit.amount * decayPenalty * tenureBonus * (epoch - deposit.epoch) * 10;
  };

  // Animate through epochs
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      if (currentEpoch < 9) {
        setCurrentEpoch(prev => prev + 1);
        // Update actor states
        setActorStates(scenarios.map((actor, idx) => {
          const hasDeposited = actor.deposits.some(d => d.epoch <= currentEpoch + 1);
          const hasWithdrawn = actor.withdraws.some(w => w.epoch && w.epoch <= currentEpoch + 1);
          
          return {
            staked: hasDeposited && !hasWithdrawn ? actor.deposits[0].amount : 0,
            rewards: calculateRewards(actor, currentEpoch + 1)
          };
        }));
      } else {
        setIsPlaying(false);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentEpoch]);

  const resetSimulation = () => {
    setCurrentEpoch(0);
    setActorStates(scenarios.map(() => ({ staked: 0, rewards: 0 })));
    setIsPlaying(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Montropy</h1>
            <div className="w-32"></div> {/* Spacer */}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Intro Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              How Montropy Works: A Visual Explanation
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Watch how three different strategies play out over 10 epochs. The anti-geyser mechanism
              rewards long-term commitment while penalizing short-term farming behavior.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="font-bold text-green-900">Long-Term LP</h3>
                </div>
                <p className="text-sm text-green-800">
                  ✅ Early entry<br/>
                  ✅ Full time-decay benefit<br/>
                  ✅ Maximum tenure multiplier<br/>
                  ✅ No churn penalty
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="font-bold text-blue-900">Moderate LP</h3>
                </div>
                <p className="text-sm text-blue-800">
                  ⚡ Mid entry<br/>
                  📉 Partial time-decay<br/>
                  📈 Good tenure multiplier<br/>
                  ✅ No churn penalty
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h3 className="font-bold text-red-900">Farmer</h3>
                </div>
                <p className="text-sm text-red-800">
                  ❌ Late entry<br/>
                  ❌ Heavy time-decay penalty<br/>
                  ❌ Minimal tenure<br/>
                  ❌ Churn penalty applied
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Simulation */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Epoch Progression: {currentEpoch} / 10
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isPlaying 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  ↻ Reset
                </button>
              </div>
            </div>

            {/* Epoch Timeline */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                {[...Array(11)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      i <= currentEpoch ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {i}
                    </div>
                    <div className="text-xs mt-1 text-gray-500">E{i}</div>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${(currentEpoch / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Actor Status */}
            <div className="space-y-4">
              {scenarios.map((actor, idx) => {
                const state = actorStates[idx];
                const isActive = state.staked > 0;
                
                return (
                  <div key={actor.name} className="border-2 rounded-lg p-4 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded-full ${actor.color}`}></div>
                          <h3 className="font-bold text-lg">{actor.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isActive ? '✓ Active' : '○ Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{actor.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {state.rewards.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">Rewards</div>
                      </div>
                    </div>
                    
                    {/* Reward Bar */}
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${actor.color} transition-all duration-500`}
                        style={{ width: `${Math.min((state.rewards / 10000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 flex justify-between">
                      <span>Staked: {state.staked} tokens</span>
                      <span>Expected: {actor.expectedRewards} of pool</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Sections */}
          {/* <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-indigo-900">⏰ Time-Decay Mechanism</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">1</div>
                  <div>
                    <strong>Early Entry = Full Rewards</strong>
                    <p className="text-gray-600">Joining at Epoch 0 gets you 100% of the time-decay multiplier</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">2</div>
                  <div>
                    <strong>Exponential Decay</strong>
                    <p className="text-gray-600">Each epoch you wait, your rewards decay by the half-life factor (default: 50% every 2 epochs)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">3</div>
                  <div>
                    <strong>Creates Urgency</strong>
                    <p className="text-gray-600">Late farmers face massive penalties, encouraging early and sustained participation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-900">📈 Tenure Multiplier</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0">1</div>
                  <div>
                    <strong>Continuous Holding Bonus</strong>
                    <p className="text-gray-600">For each epoch you hold without withdrawing, you earn a tenure bonus (default: 2% per epoch)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0">2</div>
                  <div>
                    <strong>Capped Growth</strong>
                    <p className="text-gray-600">Multiplier caps at T_max epochs (default: 10) to prevent runaway growth</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0">3</div>
                  <div>
                    <strong>Compounds Over Time</strong>
                    <p className="text-gray-600">Long-term holders see dramatic reward increases as tenure builds</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-red-900">⚠️ Churn Penalty</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold flex-shrink-0">1</div>
                  <div>
                    <strong>Withdrawal Tracking</strong>
                    <p className="text-gray-600">Every time you withdraw, the system records a "churn" event</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold flex-shrink-0">2</div>
                  <div>
                    <strong>Reduces Effective Stake</strong>
                    <p className="text-gray-600">Each churn reduces your effective stake, decreasing your share of rewards</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold flex-shrink-0">3</div>
                  <div>
                    <strong>Discourages Farming</strong>
                    <p className="text-gray-600">Rapid deposit/withdraw cycles become economically unviable</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-900">🎯 Combined Effect</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold flex-shrink-0">1</div>
                  <div>
                    <strong>Multiplicative Penalties</strong>
                    <p className="text-gray-600">Late entry + churning = near-zero rewards for farmers</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold flex-shrink-0">2</div>
                  <div>
                    <strong>Multiplicative Bonuses</strong>
                    <p className="text-gray-600">Early entry + continuous holding = exponential rewards for LPs</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold flex-shrink-0">3</div>
                  <div>
                    <strong>Capital Efficiency</strong>
                    <p className="text-gray-600">DAOs spend less on mercenary capital, more on genuine LPs</p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Formula Display */}
          {/* <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 text-white mb-8">
            <h3 className="text-2xl font-bold mb-6">📐 The Math Behind It</h3>
            
            <div className="space-y-6 font-mono text-sm">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-slate-300 mb-2">Effective Stake (what you're actually earning on):</div>
                <div className="text-lg">
                  <span className="text-yellow-300">LP<sub>i,e</sub></span> = 
                  <span className="text-blue-300"> stake</span> × 
                  <span className="text-green-300"> M<sub>tenure</sub></span> × 
                  <span className="text-purple-300"> D<sub>join</sub></span> × 
                  <span className="text-red-300"> (1 - churnPenalty)</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/30 p-4 rounded">
                  <div className="text-green-300 font-semibold mb-2">Tenure Multiplier:</div>
                  <div>M<sub>tenure</sub> = 1 + α × min(tenure, T<sub>max</sub>)</div>
                  <div className="text-xs text-slate-400 mt-2">α = 0.02 (2% per epoch)</div>
                </div>

                <div className="bg-slate-700/30 p-4 rounded">
                  <div className="text-purple-300 font-semibold mb-2">Time Decay:</div>
                  <div>D<sub>join</sub> = (0.5)<sup>joinEpoch / halfLife</sup></div>
                  <div className="text-xs text-slate-400 mt-2">halfLife = 2 epochs</div>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-slate-300 mb-2">Your Share of Rewards:</div>
                <div className="text-lg">
                  <span className="text-yellow-300">reward<sub>i,e</sub></span> = 
                  <span className="text-orange-300"> R<sub>e</sub></span> × 
                  <span className="text-yellow-300"> LP<sub>i,e</sub></span> / 
                  <span className="text-cyan-300"> S<sub>e</sub></span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Where R<sub>e</sub> = rewards for epoch, S<sub>e</sub> = total effective stake
                </div>
              </div>
            </div>
          </div> */}

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Try It Yourself!</h3>
            <div className="flex justify-center gap-4">
              <Link 
                href="/stake"
                className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Start Staking →
              </Link>
              <Link 
                href="/dashboard"
                className="bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-800 transition-colors border-2 border-white/20"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

