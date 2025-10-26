'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var zod = require('zod');
var recharts = require('recharts');
var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

// src/modules/usage-tracker.ts
var UsageEventSchema = zod.z.object({
  customerId: zod.z.string(),
  featureId: zod.z.string(),
  usage: zod.z.number().positive(),
  timestamp: zod.z.date(),
  metadata: zod.z.record(zod.z.string()).optional(),
  sessionId: zod.z.string().optional(),
  userId: zod.z.string().optional()
});
var AIUsageEventSchema = zod.z.object({
  customerId: zod.z.string(),
  modelId: zod.z.string(),
  provider: zod.z.string(),
  tokens: zod.z.number().positive(),
  inputTokens: zod.z.number().nonnegative(),
  outputTokens: zod.z.number().nonnegative(),
  cost: zod.z.number().nonnegative(),
  timestamp: zod.z.date(),
  metadata: zod.z.record(zod.z.string()).optional(),
  sessionId: zod.z.string().optional(),
  userId: zod.z.string().optional()
});
var CreditBalanceSchema = zod.z.object({
  customerId: zod.z.string(),
  featureId: zod.z.string(),
  balance: zod.z.number().nonnegative(),
  limit: zod.z.number().positive().optional(),
  resetAt: zod.z.date(),
  createdAt: zod.z.date(),
  updatedAt: zod.z.date()
});
var UsageLimitSchema = zod.z.object({
  customerId: zod.z.string(),
  featureId: zod.z.string(),
  limit: zod.z.number().positive(),
  period: zod.z.enum(["day", "week", "month", "year"]),
  resetAt: zod.z.date(),
  overageAllowed: zod.z.boolean().default(false),
  overagePrice: zod.z.number().optional()
});
var RealTimeUsageMeter = class {
  constructor(tracker) {
    this.tracker = tracker;
    this.usageCache = /* @__PURE__ */ new Map();
    this.lastReset = /* @__PURE__ */ new Map();
  }
  async trackUsage(customerId, featureId, usage) {
    const key = `${customerId}:${featureId}`;
    const currentUsage = this.usageCache.get(key) || 0;
    const newUsage = currentUsage + usage;
    const allowed = await this.tracker.checkUsageAllowed(
      customerId,
      featureId,
      usage
    );
    if (!allowed.allowed) {
      return false;
    }
    this.usageCache.set(key, newUsage);
    await this.tracker.trackUsage({
      customerId,
      featureId,
      usage,
      timestamp: /* @__PURE__ */ new Date()
    });
    return true;
  }
  async trackAIUsage(customerId, modelId, tokens, cost) {
    await this.tracker.trackAIUsage({
      customerId,
      modelId,
      provider: "openai",
      // or other provider
      tokens,
      inputTokens: Math.floor(tokens * 0.7),
      // Estimate
      outputTokens: Math.floor(tokens * 0.3),
      // Estimate
      cost,
      timestamp: /* @__PURE__ */ new Date()
    });
    return true;
  }
  getCurrentUsage(customerId, featureId) {
    const key = `${customerId}:${featureId}`;
    return this.usageCache.get(key) || 0;
  }
  async resetUsage(customerId, featureId) {
    const key = `${customerId}:${featureId}`;
    this.usageCache.delete(key);
    this.lastReset.set(key, /* @__PURE__ */ new Date());
  }
};
var UsageAnalyticsEngine = class {
  constructor(tracker) {
    this.tracker = tracker;
  }
  async generateCustomerReport(customerId, period = "month") {
    const endDate = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    switch (period) {
      case "day":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    const analytics = await this.tracker.getUsageAnalytics(
      customerId,
      startDate,
      endDate
    );
    const aiAnalytics = await this.tracker.getAIUsageAnalytics(
      customerId,
      startDate,
      endDate
    );
    return {
      summary: {
        totalUsage: analytics.totalUsage,
        totalCost: analytics.totalCost + aiAnalytics.totalCost,
        topFeatures: analytics.topFeatures,
        averageDailyUsage: analytics.totalUsage / analytics.dailyBreakdown.length
      },
      trends: {
        usageGrowth: this.calculateGrowthRate(analytics.dailyBreakdown),
        costGrowth: this.calculateGrowthRate(
          analytics.dailyBreakdown.map((d) => ({ ...d, usage: d.cost }))
        ),
        peakUsageDay: this.findPeakDay(analytics.dailyBreakdown),
        peakUsageHour: this.findPeakHour(analytics.dailyBreakdown)
      },
      recommendations: this.generateRecommendations(analytics, aiAnalytics)
    };
  }
  calculateGrowthRate(data) {
    if (data.length < 2) return 0;
    const first = data[0]?.usage;
    const last = data[data.length - 1]?.usage;
    if (first === void 0 || last === void 0) return 0;
    return (last - first) / first * 100;
  }
  findPeakDay(data) {
    return data.reduce(
      (peak, current) => current.usage > peak.usage ? current : peak
    ).date;
  }
  findPeakHour(_data) {
    return 14;
  }
  generateRecommendations(analytics, aiAnalytics) {
    const recommendations = [];
    if (analytics.totalCost > 1e3) {
      recommendations.push(
        "Consider upgrading to a higher tier plan to reduce per-unit costs"
      );
    }
    if (aiAnalytics.totalTokens > 1e5) {
      recommendations.push(
        "High AI usage detected - consider implementing usage-based pricing"
      );
    }
    if (analytics.topFeatures.length > 0) {
      const topFeature = analytics.topFeatures[0];
      recommendations.push(
        `Optimize usage of ${topFeature.featureId} - it's your most used feature`
      );
    }
    return recommendations;
  }
};
var TokenUsageSchema = zod.z.object({
  modelId: zod.z.string(),
  provider: zod.z.string(),
  inputTokens: zod.z.number().nonnegative(),
  outputTokens: zod.z.number().nonnegative(),
  totalTokens: zod.z.number().nonnegative(),
  cost: zod.z.number().nonnegative(),
  timestamp: zod.z.date(),
  customerId: zod.z.string(),
  sessionId: zod.z.string().optional(),
  requestId: zod.z.string().optional()
});
var ModelPerformanceSchema = zod.z.object({
  modelId: zod.z.string(),
  provider: zod.z.string(),
  averageLatency: zod.z.number().nonnegative(),
  successRate: zod.z.number().min(0).max(1),
  errorRate: zod.z.number().min(0).max(1),
  totalRequests: zod.z.number().nonnegative(),
  totalTokens: zod.z.number().nonnegative(),
  totalCost: zod.z.number().nonnegative(),
  period: zod.z.string()
});
var CostAnalysisSchema = zod.z.object({
  customerId: zod.z.string(),
  totalCost: zod.z.number().nonnegative(),
  costByModel: zod.z.record(zod.z.string(), zod.z.number().nonnegative()),
  costByProvider: zod.z.record(zod.z.string(), zod.z.number().nonnegative()),
  costByFeature: zod.z.record(zod.z.string(), zod.z.number().nonnegative()),
  averageCostPerToken: zod.z.number().nonnegative(),
  costTrend: zod.z.array(
    zod.z.object({
      date: zod.z.string(),
      cost: zod.z.number().nonnegative()
    })
  ),
  period: zod.z.string()
});
var UsagePatternSchema = zod.z.object({
  customerId: zod.z.string(),
  peakHours: zod.z.array(zod.z.number()),
  peakDays: zod.z.array(zod.z.string()),
  averageSessionLength: zod.z.number().nonnegative(),
  averageTokensPerSession: zod.z.number().nonnegative(),
  mostUsedModels: zod.z.array(
    zod.z.object({
      modelId: zod.z.string(),
      usage: zod.z.number().nonnegative(),
      cost: zod.z.number().nonnegative()
    })
  ),
  featureUsage: zod.z.record(zod.z.string(), zod.z.number().nonnegative())
});
var AIMetricsCalculator = class {
  constructor(tokenUsages) {
    this.tokenUsages = tokenUsages;
  }
  calculateModelPerformance(modelId, period = "month") {
    const modelUsages = this.tokenUsages.filter(
      (usage) => usage.modelId === modelId
    );
    const periodUsages = this.filterByPeriod(modelUsages, period);
    if (periodUsages.length === 0) {
      return {
        modelId,
        provider: "",
        averageLatency: 0,
        successRate: 0,
        errorRate: 0,
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        period
      };
    }
    const totalTokens = periodUsages.reduce(
      (sum, usage) => sum + usage.totalTokens,
      0
    );
    const totalCost = periodUsages.reduce((sum, usage) => sum + usage.cost, 0);
    const totalRequests = periodUsages.length;
    return {
      modelId,
      provider: periodUsages[0]?.provider || "",
      averageLatency: this.calculateAverageLatency(periodUsages),
      successRate: this.calculateSuccessRate(periodUsages),
      errorRate: this.calculateErrorRate(periodUsages),
      totalRequests,
      totalTokens,
      totalCost,
      period
    };
  }
  calculateCostAnalysis(customerId, period = "month") {
    const customerUsages = this.tokenUsages.filter(
      (usage) => usage.customerId === customerId
    );
    const periodUsages = this.filterByPeriod(customerUsages, period);
    const totalCost = periodUsages.reduce((sum, usage) => sum + usage.cost, 0);
    const costByModel = this.groupBy(periodUsages, "modelId", "cost");
    const costByProvider = this.groupBy(periodUsages, "provider", "cost");
    const costByFeature = {};
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
      period
    };
  }
  calculateUsagePatterns(customerId, period = "month") {
    const customerUsages = this.tokenUsages.filter(
      (usage) => usage.customerId === customerId
    );
    const periodUsages = this.filterByPeriod(customerUsages, period);
    const peakHours = this.calculatePeakHours(periodUsages);
    const peakDays = this.calculatePeakDays(periodUsages);
    const averageSessionLength = this.calculateAverageSessionLength(periodUsages);
    const averageTokensPerSession = this.calculateAverageTokensPerSession(periodUsages);
    const mostUsedModels = this.calculateMostUsedModels(periodUsages);
    const featureUsage = {};
    return {
      customerId,
      peakHours,
      peakDays,
      averageSessionLength,
      averageTokensPerSession,
      mostUsedModels,
      featureUsage
    };
  }
  // ============================================================================
  // Private Helper Methods
  // ============================================================================
  filterByPeriod(usages, period) {
    const now = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    return usages.filter((usage) => usage.timestamp >= startDate);
  }
  calculateAverageLatency(_usages) {
    return 1500;
  }
  calculateSuccessRate(_usages) {
    return 0.95;
  }
  calculateErrorRate(usages) {
    return 1 - this.calculateSuccessRate(usages);
  }
  groupBy(usages, key, valueKey) {
    const grouped = {};
    usages.forEach((usage) => {
      const keyValue = usage[key];
      const value = usage[valueKey];
      if (!grouped[keyValue]) {
        grouped[keyValue] = 0;
      }
      grouped[keyValue] += value;
    });
    return grouped;
  }
  calculateCostTrend(usages) {
    const dailyCosts = {};
    usages.forEach((usage) => {
      const date = usage.timestamp.toISOString().split("T")[0];
      if (date) {
        if (!dailyCosts[date]) {
          dailyCosts[date] = 0;
        }
        dailyCosts[date] += usage.cost;
      }
    });
    return Object.entries(dailyCosts).map(([date, cost]) => ({ date, cost })).sort((a, b) => a.date.localeCompare(b.date));
  }
  calculatePeakHours(usages) {
    const hourlyUsage = {};
    usages.forEach((usage) => {
      const hour = usage.timestamp.getHours();
      if (!hourlyUsage[hour]) {
        hourlyUsage[hour] = 0;
      }
      hourlyUsage[hour] += usage.totalTokens;
    });
    return Object.entries(hourlyUsage).sort(([, a], [, b]) => b - a).slice(0, 3).map(([hour]) => parseInt(hour));
  }
  calculatePeakDays(usages) {
    const dailyUsage = {};
    usages.forEach((usage) => {
      const day = usage.timestamp.toLocaleDateString("en-US", {
        weekday: "long"
      });
      if (!dailyUsage[day]) {
        dailyUsage[day] = 0;
      }
      dailyUsage[day] += usage.totalTokens;
    });
    return Object.entries(dailyUsage).sort(([, a], [, b]) => b - a).slice(0, 3).map(([day]) => day);
  }
  calculateAverageSessionLength(_usages) {
    return 30;
  }
  calculateAverageTokensPerSession(usages) {
    const sessionTokens = {};
    usages.forEach((usage) => {
      const sessionId = usage.sessionId || "default";
      if (!sessionTokens[sessionId]) {
        sessionTokens[sessionId] = 0;
      }
      sessionTokens[sessionId] += usage.totalTokens;
    });
    const totalSessions = Object.keys(sessionTokens).length;
    const totalTokens = Object.values(sessionTokens).reduce(
      (sum, tokens) => sum + tokens,
      0
    );
    return totalSessions > 0 ? totalTokens / totalSessions : 0;
  }
  calculateMostUsedModels(usages) {
    const modelUsage = {};
    usages.forEach((usage) => {
      if (!modelUsage[usage.modelId]) {
        modelUsage[usage.modelId] = { usage: 0, cost: 0 };
      }
      const modelData = modelUsage[usage.modelId];
      if (modelData) {
        modelData.usage += usage.totalTokens;
        modelData.cost += usage.cost;
      }
    });
    return Object.entries(modelUsage).map(([modelId, data]) => ({ modelId, ...data })).sort((a, b) => b.usage - a.usage).slice(0, 5);
  }
};
function generateAIMetricsDashboard(tokenUsages, customerId, period = "month") {
  const calculator = new AIMetricsCalculator(tokenUsages);
  const customerUsages = tokenUsages.filter(
    (usage) => usage.customerId === customerId
  );
  const periodUsages = calculator["filterByPeriod"](customerUsages, period);
  const totalTokens = periodUsages.reduce(
    (sum, usage) => sum + usage.totalTokens,
    0
  );
  const totalCost = periodUsages.reduce((sum, usage) => sum + usage.cost, 0);
  const totalRequests = periodUsages.length;
  const uniqueModels = [...new Set(periodUsages.map((usage) => usage.modelId))];
  const modelPerformance = uniqueModels.map(
    (modelId) => calculator.calculateModelPerformance(modelId, period)
  );
  const costAnalysis = calculator.calculateCostAnalysis(customerId, period);
  const usagePatterns = calculator.calculateUsagePatterns(customerId, period);
  const trends = {
    tokenGrowth: 15.2,
    // Mock data
    costGrowth: 12.8,
    // Mock data
    requestGrowth: 8.5
    // Mock data
  };
  return {
    summary: {
      totalTokens,
      totalCost,
      averageCostPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
      totalRequests,
      averageLatency: modelPerformance.reduce((sum, perf) => sum + perf.averageLatency, 0) / modelPerformance.length,
      successRate: modelPerformance.reduce((sum, perf) => sum + perf.successRate, 0) / modelPerformance.length
    },
    modelPerformance,
    costAnalysis,
    usagePatterns,
    trends
  };
}
function CustomerDashboard({ data }) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold text-gray-700", children: "Total Usage" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-3xl font-bold text-blue-600", children: data.summary.totalUsage.toLocaleString() }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "units this month" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold text-gray-700", children: "Total Cost" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-3xl font-bold text-green-600", children: [
          "$",
          data.summary.totalCost.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "this month" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold text-gray-700", children: "Daily Average" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-3xl font-bold text-purple-600", children: data.summary.averageDailyUsage.toFixed(0) }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "units per day" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-4", children: "Usage Trends" }),
        /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.LineChart, { data: data.usage, children: [
          /* @__PURE__ */ jsxRuntime.jsx(recharts.CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.XAxis, { dataKey: "date" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.YAxis, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Tooltip, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Line, { type: "monotone", dataKey: "usage", stroke: "#8884d8", strokeWidth: 2 })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-4", children: "AI Usage Trends" }),
        /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.LineChart, { data: data.aiUsage, children: [
          /* @__PURE__ */ jsxRuntime.jsx(recharts.CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.XAxis, { dataKey: "date" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.YAxis, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Tooltip, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Line, { type: "monotone", dataKey: "tokens", stroke: "#82ca9d", strokeWidth: 2 })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-4", children: "Top Features" }),
        /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.BarChart, { data: data.topFeatures, children: [
          /* @__PURE__ */ jsxRuntime.jsx(recharts.CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.XAxis, { dataKey: "featureId" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.YAxis, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Tooltip, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Bar, { dataKey: "usage", fill: "#8884d8" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-4", children: "AI Model Usage" }),
        /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.PieChart, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            recharts.Pie,
            {
              data: data.topModels,
              cx: "50%",
              cy: "50%",
              labelLine: false,
              label: ({ modelId, percent }) => `${modelId} ${(percent * 100).toFixed(0)}%`,
              outerRadius: 80,
              fill: "#8884d8",
              dataKey: "tokens",
              children: data.topModels.map((_, index) => /* @__PURE__ */ jsxRuntime.jsx(recharts.Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Tooltip, {})
        ] }) })
      ] })
    ] })
  ] });
}
function UsageMeter({ current, limit, featureId, resetAt }) {
  const percentage = current / limit * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage > 100;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold", children: featureId }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "span",
        {
          className: `text-sm font-medium ${isOverLimit ? "text-red-600" : isNearLimit ? "text-yellow-600" : "text-green-600"}`,
          children: [
            current.toLocaleString(),
            " / ",
            limit.toLocaleString()
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5", children: /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: `h-2.5 rounded-full ${isOverLimit ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : "bg-green-500"}`,
        style: { width: `${Math.min(percentage, 100)}%` }
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-sm text-gray-500 mt-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
        "Reset: ",
        resetAt.toLocaleDateString()
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
        percentage.toFixed(1),
        "% used"
      ] })
    ] })
  ] });
}
function AIUsageDashboard({ data }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold text-gray-700", children: "Total Tokens" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-3xl font-bold text-blue-600", children: data.totalTokens.toLocaleString() }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "tokens processed" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold text-gray-700", children: "Total Cost" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-3xl font-bold text-green-600", children: [
          "$",
          data.totalCost.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "AI usage cost" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold text-gray-700", children: "Avg Cost/Token" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-3xl font-bold text-purple-600", children: [
          "$",
          (data.totalCost / data.totalTokens).toFixed(6)
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "per token" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-4", children: "Token Usage Over Time" }),
        /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.LineChart, { data: data.dailyBreakdown, children: [
          /* @__PURE__ */ jsxRuntime.jsx(recharts.CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.XAxis, { dataKey: "date" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.YAxis, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Tooltip, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Line, { type: "monotone", dataKey: "tokens", stroke: "#8884d8", strokeWidth: 2 })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-4", children: "Usage by Hour" }),
        /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.BarChart, { data: data.hourlyBreakdown, children: [
          /* @__PURE__ */ jsxRuntime.jsx(recharts.CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.XAxis, { dataKey: "hour" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.YAxis, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Tooltip, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Bar, { dataKey: "tokens", fill: "#82ca9d" })
        ] }) })
      ] })
    ] })
  ] });
}
var CarnilAnalytics = class {
  constructor(usageTracker) {
    this.usageTracker = usageTracker;
    this.realTimeMeter = new RealTimeUsageMeter(usageTracker);
    this.analyticsEngine = new UsageAnalyticsEngine(usageTracker);
  }
  // Usage tracking methods
  async trackUsage(customerId, featureId, usage) {
    return this.realTimeMeter.trackUsage(customerId, featureId, usage);
  }
  async trackAIUsage(customerId, modelId, tokens, cost) {
    return this.realTimeMeter.trackAIUsage(customerId, modelId, tokens, cost);
  }
  // Analytics methods
  async getCustomerReport(customerId, period = "month") {
    return this.analyticsEngine.generateCustomerReport(customerId, period);
  }
  async getUsageMetrics(customerId, featureId, period) {
    return this.usageTracker.getUsageMetrics(customerId, featureId, period);
  }
  async getAIUsageMetrics(customerId, modelId, period) {
    return this.usageTracker.getAIUsageMetrics(customerId, modelId, period);
  }
  // Credit and limit management
  async getCreditBalance(customerId, featureId) {
    return this.usageTracker.getCreditBalance(customerId, featureId);
  }
  async updateCreditBalance(customerId, featureId, amount) {
    return this.usageTracker.updateCreditBalance(customerId, featureId, amount);
  }
  async setUsageLimit(customerId, limit) {
    return this.usageTracker.setUsageLimit(customerId, limit);
  }
  async checkUsageAllowed(customerId, featureId, requiredUsage) {
    return this.usageTracker.checkUsageAllowed(customerId, featureId, requiredUsage);
  }
};
function useAnalytics(customerId) {
  const [analytics, setAnalytics] = react.useState(null);
  const [loading, setLoading] = react.useState(true);
  const [error, setError] = react.useState(null);
  react.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const mockData = {
          summary: {
            totalUsage: 1250,
            totalCost: 89.5,
            averageDailyUsage: 42
          },
          usage: [
            { date: "2024-01-01", usage: 45, cost: 3.2 },
            { date: "2024-01-02", usage: 52, cost: 3.7 },
            { date: "2024-01-03", usage: 38, cost: 2.8 }
          ],
          aiUsage: [
            { date: "2024-01-01", tokens: 1200, cost: 0.24 },
            { date: "2024-01-02", tokens: 1500, cost: 0.3 },
            { date: "2024-01-03", tokens: 980, cost: 0.2 }
          ],
          topFeatures: [
            { featureId: "api-calls", usage: 800, cost: 45 },
            { featureId: "ai-processing", usage: 450, cost: 44.5 }
          ],
          topModels: [
            { modelId: "gpt-4", tokens: 2e3, cost: 0.4 },
            { modelId: "gpt-3.5-turbo", tokens: 1500, cost: 0.15 }
          ]
        };
        setAnalytics(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics");
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
function useUsageMeter(customerId, featureId) {
  const [usage, setUsage] = react.useState({ current: 0, limit: 1e3, resetAt: /* @__PURE__ */ new Date() });
  const [loading, setLoading] = react.useState(true);
  react.useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const mockUsage = {
          current: 750,
          limit: 1e3,
          resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3)
          // 7 days from now
        };
        setUsage(mockUsage);
      } catch (err) {
        console.error("Failed to fetch usage data:", err);
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
var index_default = CarnilAnalytics;

exports.AIMetricsCalculator = AIMetricsCalculator;
exports.AIUsageDashboard = AIUsageDashboard;
exports.AIUsageEventSchema = AIUsageEventSchema;
exports.CarnilAnalytics = CarnilAnalytics;
exports.CostAnalysisSchema = CostAnalysisSchema;
exports.CreditBalanceSchema = CreditBalanceSchema;
exports.CustomerDashboard = CustomerDashboard;
exports.ModelPerformanceSchema = ModelPerformanceSchema;
exports.RealTimeUsageMeter = RealTimeUsageMeter;
exports.TokenUsageSchema = TokenUsageSchema;
exports.UsageAnalyticsEngine = UsageAnalyticsEngine;
exports.UsageEventSchema = UsageEventSchema;
exports.UsageLimitSchema = UsageLimitSchema;
exports.UsageMeter = UsageMeter;
exports.UsagePatternSchema = UsagePatternSchema;
exports.default = index_default;
exports.generateAIMetricsDashboard = generateAIMetricsDashboard;
exports.useAnalytics = useAnalytics;
exports.useUsageMeter = useUsageMeter;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map