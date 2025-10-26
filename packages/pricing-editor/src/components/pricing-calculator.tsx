import React, { useState, useMemo } from 'react';
import { PricingPlan } from '../types/pricing';

interface PricingCalculatorProps {
  plan: PricingPlan;
  currency: string;
}

export function PricingCalculator({ plan, currency }: PricingCalculatorProps) {
  const [inputs, setInputs] = useState({
    monthlyRevenue: 0,
    customerCount: 0,
    churnRate: 5,
    growthRate: 10,
  });

  const calculations = useMemo(() => {
    const { monthlyRevenue, customerCount, churnRate, growthRate } = inputs;

    // Calculate metrics for each tier
    const tierMetrics = plan.tiers.map(tier => {
      const monthlyPrice = tier.price;
      const customersAtTier = Math.floor(customerCount * (1 / plan.tiers.length)); // Simplified distribution
      const monthlyRevenueFromTier = customersAtTier * monthlyPrice;
      const annualRevenueFromTier = monthlyRevenueFromTier * 12;

      // Churn impact
      const monthlyChurn = customersAtTier * (churnRate / 100);
      const monthlyNewCustomers = customersAtTier * (growthRate / 100);
      const netGrowth = monthlyNewCustomers - monthlyChurn;

      return {
        tier,
        customersAtTier,
        monthlyRevenueFromTier,
        annualRevenueFromTier,
        monthlyChurn,
        monthlyNewCustomers,
        netGrowth,
      };
    });

    // Total calculations
    const totalMonthlyRevenue = tierMetrics.reduce(
      (sum, tier) => sum + tier.monthlyRevenueFromTier,
      0
    );
    const totalAnnualRevenue = totalMonthlyRevenue * 12;
    const totalMonthlyChurn = tierMetrics.reduce((sum, tier) => sum + tier.monthlyChurn, 0);
    const totalMonthlyNewCustomers = tierMetrics.reduce(
      (sum, tier) => sum + tier.monthlyNewCustomers,
      0
    );
    const totalNetGrowth = totalMonthlyNewCustomers - totalMonthlyChurn;

    return {
      tierMetrics,
      totalMonthlyRevenue,
      totalAnnualRevenue,
      totalMonthlyChurn,
      totalMonthlyNewCustomers,
      totalNetGrowth,
    };
  }, [inputs, plan.tiers]);

  const handleInputChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Revenue Calculator</h3>

      {/* Input Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Monthly Revenue
          </label>
          <input
            type="number"
            value={inputs.monthlyRevenue}
            onChange={e => handleInputChange('monthlyRevenue', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Count</label>
          <input
            type="number"
            value={inputs.customerCount}
            onChange={e => handleInputChange('customerCount', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Churn Rate (%)</label>
            <input
              type="number"
              value={inputs.churnRate}
              onChange={e => handleInputChange('churnRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Growth Rate (%)</label>
            <input
              type="number"
              value={inputs.growthRate}
              onChange={e => handleInputChange('growthRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Projected Revenue</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Monthly:</span>
              <span className="ml-2 font-medium">
                ${calculations.totalMonthlyRevenue.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Annual:</span>
              <span className="ml-2 font-medium">
                ${calculations.totalAnnualRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Customer Metrics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Monthly Churn:</span>
              <span className="ml-2 font-medium">{calculations.totalMonthlyChurn.toFixed(0)}</span>
            </div>
            <div>
              <span className="text-gray-500">New Customers:</span>
              <span className="ml-2 font-medium">
                {calculations.totalMonthlyNewCustomers.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Net Growth:</span>
              <span
                className={`ml-2 font-medium ${calculations.totalNetGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {calculations.totalNetGrowth >= 0 ? '+' : ''}
                {calculations.totalNetGrowth.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Tier Breakdown */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Tier Breakdown</h4>
          <div className="space-y-2">
            {calculations.tierMetrics.map((tier, index) => (
              <div key={tier.tier.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{tier.tier.name}</span>
                  <span className="text-gray-500 ml-2">
                    ({tier.customersAtTier.toFixed(0)} customers)
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${tier.monthlyRevenueFromTier.toLocaleString()}/mo
                  </div>
                  <div className="text-gray-500">
                    ${tier.annualRevenueFromTier.toLocaleString()}/yr
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
