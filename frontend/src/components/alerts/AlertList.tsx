import React from 'react';
import { motion } from 'framer-motion';
import {
  Droplets,
  Gauge,
  Wrench,
  Shield,
  Bell,
  Check,
  Eye,
} from 'lucide-react';
import { Alert } from '../../types';
import { timeAgo, getSeverityColor } from '../../utils/helpers';

interface AlertListProps {
  alerts: Alert[];
  isLoading?: boolean;
  onAcknowledge?: (alert: Alert) => void;
  onMarkRead?: (alert: Alert) => void;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'leak':
      return Droplets;
    case 'pump':
      return Gauge;
    case 'quality':
      return Shield;
    case 'maintenance':
      return Wrench;
    case 'tank':
      return Droplets;
    default:
      return Bell;
  }
};

const AlertList: React.FC<AlertListProps> = ({
  alerts,
  isLoading,
  onAcknowledge,
  onMarkRead,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const Icon = getAlertIcon(alert.type);
        return (
          <motion.div
            key={alert._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white dark:bg-gray-800 rounded-xl border p-4 ${
              getSeverityColor(alert.severity)
            } ${!alert.isRead ? 'ring-2 ring-primary-500/20' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                alert.severity === 'critical'
                  ? 'bg-danger-100 dark:bg-danger-900/30'
                  : alert.severity === 'high'
                  ? 'bg-orange-100 dark:bg-orange-900/30'
                  : alert.severity === 'medium'
                  ? 'bg-accent-100 dark:bg-accent-900/30'
                  : 'bg-secondary-100 dark:bg-secondary-900/30'
              }`}>
                <Icon className={`w-5 h-5 ${
                  alert.severity === 'critical'
                    ? 'text-danger-500'
                    : alert.severity === 'high'
                    ? 'text-orange-500'
                    : alert.severity === 'medium'
                    ? 'text-accent-500'
                    : 'text-secondary-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {alert.title}
                  </h4>
                  {!alert.isRead && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{alert.message}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {timeAgo(alert.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!alert.isAcknowledged && onAcknowledge && (
                  <button
                    onClick={() => onAcknowledge(alert)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Acknowledge"
                  >
                    <Check className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                {!alert.isRead && onMarkRead && (
                  <button
                    onClick={() => onMarkRead(alert)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Mark as read"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AlertList;
