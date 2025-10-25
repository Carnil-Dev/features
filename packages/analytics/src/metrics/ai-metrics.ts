import { z } from 'zod';

// ============================================================================
// AI Metrics Schemas
// ============================================================================

export const TokenUsageSchema = z.object({
  modelId: z.string(),
  provider: z.string(),
  inputTokens: z.number().nonnegative(),
  outputTokens: z.number().nonnegative(),
  totalTokens: z.number().nonnegative(),
  cost: z.number().nonnegative(),
  timestamp: z.date(),
  customerId: z.string(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
});

export const ModelPerformanceSchema = z.object({
  modelId: z.string(),
  provider: z.string(),
  averageLatency: z.number().nonnegative(),
  successRate: z.number().min(0).max(1),
  errorRate: z.number().min(0).max(1),
  totalRequests: z.number().nonnegative(),
  totalTokens: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
  period: z.string(),
});

export const CostAnalysisSchema = z.object({
  customerId: z.string(),
  totalCost: z.number().nonnegative(),
  costByModel: z.record(z.string(), z.number().nonnegative()),
  costByProvider: z.record(z.string(), z.number().nonnegative()),
  costByFeature: z.record(z.string(), z.number().nonnegative()),
  averageCostPerToken: z.number().nonnegative(),
  costTrend: z.array(z.object({
    date: z.string(),
    cost: z.number().nonnegative(),
  })),
  period: z.string(),
});

export const UsagePatternSchema = z.object({
  customerId: z.string(),
  peakHours: z.array(z.number()),
  peakDays: z.array(z.string()),
  averageSessionLength: z.number().nonnegative(),
  averageTokensPerSession: z.number().nonnegative(),
  mostUsedModels: z.array(z.object({
    modelId: z.string(),
    usage: z.number().nonnegative(),
    cost: z.number().nonnegative(),
  })),
  featureUsage: z.record(z.string(), z.number().nonnegative()),
});

// ============================================================================
// Type Exports
// ============================================================================

export type TokenUsage = z.infer<typeof TokenUsageSchema>;
export type ModelPerformance = z.infer<typeof ModelPerformanceSchema>;
export type CostAnalysis = z.infer<typeof CostAnalysisSchema>;
export type UsagePattern = z.infer<typeof UsagePatternSchema>;

// ============================================================================
// AI Metrics Calculator
// ============================================================================

export class AIMetricsCalculator {
  constructor(private tokenUsages: TokenUsage[]) {}

  calculateModelPerformance(modelId: string, period: string = 'month'): ModelPerformance {
    const modelUsages = this.tokenUsages.filter(usage => usage.modelId === modelId);
    const periodUsages = this.filterByPeriod(modelUsages, period);

    if (periodUsages.length === 0) {
      return {
        modelId,
        provider: '',
        averageLatency: 0,
        successRate: 0,
        errorRate: 0,
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        period,
      };
    }

    const totalTokens = periodUsages.reduce((sum, usage) => sum + usage.totalTokens, 0);
    const totalCost = periodUsages.reduce((sum, usage) => sum + usage.cost, 0);
    const totalRequests = periodUsages.length;

    return {
      modelId,
      provider: periodUsages[0]?.provider || '',
      averageLatency: this.calculateAverageLatency(periodUsages),
      successRate: this.calculateSuccessRate(periodUsages),
      errorRate: this.calculateErrorRate(periodUsages),
      totalRequests,
      totalTokens,
      totalCost,
      period,
    };
  }

  calculateCostAnalysis(customerId: string, period: string = 'month'): CostAnalysis {
    const customerUsages = this.tokenUsages.filter(usage => usage.customerId === customerId);
    const periodUsages = this.filterByPeriod(customerUsages, period);

    const totalCost = periodUsages.reduce((sum, usage) => sum + usage.cost, 0);
    
    const costByModel = this.groupBy(periodUsages, 'modelId', 'cost');
    const costByProvider = this.groupBy(periodUsages, 'provider', 'cost');
    const costByFeature = this.groupBy(periodUsages, 'featureId', 'cost');
    
    const averageCostPerToken = totalCost / periodUsages.reduce((sum, usage) => sum + usage.totalTokens, 0);
    
    const costTrend = this.calculateCostTrend(periodUsages);

    return {
      customerId,
      totalCost,
      costByModel,
      costByProvider,
      costByFeature,
      averageCostPerToken,
      costTrend,
      period,
    };
  }

  calculateUsagePatterns(customerId: string, period: string = 'month'): UsagePattern {
    const customerUsages = this.tokenUsages.filter(usage => usage.customerId === customerId);
    const periodUsages = this.filterByPeriod(customerUsages, period);

    const peakHours = this.calculatePeakHours(periodUsages);
    const peakDays = this.calculatePeakDays(periodUsages);
    const averageSessionLength = this.calculateAverageSessionLength(periodUsages);
    const averageTokensPerSession = this.calculateAverageTokensPerSession(periodUsages);
    
    const mostUsedModels = this.calculateMostUsedModels(periodUsages);
    const featureUsage = this.groupBy(periodUsages, 'featureId', 'totalTokens');

    return {
      customerId,
      peakHours,
      peakDays,
      averageSessionLength,
      averageTokensPerSession,
      mostUsedModels,
      featureUsage,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private filterByPeriod(usages: TokenUsage[], period: string): TokenUsage[] {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return usages.filter(usage => usage.timestamp >= startDate);
  }

  private calculateAverageLatency(usages: TokenUsage[]): number {
    // This would require latency data from the actual API calls
    // For now, return a mock calculation
    return 1500; // 1.5 seconds average
  }

  private calculateSuccessRate(usages: TokenUsage[]): number {
    // This would require success/error data from the actual API calls
    // For now, return a mock calculation
    return 0.95; // 95% success rate
  }

  private calculateErrorRate(usages: TokenUsage[]): number {
    return 1 - this.calculateSuccessRate(usages);
  }

  private groupBy(usages: TokenUsage[], key: keyof TokenUsage, valueKey: keyof TokenUsage): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    usages.forEach(usage => {
      const keyValue = usage[key] as string;
      const value = usage[valueKey] as number;
      
      if (!grouped[keyValue]) {
        grouped[keyValue] = 0;
      }
      grouped[keyValue] += value;
    });

    return grouped;
  }

  private calculateCostTrend(usages: TokenUsage[]): Array<{ date: string; cost: number }> {
    const dailyCosts: Record<string, number> = {};
    
    usages.forEach(usage => {
      const date = usage.timestamp.toISOString().split('T')[0];
      if (!dailyCosts[date]) {
        dailyCosts[date] = 0;
      }
      dailyCosts[date] += usage.cost;
    });

    return Object.entries(dailyCosts)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculatePeakHours(usages: TokenUsage[]): number[] {
    const hourlyUsage: Record<number, number> = {};
    
    usages.forEach(usage => {
      const hour = usage.timestamp.getHours();
      if (!hourlyUsage[hour]) {
        hourlyUsage[hour] = 0;
      }
      hourlyUsage[hour] += usage.totalTokens;
    });

    return Object.entries(hourlyUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private calculatePeakDays(usages: TokenUsage[]): string[] {
    const dailyUsage: Record<string, number> = {};
    
    usages.forEach(usage => {
      const day = usage.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      if (!dailyUsage[day]) {
        dailyUsage[day] = 0;
      }
      dailyUsage[day] += usage.totalTokens;
    });

    return Object.entries(dailyUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);
  }

  private calculateAverageSessionLength(usages: TokenUsage[]): number {
    // This would require session data
    // For now, return a mock calculation
    return 30; // 30 minutes average
  }

  private calculateAverageTokensPerSession(usages: TokenUsage[]): number {
    const sessionTokens: Record<string, number> = {};
    
    usages.forEach(usage => {
      const sessionId = usage.sessionId || 'default';
      if (!sessionTokens[sessionId]) {
        sessionTokens[sessionId] = 0;
      }
      sessionTokens[sessionId] += usage.totalTokens;
    });

    const totalSessions = Object.keys(sessionTokens).length;
    const totalTokens = Object.values(sessionTokens).reduce((sum, tokens) => sum + tokens, 0);
    
    return totalSessions > 0 ? totalTokens / totalSessions : 0;
  }

  private calculateMostUsedModels(usages: TokenUsage[]): Array<{ modelId: string; usage: number; cost: number }> {
    const modelUsage: Record<string, { usage: number; cost: number }> = {};
    
    usages.forEach(usage => {
      if (!modelUsage[usage.modelId]) {
        modelUsage[usage.modelId] = { usage: 0, cost: 0 };
      }
      modelUsage[usage.modelId].usage += usage.totalTokens;
      modelUsage[usage.modelId].cost += usage.cost;
    });

    return Object.entries(modelUsage)
      .map(([modelId, data]) => ({ modelId, ...data }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);
  }
}

// ============================================================================
// AI Metrics Dashboard Data
// ============================================================================

export interface AIMetricsDashboardData {
  summary: {
    totalTokens: number;
    totalCost: number;
    averageCostPerToken: number;
    totalRequests: number;
    averageLatency: number;
    successRate: number;
  };
  modelPerformance: ModelPerformance[];
  costAnalysis: CostAnalysis;
  usagePatterns: UsagePattern;
  trends: {
    tokenGrowth: number;
    costGrowth: number;
    requestGrowth: number;
  };
}

export function generateAIMetricsDashboard(
  tokenUsages: TokenUsage[],
  customerId: string,
  period: string = 'month'
): AIMetricsDashboardData {
  const calculator = new AIMetricsCalculator(tokenUsages);
  
  const customerUsages = tokenUsages.filter(usage => usage.customerId === customerId);
  const periodUsages = calculator['filterByPeriod'](customerUsages, period);
  
  const totalTokens = periodUsages.reduce((sum, usage) => sum + usage.totalTokens, 0);
  const totalCost = periodUsages.reduce((sum, usage) => sum + usage.cost, 0);
  const totalRequests = periodUsages.length;
  
  const uniqueModels = [...new Set(periodUsages.map(usage => usage.modelId))];
  const modelPerformance = uniqueModels.map(modelId => 
    calculator.calculateModelPerformance(modelId, period)
  );
  
  const costAnalysis = calculator.calculateCostAnalysis(customerId, period);
  const usagePatterns = calculator.calculateUsagePatterns(customerId, period);
  
  // Calculate trends (simplified)
  const trends = {
    tokenGrowth: 15.2, // Mock data
    costGrowth: 12.8,  // Mock data
    requestGrowth: 8.5, // Mock data
  };

  return {
    summary: {
      totalTokens,
      totalCost,
      averageCostPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
      totalRequests,
      averageLatency: modelPerformance.reduce((sum, perf) => sum + perf.averageLatency, 0) / modelPerformance.length,
      successRate: modelPerformance.reduce((sum, perf) => sum + perf.successRate, 0) / modelPerformance.length,
    },
    modelPerformance,
    costAnalysis,
    usagePatterns,
    trends,
  };
}
