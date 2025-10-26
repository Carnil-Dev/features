import React from 'react';
import { PricingPlan } from '../types/pricing';

interface PricingPreviewProps {
  plan: PricingPlan;
  currency: string;
}

export function PricingPreview({ plan, currency }: PricingPreviewProps) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h2>
        <p className="text-lg text-gray-600">{plan.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plan.tiers.map((tier, index) => (
          <div
            key={tier.id}
            className={`relative border rounded-lg p-6 ${
              index === 1 ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
            }`}
          >
            {index === 1 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{tier.description}</p>

              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                </span>
                {tier.price > 0 && (
                  <span className="text-gray-600 ml-1">
                    /{tier.interval === 'month' ? 'month' : 'year'}
                  </span>
                )}
              </div>

              {tier.price > 0 && tier.intervalCount > 1 && (
                <p className="text-sm text-gray-500">
                  Billed every {tier.intervalCount} {tier.interval === 'month' ? 'months' : 'years'}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {tier.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                index === 1
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {tier.price === 0 ? 'Get Started' : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          All plans include 24/7 support and a 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
}
