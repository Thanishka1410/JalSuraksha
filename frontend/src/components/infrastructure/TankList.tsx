import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, AlertTriangle } from 'lucide-react';
import { WaterTank } from '../../types';
import { getWaterLevelColor, getWaterLevelBg } from '../../utils/helpers';

interface TankListProps {
  tanks: WaterTank[];
  isLoading?: boolean;
  onTankClick: (tank: WaterTank) => void;
}

const TankList: React.FC<TankListProps> = ({ tanks, isLoading, onTankClick }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tanks.length === 0) {
    return (
      <div className="text-center py-12">
        <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No tanks found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tanks.map((tank, index) => {
        const level = Math.round((tank.currentLevel / tank.capacity) * 100);
        const levelColor = getWaterLevelColor(level);
        const levelBg = getWaterLevelBg(level);

        return (
          <motion.div
            key={tank._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => onTankClick(tank)}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{tank.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Capacity: {(tank.capacity / 1000).toFixed(0)} KL
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  tank.status === 'active'
                    ? 'bg-success-500'
                    : tank.status === 'maintenance'
                    ? 'bg-accent-500'
                    : 'bg-gray-400'
                }`}
              />
            </div>

            {/* Water Level Visualization */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Water Level</span>
                <span className={`text-sm font-semibold ${levelColor}`}>{level}%</span>
              </div>
              <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${level}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`absolute bottom-0 left-0 right-0 ${levelBg} opacity-80`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(tank.currentLevel / 1000).toFixed(1)} KL
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Inflow</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {tank.inflowRate} L/hr
                </p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Outflow</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {tank.outflowRate} L/hr
                </p>
              </div>
            </div>

            {level < 25 && (
              <div className="mt-4 flex items-center gap-2 text-accent-600 dark:text-accent-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">Low water level warning</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default TankList;
