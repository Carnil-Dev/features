import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ============================================================================
// Customer Dashboard Components
// ============================================================================

interface CustomerDashboardProps {
  customerId: string;
  data: {
    usage: Array<{ date: string; usage: number; cost: number }>;
    aiUsage: Array<{ date: string; tokens: number; cost: number }>;
    topFeatures: Array<{ featureId: string; usage: number; cost: number }>;
    topModels: Array<{ modelId: string; tokens: number; cost: number }>;
    summary: {
      totalUsage: number;
      totalCost: number;
      averageDailyUsage: number;
    };
  };
}

export function CustomerDashboard({ data }: CustomerDashboardProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Usage</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data.summary.totalUsage.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">units this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Cost</h3>
          <p className="text-3xl font-bold text-green-600">${data.summary.totalCost.toFixed(2)}</p>
          <p className="text-sm text-gray-500">this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Daily Average</h3>
          <p className="text-3xl font-bold text-purple-600">
            {data.summary.averageDailyUsage.toFixed(0)}
          </p>
          <p className="text-sm text-gray-500">units per day</p>
        </div>
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Usage Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.usage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">AI Usage Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.aiUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tokens" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Features</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topFeatures}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="featureId" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">AI Model Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.topModels}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ modelId, percent }) => `${modelId} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="tokens"
              >
                {data.topModels.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Usage Meter Component
// ============================================================================

interface UsageMeterProps {
  current: number;
  limit: number;
  featureId: string;
  resetAt: Date;
}

export function UsageMeter({ current, limit, featureId, resetAt }: UsageMeterProps) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage > 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{featureId}</h3>
        <span
          className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}
        >
          {current.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${
            isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>Reset: {resetAt.toLocaleDateString()}</span>
        <span>{percentage.toFixed(1)}% used</span>
      </div>
    </div>
  );
}

// ============================================================================
// AI Usage Dashboard
// ============================================================================

interface AIUsageDashboardProps {
  customerId: string;
  data: {
    totalTokens: number;
    totalCost: number;
    topModels: Array<{ modelId: string; tokens: number; cost: number }>;
    dailyBreakdown: Array<{ date: string; tokens: number; cost: number }>;
    hourlyBreakdown: Array<{ hour: number; tokens: number; cost: number }>;
  };
}

export function AIUsageDashboard({ data }: AIUsageDashboardProps) {
  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Tokens</h3>
          <p className="text-3xl font-bold text-blue-600">{data.totalTokens.toLocaleString()}</p>
          <p className="text-sm text-gray-500">tokens processed</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Cost</h3>
          <p className="text-3xl font-bold text-green-600">${data.totalCost.toFixed(2)}</p>
          <p className="text-sm text-gray-500">AI usage cost</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg Cost/Token</h3>
          <p className="text-3xl font-bold text-purple-600">
            ${(data.totalCost / data.totalTokens).toFixed(6)}
          </p>
          <p className="text-sm text-gray-500">per token</p>
        </div>
      </div>

      {/* AI Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Token Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tokens" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Usage by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.hourlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tokens" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
