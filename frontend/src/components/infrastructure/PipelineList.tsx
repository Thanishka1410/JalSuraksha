import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, AlertTriangle } from 'lucide-react';
import { Pipeline } from '../../types';
import StatusBadge from '../common/StatusBadge';

interface PipelineListProps {
  pipelines: Pipeline[];
  isLoading?: boolean;
  onPipelineClick: (pipeline: Pipeline) => void;
}

const PipelineList: React.FC<PipelineListProps> = ({ pipelines, isLoading, onPipelineClick }) => {
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

  if (pipelines.length === 0) {
    return (
      <div className="text-center py-12">
        <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No pipelines found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Pipeline
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Material
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Length
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Diameter
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Leaks
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pipelines.map((pipeline, index) => (
              <motion.tr
                key={pipeline._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onPipelineClick(pipeline)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{pipeline.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pipeline.pipelineId}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 uppercase">
                  {pipeline.material}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {pipeline.length} m
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {pipeline.diameter} mm
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {(pipeline.leakCount || 0) > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-danger-500" />
                        <span className="text-sm font-medium text-danger-600 dark:text-danger-400">
                          {pipeline.leakCount}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">0</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={pipeline.status} size="sm" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PipelineList;
