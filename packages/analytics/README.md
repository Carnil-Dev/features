# @carnil/analytics

[![npm version](https://badge.fury.io/js/%40carnil%2Fanalytics.svg)](https://badge.fury.io/js/%40carnil%2Fanalytics)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Analytics dashboard and usage tracking for Carnil unified payments platform. This package provides comprehensive analytics tools, real-time usage monitoring, and AI usage tracking capabilities.

## Features

- 📊 **Real-time Analytics** - Live usage tracking and monitoring
- 🤖 **AI Usage Tracking** - Track AI model usage, tokens, and costs
- 📈 **Usage Dashboards** - Pre-built React components for analytics
- 💳 **Credit Management** - Credit balance and limit tracking
- 📋 **Usage Reports** - Detailed customer usage reports
- 🔄 **Real-time Meter** - Live usage monitoring
- 📱 **React Hooks** - Easy integration with React applications

## Installation

```bash
npm install @carnil/analytics
```

## Peer Dependencies

```bash
npm install react react-dom recharts
```

## Quick Start

```typescript
import { CarnilAnalytics, UsageTracker } from "@carnil/analytics";

// Initialize analytics
const usageTracker = new UsageTracker({
  // Your configuration
});

const analytics = new CarnilAnalytics(usageTracker);

// Track usage
await analytics.trackUsage("customer_123", "api_calls", 100);

// Track AI usage
await analytics.trackAIUsage("customer_123", "gpt-4", 1000, 0.02);

// Get usage metrics
const metrics = await analytics.getUsageMetrics(
  "customer_123",
  "api_calls",
  "month"
);
```

## React Integration

### Using Analytics Hooks

```tsx
import { useAnalytics, useUsageMeter } from "@carnil/analytics";

function CustomerDashboard({ customerId }: { customerId: string }) {
  const { analytics, loading, error } = useAnalytics(customerId);
  const { usage, loading: usageLoading } = useUsageMeter(
    customerId,
    "api_calls"
  );

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Usage Summary</h2>
      <p>Total Usage: {analytics?.summary.totalUsage}</p>
      <p>Total Cost: ${analytics?.summary.totalCost}</p>

      <h3>Current Usage</h3>
      <p>
        Used: {usage.current} / {usage.limit}
      </p>
      <p>Reset: {usage.resetAt.toLocaleDateString()}</p>
    </div>
  );
}
```

### Using Dashboard Components

```tsx
import { CustomerDashboard } from "@carnil/analytics";

function App() {
  return (
    <div>
      <CustomerDashboard customerId="customer_123" />
    </div>
  );
}
```

## API Reference

### CarnilAnalytics Class

```typescript
class CarnilAnalytics {
  constructor(usageTracker: UsageTracker);

  // Usage tracking
  trackUsage(
    customerId: string,
    featureId: string,
    usage: number
  ): Promise<boolean>;
  trackAIUsage(
    customerId: string,
    modelId: string,
    tokens: number,
    cost: number
  ): Promise<boolean>;

  // Analytics
  getCustomerReport(
    customerId: string,
    period?: string
  ): Promise<CustomerReport>;
  getUsageMetrics(
    customerId: string,
    featureId: string,
    period: string
  ): Promise<UsageMetrics[]>;
  getAIUsageMetrics(
    customerId: string,
    modelId?: string,
    period?: string
  ): Promise<AIUsageMetrics[]>;

  // Credit management
  getCreditBalance(customerId: string, featureId: string): Promise<number>;
  updateCreditBalance(
    customerId: string,
    featureId: string,
    amount: number
  ): Promise<boolean>;
  setUsageLimit(customerId: string, limit: UsageLimit): Promise<boolean>;
  checkUsageAllowed(
    customerId: string,
    featureId: string,
    requiredUsage: number
  ): Promise<boolean>;
}
```

### UsageTracker Class

```typescript
class UsageTracker {
  constructor(config: UsageTrackerConfig);

  // Core tracking methods
  trackUsage(
    customerId: string,
    featureId: string,
    usage: number
  ): Promise<boolean>;
  trackAIUsage(
    customerId: string,
    modelId: string,
    tokens: number,
    cost: number
  ): Promise<boolean>;

  // Metrics retrieval
  getUsageMetrics(
    customerId: string,
    featureId: string,
    period: string
  ): Promise<UsageMetrics[]>;
  getAIUsageMetrics(
    customerId: string,
    modelId?: string,
    period?: string
  ): Promise<AIUsageMetrics[]>;

  // Credit management
  getCreditBalance(customerId: string, featureId: string): Promise<number>;
  updateCreditBalance(
    customerId: string,
    featureId: string,
    amount: number
  ): Promise<boolean>;
  setUsageLimit(customerId: string, limit: UsageLimit): Promise<boolean>;
  checkUsageAllowed(
    customerId: string,
    featureId: string,
    requiredUsage: number
  ): Promise<boolean>;
}
```

### RealTimeUsageMeter Class

```typescript
class RealTimeUsageMeter {
  constructor(usageTracker: UsageTracker);

  trackUsage(
    customerId: string,
    featureId: string,
    usage: number
  ): Promise<boolean>;
  trackAIUsage(
    customerId: string,
    modelId: string,
    tokens: number,
    cost: number
  ): Promise<boolean>;

  // Real-time monitoring
  getCurrentUsage(customerId: string, featureId: string): Promise<number>;
  getUsageRate(customerId: string, featureId: string): Promise<number>;
}
```

### UsageAnalyticsEngine Class

```typescript
class UsageAnalyticsEngine {
  constructor(usageTracker: UsageTracker);

  generateCustomerReport(
    customerId: string,
    period: string
  ): Promise<CustomerReport>;
  generateUsageTrends(
    customerId: string,
    featureId: string,
    period: string
  ): Promise<UsageTrend[]>;
  generateCostAnalysis(
    customerId: string,
    period: string
  ): Promise<CostAnalysis>;
}
```

## React Hooks

### useAnalytics

```typescript
function useAnalytics(customerId: string): {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
};
```

### useUsageMeter

```typescript
function useUsageMeter(
  customerId: string,
  featureId: string
): {
  usage: {
    current: number;
    limit: number;
    resetAt: Date;
  };
  loading: boolean;
};
```

## Types

### UsageMetrics

```typescript
interface UsageMetrics {
  customerId: string;
  featureId: string;
  usage: number;
  cost: number;
  timestamp: Date;
  period: string;
}
```

### AIUsageMetrics

```typescript
interface AIUsageMetrics {
  customerId: string;
  modelId: string;
  tokens: number;
  cost: number;
  timestamp: Date;
  period?: string;
}
```

### CustomerReport

```typescript
interface CustomerReport {
  summary: {
    totalUsage: number;
    totalCost: number;
    averageDailyUsage: number;
  };
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
}
```

### UsageLimit

```typescript
interface UsageLimit {
  featureId: string;
  limit: number;
  period: "daily" | "weekly" | "monthly";
  resetAt: Date;
}
```

## Dashboard Components

### CustomerDashboard

A comprehensive dashboard component showing customer usage analytics.

```tsx
import { CustomerDashboard } from "@carnil/analytics";

<CustomerDashboard
  customerId="customer_123"
  period="month"
  showAIUsage={true}
  showCostBreakdown={true}
/>;
```

## Configuration

### UsageTrackerConfig

```typescript
interface UsageTrackerConfig {
  // Database connection
  database?: {
    url: string;
    // ... other database options
  };

  // Real-time settings
  realTime?: {
    enabled: boolean;
    updateInterval: number; // milliseconds
  };

  // Caching
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
  };
}
```

## Examples

### Basic Usage Tracking

```typescript
import { UsageTracker } from "@carnil/analytics";

const tracker = new UsageTracker({
  // Your configuration
});

// Track API calls
await tracker.trackUsage("customer_123", "api_calls", 1);

// Track AI usage
await tracker.trackAIUsage("customer_123", "gpt-4", 1000, 0.02);

// Check if usage is allowed
const allowed = await tracker.checkUsageAllowed("customer_123", "api_calls", 1);
if (!allowed) {
  throw new Error("Usage limit exceeded");
}
```

### Credit Management

```typescript
// Get credit balance
const balance = await tracker.getCreditBalance("customer_123", "api_calls");

// Update credit balance
await tracker.updateCreditBalance("customer_123", "api_calls", 100);

// Set usage limit
await tracker.setUsageLimit("customer_123", {
  featureId: "api_calls",
  limit: 1000,
  period: "monthly",
  resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});
```

### Real-time Monitoring

```typescript
import { RealTimeUsageMeter } from "@carnil/analytics";

const meter = new RealTimeUsageMeter(tracker);

// Track usage in real-time
await meter.trackUsage("customer_123", "api_calls", 1);

// Get current usage
const currentUsage = await meter.getCurrentUsage("customer_123", "api_calls");

// Get usage rate (usage per minute)
const rate = await meter.getUsageRate("customer_123", "api_calls");
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Carnil-Dev/carnil-sdk/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [Carnil Team](https://carnil.dev)

## Support

- 📖 [Documentation](https://docs.carnil.dev)
- 💬 [Discord Community](https://discord.gg/carnil)
- 🐛 [Report Issues](https://github.com/Carnil-Dev/carnil-sdk/issues)
- 📧 [Email Support](mailto:hello@carnil.dev)
