import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Filter, AlertTriangle, Droplets, Gauge, Wrench, Shield } from 'lucide-react';
import AlertList from '../components/alerts/AlertList';
import KPICard from '../components/common/KPICard';
import { useFetch } from '../hooks/useApi';
import { apiPut } from '../utils/api';
import { Alert } from '../types';
import toast from 'react-hot-toast';

const AlertsPage: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data, loading, refetch } = useFetch<{ data: { alerts: Alert[] } }>('/alerts');

  const alerts = data?.data?.alerts || [];

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleAcknowledge = async (alert: Alert) => {
    try {
      await apiPut(`/alerts/${alert._id}/acknowledge`);
      toast.success('Alert acknowledged');
      refetch();
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleMarkRead = async (alert: Alert) => {
    try {
      await apiPut(`/alerts/${alert._id}/read`);
      refetch();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor system alerts and notifications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Alerts" value={alerts.length} icon={Bell} color="primary" />
        <KPICard title="Critical" value={criticalCount} icon={AlertTriangle} color="danger" />
        <KPICard title="High Priority" value={highCount} icon={AlertTriangle} color="accent" />
        <KPICard title="Unread" value={unreadCount} icon={Bell} color="secondary" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Types</option>
          <option value="leak">Leak</option>
          <option value="pump">Pump</option>
          <option value="quality">Quality</option>
          <option value="tank">Tank</option>
          <option value="complaint">Complaint</option>
        </select>
      </div>

      {/* Alert List */}
      <AlertList
        alerts={filteredAlerts}
        isLoading={loading}
        onAcknowledge={handleAcknowledge}
        onMarkRead={handleMarkRead}
      />
    </div>
  );
};

export default AlertsPage;
