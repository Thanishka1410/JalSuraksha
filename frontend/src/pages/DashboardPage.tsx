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
} from 'lucide-react';
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

const DashboardPage: React.FC = () => {
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

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard
          title="Total Pumps"
          value={stats?.totalPumps || 0}
          icon={Zap}
          color="primary"
          change={5}
        />
        <KPICard
          title="Active Pumps"
          value={stats?.activePumps || 0}
          icon={Activity}
          color="success"
          change={3}
        />
        <KPICard
          title="Water Usage (Today)"
          value={stats?.waterUsage.today || 0}
          icon={Droplets}
          color="secondary"
          suffix="L"
          change={stats?.waterUsage.trend || 0}
        />
        <KPICard
          title="Leak Alerts"
          value={stats?.leakAlerts || 0}
          icon={AlertTriangle}
          color="danger"
          change={-12}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard
          title="Tank Levels (Avg)"
          value={stats?.tankLevels ? Math.round(stats.tankLevels.reduce((a, t) => a + t.level, 0) / stats.tankLevels.length) : 0}
          icon={Gauge}
          color="accent"
          suffix="%"
        />
        <KPICard
          title="Water Quality"
          value={stats?.waterQualityStatus === 'safe' ? 95 : stats?.waterQualityStatus === 'caution' ? 70 : 40}
          icon={Droplets}
          color="success"
          suffix="%"
        />
        <KPICard
          title="Pending Complaints"
          value={stats?.pendingComplaints || 0}
          icon={ClipboardList}
          color="accent"
          change={-8}
        />
        <KPICard
          title="Maintenance Tasks"
          value={stats?.maintenanceTasks || 0}
          icon={Wrench}
          color="primary"
        />
      </div>

      {/* Charts Section */}
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
};

export default DashboardPage;
