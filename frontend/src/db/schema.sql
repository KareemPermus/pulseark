CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes INT,
  notes TEXT,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id SERIAL PRIMARY KEY,
  workout_id INT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number INT NOT NULL,
  reps INT NOT NULL,
  weight REAL
);