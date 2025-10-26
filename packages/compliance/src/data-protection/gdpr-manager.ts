import { z } from 'zod';
import crypto from 'crypto';

// ============================================================================
// GDPR Schemas
// ============================================================================

export const DataSubjectSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  metadata: z.record(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DataProcessingActivitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  purpose: z.string(),
  legalBasis: z.enum([
    'consent',
    'contract',
    'legal_obligation',
    'vital_interests',
    'public_task',
    'legitimate_interests',
  ]),
  dataCategories: z.array(z.string()),
  dataSubjects: z.array(z.string()), // Data subject IDs
  processors: z.array(z.string()), // Processor IDs
  retentionPeriod: z.number(), // Days
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ConsentRecordSchema = z.object({
  id: z.string(),
  dataSubjectId: z.string(),
  purpose: z.string(),
  consentGiven: z.boolean(),
  consentDate: z.date(),
  withdrawalDate: z.date().optional(),
  method: z.enum(['explicit', 'opt_in', 'opt_out', 'implied']),
  version: z.string().default('1.0'),
  metadata: z.record(z.string()).optional(),
});

export const DataErasureRequestSchema = z.object({
  id: z.string(),
  dataSubjectId: z.string(),
  requestDate: z.date(),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']),
  reason: z.string(),
  requestedBy: z.string(),
  processedBy: z.string().optional(),
  processedAt: z.date().optional(),
  erasureDetails: z.object({
    dataCategories: z.array(z.string()),
    systemsAffected: z.array(z.string()),
    backupRetention: z.boolean().default(false),
    legalBasis: z.string().optional(),
  }),
  metadata: z.record(z.string()).optional(),
});

export const DataPortabilityRequestSchema = z.object({
  id: z.string(),
  dataSubjectId: z.string(),
  requestDate: z.date(),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']),
  requestedBy: z.string(),
  processedBy: z.string().optional(),
  processedAt: z.date().optional(),
  dataFormat: z.enum(['json', 'csv', 'xml', 'pdf']),
  dataCategories: z.array(z.string()),
  downloadUrl: z.string().optional(),
  expiresAt: z.date().optional(),
  metadata: z.record(z.string()).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type DataSubject = z.infer<typeof DataSubjectSchema>;
export type DataProcessingActivity = z.infer<typeof DataProcessingActivitySchema>;
export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;
export type DataErasureRequest = z.infer<typeof DataErasureRequestSchema>;
export type DataPortabilityRequest = z.infer<typeof DataPortabilityRequestSchema>;

// ============================================================================
// GDPR Manager
// ============================================================================

export class GDPRManager {
  private dataSubjects: Map<string, DataSubject> = new Map();
  private processingActivities: Map<string, DataProcessingActivity> = new Map();
  private consentRecords: Map<string, ConsentRecord[]> = new Map();
  private erasureRequests: Map<string, DataErasureRequest> = new Map();
  private portabilityRequests: Map<string, DataPortabilityRequest> = new Map();

  // ============================================================================
  // Data Subject Management
  // ============================================================================

  async createDataSubject(
    data: Omit<DataSubject, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DataSubject> {
    const dataSubject: DataSubject = {
      id: this.generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dataSubjects.set(dataSubject.id, dataSubject);
    return dataSubject;
  }

  async getDataSubject(id: string): Promise<DataSubject | null> {
    return this.dataSubjects.get(id) || null;
  }

  async updateDataSubject(id: string, updates: Partial<DataSubject>): Promise<DataSubject | null> {
    const dataSubject = this.dataSubjects.get(id);
    if (!dataSubject) return null;

    const updatedDataSubject: DataSubject = {
      ...dataSubject,
      ...updates,
      updatedAt: new Date(),
    };

    this.dataSubjects.set(id, updatedDataSubject);
    return updatedDataSubject;
  }

  async deleteDataSubject(id: string): Promise<boolean> {
    return this.dataSubjects.delete(id);
  }

  async searchDataSubjects(query: {
    email?: string;
    name?: string;
    phone?: string;
  }): Promise<DataSubject[]> {
    const subjects = Array.from(this.dataSubjects.values());

    return subjects.filter(subject => {
      if (query.email && !subject.email.toLowerCase().includes(query.email.toLowerCase())) {
        return false;
      }
      if (
        query.name &&
        subject.name &&
        !subject.name.toLowerCase().includes(query.name.toLowerCase())
      ) {
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

  async createProcessingActivity(
    data: Omit<DataProcessingActivity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DataProcessingActivity> {
    const activity: DataProcessingActivity = {
      id: this.generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.processingActivities.set(activity.id, activity);
    return activity;
  }

  async getProcessingActivity(id: string): Promise<DataProcessingActivity | null> {
    return this.processingActivities.get(id) || null;
  }

  async getProcessingActivitiesForSubject(
    dataSubjectId: string
  ): Promise<DataProcessingActivity[]> {
    const activities = Array.from(this.processingActivities.values());
    return activities.filter(
      activity => activity.dataSubjects.includes(dataSubjectId) && activity.isActive
    );
  }

  // ============================================================================
  // Consent Management
  // ============================================================================

  async recordConsent(
    dataSubjectId: string,
    purpose: string,
    consentGiven: boolean,
    method: ConsentRecord['method'] = 'explicit'
  ): Promise<ConsentRecord> {
    const consentRecord: ConsentRecord = {
      id: this.generateId(),
      dataSubjectId,
      purpose,
      consentGiven,
      consentDate: new Date(),
      method,
      version: '1.0',
    };

    const existingConsents = this.consentRecords.get(dataSubjectId) || [];
    this.consentRecords.set(dataSubjectId, [...existingConsents, consentRecord]);

    return consentRecord;
  }

  async getConsentRecords(dataSubjectId: string): Promise<ConsentRecord[]> {
    return this.consentRecords.get(dataSubjectId) || [];
  }

  async withdrawConsent(dataSubjectId: string, purpose: string): Promise<boolean> {
    const consents = this.consentRecords.get(dataSubjectId) || [];
    const consent = consents.find(c => c.purpose === purpose && c.consentGiven);

    if (consent) {
      consent.consentGiven = false;
      consent.withdrawalDate = new Date();
      return true;
    }

    return false;
  }

  async hasValidConsent(dataSubjectId: string, purpose: string): Promise<boolean> {
    const consents = this.consentRecords.get(dataSubjectId) || [];
    const consent = consents.find(c => c.purpose === purpose);

    return consent ? consent.consentGiven : false;
  }

  // ============================================================================
  // Data Erasure (Right to be Forgotten)
  // ============================================================================

  async requestDataErasure(
    dataSubjectId: string,
    reason: string,
    requestedBy: string
  ): Promise<DataErasureRequest> {
    const erasureRequest: DataErasureRequest = {
      id: this.generateId(),
      dataSubjectId,
      requestDate: new Date(),
      status: 'pending',
      reason,
      requestedBy,
      erasureDetails: {
        dataCategories: [], // To be filled during processing
        systemsAffected: [], // To be filled during processing
        backupRetention: false,
      },
    };

    this.erasureRequests.set(erasureRequest.id, erasureRequest);
    return erasureRequest;
  }

  async processDataErasure(
    requestId: string,
    processedBy: string,
    erasureDetails: DataErasureRequest['erasureDetails']
  ): Promise<DataErasureRequest | null> {
    const request = this.erasureRequests.get(requestId);
    if (!request) return null;

    request.status = 'in_progress';
    request.processedBy = processedBy;
    request.erasureDetails = erasureDetails;

    // Simulate data erasure process
    await this.performDataErasure(request.dataSubjectId, erasureDetails);

    request.status = 'completed';
    request.processedAt = new Date();

    return request;
  }

  async getErasureRequests(dataSubjectId?: string): Promise<DataErasureRequest[]> {
    const requests = Array.from(this.erasureRequests.values());

    if (dataSubjectId) {
      return requests.filter(request => request.dataSubjectId === dataSubjectId);
    }

    return requests;
  }

  // ============================================================================
  // Data Portability (Right to Data Portability)
  // ============================================================================

  async requestDataPortability(
    dataSubjectId: string,
    dataFormat: DataPortabilityRequest['dataFormat'] = 'json',
    dataCategories: string[] = []
  ): Promise<DataPortabilityRequest> {
    const portabilityRequest: DataPortabilityRequest = {
      id: this.generateId(),
      dataSubjectId,
      requestDate: new Date(),
      status: 'pending',
      requestedBy: dataSubjectId, // Self-requested
      dataFormat,
      dataCategories,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    this.portabilityRequests.set(portabilityRequest.id, portabilityRequest);
    return portabilityRequest;
  }

  async processDataPortability(
    requestId: string,
    processedBy: string
  ): Promise<DataPortabilityRequest | null> {
    const request = this.portabilityRequests.get(requestId);
    if (!request) return null;

    request.status = 'in_progress';
    request.processedBy = processedBy;

    // Generate data export
    const exportData = await this.generateDataExport(request.dataSubjectId, request.dataCategories);
    const downloadUrl = await this.uploadDataExport(exportData, request.dataFormat);

    request.status = 'completed';
    request.processedAt = new Date();
    request.downloadUrl = downloadUrl;

    return request;
  }

  async getPortabilityRequests(dataSubjectId?: string): Promise<DataPortabilityRequest[]> {
    const requests = Array.from(this.portabilityRequests.values());

    if (dataSubjectId) {
      return requests.filter(request => request.dataSubjectId === dataSubjectId);
    }

    return requests;
  }

  // ============================================================================
  // GDPR Compliance Reporting
  // ============================================================================

  async generateGDPRReport(_period: { start: Date; end: Date }): Promise<{
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
  }> {
    const dataSubjects = Array.from(this.dataSubjects.values());
    const activities = Array.from(this.processingActivities.values());
    const erasureRequests = Array.from(this.erasureRequests.values());
    const portabilityRequests = Array.from(this.portabilityRequests.values());

    const totalConsentRecords = Array.from(this.consentRecords.values()).flat().length;

    const consentRate =
      dataSubjects.length > 0 ? (totalConsentRecords / dataSubjects.length) * 100 : 0;

    const erasureResponseTime = this.calculateAverageResponseTime(erasureRequests);
    const portabilityResponseTime = this.calculateAverageResponseTime(portabilityRequests);

    return {
      summary: {
        totalDataSubjects: dataSubjects.length,
        activeProcessingActivities: activities.filter(a => a.isActive).length,
        consentRecords: totalConsentRecords,
        erasureRequests: erasureRequests.length,
        portabilityRequests: portabilityRequests.length,
      },
      compliance: {
        consentRate,
        erasureResponseTime,
        portabilityResponseTime,
        dataMinimization: true, // Simplified
        purposeLimitation: true, // Simplified
      },
      recommendations: this.generateComplianceRecommendations({
        consentRate,
        erasureResponseTime,
        portabilityResponseTime,
      }),
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private generateId(): string {
    return `gdpr_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private async performDataErasure(
    dataSubjectId: string,
    erasureDetails: DataErasureRequest['erasureDetails']
  ): Promise<void> {
    // Simulate data erasure process
    // In production, this would:
    // 1. Identify all systems containing the data
    // 2. Remove or anonymize the data
    // 3. Update backup systems
    // 4. Log the erasure process

    console.log(`Performing data erasure for subject ${dataSubjectId}`);
    console.log(`Data categories: ${erasureDetails.dataCategories.join(', ')}`);
    console.log(`Systems affected: ${erasureDetails.systemsAffected.join(', ')}`);
  }

  private async generateDataExport(
    dataSubjectId: string,
    _dataCategories: string[]
  ): Promise<Record<string, any>> {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) throw new Error('Data subject not found');

    const exportData: Record<string, any> = {
      dataSubject: {
        id: dataSubject.id,
        email: dataSubject.email,
        name: dataSubject.name,
        phone: dataSubject.phone,
        address: dataSubject.address,
        createdAt: dataSubject.createdAt,
        updatedAt: dataSubject.updatedAt,
      },
      processingActivities: await this.getProcessingActivitiesForSubject(dataSubjectId),
      consentRecords: await this.getConsentRecords(dataSubjectId),
      erasureRequests: await this.getErasureRequests(dataSubjectId),
      portabilityRequests: await this.getPortabilityRequests(dataSubjectId),
    };

    return exportData;
  }

  private async uploadDataExport(
    _data: Record<string, any>,
    format: DataPortabilityRequest['dataFormat']
  ): Promise<string> {
    // Simulate data upload
    const filename = `data_export_${Date.now()}.${format}`;
    const downloadUrl = `https://example.com/downloads/${filename}`;

    console.log(`Data export uploaded: ${downloadUrl}`);
    return downloadUrl;
  }

  private calculateAverageResponseTime(
    requests: Array<{ processedAt?: Date; requestDate: Date }>
  ): number {
    const completedRequests = requests.filter(r => r.processedAt);
    if (completedRequests.length === 0) return 0;

    const totalTime = completedRequests.reduce((sum, request) => {
      const responseTime = request.processedAt!.getTime() - request.requestDate.getTime();
      return sum + responseTime;
    }, 0);

    return totalTime / completedRequests.length / (1000 * 60 * 60 * 24); // Days
  }

  private generateComplianceRecommendations(metrics: {
    consentRate: number;
    erasureResponseTime: number;
    portabilityResponseTime: number;
  }): string[] {
    const recommendations: string[] = [];

    if (metrics.consentRate < 80) {
      recommendations.push('Improve consent collection processes to increase consent rate');
    }

    if (metrics.erasureResponseTime > 30) {
      recommendations.push('Optimize data erasure processes to reduce response time');
    }

    if (metrics.portabilityResponseTime > 7) {
      recommendations.push('Streamline data portability processes to meet GDPR requirements');
    }

    if (recommendations.length === 0) {
      recommendations.push('GDPR compliance is in good standing');
    }

    return recommendations;
  }
}

// ============================================================================
// Global GDPR Manager Instance
// ============================================================================

export const globalGDPRManager = new GDPRManager();
