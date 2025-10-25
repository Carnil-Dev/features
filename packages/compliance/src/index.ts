// ============================================================================
// Compliance Package Exports
// ============================================================================

// Audit Logging
export * from './audit/audit-logger';

// Data Protection
export * from './data-protection/gdpr-manager';

// Compliance Dashboard
export * from './compliance-dashboard/dashboard';

// ============================================================================
// Main Compliance Manager
// ============================================================================

import { AuditLogger, globalAuditLogger } from './audit/audit-logger';
import { GDPRManager, globalGDPRManager } from './data-protection/gdpr-manager';

export class ComplianceManager {
  private auditLogger: AuditLogger;
  private gdprManager: GDPRManager;

  constructor() {
    this.auditLogger = globalAuditLogger;
    this.gdprManager = globalGDPRManager;
  }

  // ============================================================================
  // Audit Logging
  // ============================================================================

  async logEvent(event: any) {
    return this.auditLogger.logEvent(event);
  }

  async logUserAction(userId: string, action: string, description: string, metadata?: Record<string, any>) {
    return this.auditLogger.logUserAction(userId, action, description, metadata);
  }

  async logPaymentEvent(customerId: string, eventType: any, action: string, description: string, resourceId?: string, metadata?: Record<string, any>) {
    return this.auditLogger.logPaymentEvent(customerId, eventType, action, description, resourceId, metadata);
  }

  async logDataAccess(userId: string, resourceType: string, resourceId: string, action: string, metadata?: Record<string, any>) {
    return this.auditLogger.logDataAccess(userId, resourceType, resourceId, action, metadata);
  }

  async logSecurityEvent(eventType: 'security_event', action: string, description: string, severity?: any, metadata?: Record<string, any>) {
    return this.auditLogger.logSecurityEvent(eventType, action, description, severity, metadata);
  }

  async logComplianceEvent(eventType: 'compliance_event', action: string, description: string, metadata?: Record<string, any>) {
    return this.auditLogger.logComplianceEvent(eventType, action, description, metadata);
  }

  getEvents(filters?: any) {
    return this.auditLogger.getEvents(filters);
  }

  getAuditTrail(entityId: string, entityType: string) {
    return this.auditLogger.getAuditTrail(entityId, entityType);
  }

  async generateComplianceReport(reportType: any, period: { start: Date; end: Date }, generatedBy: string) {
    return this.auditLogger.generateComplianceReport(reportType, period, generatedBy);
  }

  async exportAuditData(filters?: any, format: 'json' | 'csv' = 'json') {
    return this.auditLogger.exportAuditData(filters, format);
  }

  // ============================================================================
  // GDPR Management
  // ============================================================================

  async createDataSubject(data: any) {
    return this.gdprManager.createDataSubject(data);
  }

  async getDataSubject(id: string) {
    return this.gdprManager.getDataSubject(id);
  }

  async updateDataSubject(id: string, updates: any) {
    return this.gdprManager.updateDataSubject(id, updates);
  }

  async deleteDataSubject(id: string) {
    return this.gdprManager.deleteDataSubject(id);
  }

  async searchDataSubjects(query: any) {
    return this.gdprManager.searchDataSubjects(query);
  }

  async createProcessingActivity(data: any) {
    return this.gdprManager.createProcessingActivity(data);
  }

  async getProcessingActivity(id: string) {
    return this.gdprManager.getProcessingActivity(id);
  }

  async getProcessingActivitiesForSubject(dataSubjectId: string) {
    return this.gdprManager.getProcessingActivitiesForSubject(dataSubjectId);
  }

  async recordConsent(dataSubjectId: string, purpose: string, consentGiven: boolean, method?: any) {
    return this.gdprManager.recordConsent(dataSubjectId, purpose, consentGiven, method);
  }

  async getConsentRecords(dataSubjectId: string) {
    return this.gdprManager.getConsentRecords(dataSubjectId);
  }

  async withdrawConsent(dataSubjectId: string, purpose: string) {
    return this.gdprManager.withdrawConsent(dataSubjectId, purpose);
  }

  async hasValidConsent(dataSubjectId: string, purpose: string) {
    return this.gdprManager.hasValidConsent(dataSubjectId, purpose);
  }

  async requestDataErasure(dataSubjectId: string, reason: string, requestedBy: string) {
    return this.gdprManager.requestDataErasure(dataSubjectId, reason, requestedBy);
  }

  async processDataErasure(requestId: string, processedBy: string, erasureDetails: any) {
    return this.gdprManager.processDataErasure(requestId, processedBy, erasureDetails);
  }

  async getErasureRequests(dataSubjectId?: string) {
    return this.gdprManager.getErasureRequests(dataSubjectId);
  }

  async requestDataPortability(dataSubjectId: string, dataFormat?: any, dataCategories?: string[]) {
    return this.gdprManager.requestDataPortability(dataSubjectId, dataFormat, dataCategories);
  }

  async processDataPortability(requestId: string, processedBy: string) {
    return this.gdprManager.processDataPortability(requestId, processedBy);
  }

  async getPortabilityRequests(dataSubjectId?: string) {
    return this.gdprManager.getPortabilityRequests(dataSubjectId);
  }

  async generateGDPRReport(period: { start: Date; end: Date }) {
    return this.gdprManager.generateGDPRReport(period);
  }

  // ============================================================================
  // Combined Compliance Operations
  // ============================================================================

  async performComplianceCheck(): Promise<{
    overallScore: number;
    status: string;
    findings: any[];
    recommendations: string[];
  }> {
    // This would run a comprehensive compliance check
    const auditEvents = this.auditLogger.getEvents();
    const gdprReport = await this.gdprManager.generateGDPRReport({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    });

    const findings: any[] = [];
    const recommendations: string[] = [];

    // Analyze audit events for compliance issues
    const securityEvents = auditEvents.filter(e => e.eventType === 'security_event');
    if (securityEvents.length > 0) {
      findings.push({
        type: 'security',
        severity: 'high',
        description: `${securityEvents.length} security events detected`,
        recommendation: 'Review and address all security events',
      });
    }

    // Analyze GDPR compliance
    if (gdprReport.compliance.consentRate < 80) {
      findings.push({
        type: 'gdpr',
        severity: 'medium',
        description: 'Low consent rate detected',
        recommendation: 'Improve consent collection processes',
      });
    }

    if (gdprReport.compliance.erasureResponseTime > 30) {
      findings.push({
        type: 'gdpr',
        severity: 'medium',
        description: 'Slow data erasure response time',
        recommendation: 'Optimize data erasure processes',
      });
    }

    // Calculate overall score
    const totalFindings = findings.length;
    const criticalFindings = findings.filter(f => f.severity === 'high').length;
    const mediumFindings = findings.filter(f => f.severity === 'medium').length;
    
    const overallScore = Math.max(0, 100 - (criticalFindings * 20) - (mediumFindings * 10));
    const status = overallScore >= 80 ? 'COMPLIANT' : 'NON_COMPLIANT';

    // Generate recommendations
    if (criticalFindings > 0) {
      recommendations.push('Address critical compliance issues immediately');
    }
    if (mediumFindings > 0) {
      recommendations.push('Review and address medium priority issues');
    }
    if (overallScore < 80) {
      recommendations.push('Overall compliance score is below threshold');
    }

    return {
      overallScore,
      status,
      findings,
      recommendations,
    };
  }

  async generateComplianceReport(reportType: 'gdpr' | 'soc2' | 'pci' | 'hipaa' | 'custom' = 'custom'): Promise<any> {
    const period = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    };

    const [auditReport, gdprReport, complianceCheck] = await Promise.all([
      this.auditLogger.generateComplianceReport(reportType, period, 'system'),
      this.gdprManager.generateGDPRReport(period),
      this.performComplianceCheck(),
    ]);

    return {
      id: `compliance_report_${Date.now()}`,
      reportType,
      period,
      generatedAt: new Date(),
      generatedBy: 'system',
      status: 'completed',
      summary: {
        overallScore: complianceCheck.overallScore,
        status: complianceCheck.status,
        totalFindings: complianceCheck.findings.length,
        criticalFindings: complianceCheck.findings.filter(f => f.severity === 'high').length,
        mediumFindings: complianceCheck.findings.filter(f => f.severity === 'medium').length,
        lowFindings: complianceCheck.findings.filter(f => f.severity === 'low').length,
      },
      audit: auditReport,
      gdpr: gdprReport,
      compliance: complianceCheck,
      recommendations: complianceCheck.recommendations,
    };
  }
}

// ============================================================================
// Global Compliance Manager Instance
// ============================================================================

export const globalComplianceManager = new ComplianceManager();

// ============================================================================
// React Hooks for Compliance
// ============================================================================

import React, { useState, useEffect } from 'react';

export function useComplianceDashboard() {
  const [complianceData, setComplianceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setLoading(true);
        const report = await globalComplianceManager.generateComplianceReport();
        setComplianceData(report);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch compliance data');
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, []);

  return { complianceData, loading, error };
}

export function useAuditTrail(entityId: string, entityType: string) {
  const [auditTrail, setAuditTrail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        setLoading(true);
        const trail = globalComplianceManager.getAuditTrail(entityId, entityType);
        setAuditTrail(trail);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch audit trail');
      } finally {
        setLoading(false);
      }
    };

    if (entityId && entityType) {
      fetchAuditTrail();
    }
  }, [entityId, entityType]);

  return { auditTrail, loading, error };
}

export function useGDPRData(dataSubjectId: string) {
  const [gdprData, setGdprData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGDPRData = async () => {
      try {
        setLoading(true);
        const [dataSubject, consentRecords, erasureRequests, portabilityRequests] = await Promise.all([
          globalComplianceManager.getDataSubject(dataSubjectId),
          globalComplianceManager.getConsentRecords(dataSubjectId),
          globalComplianceManager.getErasureRequests(dataSubjectId),
          globalComplianceManager.getPortabilityRequests(dataSubjectId),
        ]);
        
        setGdprData({
          dataSubject,
          consentRecords,
          erasureRequests,
          portabilityRequests,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch GDPR data');
      } finally {
        setLoading(false);
      }
    };

    if (dataSubjectId) {
      fetchGDPRData();
    }
  }, [dataSubjectId]);

  return { gdprData, loading, error };
}

// ============================================================================
// Default Export
// ============================================================================

export default ComplianceManager;
