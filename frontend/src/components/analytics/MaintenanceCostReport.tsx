import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/helpers';

interface MaintenanceCostReportProps {
  data: { month: string; preventive: number; corrective: number; emergency: number }[];
  isLoading?: boolean;
}

const MaintenanceCostReport: React.FC<MaintenanceCostReportProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-pulse" />
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  const totalCost = data.reduce(
    (sum, d) => sum + d.preventive + d.corrective + d.emergency,
    0
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Maintenance Costs
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalCost)}</span>
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} tickFormatter={(v) => `${v/1000}K`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#f9fafb',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend />
          <Line type="monotone" dataKey="preventive" name="Preventive" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="corrective" name="Corrective" stroke="#f59e0b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="emergency" name="Emergency" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
          <p className="text-2xl font-bold text-success-600">
            {formatCurrency(data.reduce((s, d) => s + d.preventive, 0))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Preventive</p>
        </div>
        <div className="text-center p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
          <p className="text-2xl font-bold text-accent-600">
            {formatCurrency(data.reduce((s, d) => s + d.corrective, 0))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Corrective</p>
        </div>
        <div className="text-center p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
          <p className="text-2xl font-bold text-danger-600">
            {formatCurrency(data.reduce((s, d) => s + d.emergency, 0))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Emergency</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCostReport;
