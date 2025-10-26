import { z } from 'zod';
import * as react_jsx_runtime from 'react/jsx-runtime';

declare const UsageEventSchema: z.ZodObject<{
    customerId: z.ZodString;
    featureId: z.ZodString;
    usage: z.ZodNumber;
    timestamp: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    sessionId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    featureId: string;
    usage: number;
    timestamp: Date;
    metadata?: Record<string, string> | undefined;
    sessionId?: string | undefined;
    userId?: string | undefined;
}, {
    customerId: string;
    featureId: string;
    usage: number;
    timestamp: Date;
    metadata?: Record<string, string> | undefined;
    sessionId?: string | undefined;
    userId?: string | undefined;
}>;
declare const AIUsageEventSchema: z.ZodObject<{
    customerId: z.ZodString;
    modelId: z.ZodString;
    provider: z.ZodString;
    tokens: z.ZodNumber;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    cost: z.ZodNumber;
    timestamp: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    sessionId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    timestamp: Date;
    modelId: string;
    provider: string;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    metadata?: Record<string, string> | undefined;
    sessionId?: string | undefined;
    userId?: string | undefined;
}, {
    customerId: string;
    timestamp: Date;
    modelId: string;
    provider: string;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    metadata?: Record<string, string> | undefined;
    sessionId?: string | undefined;
    userId?: string | undefined;
}>;
declare const CreditBalanceSchema: z.ZodObject<{
    customerId: z.ZodString;
    featureId: z.ZodString;
    balance: z.ZodNumber;
    limit: z.ZodOptional<z.ZodNumber>;
    resetAt: z.ZodDate;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    featureId: string;
    balance: number;
    resetAt: Date;
    createdAt: Date;
    updatedAt: Date;
    limit?: number | undefined;
}, {
    customerId: string;
    featureId: string;
    balance: number;
    resetAt: Date;
    createdAt: Date;
    updatedAt: Date;
    limit?: number | undefined;
}>;
declare const UsageLimitSchema: z.ZodObject<{
    customerId: z.ZodString;
    featureId: z.ZodString;
    limit: z.ZodNumber;
    period: z.ZodEnum<["day", "week", "month", "year"]>;
    resetAt: z.ZodDate;
    overageAllowed: z.ZodDefault<z.ZodBoolean>;
    overagePrice: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    featureId: string;
    limit: number;
    resetAt: Date;
    period: "month" | "day" | "week" | "year";
    overageAllowed: boolean;
    overagePrice?: number | undefined;
}, {
    customerId: string;
    featureId: string;
    limit: number;
    resetAt: Date;
    period: "month" | "day" | "week" | "year";
    overageAllowed?: boolean | undefined;
    overagePrice?: number | undefined;
}>;
type UsageEvent = z.infer<typeof UsageEventSchema>;
type AIUsageEvent = z.infer<typeof AIUsageEventSchema>;
type CreditBalance = z.infer<typeof CreditBalanceSchema>;
type UsageLimit = z.infer<typeof UsageLimitSchema>;
interface UsageTracker {
    trackUsage(event: UsageEvent): Promise<void>;
    trackAIUsage(event: AIUsageEvent): Promise<void>;
    getUsageMetrics(customerId: string, featureId: string, period: string): Promise<UsageEvent[]>;
    getAIUsageMetrics(customerId: string, modelId?: string, period?: string): Promise<AIUsageEvent[]>;
    getCreditBalance(customerId: string, featureId: string): Promise<CreditBalance | null>;
    updateCreditBalance(customerId: string, featureId: string, amount: number): Promise<CreditBalance>;
    setUsageLimit(customerId: string, limit: UsageLimit): Promise<void>;
    getUsageLimit(customerId: string, featureId: string): Promise<UsageLimit | null>;
    checkUsageAllowed(customerId: string, featureId: string, requiredUsage: number): Promise<{
        allowed: boolean;
        remaining: number;
        limit: number;
        resetAt: Date;
    }>;
    getUsageAnalytics(customerId: string, startDate: Date, endDate: Date): Promise<{
        totalUsage: number;
        totalCost: number;
        topFeatures: Array<{
            featureId: string;
            usage: number;
            cost: number;
        }>;
        dailyBreakdown: Array<{
            date: string;
            usage: number;
            cost: number;
        }>;
    }>;
    getAIUsageAnalytics(customerId: string, startDate: Date, endDate: Date): Promise<{
        totalTokens: number;
        totalCost: number;
        topModels: Array<{
            modelId: string;
            tokens: number;
            cost: number;
        }>;
        dailyBreakdown: Array<{
            date: string;
            tokens: number;
            cost: number;
        }>;
    }>;
}
declare class RealTimeUsageMeter {
    private tracker;
    private usageCache;
    private lastReset;
    constructor(tracker: UsageTracker);
    trackUsage(customerId: string, featureId: string, usage: number): Promise<boolean>;
    trackAIUsage(customerId: string, modelId: string, tokens: number, cost: number): Promise<boolean>;
    getCurrentUsage(customerId: string, featureId: string): number;
    resetUsage(customerId: string, featureId: string): Promise<void>;
}
declare class UsageAnalyticsEngine {
    private tracker;
    constructor(tracker: UsageTracker);
    generateCustomerReport(customerId: string, period?: string): Promise<{
        summary: {
            totalUsage: number;
            totalCost: number;
            topFeatures: Array<{
                featureId: string;
                usage: number;
                cost: number;
            }>;
            averageDailyUsage: number;
        };
        trends: {
            usageGrowth: number;
            costGrowth: number;
            peakUsageDay: string;
            peakUsageHour: number;
        };
        recommendations: string[];
    }>;
    private calculateGrowthRate;
    private findPeakDay;
    private findPeakHour;
    private generateRecommendations;
}

declare const TokenUsageSchema: z.ZodObject<{
    modelId: z.ZodString;
    provider: z.ZodString;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    totalTokens: z.ZodNumber;
    cost: z.ZodNumber;
    timestamp: z.ZodDate;
    customerId: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    timestamp: Date;
    modelId: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    totalTokens: number;
    sessionId?: string | undefined;
    requestId?: string | undefined;
}, {
    customerId: string;
    timestamp: Date;
    modelId: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    totalTokens: number;
    sessionId?: string | undefined;
    requestId?: string | undefined;
}>;
declare const ModelPerformanceSchema: z.ZodObject<{
    modelId: z.ZodString;
    provider: z.ZodString;
    averageLatency: z.ZodNumber;
    successRate: z.ZodNumber;
    errorRate: z.ZodNumber;
    totalRequests: z.ZodNumber;
    totalTokens: z.ZodNumber;
    totalCost: z.ZodNumber;
    period: z.ZodString;
}, "strip", z.ZodTypeAny, {
    modelId: string;
    provider: string;
    period: string;
    totalTokens: number;
    averageLatency: number;
    successRate: number;
    errorRate: number;
    totalRequests: number;
    totalCost: number;
}, {
    modelId: string;
    provider: string;
    period: string;
    totalTokens: number;
    averageLatency: number;
    successRate: number;
    errorRate: number;
    totalRequests: number;
    totalCost: number;
}>;
declare const CostAnalysisSchema: z.ZodObject<{
    customerId: z.ZodString;
    totalCost: z.ZodNumber;
    costByModel: z.ZodRecord<z.ZodString, z.ZodNumber>;
    costByProvider: z.ZodRecord<z.ZodString, z.ZodNumber>;
    costByFeature: z.ZodRecord<z.ZodString, z.ZodNumber>;
    averageCostPerToken: z.ZodNumber;
    costTrend: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        cost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        cost: number;
        date: string;
    }, {
        cost: number;
        date: string;
    }>, "many">;
    period: z.ZodString;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    period: string;
    totalCost: number;
    costByModel: Record<string, number>;
    costByProvider: Record<string, number>;
    costByFeature: Record<string, number>;
    averageCostPerToken: number;
    costTrend: {
        cost: number;
        date: string;
    }[];
}, {
    customerId: string;
    period: string;
    totalCost: number;
    costByModel: Record<string, number>;
    costByProvider: Record<string, number>;
    costByFeature: Record<string, number>;
    averageCostPerToken: number;
    costTrend: {
        cost: number;
        date: string;
    }[];
}>;
declare const UsagePatternSchema: z.ZodObject<{
    customerId: z.ZodString;
    peakHours: z.ZodArray<z.ZodNumber, "many">;
    peakDays: z.ZodArray<z.ZodString, "many">;
    averageSessionLength: z.ZodNumber;
    averageTokensPerSession: z.ZodNumber;
    mostUsedModels: z.ZodArray<z.ZodObject<{
        modelId: z.ZodString;
        usage: z.ZodNumber;
        cost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        usage: number;
        modelId: string;
        cost: number;
    }, {
        usage: number;
        modelId: string;
        cost: number;
    }>, "many">;
    featureUsage: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    peakHours: number[];
    peakDays: string[];
    averageSessionLength: number;
    averageTokensPerSession: number;
    mostUsedModels: {
        usage: number;
        modelId: string;
        cost: number;
    }[];
    featureUsage: Record<string, number>;
}, {
    customerId: string;
    peakHours: number[];
    peakDays: string[];
    averageSessionLength: number;
    averageTokensPerSession: number;
    mostUsedModels: {
        usage: number;
        modelId: string;
        cost: number;
    }[];
    featureUsage: Record<string, number>;
}>;
type TokenUsage = z.infer<typeof TokenUsageSchema>;
type ModelPerformance = z.infer<typeof ModelPerformanceSchema>;
type CostAnalysis = z.infer<typeof CostAnalysisSchema>;
type UsagePattern = z.infer<typeof UsagePatternSchema>;
declare class AIMetricsCalculator {
    private tokenUsages;
    constructor(tokenUsages: TokenUsage[]);
    calculateModelPerformance(modelId: string, period?: string): ModelPerformance;
    calculateCostAnalysis(customerId: string, period?: string): CostAnalysis;
    calculateUsagePatterns(customerId: string, period?: string): UsagePattern;
    private filterByPeriod;
    private calculateAverageLatency;
    private calculateSuccessRate;
    private calculateErrorRate;
    private groupBy;
    private calculateCostTrend;
    private calculatePeakHours;
    private calculatePeakDays;
    private calculateAverageSessionLength;
    private calculateAverageTokensPerSession;
    private calculateMostUsedModels;
}
interface AIMetricsDashboardData {
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
declare function generateAIMetricsDashboard(tokenUsages: TokenUsage[], customerId: string, period?: string): AIMetricsDashboardData;

interface CustomerDashboardProps {
    customerId: string;
    data: {
        usage: Array<{
            date: string;
            usage: number;
            cost: number;
        }>;
        aiUsage: Array<{
            date: string;
            tokens: number;
            cost: number;
        }>;
        topFeatures: Array<{
            featureId: string;
            usage: number;
            cost: number;
        }>;
        topModels: Array<{
            modelId: string;
            tokens: number;
            cost: number;
        }>;
        summary: {
            totalUsage: number;
            totalCost: number;
            averageDailyUsage: number;
        };
    };
}
declare function CustomerDashboard({ data }: CustomerDashboardProps): react_jsx_runtime.JSX.Element;
interface UsageMeterProps {
    current: number;
    limit: number;
    featureId: string;
    resetAt: Date;
}
declare function UsageMeter({ current, limit, featureId, resetAt }: UsageMeterProps): react_jsx_runtime.JSX.Element;
interface AIUsageDashboardProps {
    customerId: string;
    data: {
        totalTokens: number;
        totalCost: number;
        topModels: Array<{
            modelId: string;
            tokens: number;
            cost: number;
        }>;
        dailyBreakdown: Array<{
            date: string;
            tokens: number;
            cost: number;
        }>;
        hourlyBreakdown: Array<{
            hour: number;
            tokens: number;
            cost: number;
        }>;
    };
}
declare function AIUsageDashboard({ data }: AIUsageDashboardProps): react_jsx_runtime.JSX.Element;

declare class CarnilAnalytics {
    private usageTracker;
    private realTimeMeter;
    private analyticsEngine;
    constructor(usageTracker: UsageTracker);
    trackUsage(customerId: string, featureId: string, usage: number): Promise<boolean>;
    trackAIUsage(customerId: string, modelId: string, tokens: number, cost: number): Promise<boolean>;
    getCustomerReport(customerId: string, period?: string): Promise<{
        summary: {
            totalUsage: number;
            totalCost: number;
            topFeatures: Array<{
                featureId: string;
                usage: number;
                cost: number;
            }>;
            averageDailyUsage: number;
        };
        trends: {
            usageGrowth: number;
            costGrowth: number;
            peakUsageDay: string;
            peakUsageHour: number;
        };
        recommendations: string[];
    }>;
    getUsageMetrics(customerId: string, featureId: string, period: string): Promise<{
        customerId: string;
        featureId: string;
        usage: number;
        timestamp: Date;
        metadata?: Record<string, string> | undefined;
        sessionId?: string | undefined;
        userId?: string | undefined;
    }[]>;
    getAIUsageMetrics(customerId: string, modelId?: string, period?: string): Promise<{
        customerId: string;
        timestamp: Date;
        modelId: string;
        provider: string;
        tokens: number;
        inputTokens: number;
        outputTokens: number;
        cost: number;
        metadata?: Record<string, string> | undefined;
        sessionId?: string | undefined;
        userId?: string | undefined;
    }[]>;
    getCreditBalance(customerId: string, featureId: string): Promise<{
        customerId: string;
        featureId: string;
        balance: number;
        resetAt: Date;
        createdAt: Date;
        updatedAt: Date;
        limit?: number | undefined;
    } | null>;
    updateCreditBalance(customerId: string, featureId: string, amount: number): Promise<{
        customerId: string;
        featureId: string;
        balance: number;
        resetAt: Date;
        createdAt: Date;
        updatedAt: Date;
        limit?: number | undefined;
    }>;
    setUsageLimit(customerId: string, limit: any): Promise<void>;
    checkUsageAllowed(customerId: string, featureId: string, requiredUsage: number): Promise<{
        allowed: boolean;
        remaining: number;
        limit: number;
        resetAt: Date;
    }>;
}
declare function useAnalytics(customerId: string): {
    analytics: any;
    loading: boolean;
    error: string | null;
};
declare function useUsageMeter(customerId: string, featureId: string): {
    usage: {
        current: number;
        limit: number;
        resetAt: Date;
    };
    loading: boolean;
};

export { AIMetricsCalculator, type AIMetricsDashboardData, AIUsageDashboard, type AIUsageEvent, AIUsageEventSchema, CarnilAnalytics, type CostAnalysis, CostAnalysisSchema, type CreditBalance, CreditBalanceSchema, CustomerDashboard, type ModelPerformance, ModelPerformanceSchema, RealTimeUsageMeter, type TokenUsage, TokenUsageSchema, UsageAnalyticsEngine, type UsageEvent, UsageEventSchema, type UsageLimit, UsageLimitSchema, UsageMeter, type UsagePattern, UsagePatternSchema, type UsageTracker, CarnilAnalytics as default, generateAIMetricsDashboard, useAnalytics, useUsageMeter };
