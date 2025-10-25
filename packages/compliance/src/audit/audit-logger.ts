import { z } from 'zod';
import crypto from 'crypto';

// ============================================================================
// Audit Log Schemas
// ============================================================================

export const AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  eventType: z.enum([
    'user_login',
    'user_logout',
    'user_created',
    'user_updated',
    'user_deleted',
    'payment_created',
    'payment_updated',
    'payment_cancelled',
    'payment_refunded',
    'subscription_created',
    'subscription_updated',
    'subscription_cancelled',
    'data_accessed',
    'data_modified',
    'data_deleted',
    'data_exported',
    'data_imported',
    'system_error',
    'security_event',
    'compliance_event',
  ]),
  userId: z.string().optional(),
  customerId: z.string().optional(),
  resourceId: z.string().optional(),
  resourceType: z.string().optional(),
  action: z.string(),
  description: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  source: z.string().default('carnil-sdk'),
  version: z.string().default('1.0.0'),
});

export const AuditTrailSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  events: z.array(AuditEventSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ComplianceReportSchema = z.object({
  id: z.string(),
  reportType: z.enum(['gdpr', 'soc2', 'pci', 'hipaa', 'custom']),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  findings: z.array(z.object({
    id: z.string(),
    type: z.enum(['violation', 'warning', 'recommendation', 'info']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    recommendation: z.string().optional(),
    status: z.enum(['open', 'in_progress', 'resolved', 'dismissed']),
    createdAt: z.date(),
    resolvedAt: z.date().optional(),
  })),
  summary: z.object({
    totalEvents: z.number(),
    violations: z.number(),
    warnings: z.number(),
    recommendations: z.number(),
    complianceScore: z.number().min(0).max(100),
  }),
  generatedAt: z.date(),
  generatedBy: z.string(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditTrail = z.infer<typeof AuditTrailSchema>;
export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;

// ============================================================================
// Audit Logger
// ============================================================================

export class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents: number = 10000;
  private retentionDays: number = 2555; // 7 years for compliance

  constructor(_encryptionKey?: string) {
    // Encryption key handling would be implemented here
  }

  // ============================================================================
  // Event Logging
  // ============================================================================

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event,
    };

    // Encrypt sensitive data
    if (auditEvent.metadata) {
      auditEvent.metadata = this.encryptMetadata(auditEvent.metadata);
    }

    this.events.push(auditEvent);

    // Cleanup old events
    this.cleanupOldEvents();

    return auditEvent;
  }

  async logUserAction(
    userId: string,
    action: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<AuditEvent> {
    return this.logEvent({
      eventType: 'data_modified',
      userId,
      action,
      description,
      metadata,
      severity: 'medium',
      source: 'carnil-sdk',
      version: '1.0.0',
    });
  }

  async logPaymentEvent(
    customerId: string,
    eventType: AuditEvent['eventType'],
    action: string,
    description: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<AuditEvent> {
    return this.logEvent({
      eventType,
      customerId,
      resourceId,
      resourceType: 'payment',
      action,
      description,
      metadata,
      severity: 'high',
      source: 'carnil-sdk',
      version: '1.0.0',
    });
  }

  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<AuditEvent> {
    return this.logEvent({
      eventType: 'data_accessed',
      userId,
      resourceType,
      resourceId,
      action,
      description: `Accessed ${resourceType} ${resourceId}`,
      metadata,
      severity: 'medium',
      source: 'carnil-sdk',
      version: '1.0.0',
    });
  }

  async logSecurityEvent(
    eventType: 'security_event',
    action: string,
    description: string,
    severity: AuditEvent['severity'] = 'high',
    metadata?: Record<string, any>
  ): Promise<AuditEvent> {
    return this.logEvent({
      eventType,
      action,
      description,
      metadata,
      severity,
      source: 'carnil-sdk',
      version: '1.0.0',
    });
  }

  async logComplianceEvent(
    eventType: 'compliance_event',
    action: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<AuditEvent> {
    return this.logEvent({
      eventType,
      action,
      description,
      metadata,
      severity: 'high',
      source: 'carnil-sdk',
      version: '1.0.0',
    });
  }

  // ============================================================================
  // Event Retrieval
  // ============================================================================

  getEvents(filters?: {
    eventType?: AuditEvent['eventType'];
    userId?: string;
    customerId?: string;
    resourceType?: string;
    resourceId?: string;
    severity?: AuditEvent['severity'];
    startDate?: Date;
    endDate?: Date;
  }): AuditEvent[] {
    let filteredEvents = [...this.events];

    if (filters) {
      if (filters.eventType) {
        filteredEvents = filteredEvents.filter(e => e.eventType === filters.eventType);
      }
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === filters.userId);
      }
      if (filters.customerId) {
        filteredEvents = filteredEvents.filter(e => e.customerId === filters.customerId);
      }
      if (filters.resourceType) {
        filteredEvents = filteredEvents.filter(e => e.resourceType === filters.resourceType);
      }
      if (filters.resourceId) {
        filteredEvents = filteredEvents.filter(e => e.resourceId === filters.resourceId);
      }
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(e => e.severity === filters.severity);
      }
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= filters.endDate!);
      }
    }

    return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAuditTrail(entityId: string, entityType: string): AuditTrail {
    const events = this.getEvents({ resourceId: entityId, resourceType: entityType });
    
    return {
      id: `trail_${entityId}_${entityType}`,
      entityId,
      entityType,
      events,
      createdAt: events.length > 0 ? events[events.length - 1].timestamp : new Date(),
      updatedAt: events.length > 0 ? events[0].timestamp : new Date(),
    };
  }

  // ============================================================================
  // Compliance Reporting
  // ============================================================================

  async generateComplianceReport(
    reportType: ComplianceReport['reportType'],
    period: { start: Date; end: Date },
    generatedBy: string
  ): Promise<ComplianceReport> {
    const events = this.getEvents({
      startDate: period.start,
      endDate: period.end,
    });

    const findings = this.analyzeCompliance(events, reportType);
    const summary = this.calculateComplianceSummary(events, findings);

    return {
      id: `report_${reportType}_${Date.now()}`,
      reportType,
      period,
      status: 'completed',
      findings,
      summary,
      generatedAt: new Date(),
      generatedBy,
    };
  }

  // ============================================================================
  // Data Export
  // ============================================================================

  async exportAuditData(
    filters?: Parameters<AuditLogger['getEvents']>[0],
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const events = this.getEvents(filters);
    
    if (format === 'csv') {
      return this.exportToCSV(events);
    }
    
    return JSON.stringify(events, null, 2);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private generateEventId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private encryptMetadata(metadata: Record<string, any>): Record<string, any> {
    // Simple encryption for demo purposes
    // In production, use proper encryption
    const encrypted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' && value.length > 0) {
        encrypted[key] = `encrypted_${Buffer.from(value).toString('base64')}`;
      } else {
        encrypted[key] = value;
      }
    }
    
    return encrypted;
  }

  private cleanupOldEvents(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    
    this.events = this.events.filter(event => event.timestamp >= cutoffDate);
    
    // Keep only the most recent events if we exceed maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.maxEvents);
    }
  }

  private analyzeCompliance(events: AuditEvent[], reportType: ComplianceReport['reportType']): ComplianceReport['findings'] {
    const findings: ComplianceReport['findings'] = [];
    
    // Analyze for GDPR compliance
    if (reportType === 'gdpr') {
      // Check for data access events
      const dataAccessEvents = events.filter(e => e.eventType === 'data_accessed');
      if (dataAccessEvents.length > 0) {
        findings.push({
          id: `finding_${Date.now()}_1`,
          type: 'info',
          severity: 'low',
          description: `${dataAccessEvents.length} data access events recorded`,
          recommendation: 'Ensure all data access is properly logged and authorized',
          status: 'open',
          createdAt: new Date(),
        });
      }
      
      // Check for data deletion events
      const dataDeletionEvents = events.filter(e => e.eventType === 'data_deleted');
      if (dataDeletionEvents.length === 0) {
        findings.push({
          id: `finding_${Date.now()}_2`,
          type: 'warning',
          severity: 'medium',
          description: 'No data deletion events found',
          recommendation: 'Implement data deletion capabilities for GDPR compliance',
          status: 'open',
          createdAt: new Date(),
        });
      }
    }
    
    // Analyze for SOC2 compliance
    if (reportType === 'soc2') {
      // Check for security events
      const securityEvents = events.filter(e => e.eventType === 'security_event');
      if (securityEvents.length > 0) {
        findings.push({
          id: `finding_${Date.now()}_3`,
          type: 'violation',
          severity: 'high',
          description: `${securityEvents.length} security events detected`,
          recommendation: 'Review and address all security events',
          status: 'open',
          createdAt: new Date(),
        });
      }
      
      // Check for system errors
      const systemErrors = events.filter(e => e.eventType === 'system_error');
      if (systemErrors.length > 10) {
        findings.push({
          id: `finding_${Date.now()}_4`,
          type: 'warning',
          severity: 'medium',
          description: `${systemErrors.length} system errors detected`,
          recommendation: 'Investigate and resolve system errors',
          status: 'open',
          createdAt: new Date(),
        });
      }
    }
    
    return findings;
  }

  private calculateComplianceSummary(
    events: AuditEvent[],
    findings: ComplianceReport['findings']
  ): ComplianceReport['summary'] {
    const violations = findings.filter((f: any) => f.type === 'violation').length;
    const warnings = findings.filter((f: any) => f.type === 'warning').length;
    const recommendations = findings.filter((f: any) => f.type === 'recommendation').length;
    
    const complianceScore = Math.max(0, 100 - (violations * 20) - (warnings * 10) - (recommendations * 5));
    
    return {
      totalEvents: events.length,
      violations,
      warnings,
      recommendations,
      complianceScore,
    };
  }

  private exportToCSV(events: AuditEvent[]): string {
    const headers = [
      'id',
      'timestamp',
      'eventType',
      'userId',
      'customerId',
      'resourceId',
      'resourceType',
      'action',
      'description',
      'severity',
      'source',
      'version',
    ];
    
    const rows = events.map(event => [
      event.id,
      event.timestamp.toISOString(),
      event.eventType,
      event.userId || '',
      event.customerId || '',
      event.resourceId || '',
      event.resourceType || '',
      event.action,
      event.description,
      event.severity,
      event.source,
      event.version,
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }
}

// ============================================================================
// Global Audit Logger Instance
// ============================================================================

export const globalAuditLogger = new AuditLogger();
