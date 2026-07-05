import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, User, Clock } from 'lucide-react';
import { Complaint } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { timeAgo, getPriorityColor } from '../../utils/helpers';

interface ComplaintListProps {
  complaints: Complaint[];
  isLoading?: boolean;
  onComplaintClick: (complaint: Complaint) => void;
  viewMode?: 'table' | 'card';
}

const ComplaintList: React.FC<ComplaintListProps> = ({
  complaints,
  isLoading,
  onComplaintClick,
  viewMode = 'card',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No complaints found</p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {complaints.map((complaint, index) => (
                <motion.tr
                  key={complaint._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onComplaintClick(complaint)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-4 text-sm font-medium text-primary-600">
                    {complaint._id?.substring(0, 8)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{complaint.description?.substring(0, 50) || 'Complaint'}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {complaint.category.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={complaint.status} size="sm" />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {timeAgo(complaint.createdAt)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {complaints.map((complaint, index) => (
        <motion.div
          key={complaint._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          onClick={() => onComplaintClick(complaint)}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm font-medium text-primary-600">#{complaint._id?.substring(0, 8)}</span>
            <StatusBadge status={complaint.status} size="sm" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{complaint.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
            {complaint.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {complaint.user?.name || 'Anonymous'}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(complaint.createdAt)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ComplaintList;
