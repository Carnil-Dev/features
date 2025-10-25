import { z } from 'zod';

// ============================================================================
// Usage Tracking Schemas
// ============================================================================

export const UsageEventSchema = z.object({
  customerId: z.string(),
  featureId: z.string(),
  usage: z.number().positive(),
  timestamp: z.date(),
  metadata: z.record(z.string()).optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export const AIUsageEventSchema = z.object({
  customerId: z.string(),
  modelId: z.string(),
  provider: z.string(),
  tokens: z.number().positive(),
  inputTokens: z.number().nonnegative(),
  outputTokens: z.number().nonnegative(),
  cost: z.number().nonnegative(),
  timestamp: z.date(),
  metadata: z.record(z.string()).optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export const CreditBalanceSchema = z.object({
  customerId: z.string(),
  featureId: z.string(),
  balance: z.number().nonnegative(),
  limit: z.number().positive().optional(),
  resetAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UsageLimitSchema = z.object({
  customerId: z.string(),
  featureId: z.string(),
  limit: z.number().positive(),
  period: z.enum(['day', 'week', 'month', 'year']),
  resetAt: z.date(),
  overageAllowed: z.boolean().default(false),
  overagePrice: z.number().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type UsageEvent = z.infer<typeof UsageEventSchema>;
export type AIUsageEvent = z.infer<typeof AIUsageEventSchema>;
export type CreditBalance = z.infer<typeof CreditBalanceSchema>;
export type UsageLimit = z.infer<typeof UsageLimitSchema>;

// ============================================================================
// Usage Tracker Interface
// ============================================================================

export interface UsageTracker {
  // Track usage events
  trackUsage(event: UsageEvent): Promise<void>;
  trackAIUsage(event: AIUsageEvent): Promise<void>;
  
  // Get usage metrics
  getUsageMetrics(customerId: string, featureId: string, period: string): Promise<UsageEvent[]>;
  getAIUsageMetrics(customerId: string, modelId?: string, period?: string): Promise<AIUsageEvent[]>;
  
  // Credit and limit management
  getCreditBalance(customerId: string, featureId: string): Promise<CreditBalance | null>;
  updateCreditBalance(customerId: string, featureId: string, amount: number): Promise<CreditBalance>;
  setUsageLimit(customerId: string, limit: UsageLimit): Promise<void>;
  getUsageLimit(customerId: string, featureId: string): Promise<UsageLimit | null>;
  
  // Check if usage is allowed
  checkUsageAllowed(customerId: string, featureId: string, requiredUsage: number): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    resetAt: Date;
  }>;
  
  // Analytics queries
  getUsageAnalytics(customerId: string, startDate: Date, endDate: Date): Promise<{
    totalUsage: number;
    totalCost: number;
    topFeatures: Array<{ featureId: string; usage: number; cost: number }>;
    dailyBreakdown: Array<{ date: string; usage: number; cost: number }>;
  }>;
  
  getAIUsageAnalytics(customerId: string, startDate: Date, endDate: Date): Promise<{
    totalTokens: number;
    totalCost: number;
    topModels: Array<{ modelId: string; tokens: number; cost: number }>;
    dailyBreakdown: Array<{ date: string; tokens: number; cost: number }>;
  }>;
}

// ============================================================================
// Real-time Usage Meter
// ============================================================================

export class RealTimeUsageMeter {
  private usageCache = new Map<string, number>();
  private lastReset = new Map<string, Date>();
  private limits = new Map<string, UsageLimit>();

  constructor(private tracker: UsageTracker) {}

  async trackUsage(customerId: string, featureId: string, usage: number): Promise<boolean> {
    const key = `${customerId}:${featureId}`;
    const currentUsage = this.usageCache.get(key) || 0;
    const newUsage = currentUsage + usage;

    // Check if usage is allowed
    const allowed = await this.tracker.checkUsageAllowed(customerId, featureId, usage);
    
    if (!allowed.allowed) {
      return false;
    }

    // Update cache
    this.usageCache.set(key, newUsage);

    // Track in database
    await this.tracker.trackUsage({
      customerId,
      featureId,
      usage,
      timestamp: new Date(),
    });

    return true;
  }

  async trackAIUsage(customerId: string, modelId: string, tokens: number, cost: number): Promise<boolean> {
    // Track AI usage
    await this.tracker.trackAIUsage({
      customerId,
      modelId,
      provider: 'openai', // or other provider
      tokens,
      inputTokens: Math.floor(tokens * 0.7), // Estimate
      outputTokens: Math.floor(tokens * 0.3), // Estimate
      cost,
      timestamp: new Date(),
    });

    return true;
  }

  getCurrentUsage(customerId: string, featureId: string): number {
    const key = `${customerId}:${featureId}`;
    return this.usageCache.get(key) || 0;
  }

  async resetUsage(customerId: string, featureId: string): Promise<void> {
    const key = `${customerId}:${featureId}`;
    this.usageCache.delete(key);
    this.lastReset.set(key, new Date());
  }
}

// ============================================================================
// Usage Analytics Engine
// ============================================================================

export class UsageAnalyticsEngine {
  constructor(private tracker: UsageTracker) {}

  async generateCustomerReport(customerId: string, period: string = 'month'): Promise<{
    summary: {
      totalUsage: number;
      totalCost: number;
      topFeatures: Array<{ featureId: string; usage: number; cost: number }>;
      averageDailyUsage: number;
    };
    trends: {
      usageGrowth: number;
      costGrowth: number;
      peakUsageDay: string;
      peakUsageHour: number;
    };
    recommendations: string[];
  }> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const analytics = await this.tracker.getUsageAnalytics(customerId, startDate, endDate);
    const aiAnalytics = await this.tracker.getAIUsageAnalytics(customerId, startDate, endDate);

    return {
      summary: {
        totalUsage: analytics.totalUsage,
        totalCost: analytics.totalCost + aiAnalytics.totalCost,
        topFeatures: analytics.topFeatures,
        averageDailyUsage: analytics.totalUsage / analytics.dailyBreakdown.length,
      },
      trends: {
        usageGrowth: this.calculateGrowthRate(analytics.dailyBreakdown),
        costGrowth: this.calculateGrowthRate(analytics.dailyBreakdown.map(d => ({ ...d, usage: d.cost }))),
        peakUsageDay: this.findPeakDay(analytics.dailyBreakdown),
        peakUsageHour: this.findPeakHour(analytics.dailyBreakdown),
      },
      recommendations: this.generateRecommendations(analytics, aiAnalytics),
    };
  }

  private calculateGrowthRate(data: Array<{ usage: number }>): number {
    if (data.length < 2) return 0;
    
    const first = data[0].usage;
    const last = data[data.length - 1].usage;
    
    return ((last - first) / first) * 100;
  }

  private findPeakDay(data: Array<{ date: string; usage: number }>): string {
    return data.reduce((peak, current) => 
      current.usage > peak.usage ? current : peak
    ).date;
  }

  private findPeakHour(data: Array<{ date: string; usage: number }>): number {
    // This would require hourly breakdown data
    return 14; // 2 PM as example
  }

  private generateRecommendations(analytics: any, aiAnalytics: any): string[] {
    const recommendations: string[] = [];

    if (analytics.totalCost > 1000) {
      recommendations.push('Consider upgrading to a higher tier plan to reduce per-unit costs');
    }

    if (aiAnalytics.totalTokens > 100000) {
      recommendations.push('High AI usage detected - consider implementing usage-based pricing');
    }

    if (analytics.topFeatures.length > 0) {
      const topFeature = analytics.topFeatures[0];
      recommendations.push(`Optimize usage of ${topFeature.featureId} - it's your most used feature`);
    }

    return recommendations;
  }
}
