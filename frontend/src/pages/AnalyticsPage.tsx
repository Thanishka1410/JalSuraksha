import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, BarChart3, Droplets, Wrench, Loader2, TrendingUp,
  AlertCircle, Activity, Shield, FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
} from 'recharts';
import ConsumptionReport from '../components/analytics/ConsumptionReport';
import EfficiencyReport from '../components/analytics/EfficiencyReport';
import MaintenanceCostReport from '../components/analytics/MaintenanceCostReport';
import { exportToPDF } from '../utils/pdfExport';
import { exportToExcel } from '../utils/excelExport';
import { useFetch } from '../hooks/useApi';
import { useI18n } from '../contexts/I18nContext';
import { VillageHealthScore } from '../types';
import toast from 'react-hot-toast';

/* ── Complaint Trends Chart ──────────────────────────────────────── */
interface ComplaintTrendsData {
  monthly?: { month: string; total: number; resolved: number; pending: number }[];
  byCategory?: { category: string; count: number }[];
}

const CATEGORY_COLORS: Record<string, string> = {
  leakage: '#ef4444',
  no_water: '#f59e0b',
  dirty_water: '#8b5cf6',
  low_pressure: '#3b82f6',
  other: '#6b7280',
};

const ComplaintTrendsReport: React.FC<{ data: ComplaintTrendsData | null; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-primary-400" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-400">No complaint trend data available.</div>;

  const monthly = data.monthly || [];
  const byCategory = (data.byCategory || []).map(d => ({
    ...d,
    category: d.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  }));

  return (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Complaint Volume — Monthly Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} name="Total" />
            <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Resolved" />
            <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Pending" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Complaints by Category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Complaints" radius={[4, 4, 0, 0]}>
              {byCategory.map((d, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[d.category.toLowerCase().replace(/ /g, '_')] || '#0ea5e9'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ── Village Health Scores Report ────────────────────────────────── */
const GRADE_COLORS: Record<string, string> = { A: '#22c55e', B: '#0ea5e9', C: '#f59e0b', D: '#ef4444' };

const HealthScoreReport: React.FC<{ data: { scores: VillageHealthScore[] } | null; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-primary-400" /></div>;
  if (!data?.scores?.length) return <div className="text-center py-20 text-gray-400">No village data available.</div>;

  const [selected, setSelected] = useState(data.scores[0]);

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.scores.map(vs => (
          <button
            key={vs.village._id}
            onClick={() => setSelected(vs)}
            className={`text-left p-4 rounded-2xl border-2 transition-all ${
              selected?.village._id === vs.village._id
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{vs.village.name}</p>
              <span
                className="text-lg font-black px-2 py-0.5 rounded-lg text-white"
                style={{ background: GRADE_COLORS[vs.grade] }}
              >
                {vs.grade}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">{vs.village.district}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Health Score</span>
                <span className="font-bold" style={{ color: GRADE_COLORS[vs.grade] }}>{vs.score}/100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${vs.score}%`, background: GRADE_COLORS[vs.grade] }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radar breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4">{selected.village.name} — Score Breakdown</h4>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={[
                { subject: 'Pumps', score: selected.breakdown.pumpScore, fullMark: 25 },
                { subject: 'Tanks', score: selected.breakdown.tankScore, fullMark: 25 },
                { subject: 'Quality', score: selected.breakdown.qualityScore, fullMark: 25 },
                { subject: 'Complaints', score: selected.breakdown.complaintScore, fullMark: 25 },
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 25]} tick={false} />
                <Radar name="Score" dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Detail stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Infrastructure Details</h4>
            <div className="space-y-3">
              {[
                { label: 'Running Pumps', value: `${selected.details.runningPumps} / ${selected.details.totalPumps}` },
                { label: 'Avg Tank Level', value: `${selected.details.avgTankLevel}%` },
                { label: 'Latest Water Quality', value: selected.details.latestQualityStatus.replace(/_/g, ' ').toUpperCase() },
                { label: 'Resolved Complaints', value: `${selected.details.resolvedComplaints} / ${selected.details.totalComplaints}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────── */
const AnalyticsPage: React.FC = () => {
  const { t } = useI18n();
  const [activeReport, setActiveReport] = useState<string>('consumption');
  const [isExporting, setIsExporting] = useState(false);

  const { data: complaintTrendsData, loading: complaintLoading } = useFetch<{ success: boolean; data: ComplaintTrendsData }>('/analytics/complaints');
  const { data: healthScoresData, loading: healthLoading } = useFetch<{ success: boolean; data: { scores: VillageHealthScore[] } }>('/analytics/village-health-scores');

  const consumptionData = [
    { date: 'Jan', consumption: 3200000, previous: 2900000 },
    { date: 'Feb', consumption: 2800000, previous: 2600000 },
    { date: 'Mar', consumption: 3500000, previous: 3100000 },
    { date: 'Apr', consumption: 3100000, previous: 2800000 },
    { date: 'May', consumption: 3800000, previous: 3400000 },
    { date: 'Jun', consumption: 4200000, previous: 3800000 },
  ];

  const efficiencyData = [
    { name: 'P-001', efficiency: 92, runtime: 168 },
    { name: 'P-002', efficiency: 87, runtime: 156 },
    { name: 'P-003', efficiency: 78, runtime: 142 },
    { name: 'P-004', efficiency: 95, runtime: 172 },
    { name: 'P-005', efficiency: 65, runtime: 128 },
    { name: 'P-006', efficiency: 88, runtime: 164 },
  ];

  const maintenanceData = [
    { month: 'Jan', preventive: 15000, corrective: 25000, emergency: 8000 },
    { month: 'Feb', preventive: 12000, corrective: 18000, emergency: 5000 },
    { month: 'Mar', preventive: 18000, corrective: 22000, emergency: 12000 },
    { month: 'Apr', preventive: 14000, corrective: 16000, emergency: 3000 },
    { month: 'May', preventive: 20000, corrective: 28000, emergency: 15000 },
    { month: 'Jun', preventive: 16000, corrective: 20000, emergency: 7000 },
  ];

  const reports = [
    { id: 'consumption', label: t.analytics.consumption, icon: Droplets },
    { id: 'efficiency', label: t.analytics.efficiency, icon: BarChart3 },
    { id: 'maintenance', label: t.analytics.maintenanceCosts, icon: Wrench },
    { id: 'complaint-trends', label: 'Complaint Trends', icon: TrendingUp },
    { id: 'health-scores', label: 'Village Health', icon: Shield },
  ];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF('analytics-report-area', {
        title: `${reports.find(r => r.id === activeReport)?.label || activeReport} Report`,
        filename: `${activeReport}_report`,
      });
      toast.success('PDF report downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    const scores = healthScoresData?.data?.scores;
    if (activeReport === 'health-scores' && scores) {
      const rows = scores.map(vs => ({
        Village: vs.village.name,
        District: vs.village.district,
        'Health Score': vs.score,
        Grade: vs.grade,
        'Pump Score': vs.breakdown.pumpScore,
        'Tank Score': vs.breakdown.tankScore,
        'Quality Score': vs.breakdown.qualityScore,
        'Complaint Score': vs.breakdown.complaintScore,
      }));
      exportToExcel(rows, 'Village Health', 'village_health_scores');
      toast.success('Excel file downloaded!');
    } else {
      toast('Excel export is available for Village Health report.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.analytics.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t.analytics.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors no-print"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            id="export-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-60 transition-colors no-print"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.analytics.generating}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {t.analytics.exportReport}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 overflow-x-auto no-print pb-1">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeReport === report.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {report.label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <div id="analytics-report-area" className="bg-white dark:bg-gray-900 rounded-xl p-2">
        <motion.div
          key={activeReport}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeReport === 'consumption' && <ConsumptionReport data={consumptionData} />}
          {activeReport === 'efficiency' && <EfficiencyReport data={efficiencyData} />}
          {activeReport === 'maintenance' && <MaintenanceCostReport data={maintenanceData} />}
          {activeReport === 'complaint-trends' && (
            <ComplaintTrendsReport
              data={complaintTrendsData?.data || null}
              loading={complaintLoading}
            />
          )}
          {activeReport === 'health-scores' && (
            <HealthScoreReport
              data={healthScoresData?.data || null}
              loading={healthLoading}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
