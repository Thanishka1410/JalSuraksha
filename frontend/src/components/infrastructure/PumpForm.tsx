import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { Pump } from '../../types';

const pumpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  pumpId: z.string().min(1, 'Pump ID is required'),
  type: z.enum(['submersible', 'centrifugal', 'reciprocating', 'rotary']),
  capacity: z.number().min(1, 'Capacity must be greater than 0'),
  village: z.string().min(1, 'Village is required'),
});

type PumpFormData = z.infer<typeof pumpSchema>;

interface PumpFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PumpFormData) => Promise<void>;
  pump?: Pump | null;
  loading?: boolean;
}

const PumpForm: React.FC<PumpFormProps> = ({ isOpen, onClose, onSubmit, pump, loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PumpFormData>({
    resolver: zodResolver(pumpSchema),
    defaultValues: { type: 'submersible' },
  });

  useEffect(() => {
    if (pump) {
      const vil = pump.village as any;
      reset({
        name: pump.name,
        pumpId: pump.pumpId,
        type: pump.type as any,
        capacity: pump.capacity,
        village: vil?.name || vil || '',
      });
    } else {
      reset({ name: '', pumpId: '', type: 'submersible', capacity: 0, village: '' });
    }
  }, [pump, reset]);

  const handleFormSubmit = async (data: PumpFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={pump ? 'Edit Pump' : 'Add New Pump'} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pump Name</label>
            <input {...register('name')} type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Main Pump House" />
            {errors.name && <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pump ID</label>
            <input {...register('pumpId')} type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="P-001" />
            {errors.pumpId && <p className="mt-1 text-sm text-danger-500">{errors.pumpId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pump Type</label>
            <select {...register('type')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="submersible">Submersible</option>
              <option value="centrifugal">Centrifugal</option>
              <option value="reciprocating">Reciprocating</option>
              <option value="rotary">Rotary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity (L/hr)</label>
            <input {...register('capacity', { valueAsNumber: true })} type="number" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="1000" />
            {errors.capacity && <p className="mt-1 text-sm text-danger-500">{errors.capacity.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village</label>
            <input {...register('village')} type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Enter village name" />
            {errors.village && <p className="mt-1 text-sm text-danger-500">{errors.village.message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving...</>) : pump ? 'Update Pump' : 'Add Pump'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PumpForm;