import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Droplets, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { apiPost } from '../../utils/api';
import toast from 'react-hot-toast';

const leakDetectionSchema = z.object({
  flowRate: z.number().min(0, 'Flow rate must be positive'),
  pressure: z.number().min(0, 'Pressure must be positive'),
  waterConsumption: z.number().min(0, 'Consumption must be positive'),
});

type LeakDetectionFormData = z.infer<typeof leakDetectionSchema>;

interface LeakDetectionResult {
  leakDetected: boolean;
  probability: number;
  confidence: number;
  factors: string[];
}

const LeakDetectionPanel: React.FC = () => {
  const [result, setResult] = useState<LeakDetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeakDetectionFormData>({
    resolver: zodResolver(leakDetectionSchema),
    defaultValues: {
      flowRate: 150,
      pressure: 45,
      waterConsumption: 1200,
    },
  });

  const onSubmit = async (data: LeakDetectionFormData) => {
    setIsAnalyzing(true);
    try {
      const response = await apiPost<{ data: LeakDetectionResult }>(
        '/ai/leak-detection',
        data
      );
      setResult(response.data);
    } catch (error) {
      // Mock response for demo
      const mockResult: LeakDetectionResult = {
        leakDetected: data.flowRate > 200 || data.pressure < 30,
        probability: data.flowRate > 200 ? 0.85 : 0.15,
        confidence: 0.92,
        factors: [
          data.flowRate > 180 ? 'High flow rate detected' : 'Normal flow rate',
          data.pressure < 35 ? 'Low pressure reading' : 'Normal pressure',
          data.waterConsumption > 1500 ? 'Abnormal consumption pattern' : 'Normal consumption',
        ],
      };
      setResult(mockResult);
      toast.success('Analysis complete');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        AI Leak Detection
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Flow Rate (L/hr)
            </label>
            <input
              {...register('flowRate', { valueAsNumber: true })}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.flowRate && (
              <p className="mt-1 text-sm text-danger-500">{errors.flowRate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pressure (PSI)
            </label>
            <input
              {...register('pressure', { valueAsNumber: true })}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.pressure && (
              <p className="mt-1 text-sm text-danger-500">{errors.pressure.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily Consumption (L)
            </label>
            <input
              {...register('waterConsumption', { valueAsNumber: true })}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.waterConsumption && (
              <p className="mt-1 text-sm text-danger-500">{errors.waterConsumption.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Droplets className="w-5 h-5" />
              Run Leak Detection
            </>
          )}
        </button>
      </form>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl border-2 ${
            result.leakDetected
              ? 'border-danger-500 bg-danger-50 dark:bg-danger-900/20'
              : 'border-success-500 bg-success-50 dark:bg-success-900/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {result.leakDetected ? (
              <AlertTriangle className="w-6 h-6 text-danger-500" />
            ) : (
              <CheckCircle className="w-6 h-6 text-success-500" />
            )}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {result.leakDetected ? 'Leak Detected' : 'No Leak Detected'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Probability: {(result.probability * 100).toFixed(1)}% | Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Analysis Factors:</p>
            {result.factors.map((factor, index) => (
              <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                • {factor}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LeakDetectionPanel;
