import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      if (isSupabase()) {
        const { data, error } = await db.from('workouts').select('id, title, date, duration_minutes, notes').order('date', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } else {
        const rows = db.prepare('SELECT id, title, date, duration_minutes, notes FROM workouts ORDER BY date DESC').all();
        return res.json(rows);
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    const { title, date, duration_minutes, notes, sets } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const workoutDate = date || new Date().toISOString();

    try {
      if (isSupabase()) {
        const { data: workout, error } = await db.from('workouts').insert({ title, date: workoutDate, duration_minutes: duration_minutes || null, notes: notes || null, slug }).select().single();
        if (error) return res.status(500).json({ error: error.message });
        let insertedSets: any[] = [];
        if (sets && Array.isArray(sets) && sets.length > 0) {
          const setsToInsert = sets.map((s: any, i: number) => ({ workout_id: workout.id, exercise_id: s.exercise_id, set_number: s.set_number || i + 1, reps: s.reps, weight: s.weight || null }));
          const { data: sd, error: se } = await db.from('workout_sets').insert(setsToInsert).select();
          if (se) return res.status(500).json({ error: se.message });
          insertedSets = sd || [];
        }
        return res.status(201).json({ ...workout, sets: insertedSets });
      } else {
        const r = db.prepare('INSERT INTO workouts (title, date, duration_minutes, notes, slug) VALUES (?,?,?,?,?)').run(title, workoutDate, duration_minutes || null, notes || null, slug);
        const workoutId = r.lastInsertRowid;
        const insertedSets: any[] = [];
        if (sets && Array.isArray(sets)) {
          const ins = db.prepare('INSERT INTO workout_sets (workout_id, exercise_id, set_number, reps, weight) VALUES (?,?,?,?,?)');
          for (let i = 0; i < sets.length; i++) {
            const s = sets[i];
            const sr = ins.run(workoutId, s.exercise_id, s.set_number || i + 1, s.reps, s.weight || null);
            insertedSets.push({ id: sr.lastInsertRowid, workout_id: workoutId, exercise_id: s.exercise_id, set_number: s.set_number || i + 1, reps: s.reps, weight: s.weight || null });
          }
        }
        return res.status(201).json({ id: workoutId, title, date: workoutDate, duration_minutes: duration_minutes || null, notes: notes || null, sets: insertedSets });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}