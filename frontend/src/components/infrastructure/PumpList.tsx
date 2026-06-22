import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Gauge, Power, Settings } from 'lucide-react';
import { Pump } from '../../types';
import { getHealthScoreColor } from '../../utils/helpers';

interface PumpListProps {
  pumps: Pump[];
  isLoading?: boolean;
  onPumpClick: (pump: Pump) => void;
  sortBy?: string;
  onSort?: (field: string) => void;
}

const statusColors = {
  active: 'bg-success-500',
  inactive: 'bg-gray-400',
  maintenance: 'bg-accent-500',
  faulty: 'bg-danger-500',
};

const PumpList: React.FC<PumpListProps> = ({ pumps, isLoading, onPumpClick, sortBy, onSort }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
              <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (pumps.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No pumps found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pumps.map((pump, index) => (
        <motion.div
          key={pump._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          onClick={() => onPumpClick(pump)}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{pump.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{pump.pumpId}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${(statusColors as any)[pump.status] || 'bg-gray-400'}`} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Running Hours</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {pump.runningHours.toFixed(1)}h
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Efficiency</p>
                <p className={`text-sm font-medium ${getHealthScoreColor(pump.efficiencyScore)}`}>
                  {pump.efficiencyScore}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Power</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {pump.powerConsumption} kW
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {pump.capacity} L/hr
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Health Score: <span className={getHealthScoreColor(pump.efficiencyScore)}>{pump.efficiencyScore}%</span>
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {pump.type}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PumpList;
