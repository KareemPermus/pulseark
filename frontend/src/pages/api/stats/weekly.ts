import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }

  const db = getDb();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    if (isSupabase()) {
      const { data: workouts, error } = await db.from('workouts').select('id, date, duration_minutes').gte('date', weekAgo);
      if (error) return res.status(500).json({ error: error.message });
      const workoutIds = (workouts || []).map((w: any) => w.id);
      let totalSets = 0;
      if (workoutIds.length > 0) {
        const { count } = await db.from('workout_sets').select('id', { count: 'exact', head: true }).in('workout_id', workoutIds);
        totalSets = count || 0;
      }
      const totalDuration = (workouts || []).reduce((sum: number, w: any) => sum + (w.duration_minutes || 0), 0);
      const dayMap: Record<string, number> = {};
      (workouts || []).forEach((w: any) => {
        const day = w.date.substring(0, 10);
        dayMap[day] = (dayMap[day] || 0) + 1;
      });
      const workouts_by_day = Object.entries(dayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
      return res.json({ total_workouts: (workouts || []).length, total_duration_minutes: totalDuration, total_sets: totalSets, workouts_by_day });
    } else {
      const workouts = db.prepare('SELECT id, date, duration_minutes FROM workouts WHERE date >= ?').all(weekAgo);
      const totalDuration = workouts.reduce((s: number, w: any) => s + (w.duration_minutes || 0), 0);
      let totalSets = 0;
      if (workouts.length > 0) {
        const ids = workouts.map((w: any) => w.id);
        const placeholders = ids.map(() => '?').join(',');
        const r = db.prepare(`SELECT COUNT(*) as c FROM workout_sets WHERE workout_id IN (${placeholders})`).get(...ids);
        totalSets = r.c;
      }
      const dayMap: Record<string, number> = {};
      workouts.forEach((w: any) => {
        const day = (w.date || '').substring(0, 10);
        dayMap[day] = (dayMap[day] || 0) + 1;
      });
      const workouts_by_day = Object.entries(dayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
      return res.json({ total_workouts: workouts.length, total_duration_minutes: totalDuration, total_sets: totalSets, workouts_by_day });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}