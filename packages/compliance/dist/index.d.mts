import { z } from 'zod';
import * as react_jsx_runtime from 'react/jsx-runtime';

declare const AuditEventSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodDate;
    eventType: z.ZodEnum<["user_login", "user_logout", "user_created", "user_updated", "user_deleted", "payment_created", "payment_updated", "payment_cancelled", "payment_refunded", "subscription_created", "subscription_updated", "subscription_cancelled", "data_accessed", "data_modified", "data_deleted", "data_exported", "data_imported", "system_error", "security_event", "compliance_event"]>;
    userId: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodString>;
    resourceId: z.ZodOptional<z.ZodString>;
    resourceType: z.ZodOptional<z.ZodString>;
    action: z.ZodString;
    description: z.ZodString;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    severity: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    source: z.ZodDefault<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: Date;
    eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
    action: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    source: string;
    version: string;
    userId?: string | undefined;
    customerId?: string | undefined;
    resourceId?: string | undefined;
    resourceType?: string | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    timestamp: Date;
    eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
    action: string;
    description: string;
    userId?: string | undefined;
    customerId?: string | undefined;
    resourceId?: string | undefined;
    resourceType?: string | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    metadata?: Record<string, any> | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    source?: string | undefined;
    version?: string | undefined;
}>;
declare const AuditTrailSchema: z.ZodObject<{
    id: z.ZodString;
    entityId: z.ZodString;
    entityType: z.ZodString;
    events: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodDate;
        eventType: z.ZodEnum<["user_login", "user_logout", "user_created", "user_updated", "user_deleted", "payment_created", "payment_updated", "payment_cancelled", "payment_refunded", "subscription_created", "subscription_updated", "subscription_cancelled", "data_accessed", "data_modified", "data_deleted", "data_exported", "data_imported", "system_error", "security_event", "compliance_event"]>;
        userId: z.ZodOptional<z.ZodString>;
        customerId: z.ZodOptional<z.ZodString>;
        resourceId: z.ZodOptional<z.ZodString>;
        resourceType: z.ZodOptional<z.ZodString>;
        action: z.ZodString;
        description: z.ZodString;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        severity: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        source: z.ZodDefault<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        source: string;
        version: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
        severity?: "low" | "medium" | "high" | "critical" | undefined;
        source?: string | undefined;
        version?: string | undefined;
    }>, "many">;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    entityId: string;
    entityType: string;
    events: {
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        source: string;
        version: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    createdAt: Date;
    updatedAt: Date;
}, {
    id: string;
    entityId: string;
    entityType: string;
    events: {
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
        severity?: "low" | "medium" | "high" | "critical" | undefined;
        source?: string | undefined;
        version?: string | undefined;
    }[];
    createdAt: Date;
    updatedAt: Date;
}>;
declare const ComplianceReportSchema: z.ZodObject<{
    id: z.ZodString;
    reportType: z.ZodEnum<["gdpr", "soc2", "pci", "hipaa", "custom"]>;
    period: z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start: Date;
        end: Date;
    }, {
        start: Date;
        end: Date;
    }>;
    status: z.ZodEnum<["pending", "in_progress", "completed", "failed"]>;
    findings: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["violation", "warning", "recommendation", "info"]>;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
        description: z.ZodString;
        recommendation: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["open", "in_progress", "resolved", "dismissed"]>;
        createdAt: z.ZodDate;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "in_progress" | "open" | "resolved" | "dismissed";
        type: "violation" | "warning" | "recommendation" | "info";
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        createdAt: Date;
        recommendation?: string | undefined;
        resolvedAt?: Date | undefined;
    }, {
        id: string;
        status: "in_progress" | "open" | "resolved" | "dismissed";
        type: "violation" | "warning" | "recommendation" | "info";
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        createdAt: Date;
        recommendation?: string | undefined;
        resolvedAt?: Date | undefined;
    }>, "many">;
    summary: z.ZodObject<{
        totalEvents: z.ZodNumber;
        violations: z.ZodNumber;
        warnings: z.ZodNumber;
        recommendations: z.ZodNumber;
        complianceScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalEvents: number;
        violations: number;
        warnings: number;
        recommendations: number;
        complianceScore: number;
    }, {
        totalEvents: number;
        violations: number;
        warnings: number;
        recommendations: number;
        complianceScore: number;
    }>;
    generatedAt: z.ZodDate;
    generatedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "in_progress" | "completed" | "failed";
    reportType: "custom" | "gdpr" | "soc2" | "pci" | "hipaa";
    period: {
        start: Date;
        end: Date;
    };
    findings: {
        id: string;
        status: "in_progress" | "open" | "resolved" | "dismissed";
        type: "violation" | "warning" | "recommendation" | "info";
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        createdAt: Date;
        recommendation?: string | undefined;
        resolvedAt?: Date | undefined;
    }[];
    summary: {
        totalEvents: number;
        violations: number;
        warnings: number;
        recommendations: number;
        complianceScore: number;
    };
    generatedAt: Date;
    generatedBy: string;
}, {
    id: string;
    status: "pending" | "in_progress" | "completed" | "failed";
    reportType: "custom" | "gdpr" | "soc2" | "pci" | "hipaa";
    period: {
        start: Date;
        end: Date;
    };
    findings: {
        id: string;
        status: "in_progress" | "open" | "resolved" | "dismissed";
        type: "violation" | "warning" | "recommendation" | "info";
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        createdAt: Date;
        recommendation?: string | undefined;
        resolvedAt?: Date | undefined;
    }[];
    summary: {
        totalEvents: number;
        violations: number;
        warnings: number;
        recommendations: number;
        complianceScore: number;
    };
    generatedAt: Date;
    generatedBy: string;
}>;
type AuditEvent = z.infer<typeof AuditEventSchema>;
type AuditTrail = z.infer<typeof AuditTrailSchema>;
type ComplianceReport = z.infer<typeof ComplianceReportSchema>;
declare class AuditLogger {
    private events;
    private maxEvents;
    private retentionDays;
    constructor(_encryptionKey?: string);
    logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent>;
    logUserAction(userId: string, action: string, description: string, metadata?: Record<string, any>): Promise<AuditEvent>;
    logPaymentEvent(customerId: string, eventType: AuditEvent['eventType'], action: string, description: string, resourceId?: string, metadata?: Record<string, any>): Promise<AuditEvent>;
    logDataAccess(userId: string, resourceType: string, resourceId: string, action: string, metadata?: Record<string, any>): Promise<AuditEvent>;
    logSecurityEvent(eventType: 'security_event', action: string, description: string, severity?: AuditEvent['severity'], metadata?: Record<string, any>): Promise<AuditEvent>;
    logComplianceEvent(eventType: 'compliance_event', action: string, description: string, metadata?: Record<string, any>): Promise<AuditEvent>;
    getEvents(filters?: {
        eventType?: AuditEvent['eventType'];
        userId?: string;
        customerId?: string;
        resourceType?: string;
        resourceId?: string;
        severity?: AuditEvent['severity'];
        startDate?: Date;
        endDate?: Date;
    }): AuditEvent[];
    getAuditTrail(entityId: string, entityType: string): AuditTrail;
    generateComplianceReport(reportType: ComplianceReport['reportType'], period: {
        start: Date;
        end: Date;
    }, generatedBy: string): Promise<ComplianceReport>;
    exportAuditData(filters?: Parameters<AuditLogger['getEvents']>[0], format?: 'json' | 'csv'): Promise<string>;
    private generateEventId;
    private encryptMetadata;
    private cleanupOldEvents;
    private analyzeCompliance;
    private calculateComplianceSummary;
    private exportToCSV;
}
declare const globalAuditLogger: AuditLogger;

declare const DataSubjectSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }, {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    metadata?: Record<string, string> | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    metadata?: Record<string, string> | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
}>;
declare const DataProcessingActivitySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    purpose: z.ZodString;
    legalBasis: z.ZodEnum<["consent", "contract", "legal_obligation", "vital_interests", "public_task", "legitimate_interests"]>;
    dataCategories: z.ZodArray<z.ZodString, "many">;
    dataSubjects: z.ZodArray<z.ZodString, "many">;
    processors: z.ZodArray<z.ZodString, "many">;
    retentionPeriod: z.ZodNumber;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    purpose: string;
    legalBasis: "consent" | "contract" | "legal_obligation" | "vital_interests" | "public_task" | "legitimate_interests";
    dataCategories: string[];
    dataSubjects: string[];
    processors: string[];
    retentionPeriod: number;
    isActive: boolean;
}, {
    id: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    purpose: string;
    legalBasis: "consent" | "contract" | "legal_obligation" | "vital_interests" | "public_task" | "legitimate_interests";
    dataCategories: string[];
    dataSubjects: string[];
    processors: string[];
    retentionPeriod: number;
    isActive?: boolean | undefined;
}>;
declare const ConsentRecordSchema: z.ZodObject<{
    id: z.ZodString;
    dataSubjectId: z.ZodString;
    purpose: z.ZodString;
    consentGiven: z.ZodBoolean;
    consentDate: z.ZodDate;
    withdrawalDate: z.ZodOptional<z.ZodDate>;
    method: z.ZodEnum<["explicit", "opt_in", "opt_out", "implied"]>;
    version: z.ZodDefault<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    version: string;
    purpose: string;
    dataSubjectId: string;
    consentGiven: boolean;
    consentDate: Date;
    method: "explicit" | "opt_in" | "opt_out" | "implied";
    metadata?: Record<string, string> | undefined;
    withdrawalDate?: Date | undefined;
}, {
    id: string;
    purpose: string;
    dataSubjectId: string;
    consentGiven: boolean;
    consentDate: Date;
    method: "explicit" | "opt_in" | "opt_out" | "implied";
    metadata?: Record<string, string> | undefined;
    version?: string | undefined;
    withdrawalDate?: Date | undefined;
}>;
declare const DataErasureRequestSchema: z.ZodObject<{
    id: z.ZodString;
    dataSubjectId: z.ZodString;
    requestDate: z.ZodDate;
    status: z.ZodEnum<["pending", "in_progress", "completed", "rejected"]>;
    reason: z.ZodString;
    requestedBy: z.ZodString;
    processedBy: z.ZodOptional<z.ZodString>;
    processedAt: z.ZodOptional<z.ZodDate>;
    erasureDetails: z.ZodObject<{
        dataCategories: z.ZodArray<z.ZodString, "many">;
        systemsAffected: z.ZodArray<z.ZodString, "many">;
        backupRetention: z.ZodDefault<z.ZodBoolean>;
        legalBasis: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dataCategories: string[];
        systemsAffected: string[];
        backupRetention: boolean;
        legalBasis?: string | undefined;
    }, {
        dataCategories: string[];
        systemsAffected: string[];
        legalBasis?: string | undefined;
        backupRetention?: boolean | undefined;
    }>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "in_progress" | "completed" | "rejected";
    dataSubjectId: string;
    requestDate: Date;
    reason: string;
    requestedBy: string;
    erasureDetails: {
        dataCategories: string[];
        systemsAffected: string[];
        backupRetention: boolean;
        legalBasis?: string | undefined;
    };
    metadata?: Record<string, string> | undefined;
    processedBy?: string | undefined;
    processedAt?: Date | undefined;
}, {
    id: string;
    status: "pending" | "in_progress" | "completed" | "rejected";
    dataSubjectId: string;
    requestDate: Date;
    reason: string;
    requestedBy: string;
    erasureDetails: {
        dataCategories: string[];
        systemsAffected: string[];
        legalBasis?: string | undefined;
        backupRetention?: boolean | undefined;
    };
    metadata?: Record<string, string> | undefined;
    processedBy?: string | undefined;
    processedAt?: Date | undefined;
}>;
declare const DataPortabilityRequestSchema: z.ZodObject<{
    id: z.ZodString;
    dataSubjectId: z.ZodString;
    requestDate: z.ZodDate;
    status: z.ZodEnum<["pending", "in_progress", "completed", "rejected"]>;
    requestedBy: z.ZodString;
    processedBy: z.ZodOptional<z.ZodString>;
    processedAt: z.ZodOptional<z.ZodDate>;
    dataFormat: z.ZodEnum<["json", "csv", "xml", "pdf"]>;
    dataCategories: z.ZodArray<z.ZodString, "many">;
    downloadUrl: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodDate>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "in_progress" | "completed" | "rejected";
    dataCategories: string[];
    dataSubjectId: string;
    requestDate: Date;
    requestedBy: string;
    dataFormat: "json" | "csv" | "xml" | "pdf";
    metadata?: Record<string, string> | undefined;
    processedBy?: string | undefined;
    processedAt?: Date | undefined;
    downloadUrl?: string | undefined;
    expiresAt?: Date | undefined;
}, {
    id: string;
    status: "pending" | "in_progress" | "completed" | "rejected";
    dataCategories: string[];
    dataSubjectId: string;
    requestDate: Date;
    requestedBy: string;
    dataFormat: "json" | "csv" | "xml" | "pdf";
    metadata?: Record<string, string> | undefined;
    processedBy?: string | undefined;
    processedAt?: Date | undefined;
    downloadUrl?: string | undefined;
    expiresAt?: Date | undefined;
}>;
type DataSubject = z.infer<typeof DataSubjectSchema>;
type DataProcessingActivity = z.infer<typeof DataProcessingActivitySchema>;
type ConsentRecord = z.infer<typeof ConsentRecordSchema>;
type DataErasureRequest = z.infer<typeof DataErasureRequestSchema>;
type DataPortabilityRequest = z.infer<typeof DataPortabilityRequestSchema>;
declare class GDPRManager {
    private dataSubjects;
    private processingActivities;
    private consentRecords;
    private erasureRequests;
    private portabilityRequests;
    createDataSubject(data: Omit<DataSubject, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataSubject>;
    getDataSubject(id: string): Promise<DataSubject | null>;
    updateDataSubject(id: string, updates: Partial<DataSubject>): Promise<DataSubject | null>;
    deleteDataSubject(id: string): Promise<boolean>;
    searchDataSubjects(query: {
        email?: string;
        name?: string;
        phone?: string;
    }): Promise<DataSubject[]>;
    createProcessingActivity(data: Omit<DataProcessingActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataProcessingActivity>;
    getProcessingActivity(id: string): Promise<DataProcessingActivity | null>;
    getProcessingActivitiesForSubject(dataSubjectId: string): Promise<DataProcessingActivity[]>;
    recordConsent(dataSubjectId: string, purpose: string, consentGiven: boolean, method?: ConsentRecord['method']): Promise<ConsentRecord>;
    getConsentRecords(dataSubjectId: string): Promise<ConsentRecord[]>;
    withdrawConsent(dataSubjectId: string, purpose: string): Promise<boolean>;
    hasValidConsent(dataSubjectId: string, purpose: string): Promise<boolean>;
    requestDataErasure(dataSubjectId: string, reason: string, requestedBy: string): Promise<DataErasureRequest>;
    processDataErasure(requestId: string, processedBy: string, erasureDetails: DataErasureRequest['erasureDetails']): Promise<DataErasureRequest | null>;
    getErasureRequests(dataSubjectId?: string): Promise<DataErasureRequest[]>;
    requestDataPortability(dataSubjectId: string, dataFormat?: DataPortabilityRequest['dataFormat'], dataCategories?: string[]): Promise<DataPortabilityRequest>;
    processDataPortability(requestId: string, processedBy: string): Promise<DataPortabilityRequest | null>;
    getPortabilityRequests(dataSubjectId?: string): Promise<DataPortabilityRequest[]>;
    generateGDPRReport(_period: {
        start: Date;
        end: Date;
    }): Promise<{
        summary: {
            totalDataSubjects: number;
            activeProcessingActivities: number;
            consentRecords: number;
            erasureRequests: number;
            portabilityRequests: number;
        };
        compliance: {
            consentRate: number;
            erasureResponseTime: number;
            portabilityResponseTime: number;
            dataMinimization: boolean;
            purposeLimitation: boolean;
        };
        recommendations: string[];
    }>;
    private generateId;
    private performDataErasure;
    private generateDataExport;
    private uploadDataExport;
    private calculateAverageResponseTime;
    private generateComplianceRecommendations;
}
declare const globalGDPRManager: GDPRManager;

interface ComplianceDashboardProps {
    className?: string;
}
declare function ComplianceDashboard({ className }: ComplianceDashboardProps): react_jsx_runtime.JSX.Element;

declare class ComplianceManager {
    private auditLogger;
    private gdprManager;
    constructor();
    logEvent(event: any): Promise<{
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        source: string;
        version: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>;
    logUserAction(userId: string, action: string, description: string, metadata?: Record<string, any>): Promise<{
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        source: string;
        version: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>;
    logPaymentEvent(customerId: string, eventType: any, action: string, description: string, resourceId?: string, metadata?: Record<string, any>): Promise<{
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        source: string;
        version: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>;
    logDataAccess(userId: string, resourceType: string, resourceId: string, action: string, metadata?: Record<string, any>): Promise<{
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        source: string;
        version: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>;
    logSecurityEvent(eventType: 'security_event', action: string, description: string, severity?: any, metadata?: Record<string, any>): Promise<{
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        source: string;
        version: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>;
    logComplianceEvent(eventType: 'compliance_event', action: string, description: string, metadata?: Record<string, any>): Promise<{
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        source: string;
        version: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>;
    getEvents(filters?: any): {
        id: string;
        timestamp: Date;
        eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
        action: string;
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        source: string;
        version: string;
        userId?: string | undefined;
        customerId?: string | undefined;
        resourceId?: string | undefined;
        resourceType?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    getAuditTrail(entityId: string, entityType: string): {
        id: string;
        entityId: string;
        entityType: string;
        events: {
            id: string;
            timestamp: Date;
            eventType: "user_login" | "user_logout" | "user_created" | "user_updated" | "user_deleted" | "payment_created" | "payment_updated" | "payment_cancelled" | "payment_refunded" | "subscription_created" | "subscription_updated" | "subscription_cancelled" | "data_accessed" | "data_modified" | "data_deleted" | "data_exported" | "data_imported" | "system_error" | "security_event" | "compliance_event";
            action: string;
            description: string;
            severity: "low" | "medium" | "high" | "critical";
            source: string;
            version: string;
            userId?: string | undefined;
            customerId?: string | undefined;
            resourceId?: string | undefined;
            resourceType?: string | undefined;
            ipAddress?: string | undefined;
            userAgent?: string | undefined;
            metadata?: Record<string, any> | undefined;
        }[];
        createdAt: Date;
        updatedAt: Date;
    };
    generateAuditComplianceReport(reportType: any, period: {
        start: Date;
        end: Date;
    }, generatedBy: string): Promise<{
        id: string;
        status: "pending" | "in_progress" | "completed" | "failed";
        reportType: "custom" | "gdpr" | "soc2" | "pci" | "hipaa";
        period: {
            start: Date;
            end: Date;
        };
        findings: {
            id: string;
            status: "in_progress" | "open" | "resolved" | "dismissed";
            type: "violation" | "warning" | "recommendation" | "info";
            description: string;
            severity: "low" | "medium" | "high" | "critical";
            createdAt: Date;
            recommendation?: string | undefined;
            resolvedAt?: Date | undefined;
        }[];
        summary: {
            totalEvents: number;
            violations: number;
            warnings: number;
            recommendations: number;
            complianceScore: number;
        };
        generatedAt: Date;
        generatedBy: string;
    }>;
    exportAuditData(filters?: any, format?: 'json' | 'csv'): Promise<string>;
    createDataSubject(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        metadata?: Record<string, string> | undefined;
        name?: string | undefined;
        phone?: string | undefined;
        address?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
        } | undefined;
    }>;
    getDataSubject(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        metadata?: Record<string, string> | undefined;
        name?: string | undefined;
        phone?: string | undefined;
        address?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
        } | undefined;
    } | null>;
    updateDataSubject(id: string, updates: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        metadata?: Record<string, string> | undefined;
        name?: string | undefined;
        phone?: string | undefined;
        address?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
        } | undefined;
    } | null>;
    deleteDataSubject(id: string): Promise<boolean>;
    searchDataSubjects(query: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        metadata?: Record<string, string> | undefined;
        name?: string | undefined;
        phone?: string | undefined;
        address?: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
        } | undefined;
    }[]>;
    createProcessingActivity(data: any): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        purpose: string;
        legalBasis: "consent" | "contract" | "legal_obligation" | "vital_interests" | "public_task" | "legitimate_interests";
        dataCategories: string[];
        dataSubjects: string[];
        processors: string[];
        retentionPeriod: number;
        isActive: boolean;
    }>;
    getProcessingActivity(id: string): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        purpose: string;
        legalBasis: "consent" | "contract" | "legal_obligation" | "vital_interests" | "public_task" | "legitimate_interests";
        dataCategories: string[];
        dataSubjects: string[];
        processors: string[];
        retentionPeriod: number;
        isActive: boolean;
    } | null>;
    getProcessingActivitiesForSubject(dataSubjectId: string): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        purpose: string;
        legalBasis: "consent" | "contract" | "legal_obligation" | "vital_interests" | "public_task" | "legitimate_interests";
        dataCategories: string[];
        dataSubjects: string[];
        processors: string[];
        retentionPeriod: number;
        isActive: boolean;
    }[]>;
    recordConsent(dataSubjectId: string, purpose: string, consentGiven: boolean, method?: any): Promise<{
        id: string;
        version: string;
        purpose: string;
        dataSubjectId: string;
        consentGiven: boolean;
        consentDate: Date;
        method: "explicit" | "opt_in" | "opt_out" | "implied";
        metadata?: Record<string, string> | undefined;
        withdrawalDate?: Date | undefined;
    }>;
    getConsentRecords(dataSubjectId: string): Promise<{
        id: string;
        version: string;
        purpose: string;
        dataSubjectId: string;
        consentGiven: boolean;
        consentDate: Date;
        method: "explicit" | "opt_in" | "opt_out" | "implied";
        metadata?: Record<string, string> | undefined;
        withdrawalDate?: Date | undefined;
    }[]>;
    withdrawConsent(dataSubjectId: string, purpose: string): Promise<boolean>;
    hasValidConsent(dataSubjectId: string, purpose: string): Promise<boolean>;
    requestDataErasure(dataSubjectId: string, reason: string, requestedBy: string): Promise<{
        id: string;
        status: "pending" | "in_progress" | "completed" | "rejected";
        dataSubjectId: string;
        requestDate: Date;
        reason: string;
        requestedBy: string;
        erasureDetails: {
            dataCategories: string[];
            systemsAffected: string[];
            backupRetention: boolean;
            legalBasis?: string | undefined;
        };
        metadata?: Record<string, string> | undefined;
        processedBy?: string | undefined;
        processedAt?: Date | undefined;
    }>;
    processDataErasure(requestId: string, processedBy: string, erasureDetails: any): Promise<{
        id: string;
        status: "pending" | "in_progress" | "completed" | "rejected";
        dataSubjectId: string;
        requestDate: Date;
        reason: string;
        requestedBy: string;
        erasureDetails: {
            dataCategories: string[];
            systemsAffected: string[];
            backupRetention: boolean;
            legalBasis?: string | undefined;
        };
        metadata?: Record<string, string> | undefined;
        processedBy?: string | undefined;
        processedAt?: Date | undefined;
    } | null>;
    getErasureRequests(dataSubjectId?: string): Promise<{
        id: string;
        status: "pending" | "in_progress" | "completed" | "rejected";
        dataSubjectId: string;
        requestDate: Date;
        reason: string;
        requestedBy: string;
        erasureDetails: {
            dataCategories: string[];
            systemsAffected: string[];
            backupRetention: boolean;
            legalBasis?: string | undefined;
        };
        metadata?: Record<string, string> | undefined;
        processedBy?: string | undefined;
        processedAt?: Date | undefined;
    }[]>;
    requestDataPortability(dataSubjectId: string, dataFormat?: any, dataCategories?: string[]): Promise<{
        id: string;
        status: "pending" | "in_progress" | "completed" | "rejected";
        dataCategories: string[];
        dataSubjectId: string;
        requestDate: Date;
        requestedBy: string;
        dataFormat: "json" | "csv" | "xml" | "pdf";
        metadata?: Record<string, string> | undefined;
        processedBy?: string | undefined;
        processedAt?: Date | undefined;
        downloadUrl?: string | undefined;
        expiresAt?: Date | undefined;
    }>;
    processDataPortability(requestId: string, processedBy: string): Promise<{
        id: string;
        status: "pending" | "in_progress" | "completed" | "rejected";
        dataCategories: string[];
        dataSubjectId: string;
        requestDate: Date;
        requestedBy: string;
        dataFormat: "json" | "csv" | "xml" | "pdf";
        metadata?: Record<string, string> | undefined;
        processedBy?: string | undefined;
        processedAt?: Date | undefined;
        downloadUrl?: string | undefined;
        expiresAt?: Date | undefined;
    } | null>;
    getPortabilityRequests(dataSubjectId?: string): Promise<{
        id: string;
        status: "pending" | "in_progress" | "completed" | "rejected";
        dataCategories: string[];
        dataSubjectId: string;
        requestDate: Date;
        requestedBy: string;
        dataFormat: "json" | "csv" | "xml" | "pdf";
        metadata?: Record<string, string> | undefined;
        processedBy?: string | undefined;
        processedAt?: Date | undefined;
        downloadUrl?: string | undefined;
        expiresAt?: Date | undefined;
    }[]>;
    generateGDPRReport(period: {
        start: Date;
        end: Date;
    }): Promise<{
        summary: {
            totalDataSubjects: number;
            activeProcessingActivities: number;
            consentRecords: number;
            erasureRequests: number;
            portabilityRequests: number;
        };
        compliance: {
            consentRate: number;
            erasureResponseTime: number;
            portabilityResponseTime: number;
            dataMinimization: boolean;
            purposeLimitation: boolean;
        };
        recommendations: string[];
    }>;
    performComplianceCheck(): Promise<{
        overallScore: number;
        status: string;
        findings: any[];
        recommendations: string[];
    }>;
    generateComplianceReport(reportType?: 'gdpr' | 'soc2' | 'pci' | 'hipaa' | 'custom'): Promise<any>;
}
declare const globalComplianceManager: ComplianceManager;
declare function useComplianceDashboard(): {
    complianceData: any;
    loading: boolean;
    error: string | null;
};
declare function useAuditTrail(entityId: string, entityType: string): {
    auditTrail: any;
    loading: boolean;
    error: string | null;
};
declare function useGDPRData(dataSubjectId: string): {
    gdprData: any;
    loading: boolean;
    error: string | null;
};

export { type AuditEvent, AuditEventSchema, AuditLogger, type AuditTrail, AuditTrailSchema, ComplianceDashboard, ComplianceManager, type ComplianceReport, ComplianceReportSchema, type ConsentRecord, ConsentRecordSchema, type DataErasureRequest, DataErasureRequestSchema, type DataPortabilityRequest, DataPortabilityRequestSchema, type DataProcessingActivity, DataProcessingActivitySchema, type DataSubject, DataSubjectSchema, GDPRManager, ComplianceManager as default, globalAuditLogger, globalComplianceManager, globalGDPRManager, useAuditTrail, useComplianceDashboard, useGDPRData };
