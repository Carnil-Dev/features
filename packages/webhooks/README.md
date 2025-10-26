# @carnil/webhooks

[![npm version](https://badge.fury.io/js/%40carnil%2Fwebhooks.svg)](https://badge.fury.io/js/%40carnil%2Fwebhooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Webhook management system for Carnil unified payments platform. This package provides a comprehensive event bus system for handling webhooks, event routing, and real-time notifications.

## Features

- 🚀 **Event Bus** - Centralized event management system
- 🔗 **Webhook Routing** - Intelligent webhook routing and delivery
- 📡 **Real-time Events** - Live event streaming and notifications
- 🔒 **Security** - Webhook signature verification and authentication
- 📊 **Event Analytics** - Event tracking and analytics
- 🔄 **Retry Logic** - Automatic retry with exponential backoff
- 📝 **Event Logging** - Comprehensive event logging and debugging

## Installation

```bash
npm install @carnil/webhooks
```

## Quick Start

```typescript
import { EventBus, WebhookManager } from "@carnil/webhooks";

// Initialize event bus
const eventBus = new EventBus({
  redis: {
    host: "localhost",
    port: 6379,
  },
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
  },
});

// Initialize webhook manager
const webhookManager = new WebhookManager({
  eventBus,
  webhookSecret: "your_webhook_secret",
});

// Register event handlers
eventBus.on("payment.succeeded", async (event) => {
  console.log("Payment succeeded:", event.data);
});

eventBus.on("payment.failed", async (event) => {
  console.log("Payment failed:", event.data);
});

// Publish events
await eventBus.publish("payment.succeeded", {
  paymentId: "pi_123",
  amount: 2000,
  currency: "usd",
  customerId: "cus_123",
});

// Register webhook endpoints
await webhookManager.registerEndpoint({
  url: "https://your-app.com/webhooks",
  events: ["payment.succeeded", "payment.failed"],
  secret: "your_endpoint_secret",
});
```

## API Reference

### EventBus Class

```typescript
class EventBus {
  constructor(config: EventBusConfig);

  // Event publishing
  publish(
    eventType: string,
    data: any,
    options?: PublishOptions
  ): Promise<void>;
  publishBatch(events: Event[]): Promise<void>;

  // Event subscription
  on(eventType: string, handler: EventHandler): void;
  off(eventType: string, handler: EventHandler): void;
  once(eventType: string, handler: EventHandler): void;

  // Event querying
  getEvents(filters: EventFilters): Promise<Event[]>;
  getEventById(eventId: string): Promise<Event | null>;

  // Event management
  subscribe(pattern: string, handler: EventHandler): void;
  unsubscribe(pattern: string, handler: EventHandler): void;

  // Health and monitoring
  healthCheck(): Promise<boolean>;
  getMetrics(): Promise<EventBusMetrics>;
}
```

### WebhookManager Class

```typescript
class WebhookManager {
  constructor(config: WebhookManagerConfig);

  // Webhook registration
  registerEndpoint(endpoint: WebhookEndpoint): Promise<void>;
  unregisterEndpoint(endpointId: string): Promise<void>;
  updateEndpoint(
    endpointId: string,
    updates: Partial<WebhookEndpoint>
  ): Promise<void>;

  // Webhook delivery
  deliverWebhook(endpointId: string, event: Event): Promise<WebhookDelivery>;
  deliverWebhookBatch(
    endpointId: string,
    events: Event[]
  ): Promise<WebhookDelivery[]>;

  // Webhook verification
  verifyWebhook(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean>;
  parseWebhook(
    payload: string,
    signature: string,
    secret: string
  ): Promise<Event>;

  // Webhook management
  getEndpoints(): Promise<WebhookEndpoint[]>;
  getEndpoint(endpointId: string): Promise<WebhookEndpoint | null>;
  getDeliveryHistory(endpointId: string): Promise<WebhookDelivery[]>;

  // Webhook testing
  testEndpoint(endpointId: string): Promise<WebhookTestResult>;
  sendTestWebhook(
    endpointId: string,
    eventType: string
  ): Promise<WebhookDelivery>;
}
```

## Types

### EventBusConfig

```typescript
interface EventBusConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffMs: number;
  };
  enablePersistence?: boolean;
  enableMetrics?: boolean;
}
```

### WebhookManagerConfig

```typescript
interface WebhookManagerConfig {
  eventBus: EventBus;
  webhookSecret: string;
  deliveryTimeout?: number; // milliseconds
  maxRetries?: number;
  retryBackoff?: number; // milliseconds
  enableSignatureVerification?: boolean;
}
```

### Event

```typescript
interface Event {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  source: string;
  version: string;
  metadata?: Record<string, any>;
}
```

### WebhookEndpoint

```typescript
interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
  };
  headers?: Record<string, string>;
  metadata?: Record<string, any>;
}
```

### WebhookDelivery

```typescript
interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventId: string;
  status: "pending" | "delivered" | "failed" | "retrying";
  attempts: number;
  lastAttempt?: Date;
  nextRetry?: Date;
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  };
  error?: string;
  deliveredAt?: Date;
}
```

## Event Bus Usage

### Basic Event Publishing

```typescript
import { EventBus } from "@carnil/webhooks";

const eventBus = new EventBus({
  redis: {
    host: "localhost",
    port: 6379,
  },
});

// Publish a single event
await eventBus.publish("payment.succeeded", {
  paymentId: "pi_123",
  amount: 2000,
  currency: "usd",
  customerId: "cus_123",
});

// Publish multiple events
await eventBus.publishBatch([
  {
    type: "payment.succeeded",
    data: { paymentId: "pi_123", amount: 2000 },
  },
  {
    type: "invoice.created",
    data: { invoiceId: "in_123", customerId: "cus_123" },
  },
]);
```

### Event Subscription

```typescript
// Subscribe to specific events
eventBus.on("payment.succeeded", async (event) => {
  console.log("Payment succeeded:", event.data);
  // Send confirmation email
  await sendConfirmationEmail(event.data.customerId);
});

eventBus.on("payment.failed", async (event) => {
  console.log("Payment failed:", event.data);
  // Send failure notification
  await sendFailureNotification(event.data.customerId);
});

// Subscribe to multiple events with pattern matching
eventBus.subscribe("payment.*", async (event) => {
  console.log("Payment event:", event.type, event.data);
});

// One-time subscription
eventBus.once("subscription.created", async (event) => {
  console.log("First subscription created:", event.data);
});
```

### Event Querying

```typescript
// Get events with filters
const events = await eventBus.getEvents({
  type: "payment.succeeded",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
  limit: 100,
});

// Get specific event
const event = await eventBus.getEventById("evt_123");
if (event) {
  console.log("Event found:", event);
}
```

## Webhook Management

### Webhook Registration

```typescript
import { WebhookManager } from "@carnil/webhooks";

const webhookManager = new WebhookManager({
  eventBus,
  webhookSecret: "your_webhook_secret",
});

// Register webhook endpoint
await webhookManager.registerEndpoint({
  id: "my-webhook",
  url: "https://your-app.com/webhooks",
  events: ["payment.succeeded", "payment.failed", "subscription.created"],
  secret: "your_endpoint_secret",
  enabled: true,
  timeout: 30000, // 30 seconds
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
  },
  headers: {
    "User-Agent": "MyApp/1.0",
  },
});
```

### Webhook Delivery

```typescript
// Deliver webhook manually
const delivery = await webhookManager.deliverWebhook("my-webhook", event);
console.log("Delivery status:", delivery.status);

// Deliver multiple webhooks
const deliveries = await webhookManager.deliverWebhookBatch(
  "my-webhook",
  events
);
console.log("Deliveries:", deliveries);
```

### Webhook Verification

```typescript
// Verify webhook signature
const isValid = await webhookManager.verifyWebhook(payload, signature, secret);
if (isValid) {
  console.log("Webhook signature is valid");
}

// Parse webhook payload
const event = await webhookManager.parseWebhook(payload, signature, secret);
console.log("Parsed event:", event);
```

## Webhook Endpoints

### Express.js Integration

```typescript
import express from "express";
import { WebhookManager } from "@carnil/webhooks";

const app = express();
const webhookManager = new WebhookManager({
  eventBus,
  webhookSecret: "your_webhook_secret",
});

app.post("/webhooks", async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook
    const isValid = await webhookManager.verifyWebhook(
      payload,
      signature,
      "your_endpoint_secret"
    );
    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Parse event
    const event = await webhookManager.parseWebhook(
      payload,
      signature,
      "your_endpoint_secret"
    );

    // Handle event
    switch (event.type) {
      case "payment.succeeded":
        await handlePaymentSucceeded(event.data);
        break;
      case "payment.failed":
        await handlePaymentFailed(event.data);
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### Next.js API Route

```typescript
// pages/api/webhooks.ts
import { NextApiRequest, NextApiResponse } from "next";
import { WebhookManager } from "@carnil/webhooks";

const webhookManager = new WebhookManager({
  eventBus,
  webhookSecret: process.env.WEBHOOK_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const signature = req.headers["x-webhook-signature"] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook
    const isValid = await webhookManager.verifyWebhook(
      payload,
      signature,
      process.env.ENDPOINT_SECRET!
    );
    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Parse and handle event
    const event = await webhookManager.parseWebhook(
      payload,
      signature,
      process.env.ENDPOINT_SECRET!
    );
    await handleWebhookEvent(event);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
```

## Event Types

### Payment Events

```typescript
// Payment succeeded
{
  type: 'payment.succeeded',
  data: {
    paymentId: string;
    amount: number;
    currency: string;
    customerId: string;
    paymentMethodId: string;
  }
}

// Payment failed
{
  type: 'payment.failed',
  data: {
    paymentId: string;
    amount: number;
    currency: string;
    customerId: string;
    failureReason: string;
  }
}

// Payment refunded
{
  type: 'payment.refunded',
  data: {
    paymentId: string;
    refundId: string;
    amount: number;
    currency: string;
    customerId: string;
  }
}
```

### Subscription Events

```typescript
// Subscription created
{
  type: 'subscription.created',
  data: {
    subscriptionId: string;
    customerId: string;
    planId: string;
    status: string;
  }
}

// Subscription updated
{
  type: 'subscription.updated',
  data: {
    subscriptionId: string;
    customerId: string;
    planId: string;
    status: string;
    changes: Record<string, any>;
  }
}

// Subscription cancelled
{
  type: 'subscription.cancelled',
  data: {
    subscriptionId: string;
    customerId: string;
    cancelledAt: Date;
    reason?: string;
  }
}
```

### Customer Events

```typescript
// Customer created
{
  type: 'customer.created',
  data: {
    customerId: string;
    email: string;
    name?: string;
  }
}

// Customer updated
{
  type: 'customer.updated',
  data: {
    customerId: string;
    email: string;
    name?: string;
    changes: Record<string, any>;
  }
}
```

## Testing

### Webhook Testing

```typescript
// Test webhook endpoint
const testResult = await webhookManager.testEndpoint("my-webhook");
console.log("Test result:", testResult);

// Send test webhook
const testDelivery = await webhookManager.sendTestWebhook(
  "my-webhook",
  "payment.succeeded"
);
console.log("Test delivery:", testDelivery);
```

### Event Testing

```typescript
// Test event publishing
await eventBus.publish("test.event", { message: "Hello World" });

// Test event subscription
eventBus.on("test.event", (event) => {
  console.log("Test event received:", event.data);
});
```

## Monitoring and Analytics

### Event Bus Metrics

```typescript
// Get event bus metrics
const metrics = await eventBus.getMetrics();
console.log("Event bus metrics:", metrics);

// Health check
const isHealthy = await eventBus.healthCheck();
console.log("Event bus healthy:", isHealthy);
```

### Webhook Delivery History

```typescript
// Get delivery history
const deliveries = await webhookManager.getDeliveryHistory("my-webhook");
console.log("Delivery history:", deliveries);

// Get failed deliveries
const failedDeliveries = deliveries.filter((d) => d.status === "failed");
console.log("Failed deliveries:", failedDeliveries);
```

## Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_TIMEOUT=30000
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_BACKOFF=1000

# Event Bus Configuration
EVENT_BUS_ENABLE_PERSISTENCE=true
EVENT_BUS_ENABLE_METRICS=true
EVENT_BUS_MAX_RETRIES=3
EVENT_BUS_BACKOFF_MULTIPLIER=2
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
