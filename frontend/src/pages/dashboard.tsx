import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { Workout } from '@/types';
import { format, parseISO } from 'date-fns';
import { FiActivity, FiClock, FiLayers, FiCalendar, FiTrendingUp, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/stats/weekly'),
      apiClient.get('/api/workouts'),
    ])
      .then(([statsRes, workoutsRes]) => {
        setStats(statsRes.data);
        setWorkouts(Array.isArray(workoutsRes.data) ? workoutsRes.data.slice(0, 5) : []);
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className={styles.spinner}
        />
        <p className={styles.loadingText}>Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  const totalWorkouts = stats?.total_workouts ?? 0;
  const totalSets = stats?.total_sets ?? 0;
  const totalDuration = stats?.total_duration_minutes ?? 0;
  const workoutsByDay = stats?.workouts_by_day ?? [];
  const maxCount = Math.max(...workoutsByDay.map((d) => d.count), 1);

  const goalWorkouts = 5;
  const goalDuration = 300;
  const goalSets = 50;
  const workoutPct = Math.min(100, Math.round((totalWorkouts / goalWorkouts) * 100));
  const durationPct = Math.min(100, Math.round((totalDuration / goalDuration) * 100));

  const kpis = [
    { label: 'Workouts', value: totalWorkouts, icon: <FiActivity />, color: '#84cc16' },
    { label: 'Total Sets', value: totalSets, icon: <FiLayers />, color: '#06b6d4' },
    { label: 'Duration', value: `${totalDuration} min`, icon: <FiClock />, color: '#f97316' },
    { label: 'Avg / Workout', value: totalWorkouts ? `${Math.round(totalDuration / totalWorkouts)} min` : '—', icon: <FiTrendingUp />, color: '#8b5cf6' },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.headerDate}>{format(new Date(), 'EEEE, MMMM d')}</p>
          <h1 className={styles.headerTitle}>Dashboard 👋</h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            className={styles.kpiCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={styles.kpiBody}>
              <div>
                <p className={styles.kpiLabel}>{k.label}</p>
                <p className={styles.kpiValue}>{k.value}</p>
              </div>
              <div className={styles.kpiIconWrap} style={{ backgroundColor: `${k.color}18` }}>
                <span style={{ color: k.color, fontSize: 20 }}>{k.icon}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom row */}
      <div className={styles.bottomGrid}>
        {/* Activity chart */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={styles.sectionTitle}>This Week</h2>
          <div className={styles.barChart}>
            {workoutsByDay.length === 0 && <p className={styles.emptyText}>No activity this week</p>}
            {workoutsByDay.map((d) => {
              const pct = Math.max(8, (d.count / maxCount) * 100);
              const dayLabel = (() => { try { return format(parseISO(d.date), 'EEE'); } catch { return d.date; } })();
              return (
                <div key={d.date} className={styles.barCol}>
                  <div className={styles.barTrack}>
                    <motion.div
                      className={styles.bar}
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    />
                  </div>
                  <span className={styles.barLabel}>{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Goals */}
        <motion.div
          className={styles.goalsCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className={styles.sectionTitle}>Weekly Goals</h2>
          <div className={styles.goalRow}>
            <div className={styles.goalHeader}><span className={styles.goalLabel}>Workouts</span><span className={styles.goalFraction}>{totalWorkouts} / {goalWorkouts}</span></div>
            <div className={styles.progressTrack}><div className={styles.progressFillLime} style={{ width: `${workoutPct}%` }} /></div>
          </div>
          <div className={styles.goalRow}>
            <div className={styles.goalHeader}><span className={styles.goalLabel}>Active minutes</span><span className={styles.goalFraction}>{totalDuration} / {goalDuration}</span></div>
            <div className={styles.progressTrack}><div className={styles.progressFillCyan} style={{ width: `${durationPct}%` }} /></div>
          </div>
          <div className={styles.goalRow}>
            <div className={styles.goalHeader}><span className={styles.goalLabel}>Total sets</span><span className={styles.goalFraction}>{totalSets} / {goalSets}</span></div>
            <div className={styles.progressTrack}><div className={styles.progressFillViolet} style={{ width: `${Math.min(100, Math.round((totalSets / goalSets) * 100))}%` }} /></div>
          </div>
          {totalWorkouts >= goalWorkouts - 1 && totalWorkouts < goalWorkouts && (
            <div className={styles.streakBanner}>
              <FiZap className={styles.streakIcon} />
              <p>One more workout to hit your weekly goal!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent workouts */}
      <motion.div
        className={styles.recentCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className={styles.sectionTitle}>Recent Workouts</h2>
        {workouts.length === 0 ? (
          <p className={styles.emptyText}>No workouts yet. Go log one!</p>
        ) : (
          <div className={styles.workoutList}>
            {workouts.map((w) => (
              <div key={w.id} className={styles.workoutRow}>
                <div className={styles.workoutIconWrap}>
                  <FiActivity className={styles.workoutIcon} />
                </div>
                <div className={styles.workoutInfo}>
                  <p className={styles.workoutTitle}>{w.title}</p>
                  <p className={styles.workoutDate}>
                    {(() => { try { return format(parseISO(w.date as string), 'MMM d · h:mm a'); } catch { return String(w.date); } })()}
                  </p>
                </div>
                <div className={styles.workoutMeta}>
                  <p className={styles.workoutDuration}>{w.duration_minutes ?? '—'} min</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}