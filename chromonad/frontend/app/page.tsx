'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Anti-Liquidity-Geyser
            </h1>
            <p className="text-xl text-gray-600">
              Capital-Efficient Rewards Engine that Discourages Transient Farming
            </p>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Problem: Mercenary Farming
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Traditional liquidity mining programs reward short-term liquidity providers
              who deposit right before reward epochs and withdraw immediately after.
              This creates unsustainable TVL and hurts genuine long-term participants.
            </p>
            
            <h2 className="text-3xl font-bold mb-4 text-gray-900 mt-8">
              Solution: Smart Reward Distribution
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-blue-900">
                  🎯 Time-Decay Curve
                </h3>
                <p className="text-gray-700">
                  Early joiners get full rewards. Late joiners face exponential decay penalties.
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-green-900">
                  📈 Tenure Multiplier
                </h3>
                <p className="text-gray-700">
                  Continuous holders earn increasing multipliers up to a configurable cap.
                </p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-purple-900">
                  ⚠️ Churn Penalty
                </h3>
                <p className="text-gray-700">
                  Frequent withdrawals reduce effective stake, penalizing farming behavior.
                </p>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-yellow-900">
                  ⚙️ Governance Control
                </h3>
                <p className="text-gray-700">
                  DAOs can tune decay curves and multipliers to match their goals.
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <h2 className="text-3xl font-bold mb-6">Demo Results</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">40-50x</div>
                <div className="text-indigo-100">Long-term LP advantage</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">90%</div>
                <div className="text-indigo-100">Rewards to genuine LPs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">10%</div>
                <div className="text-indigo-100">Farmer reward capture</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link 
              href="/demo"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-6 px-6 rounded-xl text-center transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-1">🎬 Interactive Demo</div>
              <div className="text-sm text-purple-100">Watch it work in real-time</div>
            </Link>
            
            <Link 
              href="/stake"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-6 rounded-xl text-center transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-1">💎 Stake LP Tokens</div>
              <div className="text-sm text-green-100">Connect and start earning</div>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors"
            >
              📊 Dashboard
            </Link>
            
            <Link 
              href="/admin"
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors"
            >
              ⚙️ Admin Panel
            </Link>
          </div>

          {/* Formula Display */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Reward Formula</h2>
            <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="mb-4">
                <span className="text-blue-600">reward_i_e</span> = 
                <span className="text-purple-600"> R_e</span> × 
                <span className="text-green-600"> LP_i_e</span> / 
                <span className="text-orange-600"> S_e</span>
              </div>
              
              <div className="mb-4">
                <span className="text-green-600">LP_i_e</span> = 
                <span> stake</span> × 
                <span className="text-blue-600"> M_tenure</span> × 
                <span className="text-purple-600"> D_join</span> × 
                <span className="text-red-600"> (1 - churnPenalty)</span>
              </div>
              
              <div className="text-xs text-gray-600 mt-4">
                <p><span className="text-blue-600">M_tenure</span> = 1 + α × min(tenure, T_max)</p>
                <p><span className="text-purple-600">D_join</span> = Decay based on join epoch</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-600">
            <p className="mb-2">Built for hackathon demo • MIT License</p>
            <p className="text-sm">⚠️ Not audited • Do not use in production</p>
          </div>
        </div>
      </div>
    </main>
  );
}

