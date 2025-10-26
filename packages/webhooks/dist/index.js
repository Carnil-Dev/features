'use strict';

var zod = require('zod');
var events = require('events');
var crypto = require('crypto');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var crypto__default = /*#__PURE__*/_interopDefault(crypto);

// src/event-bus/event-bus.ts
zod.z.object({
  id: zod.z.string(),
  type: zod.z.string(),
  data: zod.z.record(zod.z.any()),
  timestamp: zod.z.date(),
  source: zod.z.string(),
  version: zod.z.string().default("1.0"),
  metadata: zod.z.record(zod.z.string()).optional()
});
zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  description: zod.z.string().optional(),
  url: zod.z.string().url(),
  events: zod.z.array(zod.z.string()),
  secret: zod.z.string().optional(),
  isActive: zod.z.boolean().default(true),
  retryPolicy: zod.z.object({
    maxRetries: zod.z.number().min(0).max(10).default(3),
    retryDelay: zod.z.number().min(100).max(3e5).default(1e3),
    // milliseconds
    backoffMultiplier: zod.z.number().min(1).max(5).default(2)
  }),
  filters: zod.z.record(zod.z.string()).optional(),
  headers: zod.z.record(zod.z.string()).optional(),
  timeout: zod.z.number().min(1e3).max(3e4).default(1e4),
  // milliseconds
  createdAt: zod.z.date(),
  updatedAt: zod.z.date()
});
zod.z.object({
  id: zod.z.string(),
  subscriptionId: zod.z.string(),
  eventId: zod.z.string(),
  url: zod.z.string(),
  status: zod.z.enum(["pending", "delivered", "failed", "retrying"]),
  attempts: zod.z.number().min(0).default(0),
  maxAttempts: zod.z.number().min(1).default(3),
  nextRetryAt: zod.z.date().optional(),
  deliveredAt: zod.z.date().optional(),
  failedAt: zod.z.date().optional(),
  response: zod.z.object({
    statusCode: zod.z.number().optional(),
    headers: zod.z.record(zod.z.string()).optional(),
    body: zod.z.string().optional()
  }).optional(),
  error: zod.z.string().optional(),
  createdAt: zod.z.date(),
  updatedAt: zod.z.date()
});
zod.z.object({
  eventTypes: zod.z.array(zod.z.string()).optional(),
  sources: zod.z.array(zod.z.string()).optional(),
  dataFilters: zod.z.record(zod.z.string()).optional(),
  timeRange: zod.z.object({
    start: zod.z.date(),
    end: zod.z.date()
  }).optional()
});
var EventBus = class extends events.EventEmitter {
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
    return `evt_${Date.now()}_${crypto__default.default.randomBytes(8).toString("hex")}`;
  }
  generateSubscriptionId() {
    return `sub_${Date.now()}_${crypto__default.default.randomBytes(8).toString("hex")}`;
  }
  generateDeliveryId() {
    return `del_${Date.now()}_${crypto__default.default.randomBytes(8).toString("hex")}`;
  }
  generateWebhookSignature(payload, secret) {
    const hmac = crypto__default.default.createHmac("sha256", secret);
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

exports.EventBus = EventBus;
exports.WebhookProcessor = WebhookProcessor;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map