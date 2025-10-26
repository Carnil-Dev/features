import { z } from 'zod';
import { EventEmitter } from 'events';
import crypto from 'crypto';

// src/event-bus/event-bus.ts
z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.any()),
  timestamp: z.date(),
  source: z.string(),
  version: z.string().default("1.0"),
  metadata: z.record(z.string()).optional()
});
z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
  isActive: z.boolean().default(true),
  retryPolicy: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    retryDelay: z.number().min(100).max(3e5).default(1e3),
    // milliseconds
    backoffMultiplier: z.number().min(1).max(5).default(2)
  }),
  filters: z.record(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  timeout: z.number().min(1e3).max(3e4).default(1e4),
  // milliseconds
  createdAt: z.date(),
  updatedAt: z.date()
});
z.object({
  id: z.string(),
  subscriptionId: z.string(),
  eventId: z.string(),
  url: z.string(),
  status: z.enum(["pending", "delivered", "failed", "retrying"]),
  attempts: z.number().min(0).default(0),
  maxAttempts: z.number().min(1).default(3),
  nextRetryAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  failedAt: z.date().optional(),
  response: z.object({
    statusCode: z.number().optional(),
    headers: z.record(z.string()).optional(),
    body: z.string().optional()
  }).optional(),
  error: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
z.object({
  eventTypes: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  dataFilters: z.record(z.string()).optional(),
  timeRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional()
});
var EventBus = class extends EventEmitter {
  constructor() {
    super();
    this.events = /* @__PURE__ */ new Map();
    this.subscriptions = /* @__PURE__ */ new Map();
    this.deliveries = /* @__PURE__ */ new Map();
    this.retryQueue = /* @__PURE__ */ new Map();
    this.setupEventHandlers();
  }
  // ============================================================================
  // Event Management
  // ============================================================================
  async emitEvent(event) {
    const webhookEvent = {
      id: this.generateEventId(),
      timestamp: /* @__PURE__ */ new Date(),
      ...event
    };
    this.events.set(webhookEvent.id, webhookEvent);
    this.emit("event", webhookEvent);
    await this.processWebhookDeliveries(webhookEvent);
    return webhookEvent;
  }
  async getEvent(eventId) {
    return this.events.get(eventId) || null;
  }
  async getEvents(filter) {
    let events = Array.from(this.events.values());
    if (filter) {
      if (filter.eventTypes && filter.eventTypes.length > 0) {
        events = events.filter((e) => filter.eventTypes.includes(e.type));
      }
      if (filter.sources && filter.sources.length > 0) {
        events = events.filter((e) => filter.sources.includes(e.source));
      }
      if (filter.dataFilters) {
        events = events.filter((e) => {
          return Object.entries(filter.dataFilters).every(([key, value]) => {
            return e.data[key] === value;
          });
        });
      }
      if (filter.timeRange) {
        events = events.filter((e) => {
          return e.timestamp >= filter.timeRange.start && e.timestamp <= filter.timeRange.end;
        });
      }
    }
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  // ============================================================================
  // Subscription Management
  // ============================================================================
  async createSubscription(data) {
    const subscription = {
      id: this.generateSubscriptionId(),
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.subscriptions.set(subscription.id, subscription);
    this.emit("subscription:created", subscription);
    return subscription;
  }
  async getSubscription(subscriptionId) {
    return this.subscriptions.get(subscriptionId) || null;
  }
  async updateSubscription(subscriptionId, updates) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;
    const updatedSubscription = {
      ...subscription,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.subscriptions.set(subscriptionId, updatedSubscription);
    this.emit("subscription:updated", updatedSubscription);
    return updatedSubscription;
  }
  async deleteSubscription(subscriptionId) {
    const deleted = this.subscriptions.delete(subscriptionId);
    if (deleted) {
      this.emit("subscription:deleted", subscriptionId);
    }
    return deleted;
  }
  async getSubscriptions() {
    return Array.from(this.subscriptions.values());
  }
  async getActiveSubscriptions() {
    return Array.from(this.subscriptions.values()).filter((s) => s.isActive);
  }
  // ============================================================================
  // Webhook Delivery
  // ============================================================================
  async processWebhookDeliveries(event) {
    const activeSubscriptions = await this.getActiveSubscriptions();
    for (const subscription of activeSubscriptions) {
      if (subscription.events.includes(event.type) || subscription.events.includes("*")) {
        await this.createWebhookDelivery(subscription, event);
      }
    }
  }
  async createWebhookDelivery(subscription, event) {
    const delivery = {
      id: this.generateDeliveryId(),
      subscriptionId: subscription.id,
      eventId: event.id,
      url: subscription.url,
      status: "pending",
      attempts: 0,
      maxAttempts: subscription.retryPolicy.maxRetries,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.deliveries.set(delivery.id, delivery);
    await this.scheduleWebhookDelivery(delivery);
    return delivery;
  }
  async scheduleWebhookDelivery(delivery) {
    const subscription = this.subscriptions.get(delivery.subscriptionId);
    if (!subscription) return;
    const event = this.events.get(delivery.eventId);
    if (!event) return;
    try {
      await this.deliverWebhook(delivery, subscription, event);
    } catch (error) {
      await this.handleWebhookDeliveryFailure(delivery, error);
    }
  }
  async deliverWebhook(delivery, subscription, event) {
    const payload = {
      id: event.id,
      type: event.type,
      data: event.data,
      timestamp: event.timestamp.toISOString(),
      source: event.source,
      version: event.version,
      metadata: event.metadata
    };
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "Carnil-Webhooks/1.0",
      "X-Webhook-Event": event.type,
      "X-Webhook-Source": event.source,
      ...subscription.headers
    };
    if (subscription.secret) {
      const signature = this.generateWebhookSignature(payload, subscription.secret);
      headers["X-Webhook-Signature"] = signature;
    }
    const response = await fetch(subscription.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(subscription.timeout)
    });
    if (response.ok) {
      await this.markDeliveryAsDelivered(delivery, response);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  async handleWebhookDeliveryFailure(delivery, error) {
    delivery.attempts += 1;
    delivery.status = "failed";
    delivery.error = error.message;
    delivery.updatedAt = /* @__PURE__ */ new Date();
    if (delivery.attempts < delivery.maxAttempts) {
      const subscription = this.subscriptions.get(delivery.subscriptionId);
      if (subscription) {
        const retryDelay = this.calculateRetryDelay(delivery.attempts, subscription.retryPolicy);
        delivery.nextRetryAt = new Date(Date.now() + retryDelay);
        delivery.status = "retrying";
        const timeoutId = setTimeout(() => {
          this.scheduleWebhookDelivery(delivery);
        }, retryDelay);
        this.retryQueue.set(delivery.id, timeoutId);
      }
    } else {
      delivery.failedAt = /* @__PURE__ */ new Date();
      delivery.status = "failed";
    }
    this.deliveries.set(delivery.id, delivery);
  }
  async markDeliveryAsDelivered(delivery, response) {
    delivery.status = "delivered";
    delivery.deliveredAt = /* @__PURE__ */ new Date();
    delivery.updatedAt = /* @__PURE__ */ new Date();
    delivery.response = {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text()
    };
    this.deliveries.set(delivery.id, delivery);
  }
  // ============================================================================
  // Delivery Management
  // ============================================================================
  async getDelivery(deliveryId) {
    return this.deliveries.get(deliveryId) || null;
  }
  async getDeliveries(subscriptionId) {
    let deliveries = Array.from(this.deliveries.values());
    if (subscriptionId) {
      deliveries = deliveries.filter((d) => d.subscriptionId === subscriptionId);
    }
    return deliveries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async getDeliveryStats(subscriptionId) {
    const deliveries = await this.getDeliveries(subscriptionId);
    const stats = {
      total: deliveries.length,
      delivered: deliveries.filter((d) => d.status === "delivered").length,
      failed: deliveries.filter((d) => d.status === "failed").length,
      pending: deliveries.filter((d) => d.status === "pending").length,
      retrying: deliveries.filter((d) => d.status === "retrying").length,
      successRate: 0
    };
    stats.successRate = stats.total > 0 ? stats.delivered / stats.total * 100 : 0;
    return stats;
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  setupEventHandlers() {
    this.on("event", (event) => {
      console.log(`Event emitted: ${event.type} (${event.id})`);
    });
    this.on("subscription:created", (subscription) => {
      console.log(`Subscription created: ${subscription.name} (${subscription.id})`);
    });
    this.on("subscription:updated", (subscription) => {
      console.log(`Subscription updated: ${subscription.name} (${subscription.id})`);
    });
    this.on("subscription:deleted", (subscriptionId) => {
      console.log(`Subscription deleted: ${subscriptionId}`);
    });
  }
  generateEventId() {
    return `evt_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }
  generateSubscriptionId() {
    return `sub_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }
  generateDeliveryId() {
    return `del_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }
  generateWebhookSignature(payload, secret) {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest("hex")}`;
  }
  calculateRetryDelay(attempt, retryPolicy) {
    return retryPolicy.retryDelay * Math.pow(retryPolicy.backoffMultiplier, attempt - 1);
  }
};
new EventBus();

// src/index.ts
var WebhookProcessor = class {
  constructor() {
    this.handlers = /* @__PURE__ */ new Map();
  }
  registerHandler(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }
  async processWebhook(event) {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }
};

export { EventBus, WebhookProcessor };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map