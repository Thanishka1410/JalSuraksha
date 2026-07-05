import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Zap,
  Gauge,
  AlertTriangle,
  ClipboardList,
  Wrench,
  Activity,
  TrendingUp,
  Users,
  MapPin,
  BarChart3,
  Shield,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import KPICard from '../components/common/KPICard';
import UsageTrendsChart from '../components/dashboard/UsageTrendsChart';
import PumpEfficiencyChart from '../components/dashboard/PumpEfficiencyChart';
import QualityDistributionChart from '../components/dashboard/QualityDistributionChart';
import ComplaintsByCategoryChart from '../components/dashboard/ComplaintsByCategoryChart';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import RecentComplaints from '../components/dashboard/RecentComplaints';
import { CardSkeleton } from '../components/common/LoadingSpinner';
import { DashboardStats } from '../types';
import { apiGet } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

const DashboardPage: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const role = user?.role || 'citizen';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiGet<any>('/analytics/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({
        totalPumps: 3,
        activePumps: 2,
        totalTanks: 2,
        tankLevels: [
          { name: 'Overhead Tank', level: 70, capacity: 50000 },
          { name: 'Underground Tank', level: 17, capacity: 30000 },
        ],
        waterQualityStatus: 'safe',
        leakAlerts: 1,
        pendingComplaints: 3,
        maintenanceTasks: 1,
        waterUsage: { today: 13000, week: 91000, month: 390000, trend: 5.2 },
        recentAlerts: [],
        recentComplaints: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const usageData = [
    { date: 'Mon', usage: 125000, previous: 118000 },
    { date: 'Tue', usage: 132000, previous: 125000 },
    { date: 'Wed', usage: 118000, previous: 120000 },
    { date: 'Thu', usage: 145000, previous: 130000 },
    { date: 'Fri', usage: 138000, previous: 135000 },
    { date: 'Sat', usage: 155000, previous: 142000 },
    { date: 'Sun', usage: 142000, previous: 138000 },
  ];

  const pumpEfficiencyData = [
    { name: 'P-001', efficiency: 92 },
    { name: 'P-002', efficiency: 87 },
    { name: 'P-003', efficiency: 78 },
    { name: 'P-004', efficiency: 95 },
    { name: 'P-005', efficiency: 65 },
    { name: 'P-006', efficiency: 88 },
    { name: 'P-007', efficiency: 45 },
  ];

  const qualityData = [
    { name: 'Safe', value: 85 },
    { name: 'Caution', value: 10 },
    { name: 'Unsafe', value: 5 },
  ];

  const complaintsByCategoryData = [
    { name: 'Water Quality', count: 12 },
    { name: 'Supply', count: 8 },
    { name: 'Infrastructure', count: 6 },
    { name: 'Billing', count: 4 },
    { name: 'Other', count: 2 },
  ];

  const villageData = [
    { name: 'Rampur', pumps: 3, quality: 'safe', complaints: 2 },
    { name: 'Sitapur', pumps: 5, quality: 'caution', complaints: 4 },
    { name: 'Govindpur', pumps: 2, quality: 'safe', complaints: 1 },
    { name: 'Lakshmipur', pumps: 4, quality: 'unsafe', complaints: 7 },
    { name: 'Krishnanagar', pumps: 6, quality: 'safe', complaints: 3 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ==================== SUPER ADMIN DASHBOARD ====================
  if (role === 'super_admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.superAdminTitle}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.superAdminSubtitle}</p>
          </div>
        </div>

        {/* Row 1: Infrastructure Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Link to="/infrastructure">
            <KPICard title={t.dashboard.totalPumps} value={stats?.totalPumps || 0} icon={Zap} color="primary" change={5} />
          </Link>
          <Link to="/infrastructure">
            <KPICard title={t.dashboard.activePumps} value={stats?.activePumps || 0} icon={Activity} color="success" change={3} />
          </Link>
          <Link to="/infrastructure">
            <KPICard title={t.dashboard.totalTanks} value={stats?.totalTanks || 0} icon={Gauge} color="secondary" />
          </Link>
          <Link to="/alerts">
            <KPICard title={t.dashboard.leakAlerts} value={stats?.leakAlerts || 0} icon={AlertTriangle} color="danger" change={-12} />
          </Link>
        </div>

        {/* Row 2: Operational Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard title={t.dashboard.waterUsageToday} value={stats?.waterUsage.today || 0} icon={Droplets} color="secondary" suffix="L" change={stats?.waterUsage.trend || 0} />
          <KPICard title={t.dashboard.waterQuality} value={stats?.waterQualityStatus === 'safe' ? 95 : stats?.waterQualityStatus === 'caution' ? 70 : 40} icon={Droplets} color="success" suffix="%" />
          <Link to="/complaints">
            <KPICard title={t.dashboard.openComplaints} value={stats?.pendingComplaints || 0} icon={ClipboardList} color="accent" change={-8} />
          </Link>
          <KPICard title={t.dashboard.maintenanceTasks} value={stats?.maintenanceTasks || 0} icon={Wrench} color="primary" />
        </div>

        {/* Row 3: User & Village Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard title={t.dashboard.totalVillages} value={5} icon={MapPin} color="primary" />
          <KPICard title={t.dashboard.totalUsers} value={12} icon={Users} color="secondary" />
          <KPICard title={t.dashboard.tankLevelAvg} value={stats?.tankLevels ? Math.round(stats.tankLevels.reduce((a, t) => a + t.level, 0) / stats.tankLevels.length) : 0} icon={Gauge} color="accent" suffix="%" />
          <KPICard title={t.dashboard.systemUptime} value={99} icon={CheckCircle} color="success" suffix="%" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageTrendsChart data={usageData} />
          <PumpEfficiencyChart data={pumpEfficiencyData} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QualityDistributionChart data={qualityData} />
          <ComplaintsByCategoryChart data={complaintsByCategoryData} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentAlerts alerts={stats?.recentAlerts || []} />
          <RecentComplaints complaints={stats?.recentComplaints || []} />
        </div>
      </div>
    );
  }

  // ==================== GP ADMIN DASHBOARD ====================
  if (role === 'gp_admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-6 h-6 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.gpAdminTitle}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.gpAdminSubtitle}</p>
          </div>
        </div>

        {/* Infrastructure KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Link to="/infrastructure">
            <KPICard title={t.dashboard.totalPumps} value={stats?.totalPumps || 0} icon={Zap} color="primary" change={5} />
          </Link>
          <Link to="/infrastructure">
            <KPICard title={t.dashboard.activePumps} value={stats?.activePumps || 0} icon={Activity} color="success" change={3} />
          </Link>
          <Link to="/infrastructure">
            <KPICard title={t.dashboard.tankLevelAvg} value={stats?.tankLevels ? Math.round(stats.tankLevels.reduce((a, t) => a + t.level, 0) / stats.tankLevels.length) : 0} icon={Gauge} color="accent" suffix="%" />
          </Link>
          <Link to="/alerts">
            <KPICard title={t.dashboard.leakAlerts} value={stats?.leakAlerts || 0} icon={AlertTriangle} color="danger" />
          </Link>
        </div>

        {/* Maintenance & Complaints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard title={t.dashboard.waterUsageToday} value={stats?.waterUsage.today || 0} icon={Droplets} color="secondary" suffix="L" />
          <Link to="/complaints">
            <KPICard title={t.dashboard.openComplaints} value={stats?.pendingComplaints || 0} icon={ClipboardList} color="accent" change={-8} />
          </Link>
          <KPICard title={t.dashboard.maintenanceTasks} value={stats?.maintenanceTasks || 0} icon={Wrench} color="primary" />
          <KPICard title={t.dashboard.waterQuality} value={stats?.waterQualityStatus === 'safe' ? 95 : stats?.waterQualityStatus === 'caution' ? 70 : 40} icon={Droplets} color="success" suffix="%" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PumpEfficiencyChart data={pumpEfficiencyData} />
          <QualityDistributionChart data={qualityData} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentAlerts alerts={stats?.recentAlerts || []} />
          <RecentComplaints complaints={stats?.recentComplaints || []} />
        </div>
      </div>
    );
  }

  // ==================== VWSC MEMBER DASHBOARD ====================
  if (role === 'vWSC_member') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.vwscTitle}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.vwscSubtitle}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Link to="/quality" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
              <Droplets className="w-8 h-8 text-primary-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.dashboard.uploadQualityReport}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.uploadQualityReportDesc}</p>
            </div>
          </Link>
          <Link to="/infrastructure" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
              <Wrench className="w-8 h-8 text-success-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.dashboard.logMaintenance}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.logMaintenanceDesc}</p>
            </div>
          </Link>
          <Link to="/complaints" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
              <ClipboardList className="w-8 h-8 text-accent-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.dashboard.viewComplaints}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.viewComplaintsDesc}</p>
            </div>
          </Link>
          <Link to="/quality" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
              <CheckCircle className="w-8 h-8 text-secondary-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.dashboard.inspectionHistory}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.inspectionHistoryDesc}</p>
            </div>
          </Link>
        </div>

        {/* Status KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard title={t.dashboard.waterQuality} value={stats?.waterQualityStatus === 'safe' ? 95 : stats?.waterQualityStatus === 'caution' ? 70 : 40} icon={Droplets} color="success" suffix="%" />
          <KPICard title={t.dashboard.maintenanceTasks} value={stats?.maintenanceTasks || 0} icon={Wrench} color="primary" />
          <Link to="/complaints">
            <KPICard title={t.dashboard.openComplaints} value={stats?.pendingComplaints || 0} icon={ClipboardList} color="accent" />
          </Link>
          <KPICard title={t.dashboard.activePumps} value={stats?.activePumps || 0} icon={Activity} color="secondary" />
        </div>

        {/* Quality & Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QualityDistributionChart data={qualityData} />
          <ComplaintsByCategoryChart data={complaintsByCategoryData} />
        </div>
      </div>
    );
  }

  // ==================== CITIZEN DASHBOARD ====================
  if (role === 'citizen') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.welcome}, {user?.name || 'Citizen'}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.citizenSubtitle}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <Link to="/complaints" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
              <AlertTriangle className="w-8 h-8 text-danger-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.dashboard.reportIssue}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.reportIssueDesc}</p>
            </div>
          </Link>
          <Link to="/quality" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
              <Droplets className="w-8 h-8 text-success-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.dashboard.waterQuality}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.viewQuality}</p>
            </div>
          </Link>
          <Link to="/complaints" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
              <ClipboardList className="w-8 h-8 text-accent-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.dashboard.myComplaints}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.myComplaintsDesc}</p>
            </div>
          </Link>
        </div>

        {/* Status KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard title={t.dashboard.waterQuality} value={stats?.waterQualityStatus === 'safe' ? 95 : stats?.waterQualityStatus === 'caution' ? 70 : 40} icon={Droplets} color="success" suffix="%" />
          <KPICard title={t.dashboard.tankLevelAvg} value={stats?.tankLevels ? Math.round(stats.tankLevels.reduce((a, t) => a + t.level, 0) / stats.tankLevels.length) : 0} icon={Gauge} color="accent" suffix="%" />
          <KPICard title={t.dashboard.waterUsageToday} value={stats?.waterUsage.today || 0} icon={Droplets} color="secondary" suffix="L" />
          <KPICard title={t.dashboard.myComplaints} value={stats?.pendingComplaints || 0} icon={ClipboardList} color="primary" />
        </div>

        {/* Quality */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QualityDistributionChart data={qualityData} />
          <RecentComplaints complaints={stats?.recentComplaints || []} />
        </div>
      </div>
    );
  }

  // ==================== DISTRICT OFFICER DASHBOARD ====================
  if (role === 'district_officer') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-6 h-6 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.districtTitle}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.districtSubtitle}</p>
          </div>
        </div>

        {/* Overview KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard title={t.dashboard.totalVillages} value={5} icon={MapPin} color="primary" />
          <KPICard title={t.dashboard.totalPumps} value={stats?.totalPumps || 0} icon={Zap} color="secondary" change={5} />
          <KPICard title={t.dashboard.leakAlerts} value={stats?.leakAlerts || 0} icon={AlertTriangle} color="danger" />
          <KPICard title={t.dashboard.openComplaints} value={stats?.pendingComplaints || 0} icon={ClipboardList} color="accent" />
        </div>

        {/* District-wide Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard title={t.dashboard.activePumps} value={stats?.activePumps || 0} icon={Activity} color="success" />
          <KPICard title={t.dashboard.waterQuality} value={stats?.waterQualityStatus === 'safe' ? 95 : stats?.waterQualityStatus === 'caution' ? 70 : 40} icon={Droplets} color="success" suffix="%" />
          <KPICard title={t.dashboard.maintenanceTasks} value={stats?.maintenanceTasks || 0} icon={Wrench} color="primary" />
          <KPICard title={t.dashboard.tankLevelAvg} value={stats?.tankLevels ? Math.round(stats.tankLevels.reduce((a, t) => a + t.level, 0) / stats.tankLevels.length) : 0} icon={Gauge} color="accent" suffix="%" />
        </div>

        {/* Village Overview Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.dashboard.villageOverview}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.village}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Pumps</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Quality</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Complaints</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.status}</th>
                </tr>
              </thead>
              <tbody>
                {villageData.map((village) => (
                  <tr key={village.name} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{village.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{village.pumps}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        village.quality === 'safe' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' :
                        village.quality === 'caution' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
                      }`}>
                        {village.quality}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{village.complaints}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        village.complaints <= 2 ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' :
                        village.complaints <= 5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
                      }`}>
                        {village.complaints <= 2 ? t.dashboard.good : village.complaints <= 5 ? t.dashboard.moderate : t.dashboard.critical}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageTrendsChart data={usageData} />
          <PumpEfficiencyChart data={pumpEfficiencyData} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QualityDistributionChart data={qualityData} />
          <ComplaintsByCategoryChart data={complaintsByCategoryData} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentAlerts alerts={stats?.recentAlerts || []} />
          <RecentComplaints complaints={stats?.recentComplaints || []} />
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach here)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard title={t.dashboard.totalPumps} value={stats?.totalPumps || 0} icon={Zap} color="primary" />
        <KPICard title={t.dashboard.waterUsageToday} value={stats?.waterUsage.today || 0} icon={Droplets} color="secondary" suffix="L" />
        <KPICard title={t.dashboard.openComplaints} value={stats?.pendingComplaints || 0} icon={ClipboardList} color="accent" />
        <KPICard title={t.dashboard.waterQuality} value={stats?.waterQualityStatus === 'safe' ? 95 : 40} icon={Droplets} color="success" suffix="%" />
      </div>
    </div>
  );
};

export default DashboardPage;
