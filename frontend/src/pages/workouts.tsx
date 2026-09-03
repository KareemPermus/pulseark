import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { Workout } from '@/types';
import { format } from 'date-fns';
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiChevronRight, FiSearch, FiX, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/components/workouts/Workouts.module.css';

interface WorkoutWithSets extends Workout {
  sets?: { id: number; exercise_id: number; exercise_name?: string; reps: number; set_number: number; weight?: number }[];
}

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithSets | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formDuration, setFormDuration] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/workouts');
      setWorkouts(res.data);
    } catch {
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkouts(); }, [fetchWorkouts]);

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      await apiClient.post('/api/workouts', {
        title: formTitle,
        date: formDate,
        duration_minutes: formDuration ? parseInt(formDuration) : null,
        notes: formNotes || null,
        sets: [],
      });
      setShowModal(false);
      setFormTitle(''); setFormDuration(''); setFormNotes('');
      fetchWorkouts();
    } catch { setError('Failed to create workout'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await apiClient.delete(`/api/workouts/${id}`);
      setWorkouts(w => w.filter(x => x.id !== id));
      if (selectedWorkout?.id === id) setSelectedWorkout(null);
    } catch { setError('Failed to delete workout'); }
    finally { setDeleting(null); }
  };

  const handleSelect = async (w: Workout) => {
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/api/workouts/${w.id}`);
      setSelectedWorkout(res.data);
    } catch { setError('Failed to load workout details'); }
    finally { setDetailLoading(false); }
  };

  const filtered = workouts.filter(w =>
    w.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Workouts</h1>
          <p className={styles.subtitle}>{workouts.length} total workouts logged</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={styles.addBtn}
          onClick={() => setShowModal(true)}
        >
          <FiPlus size={16} /> Log Workout
        </motion.button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          {error}
          <button onClick={() => setError('')} className={styles.errorClose}><FiX size={14} /></button>
        </div>
      )}

      <div className={styles.content}>
        {/* List */}
        <div className={styles.listPanel}>
          <div className={styles.searchBar}>
            <FiSearch size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search workouts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <FiActivity size={40} className={styles.emptyIcon} />
              <p className={styles.emptyText}>No workouts found</p>
              <p className={styles.emptySubtext}>Log your first workout to get started</p>
            </div>
          ) : (
            <div className={styles.workoutList}>
              <AnimatePresence>
                {filtered.map(w => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`${styles.workoutCard} ${selectedWorkout?.id === w.id ? styles.workoutCardActive : ''}`}
                    onClick={() => handleSelect(w)}
                  >
                    <div className={styles.workoutCardLeft}>
                      <div className={styles.workoutIcon}>
                        <FiActivity size={18} />
                      </div>
                      <div>
                        <p className={styles.workoutTitle}>{w.title}</p>
                        <div className={styles.workoutMeta}>
                          <span><FiCalendar size={12} /> {format(new Date(w.date), 'MMM d, yyyy')}</span>
                          {w.duration_minutes && <span><FiClock size={12} /> {w.duration_minutes} min</span>}
                        </div>
                      </div>
                    </div>
                    <div className={styles.workoutCardRight}>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className={styles.deleteBtn}
                        onClick={e => { e.stopPropagation(); handleDelete(w.id); }}
                        disabled={deleting === w.id}
                      >
                        <FiTrash2 size={14} />
                      </motion.button>
                      <FiChevronRight size={16} className={styles.chevron} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className={styles.detailPanel}>
          {detailLoading ? (
            <div className={styles.detailLoading}><div className={styles.skeleton} style={{ height: 200 }} /></div>
          ) : selectedWorkout ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailTitle}>{selectedWorkout.title}</h2>
                <div className={styles.detailMeta}>
                  <span><FiCalendar size={14} /> {format(new Date(selectedWorkout.date), 'EEEE, MMMM d, yyyy')}</span>
                  {selectedWorkout.duration_minutes && <span><FiClock size={14} /> {selectedWorkout.duration_minutes} min</span>}
                </div>
              </div>
              {selectedWorkout.notes && (
                <div className={styles.notesCard}>
                  <p className={styles.notesLabel}>Notes</p>
                  <p className={styles.notesText}>{selectedWorkout.notes}</p>
                </div>
              )}
              {selectedWorkout.sets && selectedWorkout.sets.length > 0 && (
                <div className={styles.setsSection}>
                  <h3 className={styles.setsTitle}>Sets</h3>
                  <div className={styles.setsTable}>
                    <div className={styles.setsHeader}>
                      <span>#</span><span>Exercise</span><span>Reps</span><span>Weight</span>
                    </div>
                    {selectedWorkout.sets.map(s => (
                      <div key={s.id} className={styles.setRow}>
                        <span>{s.set_number}</span>
                        <span>{s.exercise_name || `Exercise #${s.exercise_id}`}</span>
                        <span>{s.reps}</span>
                        <span>{s.weight ? `${s.weight} lbs` : '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!selectedWorkout.sets || selectedWorkout.sets.length === 0) && (
                <div className={styles.noSets}>No sets recorded for this workout</div>
              )}
            </motion.div>
          ) : (
            <div className={styles.detailEmpty}>
              <FiActivity size={48} className={styles.emptyIcon} />
              <p>Select a workout to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Log a Workout</h3>
                <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
              </div>
              <div className={styles.modalBody}>
                <label className={styles.fieldLabel}>Title *
                  <input className={styles.fieldInput} value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Upper Body Strength" />
                </label>
                <label className={styles.fieldLabel}>Date
                  <input className={styles.fieldInput} type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                </label>
                <label className={styles.fieldLabel}>Duration (min)
                  <input className={styles.fieldInput} type="number" value={formDuration} onChange={e => setFormDuration(e.target.value)} placeholder="45" />
                </label>
                <label className={styles.fieldLabel}>Notes
                  <textarea className={styles.fieldTextarea} value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} placeholder="How did it go?" />
                </label>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={styles.saveBtn}
                onClick={handleCreate}
                disabled={saving || !formTitle.trim()}
              >
                {saving ? 'Saving…' : 'Save Workout'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}