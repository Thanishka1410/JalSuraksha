import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ClipboardList } from 'lucide-react';
import { Complaint } from '../../types';
import { timeAgo } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';
import { useI18n } from '../../contexts/I18nContext';

interface RecentComplaintsProps {
  complaints: Complaint[];
  isLoading?: boolean;
}

const RecentComplaints: React.FC<RecentComplaintsProps> = ({ complaints, isLoading }) => {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.recentComplaints}</h3>
        <button className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
          {t.common.view} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.common.noData}</p>
        ) : (
          complaints.slice(0, 5).map((complaint, index) => (
            <motion.div
              key={complaint._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <ClipboardList className="w-5 h-5 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {complaint.description?.substring(0, 50) || 'Complaint'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {complaint.category} • {timeAgo(complaint.createdAt)}
                </p>
              </div>
              <StatusBadge status={complaint.status} size="sm" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentComplaints;
