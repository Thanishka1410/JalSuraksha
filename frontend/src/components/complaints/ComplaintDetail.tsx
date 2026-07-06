import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, User, MapPin } from 'lucide-react';
import { Complaint } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { getPriorityColor, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { apiPut } from '../../utils/api';

interface ComplaintDetailProps {
  complaint: Complaint;
  onClose: () => void;
  onUpdate: () => void;
}

const statusWorkflow = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];

const ComplaintDetail: React.FC<ComplaintDetailProps> = ({ complaint, onClose, onUpdate }) => {
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      await apiPut(`/complaints/${complaint._id}/status`, {
        status: newStatus,
        notes: resolutionNotes,
      });
      toast.success('Status updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Complaint #{complaint._id?.substring(0, 8)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{complaint.description?.substring(0, 60)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Priority */}
          <div className="flex items-center gap-4">
            <StatusBadge status={complaint.status} size="md" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority}
            </span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <User className="w-4 h-4" />
              <span className="text-sm">{(complaint.complainant as any)?.name || (complaint.user as any)?.name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{(complaint.village as any)?.name || complaint.village || 'N/A'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
            <p className="text-gray-600 dark:text-gray-400">{complaint.description}</p>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Timeline</h4>
            <div className="space-y-3">
              {complaint.timeline?.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{event.notes}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {event.updatedBy?.name} • {timeAgo(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {(!complaint.timeline || complaint.timeline.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No timeline events yet</p>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Update Status
            </h4>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            >
              {statusWorkflow.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add notes (optional)..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === complaint.status}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ComplaintDetail;
