import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MapPin, Upload, X } from 'lucide-react';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { useI18n } from '../../contexts/I18nContext';

const complaintSchema = z.object({
  category: z.enum(['leakage', 'no_water', 'dirty_water', 'low_pressure', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  village: z.string().min(1, 'Village is required'),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ComplaintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ComplaintFormData & { images?: File[]; location?: any }) => Promise<void>;
  loading?: boolean;
}

const prioritySuggestions: Record<string, string> = {
  leakage: 'high',
  no_water: 'high',
  dirty_water: 'high',
  low_pressure: 'medium',
  other: 'low',
};

const categoryLabels: Record<string, string> = {
  leakage: 'Pipe Leakage',
  no_water: 'No Water Supply',
  dirty_water: 'Dirty / Contaminated Water',
  low_pressure: 'Low Water Pressure',
  other: 'Other',
};

const ComplaintForm: React.FC<ComplaintFormProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const { t } = useI18n();
  const [images, setImages] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      category: 'leakage',
      priority: 'medium',
      village: '',
    },
  });

  const watchCategory = watch('category');

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
          toast.success('Location captured');
        },
        () => {
          setIsCapturingLocation(false);
          toast.error('Failed to capture location');
        }
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: ComplaintFormData) => {
    await onSubmit({ ...data, images, location });
    reset();
    setImages([]);
    setLocation(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.complaints.submitComplaint} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.complaints.category}
          </label>
          <select
            {...register('category')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.entries(categoryLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.complaints.description}
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Please describe the issue in detail..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-danger-500">{errors.description.message}</p>
          )}
        </div>

        {/* Priority & Village */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.complaints.priority}
            </label>
            <select
              {...register('priority')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Suggested: {prioritySuggestions[watchCategory]}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.complaints.village}
            </label>
            <input
              {...register('village')}
              type="text"
              placeholder={t.complaints.villagePlaceholder}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.village && (
              <p className="mt-1 text-sm text-danger-500">{errors.village.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <button
            type="button"
            onClick={captureLocation}
            disabled={isCapturingLocation}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            {isCapturingLocation ? 'Capturing...' : location ? t.complaints.locationCaptured : t.complaints.captureLocation}
          </button>
          {location && (
            <p className="text-sm text-gray-500 mt-2">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.complaints.uploadPhotos}
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            {t.complaints.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.complaints.submitting}
              </>
            ) : (
              t.complaints.submitComplaint
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ComplaintForm;
