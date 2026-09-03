export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  description?: string;
  image_url?: string;
}

export interface Workout {
  id: number;
  title: string;
  date: string;
  duration_minutes?: number;
  notes?: string;
}

export interface WorkoutSet {
  id: number;
  workout_id: number;
  exercise_id: number;
  set_number: number;
  reps: number;
  weight?: number;
}

export interface WorkoutWithSets extends Workout {
  sets: (WorkoutSet & { exercise_name?: string })[];
}

export interface WeeklyStats {
  total_workouts: number;
  total_duration_minutes: number;
  total_sets: number;
  workouts_by_day: { date: string; count: number }[];
}