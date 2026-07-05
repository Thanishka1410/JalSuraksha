import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useI18n } from '../../contexts/I18nContext';

interface QualityDistributionChartProps {
  data: { name: string; value: number }[];
  isLoading?: boolean;
}

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const QualityDistributionChart: React.FC<QualityDistributionChartProps> = ({
  data,
  isLoading,
}) => {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }


  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {t.dashboard.qualityDistribution}
      </h3>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        {data.map((item, index) => (
          <div key={item.name} className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QualityDistributionChart;
