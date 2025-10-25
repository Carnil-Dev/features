#!/usr/bin/env node

/**
 * Compliance Check Script
 * 
 * This script performs automated compliance checks for SOC2, GDPR, and other regulations.
 * It can be run as part of CI/CD pipelines to ensure ongoing compliance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  outputDir: './compliance-reports',
  retentionDays: 2555, // 7 years
  criticalSeverityThreshold: 3,
  complianceScoreThreshold: 80,
};

// ============================================================================
// Compliance Checks
// ============================================================================

class ComplianceChecker {
  constructor() {
    this.checks = [];
    this.results = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      critical: 0,
      details: [],
    };
  }

  // ============================================================================
  // Security Checks
  // ============================================================================

  async checkSecurity() {
    console.log('🔒 Checking security compliance...');
    
    const securityChecks = [
      {
        name: 'Environment Variables Security',
        check: () => this.checkEnvironmentVariables(),
        weight: 3,
      },
      {
        name: 'API Key Security',
        check: () => this.checkAPIKeySecurity(),
        weight: 3,
      },
      {
        name: 'HTTPS Enforcement',
        check: () => this.checkHTTPSEnforcement(),
        weight: 2,
      },
      {
        name: 'Authentication Requirements',
        check: () => this.checkAuthenticationRequirements(),
        weight: 3,
      },
    ];

    for (const check of securityChecks) {
      await this.runCheck(check);
    }
  }

  // ============================================================================
  // Data Protection Checks
  // ============================================================================

  async checkDataProtection() {
    console.log('🛡️ Checking data protection compliance...');
    
    const dataProtectionChecks = [
      {
        name: 'Data Encryption',
        check: () => this.checkDataEncryption(),
        weight: 4,
      },
      {
        name: 'PII Handling',
        check: () => this.checkPIIHandling(),
        weight: 4,
      },
      {
        name: 'Data Retention Policies',
        check: () => this.checkDataRetentionPolicies(),
        weight: 3,
      },
      {
        name: 'Data Minimization',
        check: () => this.checkDataMinimization(),
        weight: 2,
      },
    ];

    for (const check of dataProtectionChecks) {
      await this.runCheck(check);
    }
  }

  // ============================================================================
  // Audit Trail Checks
  // ============================================================================

  async checkAuditTrails() {
    console.log('📋 Checking audit trail compliance...');
    
    const auditChecks = [
      {
        name: 'Audit Logging',
        check: () => this.checkAuditLogging(),
        weight: 3,
      },
      {
        name: 'Log Retention',
        check: () => this.checkLogRetention(),
        weight: 2,
      },
      {
        name: 'Log Integrity',
        check: () => this.checkLogIntegrity(),
        weight: 3,
      },
      {
        name: 'Access Logging',
        check: () => this.checkAccessLogging(),
        weight: 3,
      },
    ];

    for (const check of auditChecks) {
      await this.runCheck(check);
    }
  }

  // ============================================================================
  // Individual Check Implementations
  // ============================================================================

  async checkEnvironmentVariables() {
    const envVars = process.env;
    const sensitiveVars = ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN', 'PRIVATE_KEY'];
    
    const exposedVars = Object.keys(envVars).filter(key => 
      sensitiveVars.some(sensitive => key.includes(sensitive)) && 
      envVars[key] && 
      envVars[key].length > 0
    );

    if (exposedVars.length > 0) {
      return {
        status: 'warning',
        message: `Sensitive environment variables detected: ${exposedVars.join(', ')}`,
        recommendation: 'Ensure sensitive variables are properly secured and not exposed in logs',
      };
    }

    return {
      status: 'pass',
      message: 'Environment variables are properly configured',
    };
  }

  async checkAPIKeySecurity() {
    // Check if API keys are properly configured
    const hasStripeKey = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_');
    const hasRazorpayKey = process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID;
    
    if (!hasStripeKey && !hasRazorpayKey) {
      return {
        status: 'warning',
        message: 'No payment provider API keys configured',
        recommendation: 'Configure at least one payment provider API key',
      };
    }

    return {
      status: 'pass',
      message: 'API keys are properly configured',
    };
  }

  async checkHTTPSEnforcement() {
    // This would check if HTTPS is enforced in production
    const isProduction = process.env.NODE_ENV === 'production';
    const hasHTTPS = process.env.HTTPS === 'true' || process.env.FORCE_HTTPS === 'true';
    
    if (isProduction && !hasHTTPS) {
      return {
        status: 'critical',
        message: 'HTTPS not enforced in production',
        recommendation: 'Enable HTTPS enforcement in production environment',
      };
    }

    return {
      status: 'pass',
      message: 'HTTPS configuration is appropriate',
    };
  }

  async checkAuthenticationRequirements() {
    // Check if authentication is properly implemented
    const hasAuthMiddleware = this.checkFileExists('./src/middleware/auth.ts') || 
                            this.checkFileExists('./src/middleware/authentication.ts');
    
    if (!hasAuthMiddleware) {
      return {
        status: 'warning',
        message: 'Authentication middleware not found',
        recommendation: 'Implement proper authentication middleware',
      };
    }

    return {
      status: 'pass',
      message: 'Authentication requirements are met',
    };
  }

  async checkDataEncryption() {
    // Check if data encryption is implemented
    const hasEncryption = this.checkFileExists('./src/utils/encryption.ts') ||
                         this.checkFileExists('./src/security/encryption.ts');
    
    if (!hasEncryption) {
      return {
        status: 'critical',
        message: 'Data encryption not implemented',
        recommendation: 'Implement data encryption for sensitive data',
      };
    }

    return {
      status: 'pass',
      message: 'Data encryption is implemented',
    };
  }

  async checkPIIHandling() {
    // Check if PII handling is properly implemented
    const hasPIIHandling = this.checkFileExists('./src/compliance/pii-handler.ts') ||
                          this.checkFileExists('./src/data-protection/pii.ts');
    
    if (!hasPIIHandling) {
      return {
        status: 'warning',
        message: 'PII handling not implemented',
        recommendation: 'Implement proper PII handling and anonymization',
      };
    }

    return {
      status: 'pass',
      message: 'PII handling is implemented',
    };
  }

  async checkDataRetentionPolicies() {
    // Check if data retention policies are implemented
    const hasRetentionPolicies = this.checkFileExists('./src/compliance/retention.ts') ||
                                this.checkFileExists('./src/data-protection/retention.ts');
    
    if (!hasRetentionPolicies) {
      return {
        status: 'warning',
        message: 'Data retention policies not implemented',
        recommendation: 'Implement data retention policies for compliance',
      };
    }

    return {
      status: 'pass',
      message: 'Data retention policies are implemented',
    };
  }

  async checkDataMinimization() {
    // Check if data minimization is implemented
    const hasDataMinimization = this.checkFileExists('./src/compliance/data-minimization.ts');
    
    if (!hasDataMinimization) {
      return {
        status: 'info',
        message: 'Data minimization not explicitly implemented',
        recommendation: 'Consider implementing data minimization principles',
      };
    }

    return {
      status: 'pass',
      message: 'Data minimization is implemented',
    };
  }

  async checkAuditLogging() {
    // Check if audit logging is implemented
    const hasAuditLogging = this.checkFileExists('./src/compliance/audit-logger.ts') ||
                           this.checkFileExists('./src/audit/logger.ts');
    
    if (!hasAuditLogging) {
      return {
        status: 'critical',
        message: 'Audit logging not implemented',
        recommendation: 'Implement comprehensive audit logging',
      };
    }

    return {
      status: 'pass',
      message: 'Audit logging is implemented',
    };
  }

  async checkLogRetention() {
    // Check if log retention is configured
    const hasLogRetention = process.env.LOG_RETENTION_DAYS || 
                           this.checkFileExists('./src/compliance/log-retention.ts');
    
    if (!hasLogRetention) {
      return {
        status: 'warning',
        message: 'Log retention not configured',
        recommendation: 'Configure log retention policies',
      };
    }

    return {
      status: 'pass',
      message: 'Log retention is configured',
    };
  }

  async checkLogIntegrity() {
    // Check if log integrity is ensured
    const hasLogIntegrity = this.checkFileExists('./src/compliance/log-integrity.ts');
    
    if (!hasLogIntegrity) {
      return {
        status: 'warning',
        message: 'Log integrity not ensured',
        recommendation: 'Implement log integrity checks',
      };
    }

    return {
      status: 'pass',
      message: 'Log integrity is ensured',
    };
  }

  async checkAccessLogging() {
    // Check if access logging is implemented
    const hasAccessLogging = this.checkFileExists('./src/middleware/access-logger.ts') ||
                            this.checkFileExists('./src/compliance/access-logger.ts');
    
    if (!hasAccessLogging) {
      return {
        status: 'warning',
        message: 'Access logging not implemented',
        recommendation: 'Implement access logging for all API endpoints',
      };
    }

    return {
      status: 'pass',
      message: 'Access logging is implemented',
    };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  async runCheck(check) {
    try {
      const result = await check.check();
      this.results.details.push({
        name: check.name,
        weight: check.weight,
        ...result,
      });

      if (result.status === 'pass') {
        this.results.passed++;
      } else if (result.status === 'warning') {
        this.results.warnings++;
      } else if (result.status === 'critical') {
        this.results.critical++;
        this.results.failed++;
      } else {
        this.results.failed++;
      }

      console.log(`  ${result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'} ${check.name}: ${result.message}`);
    } catch (error) {
      console.error(`  ❌ ${check.name}: Error - ${error.message}`);
      this.results.details.push({
        name: check.name,
        weight: check.weight,
        status: 'error',
        message: error.message,
      });
      this.results.failed++;
    }
  }

  checkFileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  calculateOverallScore() {
    const totalWeight = this.results.details.reduce((sum, detail) => sum + detail.weight, 0);
    const passedWeight = this.results.details
      .filter(detail => detail.status === 'pass')
      .reduce((sum, detail) => sum + detail.weight, 0);
    
    this.results.overallScore = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0;
  }

  generateReport() {
    this.calculateOverallScore();
    
    const report = {
      ...this.results,
      summary: {
        totalChecks: this.results.details.length,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        critical: this.results.critical,
        overallScore: this.results.overallScore,
        complianceStatus: this.results.overallScore >= CONFIG.complianceScoreThreshold ? 'COMPLIANT' : 'NON_COMPLIANT',
      },
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.critical > 0) {
      recommendations.push('Address critical issues immediately');
    }
    
    if (this.results.warnings > 0) {
      recommendations.push('Review and address warning issues');
    }
    
    if (this.results.overallScore < CONFIG.complianceScoreThreshold) {
      recommendations.push('Overall compliance score is below threshold');
    }

    return recommendations;
  }

  async saveReport(report) {
    const reportDir = CONFIG.outputDir;
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const filename = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(reportDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📄 Compliance report saved to: ${filepath}`);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🔍 Starting compliance check...');
  
  const checker = new ComplianceChecker();
  
  // Run all compliance checks
  await checker.checkSecurity();
  await checker.checkDataProtection();
  await checker.checkAuditTrails();
  
  // Generate and save report
  const report = checker.generateReport();
  await checker.saveReport(report);
  
  // Print summary
  console.log('\n📊 Compliance Check Summary:');
  console.log(`  Overall Score: ${report.summary.overallScore}%`);
  console.log(`  Status: ${report.summary.complianceStatus}`);
  console.log(`  Passed: ${report.summary.passed}`);
  console.log(`  Failed: ${report.summary.failed}`);
  console.log(`  Warnings: ${report.summary.warnings}`);
  console.log(`  Critical: ${report.summary.critical}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  // Exit with appropriate code
  process.exit(report.summary.complianceStatus === 'COMPLIANT' ? 0 : 1);
}

// Run the compliance check
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Compliance check failed:', error);
    process.exit(1);
  });
}

module.exports = { ComplianceChecker };
