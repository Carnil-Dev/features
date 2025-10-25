import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Download,
  RefreshCw,
  Settings,
  FileText,
  Users,
  Lock,
  Eye
} from 'lucide-react';

// ============================================================================
// Compliance Dashboard Component
// ============================================================================

interface ComplianceDashboardProps {
  className?: string;
}

export function ComplianceDashboard({ className }: ComplianceDashboardProps) {
  const [complianceData, setComplianceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'gdpr' | 'soc2' | 'audit'>('overview');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      // This would fetch real compliance data
      const mockData = {
        overview: {
          overallScore: 85,
          status: 'COMPLIANT',
          lastUpdated: new Date().toISOString(),
          totalChecks: 24,
          passed: 20,
          failed: 2,
          warnings: 2,
          critical: 0,
        },
        gdpr: {
          dataSubjects: 1250,
          consentRate: 92,
          erasureRequests: 15,
          portabilityRequests: 8,
          complianceScore: 88,
          findings: [
            {
              id: '1',
              type: 'warning',
              severity: 'medium',
              description: 'Data retention policies need review',
              status: 'open',
            },
          ],
        },
        soc2: {
          securityScore: 90,
          availabilityScore: 95,
          processingIntegrity: 88,
          confidentiality: 92,
          privacy: 85,
          findings: [
            {
              id: '2',
              type: 'info',
              severity: 'low',
              description: 'Security audit completed successfully',
              status: 'resolved',
            },
          ],
        },
        audit: {
          totalEvents: 15420,
          securityEvents: 3,
          dataAccessEvents: 892,
          systemErrors: 12,
          lastAudit: new Date().toISOString(),
        },
      };
      
      setComplianceData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchComplianceData();
  };

  const handleExportReport = () => {
    // Export compliance report
    const report = {
      timestamp: new Date().toISOString(),
      data: complianceData,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <XCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`compliance-dashboard ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600">Monitor and manage compliance across all regulations</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleExportReport}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
            title="Export report"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Shield },
          { id: 'gdpr', label: 'GDPR', icon: Users },
          { id: 'soc2', label: 'SOC2', icon: Lock },
          { id: 'audit', label: 'Audit', icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {selectedTab === 'overview' && <OverviewTab data={complianceData?.overview} />}
        {selectedTab === 'gdpr' && <GDPRTab data={complianceData?.gdpr} />}
        {selectedTab === 'soc2' && <SOC2Tab data={complianceData?.soc2} />}
        {selectedTab === 'audit' && <AuditTab data={complianceData?.audit} />}
      </div>
    </div>
  );
}

// ============================================================================
// Tab Components
// ============================================================================

function OverviewTab({ data }: { data: any }) {
  if (!data) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'text-green-600 bg-green-100';
      case 'NON_COMPLIANT': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return CheckCircle;
      case 'NON_COMPLIANT': return XCircle;
      default: return AlertTriangle;
    }
  };

  const StatusIcon = getStatusIcon(data.status);

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Overall Compliance Status</h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{data.status}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{data.overallScore}%</div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{data.passed}</div>
            <div className="text-sm text-gray-600">Passed Checks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{data.failed}</div>
            <div className="text-sm text-gray-600">Failed Checks</div>
          </div>
        </div>
      </div>

      {/* Check Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{data.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{data.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{data.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-600">{data.totalChecks}</div>
              <div className="text-sm text-gray-600">Total Checks</div>
            </div>
            <Info className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GDPRTab({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* GDPR Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">GDPR Compliance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.dataSubjects.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Data Subjects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.consentRate}%</div>
            <div className="text-sm text-gray-600">Consent Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.erasureRequests}</div>
            <div className="text-sm text-gray-600">Erasure Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.portabilityRequests}</div>
            <div className="text-sm text-gray-600">Portability Requests</div>
          </div>
        </div>
      </div>

      {/* GDPR Findings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Findings</h3>
        <div className="space-y-3">
          {data.findings.map((finding: any) => (
            <div key={finding.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  finding.severity === 'high' ? 'bg-red-500' :
                  finding.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div>
                  <div className="font-medium text-gray-900">{finding.description}</div>
                  <div className="text-sm text-gray-600">Severity: {finding.severity}</div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                finding.status === 'open' ? 'bg-red-100 text-red-800' :
                finding.status === 'resolved' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {finding.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SOC2Tab({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* SOC2 Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SOC2 Compliance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.securityScore}%</div>
            <div className="text-sm text-gray-600">Security</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.availabilityScore}%</div>
            <div className="text-sm text-gray-600">Availability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.processingIntegrity}%</div>
            <div className="text-sm text-gray-600">Processing Integrity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.confidentiality}%</div>
            <div className="text-sm text-gray-600">Confidentiality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{data.privacy}%</div>
            <div className="text-sm text-gray-600">Privacy</div>
          </div>
        </div>
      </div>

      {/* SOC2 Findings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SOC2 Findings</h3>
        <div className="space-y-3">
          {data.findings.map((finding: any) => (
            <div key={finding.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  finding.severity === 'high' ? 'bg-red-500' :
                  finding.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div>
                  <div className="font-medium text-gray-900">{finding.description}</div>
                  <div className="text-sm text-gray-600">Type: {finding.type}</div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                finding.status === 'open' ? 'bg-red-100 text-red-800' :
                finding.status === 'resolved' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {finding.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditTab({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Audit Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.totalEvents.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{data.securityEvents}</div>
            <div className="text-sm text-gray-600">Security Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.dataAccessEvents}</div>
            <div className="text-sm text-gray-600">Data Access Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{data.systemErrors}</div>
            <div className="text-sm text-gray-600">System Errors</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Data access logged</div>
                <div className="text-sm text-gray-600">Customer data accessed by user</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">2 minutes ago</div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Security event resolved</div>
                <div className="text-sm text-gray-600">Suspicious login attempt blocked</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">1 hour ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplianceDashboard;
