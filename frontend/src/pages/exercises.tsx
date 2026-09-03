import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { Exercise } from '@/types';
import { FiSearch, FiPlus, FiX, FiTarget } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', muscle_group: 'Chest', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/exercises');
      setExercises(data);
      setError('');
    } catch {
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || e.muscle_group === filter;
    return matchSearch && matchFilter;
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      await apiClient.post('/api/exercises', formData);
      setShowModal(false);
      setFormData({ name: '', muscle_group: 'Chest', description: '' });
      fetchExercises();
    } catch {
      setError('Failed to create exercise');
    } finally {
      setSaving(false);
    }
  };

  const groupColor: Record<string, string> = {
    Chest: 'bg-orange-50 text-orange-600',
    Back: 'bg-cyan-50 text-cyan-600',
    Shoulders: 'bg-violet-50 text-violet-600',
    Arms: 'bg-lime-50 text-lime-600',
    Legs: 'bg-rose-50 text-rose-600',
    Core: 'bg-amber-50 text-amber-600',
    Cardio: 'bg-sky-50 text-sky-600',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Exercise Library</h1>
          <p className="text-sm text-slate-400 mt-1">{exercises.length} exercises available</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          <FiPlus className="w-4 h-4" /> Add Exercise
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              placeholder="Search exercises…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white w-full focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {MUSCLE_GROUPS.map(g => (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === g ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FiTarget className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No exercises found</p>
          <p className="text-sm mt-1">Try a different filter or add a new exercise</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(ex => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${groupColor[ex.muscle_group] || 'bg-slate-50 text-slate-500'}`}>
                    <FiTarget className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{ex.name}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
                      {ex.muscle_group}
                    </span>
                    {ex.description && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{ex.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Add Exercise</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Name</label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="e.g. Bench Press"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Muscle Group</label>
                  <select
                    value={formData.muscle_group}
                    onChange={e => setFormData(f => ({ ...f, muscle_group: e.target.value }))}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    {MUSCLE_GROUPS.filter(g => g !== 'All').map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={saving || !formData.name.trim()}
                className="mt-6 w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg"
              >
                {saving ? 'Saving…' : 'Save Exercise'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}