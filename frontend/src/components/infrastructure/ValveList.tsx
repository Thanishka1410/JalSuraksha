import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, AlertTriangle } from 'lucide-react';
import { Valve } from '../../types';
import ConfirmDialog from '../common/ConfirmDialog';
import StatusBadge from '../common/StatusBadge';
import toast from 'react-hot-toast';

interface ValveListProps {
  valves: Valve[];
  isLoading?: boolean;
  onValveToggle: (valve: Valve) => Promise<void>;
}

const ValveList: React.FC<ValveListProps> = ({ valves, isLoading, onValveToggle }) => {
  const [selectedValve, setSelectedValve] = useState<Valve | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (!selectedValve) return;
    setIsToggling(true);
    try {
      await onValveToggle(selectedValve);
      toast.success(`Valve ${selectedValve.status === 'open' ? 'closed' : 'opened'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle valve');
    } finally {
      setIsToggling(false);
      setSelectedValve(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (valves.length === 0) {
    return (
      <div className="text-center py-12">
        <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No valves found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Valve
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Diameter
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {valves.map((valve, index) => (
                <motion.tr
                  key={valve._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{valve.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{valve.valveId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {valve.type}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {valve.diameter} mm
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      status={valve.status === 'open' ? 'active' : valve.status === 'closed' ? 'inactive' : 'maintenance'}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedValve(valve)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        valve.status === 'open'
                          ? 'bg-danger-100 text-danger-600 hover:bg-danger-200 dark:bg-danger-900/30 dark:text-danger-400'
                          : 'bg-success-100 text-success-600 hover:bg-success-200 dark:bg-success-900/30 dark:text-success-400'
                      }`}
                    >
                      {valve.status === 'open' ? 'Close' : 'Open'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!selectedValve}
        onClose={() => setSelectedValve(null)}
        onConfirm={handleToggle}
        title={`${selectedValve?.status === 'open' ? 'Close' : 'Open'} Valve`}
        message={`Are you sure you want to ${selectedValve?.status === 'open' ? 'close' : 'open'} valve ${selectedValve?.name}?`}
        confirmLabel={selectedValve?.status === 'open' ? 'Close Valve' : 'Open Valve'}
        type={selectedValve?.status === 'open' ? 'danger' : 'info'}
        loading={isToggling}
      />
    </>
  );
};

export default ValveList;
