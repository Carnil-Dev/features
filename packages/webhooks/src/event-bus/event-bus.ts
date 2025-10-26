import { z } from 'zod';
import { EventEmitter } from 'events';
import crypto from 'crypto';

// ============================================================================
// Event Bus Schemas
// ============================================================================

export const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.any()),
  timestamp: z.date(),
  source: z.string(),
  version: z.string().default('1.0'),
  metadata: z.record(z.string()).optional(),
});

export const WebhookSubscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
  isActive: z.boolean().default(true),
  retryPolicy: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    retryDelay: z.number().min(100).max(300000).default(1000), // milliseconds
    backoffMultiplier: z.number().min(1).max(5).default(2),
  }),
  filters: z.record(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  timeout: z.number().min(1000).max(30000).default(10000), // milliseconds
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WebhookDeliverySchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  eventId: z.string(),
  url: z.string(),
  status: z.enum(['pending', 'delivered', 'failed', 'retrying']),
  attempts: z.number().min(0).default(0),
  maxAttempts: z.number().min(1).default(3),
  nextRetryAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  failedAt: z.date().optional(),
  response: z.object({
    statusCode: z.number().optional(),
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WebhookEventFilterSchema = z.object({
  eventTypes: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  dataFilters: z.record(z.string()).optional(),
  timeRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
export type WebhookSubscription = z.infer<typeof WebhookSubscriptionSchema>;
export type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>;
export type WebhookEventFilter = z.infer<typeof WebhookEventFilterSchema>;

// ============================================================================
// Event Bus
// ============================================================================

export class EventBus extends EventEmitter {
  private events: Map<string, WebhookEvent> = new Map();
  private subscriptions: Map<string, WebhookSubscription> = new Map();
  private deliveries: Map<string, WebhookDelivery> = new Map();
  private retryQueue: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.setupEventHandlers();
  }

  // ============================================================================
  // Event Management
  // ============================================================================

  async emitEvent(event: Omit<WebhookEvent, 'id' | 'timestamp'>): Promise<WebhookEvent> {
    const webhookEvent: WebhookEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event,
    };

    this.events.set(webhookEvent.id, webhookEvent);
    
    // Emit to internal listeners
    this.emit('event', webhookEvent);
    
    // Process webhook deliveries
    await this.processWebhookDeliveries(webhookEvent);
    
    return webhookEvent;
  }

  async getEvent(eventId: string): Promise<WebhookEvent | null> {
    return this.events.get(eventId) || null;
  }

  async getEvents(filter?: WebhookEventFilter): Promise<WebhookEvent[]> {
    let events = Array.from(this.events.values());
    
    if (filter) {
      if (filter.eventTypes && filter.eventTypes.length > 0) {
        events = events.filter(e => filter.eventTypes!.includes(e.type));
      }
      
      if (filter.sources && filter.sources.length > 0) {
        events = events.filter(e => filter.sources!.includes(e.source));
      }
      
      if (filter.dataFilters) {
        events = events.filter(e => {
          return Object.entries(filter.dataFilters!).every(([key, value]) => {
            return e.data[key] === value;
          });
        });
      }
      
      if (filter.timeRange) {
        events = events.filter(e => {
          return e.timestamp >= filter.timeRange!.start && e.timestamp <= filter.timeRange!.end;
        });
      }
    }
    
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // ============================================================================
  // Subscription Management
  // ============================================================================

  async createSubscription(data: Omit<WebhookSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookSubscription> {
    const subscription: WebhookSubscription = {
      id: this.generateSubscriptionId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.subscriptions.set(subscription.id, subscription);
    
    // Emit subscription created event
    this.emit('subscription:created', subscription);
    
    return subscription;
  }

  async getSubscription(subscriptionId: string): Promise<WebhookSubscription | null> {
    return this.subscriptions.get(subscriptionId) || null;
  }

  async updateSubscription(subscriptionId: string, updates: Partial<WebhookSubscription>): Promise<WebhookSubscription | null> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    const updatedSubscription: WebhookSubscription = {
      ...subscription,
      ...updates,
      updatedAt: new Date(),
    };

    this.subscriptions.set(subscriptionId, updatedSubscription);
    
    // Emit subscription updated event
    this.emit('subscription:updated', updatedSubscription);
    
    return updatedSubscription;
  }

  async deleteSubscription(subscriptionId: string): Promise<boolean> {
    const deleted = this.subscriptions.delete(subscriptionId);
    
    if (deleted) {
      // Emit subscription deleted event
      this.emit('subscription:deleted', subscriptionId);
    }
    
    return deleted;
  }

  async getSubscriptions(): Promise<WebhookSubscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getActiveSubscriptions(): Promise<WebhookSubscription[]> {
    return Array.from(this.subscriptions.values()).filter(s => s.isActive);
  }

  // ============================================================================
  // Webhook Delivery
  // ============================================================================

  private async processWebhookDeliveries(event: WebhookEvent): Promise<void> {
    const activeSubscriptions = await this.getActiveSubscriptions();
    
    for (const subscription of activeSubscriptions) {
      // Check if subscription is interested in this event
      if (subscription.events.includes(event.type) || subscription.events.includes('*')) {
        await this.createWebhookDelivery(subscription, event);
      }
    }
  }

  private async createWebhookDelivery(subscription: WebhookSubscription, event: WebhookEvent): Promise<WebhookDelivery> {
    const delivery: WebhookDelivery = {
      id: this.generateDeliveryId(),
      subscriptionId: subscription.id,
      eventId: event.id,
      url: subscription.url,
      status: 'pending',
      attempts: 0,
      maxAttempts: subscription.retryPolicy.maxRetries,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.deliveries.set(delivery.id, delivery);
    
    // Schedule immediate delivery
    await this.scheduleWebhookDelivery(delivery);
    
    return delivery;
  }

  private async scheduleWebhookDelivery(delivery: WebhookDelivery): Promise<void> {
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

  private async deliverWebhook(
    delivery: WebhookDelivery,
    subscription: WebhookSubscription,
    event: WebhookEvent
  ): Promise<void> {
    const payload = {
      id: event.id,
      type: event.type,
      data: event.data,
      timestamp: event.timestamp.toISOString(),
      source: event.source,
      version: event.version,
      metadata: event.metadata,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Carnil-Webhooks/1.0',
      'X-Webhook-Event': event.type,
      'X-Webhook-Source': event.source,
      ...subscription.headers,
    };

    // Add signature if secret is provided
    if (subscription.secret) {
      const signature = this.generateWebhookSignature(payload, subscription.secret);
      headers['X-Webhook-Signature'] = signature;
    }

    const response = await fetch(subscription.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(subscription.timeout),
    });

    if (response.ok) {
      await this.markDeliveryAsDelivered(delivery, response);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async handleWebhookDeliveryFailure(delivery: WebhookDelivery, error: any): Promise<void> {
    delivery.attempts += 1;
    delivery.status = 'failed';
    delivery.error = error.message;
    delivery.updatedAt = new Date();

    if (delivery.attempts < delivery.maxAttempts) {
      // Schedule retry
      const subscription = this.subscriptions.get(delivery.subscriptionId);
      if (subscription) {
        const retryDelay = this.calculateRetryDelay(delivery.attempts, subscription.retryPolicy);
        delivery.nextRetryAt = new Date(Date.now() + retryDelay);
        delivery.status = 'retrying';
        
        // Schedule retry
        const timeoutId = setTimeout(() => {
          this.scheduleWebhookDelivery(delivery);
        }, retryDelay);
        
        this.retryQueue.set(delivery.id, timeoutId);
      }
    } else {
      delivery.failedAt = new Date();
      delivery.status = 'failed';
    }

    this.deliveries.set(delivery.id, delivery);
  }

  private async markDeliveryAsDelivered(delivery: WebhookDelivery, response: Response): Promise<void> {
    delivery.status = 'delivered';
    delivery.deliveredAt = new Date();
    delivery.updatedAt = new Date();
    delivery.response = {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };

    this.deliveries.set(delivery.id, delivery);
  }

  // ============================================================================
  // Delivery Management
  // ============================================================================

  async getDelivery(deliveryId: string): Promise<WebhookDelivery | null> {
    return this.deliveries.get(deliveryId) || null;
  }

  async getDeliveries(subscriptionId?: string): Promise<WebhookDelivery[]> {
    let deliveries = Array.from(this.deliveries.values());
    
    if (subscriptionId) {
      deliveries = deliveries.filter(d => d.subscriptionId === subscriptionId);
    }
    
    return deliveries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getDeliveryStats(subscriptionId?: string): Promise<{
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    retrying: number;
    successRate: number;
  }> {
    const deliveries = await this.getDeliveries(subscriptionId);
    
    const stats = {
      total: deliveries.length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      failed: deliveries.filter(d => d.status === 'failed').length,
      pending: deliveries.filter(d => d.status === 'pending').length,
      retrying: deliveries.filter(d => d.status === 'retrying').length,
      successRate: 0,
    };
    
    stats.successRate = stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0;
    
    return stats;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private setupEventHandlers(): void {
    this.on('event', (event: WebhookEvent) => {
      console.log(`Event emitted: ${event.type} (${event.id})`);
    });
    
    this.on('subscription:created', (subscription: WebhookSubscription) => {
      console.log(`Subscription created: ${subscription.name} (${subscription.id})`);
    });
    
    this.on('subscription:updated', (subscription: WebhookSubscription) => {
      console.log(`Subscription updated: ${subscription.name} (${subscription.id})`);
    });
    
    this.on('subscription:deleted', (subscriptionId: string) => {
      console.log(`Subscription deleted: ${subscriptionId}`);
    });
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateDeliveryId(): string {
    return `del_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateWebhookSignature(payload: any, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  private calculateRetryDelay(attempt: number, retryPolicy: WebhookSubscription['retryPolicy']): number {
    return retryPolicy.retryDelay * Math.pow(retryPolicy.backoffMultiplier, attempt - 1);
  }
}

// ============================================================================
// Global Event Bus Instance
// ============================================================================

export const globalEventBus = new EventBus();
