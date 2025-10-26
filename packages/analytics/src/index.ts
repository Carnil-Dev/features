// ============================================================================
// Analytics Package Exports
// ============================================================================

// Usage Tracking
export * from './modules/usage-tracker';

// AI Metrics
export * from './metrics/ai-metrics';

// Dashboard Components
export * from './dashboards/customer-dashboard';

// ============================================================================
// Main Analytics Engine
// ============================================================================

import { UsageTracker, RealTimeUsageMeter, UsageAnalyticsEngine } from './modules/usage-tracker';

export class CarnilAnalytics {
  private usageTracker: UsageTracker;
  private realTimeMeter: RealTimeUsageMeter;
  private analyticsEngine: UsageAnalyticsEngine;

  constructor(usageTracker: UsageTracker) {
    this.usageTracker = usageTracker;
    this.realTimeMeter = new RealTimeUsageMeter(usageTracker);
    this.analyticsEngine = new UsageAnalyticsEngine(usageTracker);
  }

  // Usage tracking methods
  async trackUsage(customerId: string, featureId: string, usage: number): Promise<boolean> {
    return this.realTimeMeter.trackUsage(customerId, featureId, usage);
  }

  async trackAIUsage(
    customerId: string,
    modelId: string,
    tokens: number,
    cost: number
  ): Promise<boolean> {
    return this.realTimeMeter.trackAIUsage(customerId, modelId, tokens, cost);
  }

  // Analytics methods
  async getCustomerReport(customerId: string, period: string = 'month') {
    return this.analyticsEngine.generateCustomerReport(customerId, period);
  }

  async getUsageMetrics(customerId: string, featureId: string, period: string) {
    return this.usageTracker.getUsageMetrics(customerId, featureId, period);
  }

  async getAIUsageMetrics(customerId: string, modelId?: string, period?: string) {
    return this.usageTracker.getAIUsageMetrics(customerId, modelId, period);
  }

  // Credit and limit management
  async getCreditBalance(customerId: string, featureId: string) {
    return this.usageTracker.getCreditBalance(customerId, featureId);
  }

  async updateCreditBalance(customerId: string, featureId: string, amount: number) {
    return this.usageTracker.updateCreditBalance(customerId, featureId, amount);
  }

  async setUsageLimit(customerId: string, limit: any) {
    return this.usageTracker.setUsageLimit(customerId, limit);
  }

  async checkUsageAllowed(customerId: string, featureId: string, requiredUsage: number) {
    return this.usageTracker.checkUsageAllowed(customerId, featureId, requiredUsage);
  }
}

// ============================================================================
// React Hooks for Analytics
// ============================================================================

import { useState, useEffect } from 'react';

export function useAnalytics(customerId: string) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This would integrate with your actual analytics service
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Mock analytics data
        const mockData = {
          summary: {
            totalUsage: 1250,
            totalCost: 89.5,
            averageDailyUsage: 42,
          },
          usage: [
            { date: '2024-01-01', usage: 45, cost: 3.2 },
            { date: '2024-01-02', usage: 52, cost: 3.7 },
            { date: '2024-01-03', usage: 38, cost: 2.8 },
          ],
          aiUsage: [
            { date: '2024-01-01', tokens: 1200, cost: 0.24 },
            { date: '2024-01-02', tokens: 1500, cost: 0.3 },
            { date: '2024-01-03', tokens: 980, cost: 0.2 },
          ],
          topFeatures: [
            { featureId: 'api-calls', usage: 800, cost: 45.0 },
            { featureId: 'ai-processing', usage: 450, cost: 44.5 },
          ],
          topModels: [
            { modelId: 'gpt-4', tokens: 2000, cost: 0.4 },
            { modelId: 'gpt-3.5-turbo', tokens: 1500, cost: 0.15 },
          ],
        };

        setAnalytics(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchAnalytics();
    }
  }, [customerId]);

  return { analytics, loading, error };
}

export function useUsageMeter(customerId: string, featureId: string) {
  const [usage, setUsage] = useState({ current: 0, limit: 1000, resetAt: new Date() });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would integrate with your actual usage tracking service
    const fetchUsage = async () => {
      try {
        setLoading(true);
        // Mock usage data
        const mockUsage = {
          current: 750,
          limit: 1000,
          resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        };

        setUsage(mockUsage);
      } catch (err) {
        console.error('Failed to fetch usage data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId && featureId) {
      fetchUsage();
    }
  }, [customerId, featureId]);

  return { usage, loading };
}

// ============================================================================
// Default Export
// ============================================================================

export default CarnilAnalytics;
