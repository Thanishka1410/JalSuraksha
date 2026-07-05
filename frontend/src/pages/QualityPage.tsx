import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Droplets, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import QualityForm from '../components/quality/QualityForm';
import QualityTrends from '../components/quality/QualityTrends';
import QualityHistory from '../components/quality/QualityHistory';
import KPICard from '../components/common/KPICard';
import { useFetch } from '../hooks/useApi';
import { apiPost } from '../utils/api';
import { WaterQuality } from '../types';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';

const QualityPage: React.FC = () => {
  const { t } = useI18n();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, loading, refetch } = useFetch<{ data: { records: WaterQuality[] } }>('/water-quality');
  const [submitLoading, setSubmitLoading] = useState(false);

  const readings = data?.data?.records || [];

  const latestReading = readings[0];
  const safeCount = readings.filter((r) => r.overallStatus === 'safe').length;
  const cautionCount = readings.filter((r) => r.overallStatus === 'needs_inspection').length;
  const unsafeCount = readings.filter((r) => r.overallStatus === 'unsafe').length;

  const trendsData = readings
    .slice(0, 20)
    .reverse()
    .map((r) => ({
      date: new Date(r.sampleDate || r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pH: r.parameters?.pH || 0,
      TDS: r.parameters?.TDS || 0,
      turbidity: r.parameters?.turbidity || 0,
      chlorine: r.parameters?.chlorine || 0,
      fluoride: r.parameters?.fluoride || 0,
      iron: r.parameters?.iron || 0,
    }));

  const handleSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      await apiPost('/water-quality', data);
      toast.success(t.quality.readingSubmitted);
      refetch();
    } catch (error) {
      toast.error(t.quality.readingFailed);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.quality.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t.quality.subtitle}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t.quality.addReading}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t.quality.latestStatus}
          value={latestReading?.overallStatus === 'safe' ? 95 : latestReading?.overallStatus === 'needs_inspection' ? 70 : 40}
          icon={Droplets}
          color={latestReading?.overallStatus === 'safe' ? 'success' : latestReading?.overallStatus === 'needs_inspection' ? 'accent' : 'danger'}
          suffix="%"
        />
        <KPICard
          title={t.quality.safeReadings}
          value={safeCount}
          icon={CheckCircle}
          color="success"
        />
        <KPICard
          title={t.quality.cautionReadings}
          value={cautionCount}
          icon={AlertTriangle}
          color="accent"
        />
        <KPICard
          title={t.quality.unsafeReadings}
          value={unsafeCount}
          icon={XCircle}
          color="danger"
        />
      </div>

      {/* Current Status Card */}
      {latestReading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t.quality.latestReading}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {latestReading.parameters && Object.entries(latestReading.parameters).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{key}</p>
                <p className={`text-lg font-semibold ${
                  key === 'pH' && (value < 6.5 || value > 8.5) ? 'text-danger-600' :
                  key === 'TDS' && value > 500 ? 'text-danger-600' :
                  key === 'turbidity' && value > 5 ? 'text-danger-600' :
                  'text-gray-900 dark:text-white'
                }`}>
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trends Chart */}
      <QualityTrends data={trendsData} isLoading={loading} />

      {/* History Table */}
      <QualityHistory readings={readings} isLoading={loading} />

      {/* Form Modal */}
      <QualityForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />
    </div>
  );
};

export default QualityPage;
