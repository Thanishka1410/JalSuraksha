import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Filter, AlertTriangle, Droplets, Gauge, Wrench, Shield } from 'lucide-react';
import AlertList from '../components/alerts/AlertList';
import KPICard from '../components/common/KPICard';
import { useFetch } from '../hooks/useApi';
import { apiPut } from '../utils/api';
import { Alert } from '../types';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';

const AlertsPage: React.FC = () => {
  const { t } = useI18n();
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
      toast.success(t.alerts.acknowledge);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.alerts.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t.alerts.subtitle}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t.alerts.totalAlerts} value={alerts.length} icon={Bell} color="primary" />
        <KPICard title={t.alerts.critical} value={criticalCount} icon={AlertTriangle} color="danger" />
        <KPICard title={t.alerts.highPriority} value={highCount} icon={AlertTriangle} color="accent" />
        <KPICard title={t.alerts.unread} value={unreadCount} icon={Bell} color="secondary" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">{t.alerts.allSeverity}</option>
          <option value="low">{t.alerts.low}</option>
          <option value="medium">{t.alerts.medium}</option>
          <option value="high">{t.alerts.high}</option>
          <option value="critical">{t.alerts.critical}</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">{t.alerts.allTypes}</option>
          <option value="leak">{t.alerts.leak}</option>
          <option value="pump">{t.alerts.pump}</option>
          <option value="quality">{t.alerts.quality}</option>
          <option value="tank">{t.alerts.tank}</option>
          <option value="complaint">{t.alerts.complaint}</option>
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
