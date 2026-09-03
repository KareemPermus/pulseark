import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import apiClient from '@/api/client';
import { Exercise } from '@/types';
import Link from 'next/link';
import { FiArrowLeft, FiTarget } from 'react-icons/fi';
import styles from '@/components/ExerciseDetail.module.css';

function MuscleGroupBadge({ group }: { group: string }) {
  return <span className={styles.badge}>{group}</span>;
}

function InstructionsList({ description }: { description?: string }) {
  if (!description) return <p className={styles.noDesc}>No instructions available.</p>;
  const lines = description.split(/\.\s+/).filter(Boolean);
  return (
    <ol className={styles.instructions}>
      {lines.map((line, i) => (
        <li key={i}>{line.trim().replace(/\.$/, '')}.</li>
      ))}
    </ol>
  );
}

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

  if (loading) return <div className={styles.center}>Loading…</div>;
  if (error || !exercise) return <div className={styles.center}>{error || 'Not found.'}</div>;

  return (
    <div className={styles.page}>
      <Link href="/exercises" className={styles.back}><FiArrowLeft /> Back to exercises</Link>

      <div className={styles.header}>
        {exercise.image_url && <img src={exercise.image_url} alt={exercise.name} className={styles.img} />}
        <div>
          <h1 className={styles.title}>{exercise.name}</h1>
          <MuscleGroupBadge group={exercise.muscle_group} />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}><FiTarget /> Instructions</div>
        <InstructionsList description={exercise.description} />
      </div>
    </div>
  );
}