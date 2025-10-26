import React, { useState } from 'react';
import { PricingTemplate } from '../types/pricing';

interface TemplateSelectorProps {
  templates: PricingTemplate[];
  onSelect: (template: PricingTemplate) => void;
  onCreate: () => void;
}

export function TemplateSelector({ templates, onSelect, onCreate }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose a Template</h3>
        <p className="text-gray-600">Start with a pre-built pricing structure or create your own</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Templates' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            onClick={() => onSelect(template)}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>

            <div className="mb-3">
              <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 font-mono">
                {template.preview}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {template.category}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Use Template →
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No templates found</p>
          <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Create New */}
      <div className="border-t pt-6">
        <div className="text-center">
          <h4 className="font-medium text-gray-900 mb-2">Don't see what you need?</h4>
          <p className="text-sm text-gray-600 mb-4">Create a custom pricing plan from scratch</p>
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Custom Plan
          </button>
        </div>
      </div>
    </div>
  );
}
