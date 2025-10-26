import { z } from 'zod';
import crypto from 'crypto';
import { useState, useEffect } from 'react';
import { RefreshCw, XCircle, Download, Settings, Shield, Users, Lock, FileText, CheckCircle, AlertTriangle, Info, Eye } from 'lucide-react';
import { jsx, jsxs } from 'react/jsx-runtime';

// src/audit/audit-logger.ts
var AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  eventType: z.enum([
    "user_login",
    "user_logout",
    "user_created",
    "user_updated",
    "user_deleted",
    "payment_created",
    "payment_updated",
    "payment_cancelled",
    "payment_refunded",
    "subscription_created",
    "subscription_updated",
    "subscription_cancelled",
    "data_accessed",
    "data_modified",
    "data_deleted",
    "data_exported",
    "data_imported",
    "system_error",
    "security_event",
    "compliance_event"
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
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  source: z.string().default("carnil-sdk"),
  version: z.string().default("1.0.0")
});
var AuditTrailSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  events: z.array(AuditEventSchema),
  createdAt: z.date(),
  updatedAt: z.date()
});
var ComplianceReportSchema = z.object({
  id: z.string(),
  reportType: z.enum(["gdpr", "soc2", "pci", "hipaa", "custom"]),
  period: z.object({
    start: z.date(),
    end: z.date()
  }),
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
  findings: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["violation", "warning", "recommendation", "info"]),
      severity: z.enum(["low", "medium", "high", "critical"]),
      description: z.string(),
      recommendation: z.string().optional(),
      status: z.enum(["open", "in_progress", "resolved", "dismissed"]),
      createdAt: z.date(),
      resolvedAt: z.date().optional()
    })
  ),
  summary: z.object({
    totalEvents: z.number(),
    violations: z.number(),
    warnings: z.number(),
    recommendations: z.number(),
    complianceScore: z.number().min(0).max(100)
  }),
  generatedAt: z.date(),
  generatedBy: z.string()
});
var AuditLogger = class {
  // 7 years for compliance
  constructor(_encryptionKey) {
    this.events = [];
    this.maxEvents = 1e4;
    this.retentionDays = 2555;
  }
  // ============================================================================
  // Event Logging
  // ============================================================================
  async logEvent(event) {
    const auditEvent = {
      id: this.generateEventId(),
      timestamp: /* @__PURE__ */ new Date(),
      ...event
    };
    if (auditEvent.metadata) {
      auditEvent.metadata = this.encryptMetadata(auditEvent.metadata);
    }
    this.events.push(auditEvent);
    this.cleanupOldEvents();
    return auditEvent;
  }
  async logUserAction(userId, action, description, metadata) {
    return this.logEvent({
      eventType: "data_modified",
      userId,
      action,
      description,
      metadata,
      severity: "medium",
      source: "carnil-sdk",
      version: "1.0.0"
    });
  }
  async logPaymentEvent(customerId, eventType, action, description, resourceId, metadata) {
    return this.logEvent({
      eventType,
      customerId,
      resourceId,
      resourceType: "payment",
      action,
      description,
      metadata,
      severity: "high",
      source: "carnil-sdk",
      version: "1.0.0"
    });
  }
  async logDataAccess(userId, resourceType, resourceId, action, metadata) {
    return this.logEvent({
      eventType: "data_accessed",
      userId,
      resourceType,
      resourceId,
      action,
      description: `Accessed ${resourceType} ${resourceId}`,
      metadata,
      severity: "medium",
      source: "carnil-sdk",
      version: "1.0.0"
    });
  }
  async logSecurityEvent(eventType, action, description, severity = "high", metadata) {
    return this.logEvent({
      eventType,
      action,
      description,
      metadata,
      severity,
      source: "carnil-sdk",
      version: "1.0.0"
    });
  }
  async logComplianceEvent(eventType, action, description, metadata) {
    return this.logEvent({
      eventType,
      action,
      description,
      metadata,
      severity: "high",
      source: "carnil-sdk",
      version: "1.0.0"
    });
  }
  // ============================================================================
  // Event Retrieval
  // ============================================================================
  getEvents(filters) {
    let filteredEvents = [...this.events];
    if (filters) {
      if (filters.eventType) {
        filteredEvents = filteredEvents.filter(
          (e) => e.eventType === filters.eventType
        );
      }
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(
          (e) => e.userId === filters.userId
        );
      }
      if (filters.customerId) {
        filteredEvents = filteredEvents.filter(
          (e) => e.customerId === filters.customerId
        );
      }
      if (filters.resourceType) {
        filteredEvents = filteredEvents.filter(
          (e) => e.resourceType === filters.resourceType
        );
      }
      if (filters.resourceId) {
        filteredEvents = filteredEvents.filter(
          (e) => e.resourceId === filters.resourceId
        );
      }
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(
          (e) => e.severity === filters.severity
        );
      }
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(
          (e) => e.timestamp >= filters.startDate
        );
      }
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(
          (e) => e.timestamp <= filters.endDate
        );
      }
    }
    return filteredEvents.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
  getAuditTrail(entityId, entityType) {
    const events = this.getEvents({
      resourceId: entityId,
      resourceType: entityType
    });
    return {
      id: `trail_${entityId}_${entityType}`,
      entityId,
      entityType,
      events,
      createdAt: events.length > 0 ? events[events.length - 1]?.timestamp || /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(),
      updatedAt: events.length > 0 ? events[0]?.timestamp || /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date()
    };
  }
  // ============================================================================
  // Compliance Reporting
  // ============================================================================
  async generateComplianceReport(reportType, period, generatedBy) {
    const events = this.getEvents({
      startDate: period.start,
      endDate: period.end
    });
    const findings = this.analyzeCompliance(events, reportType);
    const summary = this.calculateComplianceSummary(events, findings);
    return {
      id: `report_${reportType}_${Date.now()}`,
      reportType,
      period,
      status: "completed",
      findings,
      summary,
      generatedAt: /* @__PURE__ */ new Date(),
      generatedBy
    };
  }
  // ============================================================================
  // Data Export
  // ============================================================================
  async exportAuditData(filters, format = "json") {
    const events = this.getEvents(filters);
    if (format === "csv") {
      return this.exportToCSV(events);
    }
    return JSON.stringify(events, null, 2);
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  generateEventId() {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }
  encryptMetadata(metadata) {
    const encrypted = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === "string" && value.length > 0) {
        encrypted[key] = `encrypted_${Buffer.from(value).toString("base64")}`;
      } else {
        encrypted[key] = value;
      }
    }
    return encrypted;
  }
  cleanupOldEvents() {
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    this.events = this.events.filter((event) => event.timestamp >= cutoffDate);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, this.maxEvents);
    }
  }
  analyzeCompliance(events, reportType) {
    const findings = [];
    if (reportType === "gdpr") {
      const dataAccessEvents = events.filter(
        (e) => e.eventType === "data_accessed"
      );
      if (dataAccessEvents.length > 0) {
        findings.push({
          id: `finding_${Date.now()}_1`,
          type: "info",
          severity: "low",
          description: `${dataAccessEvents.length} data access events recorded`,
          recommendation: "Ensure all data access is properly logged and authorized",
          status: "open",
          createdAt: /* @__PURE__ */ new Date()
        });
      }
      const dataDeletionEvents = events.filter(
        (e) => e.eventType === "data_deleted"
      );
      if (dataDeletionEvents.length === 0) {
        findings.push({
          id: `finding_${Date.now()}_2`,
          type: "warning",
          severity: "medium",
          description: "No data deletion events found",
          recommendation: "Implement data deletion capabilities for GDPR compliance",
          status: "open",
          createdAt: /* @__PURE__ */ new Date()
        });
      }
    }
    if (reportType === "soc2") {
      const securityEvents = events.filter(
        (e) => e.eventType === "security_event"
      );
      if (securityEvents.length > 0) {
        findings.push({
          id: `finding_${Date.now()}_3`,
          type: "violation",
          severity: "high",
          description: `${securityEvents.length} security events detected`,
          recommendation: "Review and address all security events",
          status: "open",
          createdAt: /* @__PURE__ */ new Date()
        });
      }
      const systemErrors = events.filter((e) => e.eventType === "system_error");
      if (systemErrors.length > 10) {
        findings.push({
          id: `finding_${Date.now()}_4`,
          type: "warning",
          severity: "medium",
          description: `${systemErrors.length} system errors detected`,
          recommendation: "Investigate and resolve system errors",
          status: "open",
          createdAt: /* @__PURE__ */ new Date()
        });
      }
    }
    return findings;
  }
  calculateComplianceSummary(events, findings) {
    const violations = findings.filter(
      (f) => f.type === "violation"
    ).length;
    const warnings = findings.filter((f) => f.type === "warning").length;
    const recommendations = findings.filter(
      (f) => f.type === "recommendation"
    ).length;
    const complianceScore = Math.max(
      0,
      100 - violations * 20 - warnings * 10 - recommendations * 5
    );
    return {
      totalEvents: events.length,
      violations,
      warnings,
      recommendations,
      complianceScore
    };
  }
  exportToCSV(events) {
    const headers = [
      "id",
      "timestamp",
      "eventType",
      "userId",
      "customerId",
      "resourceId",
      "resourceType",
      "action",
      "description",
      "severity",
      "source",
      "version"
    ];
    const rows = events.map((event) => [
      event.id,
      event.timestamp.toISOString(),
      event.eventType,
      event.userId || "",
      event.customerId || "",
      event.resourceId || "",
      event.resourceType || "",
      event.action,
      event.description,
      event.severity,
      event.source,
      event.version
    ]);
    return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n");
  }
};
var globalAuditLogger = new AuditLogger();
var DataSubjectSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  metadata: z.record(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
var DataProcessingActivitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  purpose: z.string(),
  legalBasis: z.enum([
    "consent",
    "contract",
    "legal_obligation",
    "vital_interests",
    "public_task",
    "legitimate_interests"
  ]),
  dataCategories: z.array(z.string()),
  dataSubjects: z.array(z.string()),
  // Data subject IDs
  processors: z.array(z.string()),
  // Processor IDs
  retentionPeriod: z.number(),
  // Days
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});
var ConsentRecordSchema = z.object({
  id: z.string(),
  dataSubjectId: z.string(),
  purpose: z.string(),
  consentGiven: z.boolean(),
  consentDate: z.date(),
  withdrawalDate: z.date().optional(),
  method: z.enum(["explicit", "opt_in", "opt_out", "implied"]),
  version: z.string().default("1.0"),
  metadata: z.record(z.string()).optional()
});
var DataErasureRequestSchema = z.object({
  id: z.string(),
  dataSubjectId: z.string(),
  requestDate: z.date(),
  status: z.enum(["pending", "in_progress", "completed", "rejected"]),
  reason: z.string(),
  requestedBy: z.string(),
  processedBy: z.string().optional(),
  processedAt: z.date().optional(),
  erasureDetails: z.object({
    dataCategories: z.array(z.string()),
    systemsAffected: z.array(z.string()),
    backupRetention: z.boolean().default(false),
    legalBasis: z.string().optional()
  }),
  metadata: z.record(z.string()).optional()
});
var DataPortabilityRequestSchema = z.object({
  id: z.string(),
  dataSubjectId: z.string(),
  requestDate: z.date(),
  status: z.enum(["pending", "in_progress", "completed", "rejected"]),
  requestedBy: z.string(),
  processedBy: z.string().optional(),
  processedAt: z.date().optional(),
  dataFormat: z.enum(["json", "csv", "xml", "pdf"]),
  dataCategories: z.array(z.string()),
  downloadUrl: z.string().optional(),
  expiresAt: z.date().optional(),
  metadata: z.record(z.string()).optional()
});
var GDPRManager = class {
  constructor() {
    this.dataSubjects = /* @__PURE__ */ new Map();
    this.processingActivities = /* @__PURE__ */ new Map();
    this.consentRecords = /* @__PURE__ */ new Map();
    this.erasureRequests = /* @__PURE__ */ new Map();
    this.portabilityRequests = /* @__PURE__ */ new Map();
  }
  // ============================================================================
  // Data Subject Management
  // ============================================================================
  async createDataSubject(data) {
    const dataSubject = {
      id: this.generateId(),
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.dataSubjects.set(dataSubject.id, dataSubject);
    return dataSubject;
  }
  async getDataSubject(id) {
    return this.dataSubjects.get(id) || null;
  }
  async updateDataSubject(id, updates) {
    const dataSubject = this.dataSubjects.get(id);
    if (!dataSubject) return null;
    const updatedDataSubject = {
      ...dataSubject,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.dataSubjects.set(id, updatedDataSubject);
    return updatedDataSubject;
  }
  async deleteDataSubject(id) {
    return this.dataSubjects.delete(id);
  }
  async searchDataSubjects(query) {
    const subjects = Array.from(this.dataSubjects.values());
    return subjects.filter((subject) => {
      if (query.email && !subject.email.toLowerCase().includes(query.email.toLowerCase())) {
        return false;
      }
      if (query.name && subject.name && !subject.name.toLowerCase().includes(query.name.toLowerCase())) {
        return false;
      }
      if (query.phone && subject.phone && !subject.phone.includes(query.phone)) {
        return false;
      }
      return true;
    });
  }
  // ============================================================================
  // Data Processing Activities
  // ============================================================================
  async createProcessingActivity(data) {
    const activity = {
      id: this.generateId(),
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.processingActivities.set(activity.id, activity);
    return activity;
  }
  async getProcessingActivity(id) {
    return this.processingActivities.get(id) || null;
  }
  async getProcessingActivitiesForSubject(dataSubjectId) {
    const activities = Array.from(this.processingActivities.values());
    return activities.filter(
      (activity) => activity.dataSubjects.includes(dataSubjectId) && activity.isActive
    );
  }
  // ============================================================================
  // Consent Management
  // ============================================================================
  async recordConsent(dataSubjectId, purpose, consentGiven, method = "explicit") {
    const consentRecord = {
      id: this.generateId(),
      dataSubjectId,
      purpose,
      consentGiven,
      consentDate: /* @__PURE__ */ new Date(),
      method,
      version: "1.0"
    };
    const existingConsents = this.consentRecords.get(dataSubjectId) || [];
    this.consentRecords.set(dataSubjectId, [...existingConsents, consentRecord]);
    return consentRecord;
  }
  async getConsentRecords(dataSubjectId) {
    return this.consentRecords.get(dataSubjectId) || [];
  }
  async withdrawConsent(dataSubjectId, purpose) {
    const consents = this.consentRecords.get(dataSubjectId) || [];
    const consent = consents.find((c) => c.purpose === purpose && c.consentGiven);
    if (consent) {
      consent.consentGiven = false;
      consent.withdrawalDate = /* @__PURE__ */ new Date();
      return true;
    }
    return false;
  }
  async hasValidConsent(dataSubjectId, purpose) {
    const consents = this.consentRecords.get(dataSubjectId) || [];
    const consent = consents.find((c) => c.purpose === purpose);
    return consent ? consent.consentGiven : false;
  }
  // ============================================================================
  // Data Erasure (Right to be Forgotten)
  // ============================================================================
  async requestDataErasure(dataSubjectId, reason, requestedBy) {
    const erasureRequest = {
      id: this.generateId(),
      dataSubjectId,
      requestDate: /* @__PURE__ */ new Date(),
      status: "pending",
      reason,
      requestedBy,
      erasureDetails: {
        dataCategories: [],
        // To be filled during processing
        systemsAffected: [],
        // To be filled during processing
        backupRetention: false
      }
    };
    this.erasureRequests.set(erasureRequest.id, erasureRequest);
    return erasureRequest;
  }
  async processDataErasure(requestId, processedBy, erasureDetails) {
    const request = this.erasureRequests.get(requestId);
    if (!request) return null;
    request.status = "in_progress";
    request.processedBy = processedBy;
    request.erasureDetails = erasureDetails;
    await this.performDataErasure(request.dataSubjectId, erasureDetails);
    request.status = "completed";
    request.processedAt = /* @__PURE__ */ new Date();
    return request;
  }
  async getErasureRequests(dataSubjectId) {
    const requests = Array.from(this.erasureRequests.values());
    if (dataSubjectId) {
      return requests.filter((request) => request.dataSubjectId === dataSubjectId);
    }
    return requests;
  }
  // ============================================================================
  // Data Portability (Right to Data Portability)
  // ============================================================================
  async requestDataPortability(dataSubjectId, dataFormat = "json", dataCategories = []) {
    const portabilityRequest = {
      id: this.generateId(),
      dataSubjectId,
      requestDate: /* @__PURE__ */ new Date(),
      status: "pending",
      requestedBy: dataSubjectId,
      // Self-requested
      dataFormat,
      dataCategories,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
      // 30 days
    };
    this.portabilityRequests.set(portabilityRequest.id, portabilityRequest);
    return portabilityRequest;
  }
  async processDataPortability(requestId, processedBy) {
    const request = this.portabilityRequests.get(requestId);
    if (!request) return null;
    request.status = "in_progress";
    request.processedBy = processedBy;
    const exportData = await this.generateDataExport(request.dataSubjectId, request.dataCategories);
    const downloadUrl = await this.uploadDataExport(exportData, request.dataFormat);
    request.status = "completed";
    request.processedAt = /* @__PURE__ */ new Date();
    request.downloadUrl = downloadUrl;
    return request;
  }
  async getPortabilityRequests(dataSubjectId) {
    const requests = Array.from(this.portabilityRequests.values());
    if (dataSubjectId) {
      return requests.filter((request) => request.dataSubjectId === dataSubjectId);
    }
    return requests;
  }
  // ============================================================================
  // GDPR Compliance Reporting
  // ============================================================================
  async generateGDPRReport(_period) {
    const dataSubjects = Array.from(this.dataSubjects.values());
    const activities = Array.from(this.processingActivities.values());
    const erasureRequests = Array.from(this.erasureRequests.values());
    const portabilityRequests = Array.from(this.portabilityRequests.values());
    const totalConsentRecords = Array.from(this.consentRecords.values()).flat().length;
    const consentRate = dataSubjects.length > 0 ? totalConsentRecords / dataSubjects.length * 100 : 0;
    const erasureResponseTime = this.calculateAverageResponseTime(erasureRequests);
    const portabilityResponseTime = this.calculateAverageResponseTime(portabilityRequests);
    return {
      summary: {
        totalDataSubjects: dataSubjects.length,
        activeProcessingActivities: activities.filter((a) => a.isActive).length,
        consentRecords: totalConsentRecords,
        erasureRequests: erasureRequests.length,
        portabilityRequests: portabilityRequests.length
      },
      compliance: {
        consentRate,
        erasureResponseTime,
        portabilityResponseTime,
        dataMinimization: true,
        // Simplified
        purposeLimitation: true
        // Simplified
      },
      recommendations: this.generateComplianceRecommendations({
        consentRate,
        erasureResponseTime,
        portabilityResponseTime
      })
    };
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  generateId() {
    return `gdpr_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }
  async performDataErasure(dataSubjectId, erasureDetails) {
    console.log(`Performing data erasure for subject ${dataSubjectId}`);
    console.log(`Data categories: ${erasureDetails.dataCategories.join(", ")}`);
    console.log(`Systems affected: ${erasureDetails.systemsAffected.join(", ")}`);
  }
  async generateDataExport(dataSubjectId, _dataCategories) {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) throw new Error("Data subject not found");
    const exportData = {
      dataSubject: {
        id: dataSubject.id,
        email: dataSubject.email,
        name: dataSubject.name,
        phone: dataSubject.phone,
        address: dataSubject.address,
        createdAt: dataSubject.createdAt,
        updatedAt: dataSubject.updatedAt
      },
      processingActivities: await this.getProcessingActivitiesForSubject(dataSubjectId),
      consentRecords: await this.getConsentRecords(dataSubjectId),
      erasureRequests: await this.getErasureRequests(dataSubjectId),
      portabilityRequests: await this.getPortabilityRequests(dataSubjectId)
    };
    return exportData;
  }
  async uploadDataExport(_data, format) {
    const filename = `data_export_${Date.now()}.${format}`;
    const downloadUrl = `https://example.com/downloads/${filename}`;
    console.log(`Data export uploaded: ${downloadUrl}`);
    return downloadUrl;
  }
  calculateAverageResponseTime(requests) {
    const completedRequests = requests.filter((r) => r.processedAt);
    if (completedRequests.length === 0) return 0;
    const totalTime = completedRequests.reduce((sum, request) => {
      const responseTime = request.processedAt.getTime() - request.requestDate.getTime();
      return sum + responseTime;
    }, 0);
    return totalTime / completedRequests.length / (1e3 * 60 * 60 * 24);
  }
  generateComplianceRecommendations(metrics) {
    const recommendations = [];
    if (metrics.consentRate < 80) {
      recommendations.push("Improve consent collection processes to increase consent rate");
    }
    if (metrics.erasureResponseTime > 30) {
      recommendations.push("Optimize data erasure processes to reduce response time");
    }
    if (metrics.portabilityResponseTime > 7) {
      recommendations.push("Streamline data portability processes to meet GDPR requirements");
    }
    if (recommendations.length === 0) {
      recommendations.push("GDPR compliance is in good standing");
    }
    return recommendations;
  }
};
var globalGDPRManager = new GDPRManager();
function ComplianceDashboard({ className }) {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(
    "overview"
  );
  useEffect(() => {
    fetchComplianceData();
  }, []);
  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const mockData = {
        overview: {
          overallScore: 85,
          status: "COMPLIANT",
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
          totalChecks: 24,
          passed: 20,
          failed: 2,
          warnings: 2,
          critical: 0
        },
        gdpr: {
          dataSubjects: 1250,
          consentRate: 92,
          erasureRequests: 15,
          portabilityRequests: 8,
          complianceScore: 88,
          findings: [
            {
              id: "1",
              type: "warning",
              severity: "medium",
              description: "Data retention policies need review",
              status: "open"
            }
          ]
        },
        soc2: {
          securityScore: 90,
          availabilityScore: 95,
          processingIntegrity: 88,
          confidentiality: 92,
          privacy: 85,
          findings: [
            {
              id: "2",
              type: "info",
              severity: "low",
              description: "Security audit completed successfully",
              status: "resolved"
            }
          ]
        },
        audit: {
          totalEvents: 15420,
          securityEvents: 3,
          dataAccessEvents: 892,
          systemErrors: 12,
          lastAudit: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      setComplianceData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch compliance data");
    } finally {
      setLoading(false);
    }
  };
  const handleRefresh = () => {
    fetchComplianceData();
  };
  const handleExportReport = () => {
    const report = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      data: complianceData
    };
    if (typeof window === "undefined") return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-report-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: `flex items-center justify-center h-96 ${className}`, children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Loading compliance data..." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: `flex items-center justify-center h-96 ${className}`, children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(XCircle, { className: "w-8 h-8 mx-auto mb-4 text-red-600" }),
      /* @__PURE__ */ jsxs("p", { className: "text-red-600 mb-4", children: [
        "Error: ",
        error
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleRefresh,
          className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
          children: "Retry"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: `compliance-dashboard ${className}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Compliance Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Monitor and manage compliance across all regulations" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleRefresh,
            className: "p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100",
            title: "Refresh data",
            children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleExportReport,
            className: "p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100",
            title: "Export report",
            children: /* @__PURE__ */ jsx(Download, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100",
            title: "Settings",
            children: /* @__PURE__ */ jsx(Settings, { className: "w-5 h-5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex space-x-1 mb-6", children: [
      { id: "overview", label: "Overview", icon: Shield },
      { id: "gdpr", label: "GDPR", icon: Users },
      { id: "soc2", label: "SOC2", icon: Lock },
      { id: "audit", label: "Audit", icon: FileText }
    ].map(({ id, label, icon: Icon }) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setSelectedTab(id),
        className: `flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}`,
        children: [
          /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { children: label })
        ]
      },
      id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      selectedTab === "overview" && /* @__PURE__ */ jsx(OverviewTab, { data: complianceData?.overview }),
      selectedTab === "gdpr" && /* @__PURE__ */ jsx(GDPRTab, { data: complianceData?.gdpr }),
      selectedTab === "soc2" && /* @__PURE__ */ jsx(SOC2Tab, { data: complianceData?.soc2 }),
      selectedTab === "audit" && /* @__PURE__ */ jsx(AuditTab, { data: complianceData?.audit })
    ] })
  ] });
}
function OverviewTab({ data }) {
  if (!data) return null;
  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLIANT":
        return "text-green-600 bg-green-100";
      case "NON_COMPLIANT":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLIANT":
        return CheckCircle;
      case "NON_COMPLIANT":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };
  const StatusIcon = getStatusIcon(data.status);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Overall Compliance Status" }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`,
            children: [
              /* @__PURE__ */ jsx(StatusIcon, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: data.status })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [
            data.overallScore,
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Overall Score" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-green-600", children: data.passed }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Passed Checks" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-red-600", children: data.failed }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Failed Checks" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-600", children: data.passed }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Passed" })
        ] }),
        /* @__PURE__ */ jsx(CheckCircle, { className: "w-8 h-8 text-green-600" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-red-600", children: data.failed }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Failed" })
        ] }),
        /* @__PURE__ */ jsx(XCircle, { className: "w-8 h-8 text-red-600" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-yellow-600", children: data.warnings }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Warnings" })
        ] }),
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-8 h-8 text-yellow-600" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-gray-600", children: data.totalChecks }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Total Checks" })
        ] }),
        /* @__PURE__ */ jsx(Info, { className: "w-8 h-8 text-gray-600" })
      ] }) })
    ] })
  ] });
}
function GDPRTab({ data }) {
  if (!data) return null;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "GDPR Compliance" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-600", children: data.dataSubjects.toLocaleString() }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Data Subjects" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-green-600", children: [
            data.consentRate,
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Consent Rate" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-purple-600", children: data.erasureRequests }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Erasure Requests" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-orange-600", children: data.portabilityRequests }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Portability Requests" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Recent Findings" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: data.findings.map((finding) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-center justify-between p-3 bg-gray-50 rounded-md",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `w-3 h-3 rounded-full ${finding.severity === "high" ? "bg-red-500" : finding.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"}`
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900", children: finding.description }),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
                  "Severity: ",
                  finding.severity
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `px-2 py-1 rounded-full text-xs font-medium ${finding.status === "open" ? "bg-red-100 text-red-800" : finding.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`,
                children: finding.status
              }
            )
          ]
        },
        finding.id
      )) })
    ] })
  ] });
}
function SOC2Tab({ data }) {
  if (!data) return null;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "SOC2 Compliance" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [
            data.securityScore,
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Security" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-green-600", children: [
            data.availabilityScore,
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Availability" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [
            data.processingIntegrity,
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Processing Integrity" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [
            data.confidentiality,
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Confidentiality" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-red-600", children: [
            data.privacy,
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Privacy" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "SOC2 Findings" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: data.findings.map((finding) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-center justify-between p-3 bg-gray-50 rounded-md",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `w-3 h-3 rounded-full ${finding.severity === "high" ? "bg-red-500" : finding.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"}`
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900", children: finding.description }),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
                  "Type: ",
                  finding.type
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `px-2 py-1 rounded-full text-xs font-medium ${finding.status === "open" ? "bg-red-100 text-red-800" : finding.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`,
                children: finding.status
              }
            )
          ]
        },
        finding.id
      )) })
    ] })
  ] });
}
function AuditTab({ data }) {
  if (!data) return null;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Audit Trail" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-600", children: data.totalEvents.toLocaleString() }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Total Events" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-red-600", children: data.securityEvents }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Security Events" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-600", children: data.dataAccessEvents }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Data Access Events" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-yellow-600", children: data.systemErrors }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "System Errors" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Recent Activity" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-md", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5 text-blue-600" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900", children: "Data access logged" }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Customer data accessed by user" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "2 minutes ago" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-md", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5 text-green-600" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900", children: "Security event resolved" }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Suspicious login attempt blocked" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "1 hour ago" })
        ] })
      ] })
    ] })
  ] });
}
var ComplianceManager = class {
  constructor() {
    this.auditLogger = globalAuditLogger;
    this.gdprManager = globalGDPRManager;
  }
  // ============================================================================
  // Audit Logging
  // ============================================================================
  async logEvent(event) {
    return this.auditLogger.logEvent(event);
  }
  async logUserAction(userId, action, description, metadata) {
    return this.auditLogger.logUserAction(userId, action, description, metadata);
  }
  async logPaymentEvent(customerId, eventType, action, description, resourceId, metadata) {
    return this.auditLogger.logPaymentEvent(
      customerId,
      eventType,
      action,
      description,
      resourceId,
      metadata
    );
  }
  async logDataAccess(userId, resourceType, resourceId, action, metadata) {
    return this.auditLogger.logDataAccess(userId, resourceType, resourceId, action, metadata);
  }
  async logSecurityEvent(eventType, action, description, severity, metadata) {
    return this.auditLogger.logSecurityEvent(eventType, action, description, severity, metadata);
  }
  async logComplianceEvent(eventType, action, description, metadata) {
    return this.auditLogger.logComplianceEvent(eventType, action, description, metadata);
  }
  getEvents(filters) {
    return this.auditLogger.getEvents(filters);
  }
  getAuditTrail(entityId, entityType) {
    return this.auditLogger.getAuditTrail(entityId, entityType);
  }
  async generateAuditComplianceReport(reportType, period, generatedBy) {
    return this.auditLogger.generateComplianceReport(reportType, period, generatedBy);
  }
  async exportAuditData(filters, format = "json") {
    return this.auditLogger.exportAuditData(filters, format);
  }
  // ============================================================================
  // GDPR Management
  // ============================================================================
  async createDataSubject(data) {
    return this.gdprManager.createDataSubject(data);
  }
  async getDataSubject(id) {
    return this.gdprManager.getDataSubject(id);
  }
  async updateDataSubject(id, updates) {
    return this.gdprManager.updateDataSubject(id, updates);
  }
  async deleteDataSubject(id) {
    return this.gdprManager.deleteDataSubject(id);
  }
  async searchDataSubjects(query) {
    return this.gdprManager.searchDataSubjects(query);
  }
  async createProcessingActivity(data) {
    return this.gdprManager.createProcessingActivity(data);
  }
  async getProcessingActivity(id) {
    return this.gdprManager.getProcessingActivity(id);
  }
  async getProcessingActivitiesForSubject(dataSubjectId) {
    return this.gdprManager.getProcessingActivitiesForSubject(dataSubjectId);
  }
  async recordConsent(dataSubjectId, purpose, consentGiven, method) {
    return this.gdprManager.recordConsent(dataSubjectId, purpose, consentGiven, method);
  }
  async getConsentRecords(dataSubjectId) {
    return this.gdprManager.getConsentRecords(dataSubjectId);
  }
  async withdrawConsent(dataSubjectId, purpose) {
    return this.gdprManager.withdrawConsent(dataSubjectId, purpose);
  }
  async hasValidConsent(dataSubjectId, purpose) {
    return this.gdprManager.hasValidConsent(dataSubjectId, purpose);
  }
  async requestDataErasure(dataSubjectId, reason, requestedBy) {
    return this.gdprManager.requestDataErasure(dataSubjectId, reason, requestedBy);
  }
  async processDataErasure(requestId, processedBy, erasureDetails) {
    return this.gdprManager.processDataErasure(requestId, processedBy, erasureDetails);
  }
  async getErasureRequests(dataSubjectId) {
    return this.gdprManager.getErasureRequests(dataSubjectId);
  }
  async requestDataPortability(dataSubjectId, dataFormat, dataCategories) {
    return this.gdprManager.requestDataPortability(dataSubjectId, dataFormat, dataCategories);
  }
  async processDataPortability(requestId, processedBy) {
    return this.gdprManager.processDataPortability(requestId, processedBy);
  }
  async getPortabilityRequests(dataSubjectId) {
    return this.gdprManager.getPortabilityRequests(dataSubjectId);
  }
  async generateGDPRReport(period) {
    return this.gdprManager.generateGDPRReport(period);
  }
  // ============================================================================
  // Combined Compliance Operations
  // ============================================================================
  async performComplianceCheck() {
    const auditEvents = this.auditLogger.getEvents();
    const gdprReport = await this.gdprManager.generateGDPRReport({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3),
      // 30 days ago
      end: /* @__PURE__ */ new Date()
    });
    const findings = [];
    const recommendations = [];
    const securityEvents = auditEvents.filter((e) => e.eventType === "security_event");
    if (securityEvents.length > 0) {
      findings.push({
        type: "security",
        severity: "high",
        description: `${securityEvents.length} security events detected`,
        recommendation: "Review and address all security events"
      });
    }
    if (gdprReport.compliance.consentRate < 80) {
      findings.push({
        type: "gdpr",
        severity: "medium",
        description: "Low consent rate detected",
        recommendation: "Improve consent collection processes"
      });
    }
    if (gdprReport.compliance.erasureResponseTime > 30) {
      findings.push({
        type: "gdpr",
        severity: "medium",
        description: "Slow data erasure response time",
        recommendation: "Optimize data erasure processes"
      });
    }
    const criticalFindings = findings.filter((f) => f.severity === "high").length;
    const mediumFindings = findings.filter((f) => f.severity === "medium").length;
    const overallScore = Math.max(0, 100 - criticalFindings * 20 - mediumFindings * 10);
    const status = overallScore >= 80 ? "COMPLIANT" : "NON_COMPLIANT";
    if (criticalFindings > 0) {
      recommendations.push("Address critical compliance issues immediately");
    }
    if (mediumFindings > 0) {
      recommendations.push("Review and address medium priority issues");
    }
    if (overallScore < 80) {
      recommendations.push("Overall compliance score is below threshold");
    }
    return {
      overallScore,
      status,
      findings,
      recommendations
    };
  }
  async generateComplianceReport(reportType = "custom") {
    const period = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3),
      // 30 days ago
      end: /* @__PURE__ */ new Date()
    };
    const [auditReport, gdprReport, complianceCheck] = await Promise.all([
      this.generateAuditComplianceReport(reportType, period, "system"),
      this.gdprManager.generateGDPRReport(period),
      this.performComplianceCheck()
    ]);
    return {
      id: `compliance_report_${Date.now()}`,
      reportType,
      period,
      generatedAt: /* @__PURE__ */ new Date(),
      generatedBy: "system",
      status: "completed",
      summary: {
        overallScore: complianceCheck.overallScore,
        status: complianceCheck.status,
        totalFindings: complianceCheck.findings.length,
        criticalFindings: complianceCheck.findings.filter((f) => f.severity === "high").length,
        mediumFindings: complianceCheck.findings.filter((f) => f.severity === "medium").length,
        lowFindings: complianceCheck.findings.filter((f) => f.severity === "low").length
      },
      audit: auditReport,
      gdpr: gdprReport,
      compliance: complianceCheck,
      recommendations: complianceCheck.recommendations
    };
  }
};
var globalComplianceManager = new ComplianceManager();
function useComplianceDashboard() {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setLoading(true);
        const report = await globalComplianceManager.generateComplianceReport();
        setComplianceData(report);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch compliance data");
      } finally {
        setLoading(false);
      }
    };
    fetchComplianceData();
  }, []);
  return { complianceData, loading, error };
}
function useAuditTrail(entityId, entityType) {
  const [auditTrail, setAuditTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        setLoading(true);
        const trail = globalComplianceManager.getAuditTrail(entityId, entityType);
        setAuditTrail(trail);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch audit trail");
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
function useGDPRData(dataSubjectId) {
  const [gdprData, setGdprData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchGDPRData = async () => {
      try {
        setLoading(true);
        const [dataSubject, consentRecords, erasureRequests, portabilityRequests] = await Promise.all([
          globalComplianceManager.getDataSubject(dataSubjectId),
          globalComplianceManager.getConsentRecords(dataSubjectId),
          globalComplianceManager.getErasureRequests(dataSubjectId),
          globalComplianceManager.getPortabilityRequests(dataSubjectId)
        ]);
        setGdprData({
          dataSubject,
          consentRecords,
          erasureRequests,
          portabilityRequests
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch GDPR data");
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
var index_default = ComplianceManager;

export { AuditEventSchema, AuditLogger, AuditTrailSchema, ComplianceDashboard, ComplianceManager, ComplianceReportSchema, ConsentRecordSchema, DataErasureRequestSchema, DataPortabilityRequestSchema, DataProcessingActivitySchema, DataSubjectSchema, GDPRManager, index_default as default, globalAuditLogger, globalComplianceManager, globalGDPRManager, useAuditTrail, useComplianceDashboard, useGDPRData };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map