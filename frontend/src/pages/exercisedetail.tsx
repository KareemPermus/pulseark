import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { Exercise } from '@/types';
import styles from '@/styles/exercisedetail.module.css';

export default function ExerciseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(`/api/exercises/${id}`)
      .then(res => setExercise(res.data))
      .catch(() => setError('Failed to load exercise.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading exercise…</p>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className={styles.center}>
        <p className={styles.errorText}>{error || 'Exercise not found.'}</p>
        <button className={styles.backBtn} onClick={() => router.back()}>← Go back</button>
      </div>
    );
  }

  const muscleColors: Record<string, string> = {
    chest: '#ef4444', back: '#3b82f6', legs: '#22c55e', shoulders: '#a855f7',
    arms: '#f97316', core: '#06b6d4', cardio: '#ec4899',
  };
  const badgeColor = muscleColors[exercise.muscle_group?.toLowerCase()] || '#64748b';

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.back()}>← Back to exercises</button>

      <div className={styles.hero}>
        {exercise.image_url ? (
          <img src={exercise.image_url} alt={exercise.name} className={styles.heroImg} />
        ) : (
          <div className={styles.heroPlaceholder}>
            <span className={styles.heroIcon}>🏋️</span>
          </div>
        )}
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>{exercise.name}</h1>
        <span className={styles.badge} style={{ backgroundColor: badgeColor }}>
          {exercise.muscle_group}
        </span>
      </div>

      {exercise.description && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Description</h2>
          <p className={styles.description}>{exercise.description}</p>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Details</h2>
        <div className={styles.detailGrid}>
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>Muscle Group</span>
            <span className={styles.detailValue}>{exercise.muscle_group}</span>
          </div>
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>Exercise ID</span>
            <span className={styles.detailValue}>#{exercise.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}