# @carnil/compliance

[![npm version](https://badge.fury.io/js/%40carnil%2Fcompliance.svg)](https://badge.fury.io/js/%40carnil%2Fcompliance)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Compliance tools for Carnil unified payments platform. This package provides comprehensive compliance management including PCI DSS, GDPR, audit logging, and data protection features.

## Features

- 🛡️ **PCI DSS Compliance** - Payment Card Industry Data Security Standard tools
- 🔒 **GDPR Compliance** - General Data Protection Regulation management
- 📋 **Audit Logging** - Comprehensive audit trail and logging
- 🏛️ **Compliance Dashboard** - Visual compliance monitoring
- 🔍 **Data Protection** - Data privacy and protection utilities
- ✅ **Compliance Checks** - Automated compliance validation
- 📊 **Reporting** - Compliance reports and analytics

## Installation

```bash
npm install @carnil/compliance
```

## Peer Dependencies

```bash
npm install react react-dom lucide-react
```

## Quick Start

```typescript
import { 
  ComplianceManager, 
  AuditLogger, 
  GDPRManager,
  ComplianceDashboard 
} from '@carnil/compliance';

// Initialize compliance manager
const complianceManager = new ComplianceManager({
  pciDss: {
    enabled: true,
    level: 'level-1'
  },
  gdpr: {
    enabled: true,
    dataRetentionDays: 2555 // 7 years
  }
});

// Initialize audit logger
const auditLogger = new AuditLogger({
  logLevel: 'info',
  retentionDays: 2555
});

// Log an audit event
await auditLogger.logEvent({
  userId: 'user_123',
  action: 'payment_processed',
  resource: 'payment_intent',
  resourceId: 'pi_123',
  metadata: { amount: 2000, currency: 'usd' }
});
```

## React Integration

### Using Compliance Dashboard

```tsx
import { ComplianceDashboard } from '@carnil/compliance';

function CompliancePage() {
  return (
    <ComplianceDashboard 
      organizationId="org_123"
      showPCIStatus={true}
      showGDPRStatus={true}
      showAuditLogs={true}
    />
  );
}
```

## API Reference

### ComplianceManager Class

```typescript
class ComplianceManager {
  constructor(config: ComplianceConfig);
  
  // PCI DSS compliance
  validatePCIDSS(): Promise<PCIDSSStatus>;
  generatePCIReport(): Promise<PCIReport>;
  
  // GDPR compliance
  validateGDPR(): Promise<GDPRStatus>;
  generateGDPRReport(): Promise<GDPRReport>;
  
  // General compliance
  runComplianceCheck(): Promise<ComplianceStatus>;
  getComplianceScore(): Promise<number>;
}
```

### AuditLogger Class

```typescript
class AuditLogger {
  constructor(config: AuditLoggerConfig);
  
  // Logging methods
  logEvent(event: AuditEvent): Promise<void>;
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  logDataAccess(event: DataAccessEvent): Promise<void>;
  
  // Query methods
  getAuditLogs(filters: AuditLogFilters): Promise<AuditLog[]>;
  getSecurityEvents(filters: SecurityEventFilters): Promise<SecurityEvent[]>;
  getDataAccessLogs(filters: DataAccessFilters): Promise<DataAccessEvent[]>;
  
  // Compliance methods
  generateAuditReport(period: string): Promise<AuditReport>;
  exportAuditLogs(format: 'json' | 'csv'): Promise<string>;
}
```

### GDPRManager Class

```typescript
class GDPRManager {
  constructor(config: GDPRConfig);
  
  // Data subject rights
  processDataSubjectRequest(request: DataSubjectRequest): Promise<void>;
  exportPersonalData(userId: string): Promise<PersonalDataExport>;
  deletePersonalData(userId: string): Promise<void>;
  anonymizePersonalData(userId: string): Promise<void>;
  
  // Consent management
  recordConsent(consent: ConsentRecord): Promise<void>;
  revokeConsent(userId: string, purpose: string): Promise<void>;
  getConsentStatus(userId: string): Promise<ConsentStatus>;
  
  // Data processing
  recordDataProcessing(processing: DataProcessingRecord): Promise<void>;
  getDataProcessingRecords(userId: string): Promise<DataProcessingRecord[]>;
  
  // Compliance
  validateDataRetention(): Promise<DataRetentionStatus>;
  generateGDPRReport(): Promise<GDPRReport>;
}
```

## Types

### ComplianceConfig

```typescript
interface ComplianceConfig {
  pciDss?: {
    enabled: boolean;
    level: 'level-1' | 'level-2' | 'level-3' | 'level-4';
    merchantId?: string;
  };
  gdpr?: {
    enabled: boolean;
    dataRetentionDays: number;
    dataController: string;
    dpoEmail?: string;
  };
  audit?: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
  };
}
```

### AuditEvent

```typescript
interface AuditEvent {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
```

### SecurityEvent

```typescript
interface SecurityEvent {
  id?: string;
  userId?: string;
  eventType: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
```

### DataAccessEvent

```typescript
interface DataAccessEvent {
  id?: string;
  userId: string;
  dataType: 'personal' | 'financial' | 'payment' | 'usage';
  action: 'read' | 'write' | 'delete' | 'export';
  resourceId: string;
  timestamp?: Date;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest';
}
```

### DataSubjectRequest

```typescript
interface DataSubjectRequest {
  id?: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  submittedAt?: Date;
  completedAt?: Date;
  response?: string;
}
```

### ConsentRecord

```typescript
interface ConsentRecord {
  id?: string;
  userId: string;
  purpose: string;
  granted: boolean;
  timestamp?: Date;
  method: 'explicit' | 'opt_in' | 'opt_out';
  version: string;
  withdrawnAt?: Date;
}
```

## Compliance Checks

### PCI DSS Compliance

```typescript
import { ComplianceManager } from '@carnil/compliance';

const complianceManager = new ComplianceManager({
  pciDss: {
    enabled: true,
    level: 'level-1'
  }
});

// Run PCI DSS compliance check
const pciStatus = await complianceManager.validatePCIDSS();

if (pciStatus.compliant) {
  console.log('PCI DSS compliant');
} else {
  console.log('PCI DSS violations:', pciStatus.violations);
}

// Generate PCI DSS report
const pciReport = await complianceManager.generatePCIReport();
```

### GDPR Compliance

```typescript
import { GDPRManager } from '@carnil/compliance';

const gdprManager = new GDPRManager({
  enabled: true,
  dataRetentionDays: 2555,
  dataController: 'Your Company Ltd'
});

// Process data subject request
await gdprManager.processDataSubjectRequest({
  userId: 'user_123',
  requestType: 'access',
  description: 'User requests access to their personal data'
});

// Export personal data
const personalData = await gdprManager.exportPersonalData('user_123');

// Record consent
await gdprManager.recordConsent({
  userId: 'user_123',
  purpose: 'marketing',
  granted: true,
  method: 'explicit',
  version: '1.0'
});
```

## Audit Logging

### Basic Audit Logging

```typescript
import { AuditLogger } from '@carnil/compliance';

const auditLogger = new AuditLogger({
  logLevel: 'info',
  retentionDays: 2555
});

// Log payment processing
await auditLogger.logEvent({
  userId: 'user_123',
  action: 'payment_processed',
  resource: 'payment_intent',
  resourceId: 'pi_123',
  metadata: { 
    amount: 2000, 
    currency: 'usd',
    paymentMethod: 'card'
  }
});

// Log security event
await auditLogger.logSecurityEvent({
  userId: 'user_123',
  eventType: 'login',
  severity: 'low',
  description: 'User logged in successfully',
  ipAddress: '192.168.1.1'
});

// Log data access
await auditLogger.logDataAccess({
  userId: 'user_123',
  dataType: 'personal',
  action: 'read',
  resourceId: 'profile_123',
  purpose: 'account_management',
  legalBasis: 'contract'
});
```

### Querying Audit Logs

```typescript
// Get audit logs for a user
const auditLogs = await auditLogger.getAuditLogs({
  userId: 'user_123',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  action: 'payment_processed'
});

// Get security events
const securityEvents = await auditLogger.getSecurityEvents({
  severity: 'high',
  startDate: new Date('2024-01-01')
});

// Get data access logs
const dataAccessLogs = await auditLogger.getDataAccessLogs({
  userId: 'user_123',
  dataType: 'personal'
});
```

## Dashboard Components

### ComplianceDashboard

```tsx
import { ComplianceDashboard } from '@carnil/compliance';

function CompliancePage() {
  return (
    <ComplianceDashboard 
      organizationId="org_123"
      showPCIStatus={true}
      showGDPRStatus={true}
      showAuditLogs={true}
      refreshInterval={30000} // 30 seconds
    />
  );
}
```

## CI/CD Integration

### Compliance Check Script

```javascript
// ci-scripts/compliance-check.js
const { ComplianceManager } = require('@carnil/compliance');

async function runComplianceCheck() {
  const complianceManager = new ComplianceManager({
    pciDss: { enabled: true, level: 'level-1' },
    gdpr: { enabled: true, dataRetentionDays: 2555 }
  });

  const status = await complianceManager.runComplianceCheck();
  
  if (!status.compliant) {
    console.error('Compliance check failed:', status.violations);
    process.exit(1);
  }
  
  console.log('Compliance check passed');
}

runComplianceCheck().catch(console.error);
```

## Configuration

### Environment Variables

```bash
# PCI DSS
PCI_DSS_ENABLED=true
PCI_DSS_LEVEL=level-1
PCI_MERCHANT_ID=your_merchant_id

# GDPR
GDPR_ENABLED=true
GDPR_DATA_RETENTION_DAYS=2555
GDPR_DATA_CONTROLLER="Your Company Ltd"
GDPR_DPO_EMAIL=dpo@yourcompany.com

# Audit Logging
AUDIT_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_RETENTION_DAYS=2555
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Carnil-Dev/carnil-sdk/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [Carnil Team](https://carnil.dev)

## Support

- 📖 [Documentation](https://docs.carnil.dev)
- 💬 [Discord Community](https://discord.gg/carnil)
- 🐛 [Report Issues](https://github.com/Carnil-Dev/carnil-sdk/issues)
- 📧 [Email Support](mailto:hello@carnil.dev)
