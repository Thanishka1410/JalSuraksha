import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, BarChart3, Droplets, Wrench, AlertTriangle } from 'lucide-react';
import ConsumptionReport from '../components/analytics/ConsumptionReport';
import EfficiencyReport from '../components/analytics/EfficiencyReport';
import MaintenanceCostReport from '../components/analytics/MaintenanceCostReport';
import { ChartSkeleton } from '../components/common/LoadingSpinner';

const AnalyticsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string>('consumption');

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
    { id: 'consumption', label: 'Consumption', icon: Droplets },
    { id: 'efficiency', label: 'Efficiency', icon: BarChart3 },
    { id: 'maintenance', label: 'Maintenance Costs', icon: Wrench },
  ];

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Detailed reports and insights
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors no-print"
        >
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 overflow-x-auto no-print">
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
      <motion.div
        key={activeReport}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeReport === 'consumption' && (
          <ConsumptionReport data={consumptionData} />
        )}
        {activeReport === 'efficiency' && (
          <EfficiencyReport data={efficiencyData} />
        )}
        {activeReport === 'maintenance' && (
          <MaintenanceCostReport data={maintenanceData} />
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
