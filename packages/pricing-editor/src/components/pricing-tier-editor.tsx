import React, { useState, useCallback } from 'react';
import { PricingTier } from '../types/pricing';

interface PricingTierEditorProps {
  tier: PricingTier;
  onUpdate: (updates: Partial<PricingTier>) => void;
  onClose: () => void;
  currency: string;
  supportedCurrencies: string[];
  features: string[];
  limits: string[];
}

export function PricingTierEditor({
  tier,
  onUpdate,
  onClose,
  currency,
  supportedCurrencies,
  features,
  limits,
}: PricingTierEditorProps) {
  const [formData, setFormData] = useState({
    name: tier.name,
    description: tier.description,
    price: tier.price,
    currency: tier.currency,
    interval: tier.interval,
    intervalCount: tier.intervalCount,
    features: tier.features,
    isActive: tier.isActive,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onUpdate(formData);
      onClose();
    },
    [formData, onUpdate, onClose]
  );

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edit Tier</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={e => handleChange('price', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={e => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {supportedCurrencies.map(curr => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
            <select
              value={formData.interval}
              onChange={e => handleChange('interval', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interval Count</label>
            <input
              type="number"
              value={formData.intervalCount}
              onChange={e => handleChange('intervalCount', parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={e => {
                    const newFeatures = e.target.checked
                      ? [...formData.features, feature]
                      : formData.features.filter(f => f !== feature);
                    handleChange('features', newFeatures);
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={e => handleChange('isActive', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Active
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
