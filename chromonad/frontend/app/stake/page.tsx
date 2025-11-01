'use client';

import Link from 'next/link';
import StakingInterface from '@/components/StakingInterface';

export default function StakePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Stake LP Tokens</h1>
            <Link href="/demo" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Watch Demo →
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-8">
            <h2 className="text-2xl font-bold mb-2">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl mb-2">⏰</div>
                <h3 className="font-bold mb-1">1. Stake Early</h3>
                <p className="text-sm text-indigo-100">
                  Join sooner to avoid time-decay penalties
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-bold mb-1">2. Hold Longer</h3>
                <p className="text-sm text-indigo-100">
                  Build tenure to increase your multiplier
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-bold mb-1">3. Earn More</h3>
                <p className="text-sm text-indigo-100">
                  Get exponentially higher rewards
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">▸</span>
                <span><strong>Early entry matters:</strong> Rewards decay exponentially for late joiners</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">▸</span>
                <span><strong>Tenure builds rewards:</strong> Each epoch held adds 2% to your multiplier (up to 10 epochs)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">▸</span>
                <span><strong>Withdrawals hurt:</strong> Every withdrawal increases churn count and reduces effective stake</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">▸</span>
                <span><strong>Long-term wins:</strong> Committed LPs can earn 40-50x more than short-term farmers</span>
              </li>
            </ul>
          </div>

          {/* Staking Interface */}
          <StakingInterface />

          {/* Help Section */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Need Help?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900">📚 Resources</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• <Link href="/demo" className="text-indigo-600 hover:underline">Watch Interactive Demo</Link></li>
                  <li>• <Link href="/dashboard" className="text-indigo-600 hover:underline">View Your Dashboard</Link></li>
                  <li>• <Link href="/" className="text-indigo-600 hover:underline">Read Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900">⚙️ Configuration</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Epoch Length: 1 day (86,400 seconds)</li>
                  <li>• Half-Life: 2 epochs (rewards halve)</li>
                  <li>• Tenure Boost: 2% per epoch held</li>
                  <li>• Max Tenure: 10 epochs (20% max boost)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>⚠️ This is a demo on local testnet. Not audited for production use.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
