import React, { useState } from 'react';
import { format } from 'date-fns';
import { WaterQuality } from '../../types';
import StatusBadge from '../common/StatusBadge';
import DataTable, { Column } from '../common/DataTable';

interface QualityHistoryProps {
  readings: WaterQuality[];
  isLoading?: boolean;
}

const QualityHistory: React.FC<QualityHistoryProps> = ({ readings, isLoading }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const filteredReadings = readings.filter((reading) => {
    if (statusFilter !== 'all' && reading.overallStatus !== statusFilter) {
      return false;
    }
    const dateVal = reading.sampleDate || reading.createdAt;
    if (dateRange.start && new Date(dateVal) < new Date(dateRange.start)) {
      return false;
    }
    if (dateRange.end && new Date(dateVal) > new Date(dateRange.end)) {
      return false;
    }
    return true;
  });

  const columns: Column<WaterQuality>[] = [
    {
      key: 'createdAt',
      title: 'Date & Time',
      sortable: true,
      render: (item) => (
        <span className="text-gray-900 dark:text-white">
          {format(new Date(item.sampleDate || item.createdAt), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
    {
      key: 'pH',
      title: 'pH',
      sortable: true,
      render: (item) => (
        <span className={item.parameters?.pH < 6.5 || item.parameters?.pH > 8.5 ? 'text-danger-600' : ''}>
          {item.parameters?.pH?.toFixed(1) || '-'}
        </span>
      ),
    },
    {
      key: 'TDS',
      title: 'TDS',
      sortable: true,
      render: (item) => (
        <span className={item.parameters?.TDS > 500 ? 'text-danger-600' : ''}>
          {item.parameters?.TDS || '-'} mg/L
        </span>
      ),
    },
    {
      key: 'turbidity',
      title: 'Turbidity',
      sortable: true,
      render: (item) => (
        <span className={item.parameters?.turbidity > 5 ? 'text-danger-600' : ''}>
          {item.parameters?.turbidity?.toFixed(2) || '-'} NTU
        </span>
      ),
    },
    {
      key: 'coliform',
      title: 'Coliform',
      sortable: true,
      render: (item) => (
        <span className={(item.parameters?.coliform || 0) > 0 ? 'text-danger-600' : ''}>
          {item.parameters?.coliform || 0} CFU
        </span>
      ),
    },
    {
      key: 'overallStatus',
      title: 'Status',
      render: (item) => <StatusBadge status={item.overallStatus} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="safe">Safe</option>
          <option value="caution">Caution</option>
          <option value="unsafe">Unsafe</option>
        </select>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="End Date"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredReadings}
        loading={isLoading}
        keyExtractor={(item) => item._id}
        emptyMessage="No water quality readings found"
        pagination={{
          page: 1,
          totalPages: Math.ceil(filteredReadings.length / 10),
          onPageChange: () => {},
        }}
      />
    </div>
  );
};

export default QualityHistory;
