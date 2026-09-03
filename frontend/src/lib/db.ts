import path from 'path';

let db: any = null;

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      slug TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT (datetime('now')),
      duration_minutes INTEGER,
      notes TEXT,
      slug TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      set_number INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM exercises').get();
  if (count.c === 0) {
    db.exec(`
      INSERT INTO exercises (slug, name, muscle_group, description) VALUES
        ('barbell-bench-press', 'Barbell Bench Press', 'Chest', 'Classic chest compound movement'),
        ('barbell-squat', 'Barbell Squat', 'Legs', 'King of leg exercises'),
        ('deadlift', 'Deadlift', 'Back', 'Full body posterior chain exercise'),
        ('overhead-press', 'Overhead Press', 'Shoulders', 'Standing barbell press'),
        ('barbell-row', 'Barbell Row', 'Back', 'Bent over row for back thickness');
    `);
  }

  const wcount = db.prepare('SELECT COUNT(*) as c FROM workouts').get();
  if (wcount.c === 0) {
    db.exec(`
      INSERT INTO workouts (slug, title, date, duration_minutes, notes) VALUES
        ('push-day-demo', 'Push Day', '2025-01-15T10:00:00Z', 60, 'Great session'),
        ('pull-day-demo', 'Pull Day', '2025-01-16T10:00:00Z', 45, 'Felt strong'),
        ('leg-day-demo', 'Leg Day', '2025-01-17T10:00:00Z', 55, NULL);
    `);
    const pushId = db.prepare("SELECT id FROM workouts WHERE slug='push-day-demo'").get().id;
    const pullId = db.prepare("SELECT id FROM workouts WHERE slug='pull-day-demo'").get().id;
    const legId = db.prepare("SELECT id FROM workouts WHERE slug='leg-day-demo'").get().id;
    const benchId = db.prepare("SELECT id FROM exercises WHERE slug='barbell-bench-press'").get().id;
    const rowId = db.prepare("SELECT id FROM exercises WHERE slug='barbell-row'").get().id;
    const squatId = db.prepare("SELECT id FROM exercises WHERE slug='barbell-squat'").get().id;
    const ins = db.prepare('INSERT INTO workout_sets (workout_id, exercise_id, set_number, reps, weight) VALUES (?,?,?,?,?)');
    ins.run(pushId, benchId, 1, 10, 135.0);
    ins.run(pushId, benchId, 2, 8, 155.0);
    ins.run(pullId, rowId, 1, 10, 135.0);
    ins.run(legId, squatId, 1, 8, 185.0);
  }

  return db;
}

export function isSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}