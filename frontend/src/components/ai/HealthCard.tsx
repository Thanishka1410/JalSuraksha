import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { getHealthScoreColor, getHealthScoreBg } from '../../utils/helpers';

interface HealthCardProps {
  name: string;
  healthScore: number;
  failureRisk: 'low' | 'medium' | 'high';
  recommendation: string;
  lastMaintenance?: string;
}

const HealthCard: React.FC<HealthCardProps> = ({
  name,
  healthScore,
  failureRisk,
  recommendation,
  lastMaintenance,
}) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  const riskColors = {
    low: 'text-success-600 bg-success-100 dark:bg-success-900/30',
    medium: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30',
    high: 'text-danger-600 bg-danger-100 dark:bg-danger-900/30',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[failureRisk]}`}>
          {failureRisk} risk
        </span>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke={getHealthScoreBg(healthScore)}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>
              {healthScore}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          {failureRisk === 'high' ? (
            <AlertTriangle className="w-4 h-4 text-danger-500 mt-0.5" />
          ) : failureRisk === 'medium' ? (
            <Activity className="w-4 h-4 text-accent-500 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 text-success-500 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Risk Level</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {failureRisk} probability of failure
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Wrench className="w-4 h-4 text-primary-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Recommendation</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{recommendation}</p>
          </div>
        </div>

        {lastMaintenance && (
          <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
            Last maintenance: {lastMaintenance}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default HealthCard;
