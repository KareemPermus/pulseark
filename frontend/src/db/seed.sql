INSERT INTO exercises (slug, name, muscle_group, description, image_url) VALUES
  ('barbell-bench-press', 'Barbell Bench Press', 'Chest', 'Classic chest compound movement', NULL),
  ('barbell-squat', 'Barbell Squat', 'Legs', 'King of leg exercises', NULL),
  ('deadlift', 'Deadlift', 'Back', 'Full body posterior chain exercise', NULL),
  ('overhead-press', 'Overhead Press', 'Shoulders', 'Standing barbell press', NULL),
  ('barbell-row', 'Barbell Row', 'Back', 'Bent over row for back thickness', NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO workouts (slug, title, date, duration_minutes, notes) VALUES
  ('push-day-demo', 'Push Day', '2025-01-15T10:00:00Z', 60, 'Great session'),
  ('pull-day-demo', 'Pull Day', '2025-01-16T10:00:00Z', 45, 'Felt strong'),
  ('leg-day-demo', 'Leg Day', '2025-01-17T10:00:00Z', 55, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO workout_sets (workout_id, exercise_id, set_number, reps, weight)
SELECT w.id, e.id, s.set_number, s.reps, s.weight
FROM (VALUES ('push-day-demo', 'barbell-bench-press', 1, 10, 135.0),
             ('push-day-demo', 'barbell-bench-press', 2, 8, 155.0),
             ('pull-day-demo', 'barbell-row', 1, 10, 135.0),
             ('leg-day-demo', 'barbell-squat', 1, 8, 185.0))
  AS s(wslug, eslug, set_number, reps, weight)
JOIN workouts w ON w.slug = s.wslug
JOIN exercises e ON e.slug = s.eslug
WHERE NOT EXISTS (
  SELECT 1 FROM workout_sets ws WHERE ws.workout_id = w.id AND ws.exercise_id = e.id AND ws.set_number = s.set_number
);