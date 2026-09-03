import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Workout } from '@/types';
import { format, parseISO } from 'date-fns';
import { FiPlus, FiX, FiActivity, FiTrendingUp, FiClock, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/components/dashboard/Dashboard.module.css';

interface WeeklyStats {
  total_workouts: number;
  total_sets: number;
  total_duration_minutes: number;
  workouts_by_day: { date: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', duration_minutes: 30, notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, workoutsRes] = await Promise.all([
        apiClient.get('/api/stats/weekly'),
        apiClient.get('/api/workouts'),
      ]);
      setStats(statsRes.data);
      setWorkouts(workoutsRes.data);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setSaving(true);
    try {
      await apiClient.post('/api/workouts', {
        title: formData.title,
        date: new Date().toISOString(),
        duration_minutes: formData.duration_minutes,
        notes: formData.notes,
        sets: [],
      });
      setModalOpen(false);
      setFormData({ title: '', duration_minutes: 30, notes: '' });
      fetchData();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <FiActivity size={32} className={styles.spinner} />
        </motion.div>
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorWrap}><p>{error}</p><button onClick={fetchData} className={styles.retryBtn}>Retry</button></div>;
  }

  const goalWorkouts = 5;
  const goalDuration = 300;
  const goalSets = 50;
  const pctWorkouts = stats ? Math.min(100, Math.round((stats.total_workouts / goalWorkouts) * 100)) : 0;
  const pctDuration = stats ? Math.min(100, Math.round((stats.total_duration_minutes / goalDuration) * 100)) : 0;
  const pctSets = stats ? Math.min(100, Math.round((stats.total_sets / goalSets) * 100)) : 0;
  const overallPct = Math.round((pctWorkouts + pctDuration) / 2);

  const recentWorkouts = workouts.slice(0, 4);
  const maxDayCount = stats ? Math.max(...stats.workouts_by_day.map(d => d.count), 1) : 1;

  return (
    <>
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <p className={styles.dateLabel}>{format(new Date(), 'EEEE, MMMM d')}</p>
            <h1 className={styles.greeting}>Dashboard 👋</h1>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={styles.logBtn} onClick={() => setModalOpen(true)}>
            <FiPlus size={16} /> Log workout
          </motion.button>
        </header>

        {/* KPI Row */}
        <div className={styles.kpiGrid}>
          {/* Ring card */}
          <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className={styles.ringWrap}>
              <div className={styles.ringContainer}>
                <svg viewBox="0 0 120 120" className={styles.ringSvg}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#fee2e2" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#dc2626" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray="326" strokeDashoffset={326 - (326 * pctWorkouts) / 100} />
                  <circle cx="60" cy="60" r="38" fill="none" stroke="#fecaca" strokeWidth="10" />
                  <circle cx="60" cy="60" r="38" fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray="239" strokeDashoffset={239 - (239 * pctDuration) / 100} />
                </svg>
                <div className={styles.ringCenter}>
                  <span className={styles.ringPct}>{overallPct}%</span>
                  <span className={styles.ringLabel}>of goal</span>
                </div>
              </div>
              <div className={styles.ringStats}>
                <div><p className={styles.statLabel}>Workouts</p><p className={styles.statValueRed}>{stats?.total_workouts ?? 0} <span className={styles.statGoal}>/ {goalWorkouts}</span></p></div>
                <div><p className={styles.statLabel}>Duration</p><p className={styles.statValueOrange}>{stats?.total_duration_minutes ?? 0} <span className={styles.statGoal}>/ {goalDuration} min</span></p></div>
              </div>
            </div>
          </motion.div>

          {/* Sets card */}
          <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className={styles.cardIcon}><FiZap size={16} /></div>
            <p className={styles.cardSmLabel}>Total Sets</p>
            <p className={styles.cardBigNum}>{stats?.total_sets ?? 0}</p>
            <p className={styles.cardSubtext}>this week</p>
            {stats && stats.workouts_by_day.length > 0 && (
              <div className={styles.miniChart}>
                {stats.workouts_by_day.map((d, i) => (
                  <div key={i} className={styles.miniBar} style={{ height: `${Math.max(15, (d.count / maxDayCount) * 100)}%` }} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Duration card */}
          <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className={styles.cardIconOrange}><FiClock size={16} /></div>
            <p className={styles.cardSmLabel}>Active Minutes</p>
            <p className={styles.cardBigNum}>{stats?.total_duration_minutes ?? 0}</p>
            <p className={styles.cardSubtext}>this week</p>
            <div className={styles.miniStats}>
              <div className={styles.miniStatBox}><p className={styles.miniStatVal}>{stats?.total_workouts ?? 0}</p><p className={styles.miniStatLbl}>Sessions</p></div>
              <div className={styles.miniStatBox}><p className={styles.miniStatVal}>{stats ? Math.round(stats.total_duration_minutes / Math.max(stats.total_workouts, 1)) : 0}</p><p className={styles.miniStatLbl}>Avg min</p></div>
            </div>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className={styles.bottomGrid}>
          {/* Recent workouts */}
          <motion.div className={`${styles.card} ${styles.recentCard}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent workouts</h2>
              <Link href="/workouts" className={styles.viewAll}>View all</Link>
            </div>
            {recentWorkouts.length === 0 ? (
              <p className={styles.emptyText}>No workouts yet. Log your first one!</p>
            ) : (
              <div className={styles.workoutList}>
                {recentWorkouts.map((w, i) => (
                  <motion.div key={w.id} className={styles.workoutRow} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
                    <div className={styles.workoutIcon}><FiActivity size={18} /></div>
                    <div className={styles.workoutInfo}>
                      <p className={styles.workoutTitle}>{w.title}</p>
                      <p className={styles.workoutDate}>{format(parseISO(w.date), 'MMM d · h:mm a')}</p>
                    </div>
                    <div className={styles.workoutMeta}>
                      <p className={styles.workoutDur}>{w.duration_minutes ?? '—'} min</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Goals */}
          <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className={styles.sectionTitle}>This week&apos;s goal</h2>
            <div className={styles.goalItem}>
              <div className={styles.goalRow}><span className={styles.goalLabel}>Workouts</span><span className={styles.goalVal}>{stats?.total_workouts ?? 0} / {goalWorkouts}</span></div>
              <div className={styles.progressBar}><div className={styles.progressFillRed} style={{ width: `${pctWorkouts}%` }} /></div>
            </div>
            <div className={styles.goalItem}>
              <div className={styles.goalRow}><span className={styles.goalLabel}>Active minutes</span><span className={styles.goalVal}>{stats?.total_duration_minutes ?? 0} / {goalDuration}</span></div>
              <div className={styles.progressBar}><div className={styles.progressFillOrange} style={{ width: `${pctDuration}%` }} /></div>
            </div>
            <div className={styles.goalItem}>
              <div className={styles.goalRow}><span className={styles.goalLabel}>Total sets</span><span className={styles.goalVal}>{stats?.total_sets ?? 0} / {goalSets}</span></div>
              <div className={styles.progressBar}><div className={styles.progressFillPurple} style={{ width: `${pctSets}%` }} /></div>
            </div>
            <div className={styles.tipBox}>
              <FiTrendingUp size={16} className={styles.tipIcon} />
              <p className={styles.tipText}>Keep going! Consistency is the key to progress.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)}>
            <motion.div className={styles.modal} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Log a workout</h3>
                <button onClick={() => setModalOpen(false)} className={styles.closeBtn}><FiX size={20} /></button>
              </div>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Upper Body Strength" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Duration (min)</label>
                  <input type="number" value={formData.duration_minutes} onChange={e => setFormData(p => ({ ...p, duration_minutes: Number(e.target.value) }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Notes</label>
                  <input value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save workout'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}