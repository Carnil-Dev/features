import React, { useState } from 'react';
import { GrandfatheringRule } from '../types/pricing';

interface GrandfatheringPanelProps {
  rules: GrandfatheringRule[];
  onAdd: (rule: GrandfatheringRule) => void;
  onUpdate: (id: string, rule: GrandfatheringRule) => void;
  onDelete: (id: string) => void;
}

export function GrandfatheringPanel({
  rules,
  onAdd,
  onUpdate,
  onDelete,
}: GrandfatheringPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customerSegment: '',
    originalPrice: 0,
    grandfatheredPrice: 0,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const handleSubmit = () => {
    const newRule: GrandfatheringRule = {
      id: editingRule || `rule-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      customerSegment: formData.customerSegment,
      originalPrice: formData.originalPrice,
      grandfatheredPrice: formData.grandfatheredPrice,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      isActive: formData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingRule) {
      onUpdate(editingRule, newRule);
    } else {
      onAdd(newRule);
    }

    setIsCreating(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      customerSegment: '',
      originalPrice: 0,
      grandfatheredPrice: 0,
      startDate: '',
      endDate: '',
      isActive: true,
    });
  };

  const handleEdit = (rule: GrandfatheringRule) => {
    setFormData({
      name: rule.name,
      description: rule.description,
      customerSegment: rule.customerSegment,
      originalPrice: rule.originalPrice,
      grandfatheredPrice: rule.grandfatheredPrice,
      startDate: rule.startDate.toISOString().split('T')[0],
      endDate: rule.endDate ? rule.endDate.toISOString().split('T')[0] : '',
      isActive: rule.isActive,
    });
    setEditingRule(rule.id);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      customerSegment: '',
      originalPrice: 0,
      grandfatheredPrice: 0,
      startDate: '',
      endDate: '',
      isActive: true,
    });
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Grandfathering Rules</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Add Rule
        </button>
      </div>

      {isCreating ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Segment</label>
            <input
              type="text"
              value={formData.customerSegment}
              onChange={e => setFormData(prev => ({ ...prev, customerSegment: e.target.value }))}
              placeholder="e.g., Early adopters, Enterprise customers"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={e =>
                  setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grandfathered Price
              </label>
              <input
                type="number"
                value={formData.grandfatheredPrice}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    grandfatheredPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.customerSegment}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {editingRule ? 'Update Rule' : 'Add Rule'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No grandfathering rules</p>
              <p className="text-gray-400 text-xs mt-1">
                Add rules to protect existing customers from price changes
              </p>
            </div>
          ) : (
            rules.map(rule => (
              <div key={rule.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="mr-4">Segment: {rule.customerSegment}</span>
                      <span className="mr-4">Original: ${rule.originalPrice}</span>
                      <span className="mr-4">Grandfathered: ${rule.grandfatheredPrice}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(rule.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
