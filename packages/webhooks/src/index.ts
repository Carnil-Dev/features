// ============================================================================
// Webhooks Package for Carnil Payments SDK
// ============================================================================

import { WebhookEvent } from './event-bus/event-bus';

export { EventBus } from './event-bus/event-bus';

// Re-export core types for convenience
export type { CarnilResponse } from '@carnil/core';
export type { WebhookEvent } from './event-bus/event-bus';

// Webhook event types
export interface WebhookHandler {
  (event: WebhookEvent): Promise<void>;
}

export interface WebhookConfig {
  secret: string;
  endpoint: string;
  events: string[];
}

// Event bus for webhook processing
export class WebhookProcessor {
  private handlers: Map<string, WebhookHandler[]> = new Map();

  constructor() {}

  registerHandler(eventType: string, handler: WebhookHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async processWebhook(event: WebhookEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }
}
