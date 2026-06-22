import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'accent' | 'danger' | 'success';
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    text: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-200 dark:border-primary-800',
  },
  secondary: {
    bg: 'bg-secondary-100 dark:bg-secondary-900/30',
    text: 'text-secondary-600 dark:text-secondary-400',
    border: 'border-secondary-200 dark:border-secondary-800',
  },
  accent: {
    bg: 'bg-accent-100 dark:bg-accent-900/30',
    text: 'text-accent-600 dark:text-accent-400',
    border: 'border-accent-200 dark:border-accent-800',
  },
  danger: {
    bg: 'bg-danger-100 dark:bg-danger-900/30',
    text: 'text-danger-600 dark:text-danger-400',
    border: 'border-danger-200 dark:border-danger-800',
  },
  success: {
    bg: 'bg-success-100 dark:bg-success-900/30',
    text: 'text-success-600 dark:text-success-400',
    border: 'border-success-200 dark:border-success-800',
  },
};

const AnimatedNumber: React.FC<{ value: number; decimals?: number }> = ({
  value,
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toFixed(decimals)}</span>;
};

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${colors.border} p-6 cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            {prefix && (
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{prefix}</span>
            )}
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={value} decimals={decimals} />
            </span>
            {suffix && (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{suffix}</span>
            )}
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}
              >
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default KPICard;
