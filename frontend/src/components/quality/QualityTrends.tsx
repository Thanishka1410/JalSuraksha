import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

interface QualityTrendsProps {
  data: any[];
  isLoading?: boolean;
}

const parameters = [
  { key: 'pH', color: '#0ea5e9', min: 6.5, max: 8.5 },
  { key: 'TDS', color: '#14b8a6', min: 0, max: 500 },
  { key: 'turbidity', color: '#f59e0b', min: 0, max: 5 },
  { key: 'chlorine', color: '#22c55e', min: 0.2, max: 1.0 },
  { key: 'fluoride', color: '#8b5cf6', min: 0, max: 1.5 },
  { key: 'iron', color: '#ef4444', min: 0, max: 0.3 },
];

const QualityTrends: React.FC<QualityTrendsProps> = ({ data, isLoading }) => {
  const [activeParams, setActiveParams] = useState<string[]>(
    parameters.map((p) => p.key)
  );

  const toggleParam = (key: string) => {
    setActiveParams((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quality Parameter Trends
        </h3>
        <div className="flex flex-wrap gap-2">
          {parameters.map((param) => (
            <button
              key={param.key}
              onClick={() => toggleParam(param.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeParams.includes(param.key)
                  ? 'text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              style={
                activeParams.includes(param.key)
                  ? { backgroundColor: param.color }
                  : undefined
              }
            >
              {param.key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#f9fafb',
            }}
          />
          <Legend />
          {parameters
            .filter((p) => activeParams.includes(p.key))
            .map((param) => (
              <Line
                key={param.key}
                type="monotone"
                dataKey={param.key}
                stroke={param.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QualityTrends;
