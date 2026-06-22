import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface EfficiencyReportProps {
  data: { name: string; efficiency: number; runtime: number }[];
  isLoading?: boolean;
}

const getColor = (efficiency: number) => {
  if (efficiency >= 80) return '#22c55e';
  if (efficiency >= 60) return '#f59e0b';
  return '#ef4444';
};

const EfficiencyReport: React.FC<EfficiencyReportProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-pulse" />
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Pump Efficiency Report
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#f9fafb',
            }}
          />
          <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.efficiency)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Pump</th>
              <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Efficiency</th>
              <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Runtime</th>
              <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.name} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-3 text-sm text-gray-900 dark:text-white">{item.name}</td>
                <td className="py-3 text-sm" style={{ color: getColor(item.efficiency) }}>
                  {item.efficiency}%
                </td>
                <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{item.runtime} hrs</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.efficiency >= 80 ? 'bg-success-100 text-success-600' :
                    item.efficiency >= 60 ? 'bg-accent-100 text-accent-600' :
                    'bg-danger-100 text-danger-600'
                  }`}>
                    {item.efficiency >= 80 ? 'Good' : item.efficiency >= 60 ? 'Fair' : 'Poor'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EfficiencyReport;
