import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const db = getDb();

  if (req.method === 'GET') {
    try {
      if (isSupabase()) {
        const { data: workout, error } = await db.from('workouts').select('id, title, date, duration_minutes, notes').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Not found' });
        const { data: sets } = await db.from('workout_sets').select('id, workout_id, exercise_id, set_number, reps, weight').eq('workout_id', id).order('set_number');
        const exerciseIds = [...new Set((sets || []).map((s: any) => s.exercise_id))];
        let exerciseMap: Record<number, string> = {};
        if (exerciseIds.length > 0) {
          const { data: exercises } = await db.from('exercises').select('id, name').in('id', exerciseIds);
          (exercises || []).forEach((e: any) => { exerciseMap[e.id] = e.name; });
        }
        const enrichedSets = (sets || []).map((s: any) => ({ ...s, exercise_name: exerciseMap[s.exercise_id] || '' }));
        return res.json({ ...workout, sets: enrichedSets });
      } else {
        const workout = db.prepare('SELECT id, title, date, duration_minutes, notes FROM workouts WHERE id = ?').get(id);
        if (!workout) return res.status(404).json({ error: 'Not found' });
        const sets = db.prepare(`
          SELECT ws.id, ws.workout_id, ws.exercise_id, ws.set_number, ws.reps, ws.weight, e.name as exercise_name
          FROM workout_sets ws LEFT JOIN exercises e ON ws.exercise_id = e.id
          WHERE ws.workout_id = ? ORDER BY ws.set_number
        `).all(id);
        return res.json({ ...workout, sets });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'PUT') {
    const { title, date, duration_minutes, notes } = req.body;
    try {
      if (isSupabase()) {
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (date !== undefined) updates.date = date;
        if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes;
        if (notes !== undefined) updates.notes = notes;
        const { data, error } = await db.from('workouts').update(updates).eq('id', id).select().single();
        if (error) return res.status(404).json({ error: 'Not found' });
        return res.json(data);
      } else {
        const existing = db.prepare('SELECT * FROM workouts WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Not found' });
        db.prepare('UPDATE workouts SET title=?, date=?, duration_minutes=?, notes=? WHERE id=?').run(
          title ?? existing.title, date ?? existing.date, duration_minutes ?? existing.duration_minutes, notes ?? existing.notes, id
        );
        const updated = db.prepare('SELECT id, title, date, duration_minutes, notes FROM workouts WHERE id = ?').get(id);
        return res.json(updated);
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (isSupabase()) {
        await db.from('workout_sets').delete().eq('workout_id', id);
        const { error } = await db.from('workouts').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
      } else {
        db.prepare('DELETE FROM workout_sets WHERE workout_id = ?').run(id);
        db.prepare('DELETE FROM workouts WHERE id = ?').run(id);
        return res.json({ success: true });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  res.status(405).end();
}