import React, { useState } from 'react';
import { ABTest, PricingPlan } from '../types/pricing';

interface ABTestPanelProps {
  activeTest: ABTest | null;
  onStart: (test: ABTest) => void;
  onStop: () => void;
  currentPlan: PricingPlan;
}

export function ABTestPanel({ activeTest, onStart, onStop, currentPlan }: ABTestPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [testConfig, setTestConfig] = useState({
    name: '',
    description: '',
    variantName: '',
    trafficSplit: 50,
    duration: 30,
  });

  const handleStartTest = () => {
    const newTest: ABTest = {
      id: `test-${Date.now()}`,
      name: testConfig.name,
      description: testConfig.description,
      variantName: testConfig.variantName,
      trafficSplit: testConfig.trafficSplit,
      duration: testConfig.duration,
      startDate: new Date(),
      status: 'running',
      metrics: {
        conversions: 0,
        revenue: 0,
        users: 0,
      },
    };

    onStart(newTest);
    setIsCreating(false);
    setTestConfig({
      name: '',
      description: '',
      variantName: '',
      trafficSplit: 50,
      duration: 30,
    });
  };

  if (activeTest) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Active A/B Test</h3>
          <button
            onClick={onStop}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Stop Test
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900">{activeTest.name}</h4>
            <p className="text-sm text-gray-600">{activeTest.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Variant:</span>
              <span className="ml-2 font-medium">{activeTest.variantName}</span>
            </div>
            <div>
              <span className="text-gray-500">Traffic Split:</span>
              <span className="ml-2 font-medium">{activeTest.trafficSplit}%</span>
            </div>
            <div>
              <span className="text-gray-500">Duration:</span>
              <span className="ml-2 font-medium">{activeTest.duration} days</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 font-medium text-green-600 capitalize">
                {activeTest.status}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t">
            <h5 className="font-medium text-gray-900 mb-2">Metrics</h5>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Users:</span>
                <span className="ml-2 font-medium">{activeTest.metrics.users}</span>
              </div>
              <div>
                <span className="text-gray-500">Conversions:</span>
                <span className="ml-2 font-medium">{activeTest.metrics.conversions}</span>
              </div>
              <div>
                <span className="text-gray-500">Revenue:</span>
                <span className="ml-2 font-medium">${activeTest.metrics.revenue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create A/B Test</h3>
          <button
            onClick={() => setIsCreating(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
            <input
              type="text"
              value={testConfig.name}
              onChange={e => setTestConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={testConfig.description}
              onChange={e => setTestConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
            <input
              type="text"
              value={testConfig.variantName}
              onChange={e => setTestConfig(prev => ({ ...prev, variantName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Traffic Split (%)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={testConfig.trafficSplit}
                onChange={e =>
                  setTestConfig(prev => ({ ...prev, trafficSplit: parseInt(e.target.value) || 50 }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                value={testConfig.duration}
                onChange={e =>
                  setTestConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleStartTest}
              disabled={!testConfig.name || !testConfig.variantName}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">A/B Testing</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          New Test
        </button>
      </div>

      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No active A/B tests</p>
        <p className="text-gray-400 text-xs mt-1">Create a test to compare pricing strategies</p>
      </div>
    </div>
  );
}
