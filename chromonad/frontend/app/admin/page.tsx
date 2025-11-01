'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [formData, setFormData] = useState({
    epochLength: '86400', // 1 day in seconds
    rewardPerEpoch: '1000',
    halfLife: '2',
    alpha: '0.02',
    tMax: '10',
    totalEpochs: '30',
  });

  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Creating program...');
    
    // In a real app, this would interact with the contract
    setTimeout(() => {
      setStatus('✅ Program created successfully!');
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Create and configure rewards programs</p>
          </div>

          {/* Create Program Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Rewards Program</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Epoch Length (seconds)
                </label>
                <input
                  type="number"
                  name="epochLength"
                  value={formData.epochLength}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="86400"
                />
                <p className="text-xs text-gray-500 mt-1">Default: 86400 (1 day)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Per Epoch (tokens)
                </label>
                <input
                  type="number"
                  name="rewardPerEpoch"
                  value={formData.rewardPerEpoch}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Half Life (epochs)
                  </label>
                  <input
                    type="number"
                    name="halfLife"
                    value={formData.halfLife}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Decay penalty for late joiners</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alpha (per epoch)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="alpha"
                    value={formData.alpha}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.02"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tenure boost (e.g., 0.02 = 2%)</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    T Max (epochs)
                  </label>
                  <input
                    type="number"
                    name="tMax"
                    value={formData.tMax}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max tenure for multiplier cap</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Epochs
                  </label>
                  <input
                    type="number"
                    name="totalEpochs"
                    value={formData.totalEpochs}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Total Rewards Calculation */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-indigo-900">
                  Total Rewards: {parseInt(formData.rewardPerEpoch) * parseInt(formData.totalEpochs)} tokens
                </p>
                <p className="text-xs text-indigo-700 mt-1">
                  Duration: {parseInt(formData.totalEpochs)} epochs 
                  ({Math.round(parseInt(formData.totalEpochs) * parseInt(formData.epochLength) / 86400)} days)
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Create Program
              </button>

              {status && (
                <div className={`p-4 rounded-lg ${status.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
                  {status}
                </div>
              )}
            </form>
          </div>

          {/* Deposit Rewards Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Deposit Rewards</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (tokens)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>

              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Deposit Rewards
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

