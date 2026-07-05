import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, LayoutGrid, List } from 'lucide-react';
import ComplaintList from '../components/complaints/ComplaintList';
import ComplaintForm from '../components/complaints/ComplaintForm';
import ComplaintDetail from '../components/complaints/ComplaintDetail';
import KPICard from '../components/common/KPICard';
import { useFetch } from '../hooks/useApi';
import { apiPost, uploadImages } from '../utils/api';
import { Complaint } from '../types';
import { useI18n } from '../contexts/I18nContext';
import toast from 'react-hot-toast';

const ComplaintsPage: React.FC = () => {
  const { t } = useI18n();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { data, loading, refetch } = useFetch<{ data: { complaints: Complaint[] } }>('/complaints');
  const [submitLoading, setSubmitLoading] = useState(false);

  const complaints = data?.data?.complaints || [];

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    return true;
  });

  const pendingCount = complaints.filter((c) => c.status === 'pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  const handleSubmit = async (formData: any) => {
    setSubmitLoading(true);
    try {
      // Step 1: Upload images if any
      let imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        toast.loading(t.complaints.uploadingImages, { id: 'upload-toast' });
        imageUrls = await uploadImages(formData.images);
        toast.dismiss('upload-toast');
      }

      // Step 2: Submit complaint with image URLs
      const { images, location, ...rest } = formData;
      const payload: any = { ...rest, images: imageUrls };
      if (location) {
        payload.location = { type: 'Point', coordinates: [location.lng, location.lat] };
      }
      await apiPost('/complaints', payload);
      toast.success(t.complaints.complaintSubmitted);
      refetch();
    } catch (error) {
      toast.dismiss('upload-toast');
      toast.error(t.complaints.complaintFailed);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.complaints.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t.complaints.subtitle}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t.complaints.newComplaint}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t.complaints.total} value={complaints.length} icon={Filter} color="primary" />
        <KPICard title={t.complaints.pending} value={pendingCount} icon={Filter} color="accent" />
        <KPICard title={t.complaints.inProgress} value={inProgressCount} icon={Filter} color="secondary" />
        <KPICard title={t.complaints.resolved} value={resolvedCount} icon={Filter} color="success" />
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">{t.complaints.allStatus}</option>
            <option value="pending">{t.complaints.pending}</option>
            <option value="assigned">{t.complaints.assigned}</option>
            <option value="in_progress">{t.complaints.inProgress}</option>
            <option value="resolved">{t.complaints.resolved}</option>
            <option value="closed">{t.complaints.closed}</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">{t.complaints.allCategories}</option>
            <option value="water_quality">{t.quality.title}</option>
            <option value="supply">{t.complaints.noWater}</option>
            <option value="infrastructure">{t.infrastructure.title}</option>
            <option value="billing">Billing</option>
            <option value="other">{t.complaints.other}</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">{t.complaints.allPriorities}</option>
            <option value="low">{t.complaints.low}</option>
            <option value="medium">{t.complaints.medium}</option>
            <option value="high">{t.complaints.high}</option>
            <option value="critical">{t.complaints.critical}</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'card'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Complaint List */}
      <ComplaintList
        complaints={filteredComplaints}
        isLoading={loading}
        onComplaintClick={setSelectedComplaint}
        viewMode={viewMode}
      />

      {/* Form Modal */}
      <ComplaintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />

      {/* Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetail
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
};

export default ComplaintsPage;
