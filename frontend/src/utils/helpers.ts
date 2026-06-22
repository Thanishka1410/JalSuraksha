import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return format(d, 'MMM dd, yyyy HH:mm');
};

export const timeAgo = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'text-success-600 bg-success-100 dark:bg-success-900/30',
    inactive: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
    maintenance: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30',
    faulty: 'text-danger-600 bg-danger-100 dark:bg-danger-900/30',
    pending: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30',
    assigned: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30',
    in_progress: 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/30',
    resolved: 'text-success-600 bg-success-100 dark:bg-success-900/30',
    closed: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
    open: 'text-success-600 bg-success-100 dark:bg-success-900/30',
    closed_valve: 'text-danger-600 bg-danger-100 dark:bg-danger-900/30',
    partial: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30',
    safe: 'text-success-600 bg-success-100 dark:bg-success-900/30',
    caution: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30',
    unsafe: 'text-danger-600 bg-danger-100 dark:bg-danger-900/30',
    overflowing: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30',
    empty: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
    damaged: 'text-danger-600 bg-danger-100 dark:bg-danger-900/30',
    under_repair: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30',
  };
  return colors[status] || 'text-gray-600 bg-gray-100 dark:bg-gray-700';
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/30',
    medium: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30',
    high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    critical: 'text-danger-600 bg-danger-100 dark:bg-danger-900/30',
  };
  return colors[priority] || 'text-gray-600 bg-gray-100 dark:bg-gray-700';
};

export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    low: 'text-secondary-600 border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20',
    medium: 'text-accent-600 border-accent-500 bg-accent-50 dark:bg-accent-900/20',
    high: 'text-orange-600 border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    critical: 'text-danger-600 border-danger-500 bg-danger-50 dark:bg-danger-900/20',
  };
  return colors[severity] || 'text-gray-600 border-gray-500 bg-gray-50 dark:bg-gray-700';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatVolume = (liters: number): string => {
  if (liters >= 1000000) {
    return (liters / 1000000).toFixed(2) + ' ML';
  }
  if (liters >= 1000) {
    return (liters / 1000).toFixed(2) + ' KL';
  }
  return liters.toFixed(2) + ' L';
};

export const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getWaterQualityColor = (status: string): string => {
  const colors: Record<string, string> = {
    safe: '#22c55e',
    caution: '#f59e0b',
    unsafe: '#ef4444',
  };
  return colors[status] || '#6b7280';
};

export const calculateEfficiency = (hours: number, consumption: number): number => {
  if (hours === 0 || consumption === 0) return 0;
  const expectedConsumption = hours * 100;
  return Math.min(100, Math.round((expectedConsumption / consumption) * 100));
};

export const getWaterLevelColor = (level: number): string => {
  if (level >= 80) return 'text-success-600';
  if (level >= 50) return 'text-primary-600';
  if (level >= 25) return 'text-accent-600';
  return 'text-danger-600';
};

export const getWaterLevelBg = (level: number): string => {
  if (level >= 80) return 'bg-success-500';
  if (level >= 50) return 'bg-primary-500';
  if (level >= 25) return 'bg-accent-500';
  return 'bg-danger-500';
};

export const getHealthScoreColor = (score: number): string => {
  if (score >= 80) return 'text-success-600';
  if (score >= 60) return 'text-accent-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-danger-600';
};

export const getHealthScoreBg = (score: number): string => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
