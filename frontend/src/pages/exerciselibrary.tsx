import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/api/client';
import { Exercise } from '@/types';
import { FiSearch, FiPlus, FiX, FiTarget } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formGroup, setFormGroup] = useState('Chest');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/exercises');
      setExercises(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExercises(); }, []);

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const matchGroup = filter === 'All' || e.muscle_group?.toLowerCase() === filter.toLowerCase();
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [exercises, filter, search]);

  const handleAdd = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const { data } = await apiClient.post('/api/exercises', {
        name: formName, muscle_group: formGroup, description: formDesc || undefined,
      });
      setExercises(prev => [...prev, data]);
      setShowModal(false);
      setFormName(''); setFormDesc('');
    } catch { setError('Failed to add exercise'); }
    finally { setSaving(false); }
  };

  const groupColor = (g: string) => {
    const m: Record<string, string> = {
      chest: 'bg-red-500/20 text-red-400', back: 'bg-blue-500/20 text-blue-400',
      shoulders: 'bg-amber-500/20 text-amber-400', arms: 'bg-purple-500/20 text-purple-400',
      legs: 'bg-lime-500/20 text-lime-400', core: 'bg-cyan-500/20 text-cyan-400',
      cardio: 'bg-orange-500/20 text-orange-400',
    };
    return m[g?.toLowerCase()] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Exercise Library</h1>
          <p className="text-sm text-slate-400 mt-1">{exercises.length} exercises available</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
          <FiPlus className="w-4 h-4" /> Add Exercise
        </motion.button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white w-full focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {MUSCLE_GROUPS.map(g => (
            <button key={g} onClick={() => setFilter(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === g ? 'bg-red-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-medium">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No exercises found. Try a different filter or add one!</div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(ex => (
              <motion.div key={ex.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <FiTarget className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-slate-900 truncate">{ex.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${groupColor(ex.muscle_group)}`}>
                      {ex.muscle_group}
                    </span>
                  </div>
                </div>
                {ex.description && <p className="text-xs text-slate-400 mt-3 line-clamp-2">{ex.description}</p>}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Add Exercise</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Name</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Muscle Group</label>
                  <select value={formGroup} onChange={e => setFormGroup(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                    {MUSCLE_GROUPS.filter(g => g !== 'All').map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Description (optional)</label>
                  <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleAdd} disabled={saving || !formName.trim()}
                className="mt-6 w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg">
                {saving ? 'Saving…' : 'Save Exercise'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}