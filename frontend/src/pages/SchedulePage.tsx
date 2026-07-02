import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Calendar, Droplets, Edit2, Trash2, CheckCircle, X } from 'lucide-react';
import { useFetch } from '../hooks/useApi';
import { apiPost, apiPut, apiDelete } from '../utils/api';
import { WaterSchedule, WaterScheduleSlot } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily'];

const DAY_COLORS: Record<string, string> = {
  Monday: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Tuesday: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  Wednesday: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Thursday: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Friday: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Saturday: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Sunday: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Daily: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

const ADMIN_ROLES = ['super_admin', 'gp_admin', 'vWSC_member'];

const emptySlot = (): WaterScheduleSlot => ({ zone: '', startTime: '06:00', endTime: '08:00' });

interface ScheduleFormProps {
  onClose: () => void;
  onSaved: () => void;
  initial?: WaterSchedule;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ onClose, onSaved, initial }) => {
  const [day, setDay] = useState(initial?.dayOfWeek || 'Monday');
  const [slots, setSlots] = useState<WaterScheduleSlot[]>(initial?.slots?.length ? initial.slots : [emptySlot()]);
  const [notes, setNotes] = useState(initial?.notes || '');
  const [saving, setSaving] = useState(false);

  const updateSlot = (i: number, field: keyof WaterScheduleSlot, value: string) => {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };
  const addSlot = () => setSlots(prev => [...prev, emptySlot()]);
  const removeSlot = (i: number) => setSlots(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (slots.some(s => !s.zone.trim())) {
      toast.error('Please fill in all zone names');
      return;
    }
    setSaving(true);
    try {
      const payload = { dayOfWeek: day, slots, notes };
      if (initial) {
        await apiPut(`/schedule/${initial._id}`, payload);
        toast.success('Schedule updated');
      } else {
        await apiPost('/schedule', payload);
        toast.success('Schedule created');
      }
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initial ? 'Edit Schedule' : 'New Supply Schedule'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Day selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Day of Week</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(d => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  day === d ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Slots */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Slots</label>
            <button onClick={addSlot} className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium">
              <Plus className="w-3 h-3" /> Add Slot
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <input
                  placeholder="Zone name"
                  value={slot.zone}
                  onChange={e => updateSlot(i, 'zone', e.target.value)}
                  className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={e => updateSlot(i, 'startTime', e.target.value)}
                  className="text-sm px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={e => updateSlot(i, 'endTime', e.target.value)}
                  className="text-sm px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {slots.length > 1 && (
                  <button onClick={() => removeSlot(i)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any special notes for this schedule..."
            className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving...' : initial ? 'Update' : 'Create'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role && ADMIN_ROLES.includes(user.role);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<WaterSchedule | null>(null);
  const [dayFilter, setDayFilter] = useState('All');

  const { data, loading, refetch } = useFetch<{ data: { schedules: WaterSchedule[] } }>('/schedule');
  const schedules = data?.data?.schedules || [];

  const filtered = dayFilter === 'All' ? schedules : schedules.filter(s => s.dayOfWeek === dayFilter);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await apiDelete(`/schedule/${id}`);
      toast.success('Schedule deleted');
      refetch();
    } catch {
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Water Supply Schedule</h1>
          <p className="text-gray-500 dark:text-gray-400">Daily water supply times by zone for each day of the week</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Schedule
          </button>
        )}
      </div>

      {/* Day filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...DAYS].map(d => (
          <button
            key={d}
            onClick={() => setDayFilter(d)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              dayFilter === d
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading schedules..." /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No schedules found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {isAdmin ? 'Click "Add Schedule" to create the first one.' : 'Schedules will appear here once added by your GP admin.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((schedule) => (
            <motion.div
              key={schedule._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${DAY_COLORS[schedule.dayOfWeek] || 'bg-gray-100 text-gray-700'}`}>
                    {schedule.dayOfWeek}
                  </div>
                  {schedule.isActive && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditItem(schedule); setShowForm(true); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Slots */}
              <div className="space-y-2">
                {schedule.slots.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{slot.zone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      <Clock className="w-3 h-3" />
                      <span>{slot.startTime} – {slot.endTime}</span>
                      {slot.durationMinutes && (
                        <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded-full font-medium">
                          {slot.durationMinutes}m
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {schedule.notes && (
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-700 pt-3">
                  📝 {schedule.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ScheduleForm
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={refetch}
          initial={editItem || undefined}
        />
      )}
    </div>
  );
};

export default SchedulePage;
