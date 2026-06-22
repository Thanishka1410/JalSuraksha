import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MapPin } from 'lucide-react';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { apiPost } from '../../utils/api';

const qualitySchema = z.object({
  pH: z.number().min(0).max(14),
  tds: z.number().min(0),
  turbidity: z.number().min(0),
  chlorine: z.number().min(0),
  fluoride: z.number().min(0),
  iron: z.number().min(0),
  nitrate: z.number().min(0),
  coliform: z.number().min(0),
  temperature: z.number(),
  notes: z.string().optional(),
});

type QualityFormData = z.infer<typeof qualitySchema>;

interface QualityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QualityFormData) => Promise<void>;
  loading?: boolean;
}

const QualityForm: React.FC<QualityFormProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<QualityFormData>({
    resolver: zodResolver(qualitySchema),
    defaultValues: {
      pH: 7.0,
      tds: 300,
      turbidity: 1.0,
      chlorine: 0.5,
      fluoride: 0.5,
      iron: 0.1,
      nitrate: 20,
      coliform: 0,
      temperature: 25,
    },
  });

  const watchAll = watch();

  const getStatus = () => {
    if (
      watchAll.pH < 6.5 ||
      watchAll.pH > 8.5 ||
      watchAll.tds > 500 ||
      watchAll.turbidity > 5 ||
      watchAll.coliform > 0
    ) {
      return 'unsafe';
    }
    if (
      watchAll.pH < 7 ||
      watchAll.pH > 8 ||
      watchAll.tds > 300 ||
      watchAll.turbidity > 1 ||
      watchAll.fluoride > 1
    ) {
      return 'caution';
    }
    return 'safe';
  };

  const status = getStatus();

  const captureLocation = () => {
    setIsCapturingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsCapturingLocation(false);
          toast.success('Location captured successfully');
        },
        (error) => {
          setIsCapturingLocation(false);
          toast.error('Failed to capture location');
        }
      );
    } else {
      setIsCapturingLocation(false);
      toast.error('Geolocation not supported');
    }
  };

  const handleFormSubmit = async (data: QualityFormData) => {
    await onSubmit({ ...data });
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Water Quality Reading" size="xl">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Status Indicator */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Status:
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === 'safe'
                ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400'
                : status === 'caution'
                ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400'
                : 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={captureLocation}
            disabled={isCapturingLocation}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            {location ? 'Location Captured' : 'Capture GPS Location'}
          </button>
          {location && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* pH */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              pH Level
            </label>
            <input
              {...register('pH', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Safe: 6.5-8.5</p>
          </div>

          {/* TDS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              TDS (mg/L)
            </label>
            <input
              {...register('tds', { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Safe: &lt;500</p>
          </div>

          {/* Turbidity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Turbidity (NTU)
            </label>
            <input
              {...register('turbidity', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Safe: &lt;1</p>
          </div>

          {/* Chlorine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chlorine (mg/L)
            </label>
            <input
              {...register('chlorine', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Fluoride */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fluoride (mg/L)
            </label>
            <input
              {...register('fluoride', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Safe: &lt;1</p>
          </div>

          {/* Iron */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Iron (mg/L)
            </label>
            <input
              {...register('iron', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Nitrate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nitrate (mg/L)
            </label>
            <input
              {...register('nitrate', { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Safe: &lt;45</p>
          </div>

          {/* Coliform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coliform (CFU/100ml)
            </label>
            <input
              {...register('coliform', { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Safe: 0</p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Temperature (°C)
            </label>
            <input
              {...register('temperature', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Any additional observations..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Reading'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QualityForm;
