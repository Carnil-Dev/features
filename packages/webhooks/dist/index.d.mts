import { z } from 'zod';
import { EventEmitter } from 'events';
export { CarnilResponse } from '@carnil/core';

declare const WebhookEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    timestamp: z.ZodDate;
    source: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    data: Record<string, any>;
    timestamp: Date;
    source: string;
    version: string;
    metadata?: Record<string, string> | undefined;
}, {
    id: string;
    type: string;
    data: Record<string, any>;
    timestamp: Date;
    source: string;
    version?: string | undefined;
    metadata?: Record<string, string> | undefined;
}>;
declare const WebhookSubscriptionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    url: z.ZodString;
    events: z.ZodArray<z.ZodString, "many">;
    secret: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    retryPolicy: z.ZodObject<{
        maxRetries: z.ZodDefault<z.ZodNumber>;
        retryDelay: z.ZodDefault<z.ZodNumber>;
        backoffMultiplier: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxRetries: number;
        retryDelay: number;
        backoffMultiplier: number;
    }, {
        maxRetries?: number | undefined;
        retryDelay?: number | undefined;
        backoffMultiplier?: number | undefined;
    }>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeout: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    url: string;
    events: string[];
    isActive: boolean;
    retryPolicy: {
        maxRetries: number;
        retryDelay: number;
        backoffMultiplier: number;
    };
    timeout: number;
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    secret?: string | undefined;
    filters?: Record<string, string> | undefined;
    headers?: Record<string, string> | undefined;
}, {
    id: string;
    name: string;
    url: string;
    events: string[];
    retryPolicy: {
        maxRetries?: number | undefined;
        retryDelay?: number | undefined;
        backoffMultiplier?: number | undefined;
    };
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    secret?: string | undefined;
    isActive?: boolean | undefined;
    filters?: Record<string, string> | undefined;
    headers?: Record<string, string> | undefined;
    timeout?: number | undefined;
}>;
declare const WebhookDeliverySchema: z.ZodObject<{
    id: z.ZodString;
    subscriptionId: z.ZodString;
    eventId: z.ZodString;
    url: z.ZodString;
    status: z.ZodEnum<["pending", "delivered", "failed", "retrying"]>;
    attempts: z.ZodDefault<z.ZodNumber>;
    maxAttempts: z.ZodDefault<z.ZodNumber>;
    nextRetryAt: z.ZodOptional<z.ZodDate>;
    deliveredAt: z.ZodOptional<z.ZodDate>;
    failedAt: z.ZodOptional<z.ZodDate>;
    response: z.ZodOptional<z.ZodObject<{
        statusCode: z.ZodOptional<z.ZodNumber>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        body: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        headers?: Record<string, string> | undefined;
        statusCode?: number | undefined;
        body?: string | undefined;
    }, {
        headers?: Record<string, string> | undefined;
        statusCode?: number | undefined;
        body?: string | undefined;
    }>>;
    error: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "delivered" | "failed" | "retrying";
    url: string;
    createdAt: Date;
    updatedAt: Date;
    subscriptionId: string;
    eventId: string;
    attempts: number;
    maxAttempts: number;
    nextRetryAt?: Date | undefined;
    deliveredAt?: Date | undefined;
    failedAt?: Date | undefined;
    response?: {
        headers?: Record<string, string> | undefined;
        statusCode?: number | undefined;
        body?: string | undefined;
    } | undefined;
    error?: string | undefined;
}, {
    id: string;
    status: "pending" | "delivered" | "failed" | "retrying";
    url: string;
    createdAt: Date;
    updatedAt: Date;
    subscriptionId: string;
    eventId: string;
    attempts?: number | undefined;
    maxAttempts?: number | undefined;
    nextRetryAt?: Date | undefined;
    deliveredAt?: Date | undefined;
    failedAt?: Date | undefined;
    response?: {
        headers?: Record<string, string> | undefined;
        statusCode?: number | undefined;
        body?: string | undefined;
    } | undefined;
    error?: string | undefined;
}>;
declare const WebhookEventFilterSchema: z.ZodObject<{
    eventTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dataFilters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeRange: z.ZodOptional<z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start: Date;
        end: Date;
    }, {
        start: Date;
        end: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    eventTypes?: string[] | undefined;
    sources?: string[] | undefined;
    dataFilters?: Record<string, string> | undefined;
    timeRange?: {
        start: Date;
        end: Date;
    } | undefined;
}, {
    eventTypes?: string[] | undefined;
    sources?: string[] | undefined;
    dataFilters?: Record<string, string> | undefined;
    timeRange?: {
        start: Date;
        end: Date;
    } | undefined;
}>;
type WebhookEvent = z.infer<typeof WebhookEventSchema>;
type WebhookSubscription = z.infer<typeof WebhookSubscriptionSchema>;
type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>;
type WebhookEventFilter = z.infer<typeof WebhookEventFilterSchema>;
declare class EventBus extends EventEmitter {
    private events;
    private subscriptions;
    private deliveries;
    private retryQueue;
    constructor();
    emitEvent(event: Omit<WebhookEvent, 'id' | 'timestamp'>): Promise<WebhookEvent>;
    getEvent(eventId: string): Promise<WebhookEvent | null>;
    getEvents(filter?: WebhookEventFilter): Promise<WebhookEvent[]>;
    createSubscription(data: Omit<WebhookSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookSubscription>;
    getSubscription(subscriptionId: string): Promise<WebhookSubscription | null>;
    updateSubscription(subscriptionId: string, updates: Partial<WebhookSubscription>): Promise<WebhookSubscription | null>;
    deleteSubscription(subscriptionId: string): Promise<boolean>;
    getSubscriptions(): Promise<WebhookSubscription[]>;
    getActiveSubscriptions(): Promise<WebhookSubscription[]>;
    private processWebhookDeliveries;
    private createWebhookDelivery;
    private scheduleWebhookDelivery;
    private deliverWebhook;
    private handleWebhookDeliveryFailure;
    private markDeliveryAsDelivered;
    getDelivery(deliveryId: string): Promise<WebhookDelivery | null>;
    getDeliveries(subscriptionId?: string): Promise<WebhookDelivery[]>;
    getDeliveryStats(subscriptionId?: string): Promise<{
        total: number;
        delivered: number;
        failed: number;
        pending: number;
        retrying: number;
        successRate: number;
    }>;
    private setupEventHandlers;
    private generateEventId;
    private generateSubscriptionId;
    private generateDeliveryId;
    private generateWebhookSignature;
    private calculateRetryDelay;
}

interface WebhookHandler {
    (event: WebhookEvent): Promise<void>;
}
interface WebhookConfig {
    secret: string;
    endpoint: string;
    events: string[];
}
declare class WebhookProcessor {
    private handlers;
    constructor();
    registerHandler(eventType: string, handler: WebhookHandler): void;
    processWebhook(event: WebhookEvent): Promise<void>;
}

export { EventBus, type WebhookConfig, type WebhookEvent, type WebhookHandler, WebhookProcessor };
