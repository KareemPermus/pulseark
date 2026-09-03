import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const db = getDb();
  try {
    if (isSupabase()) {
      const { data, error } = await db.from('exercises').select('id, name, muscle_group, description, image_url').eq('id', id).single();
      if (error) return res.status(404).json({ error: 'Not found' });
      return res.json(data);
    } else {
      const row = db.prepare('SELECT id, name, muscle_group, description, image_url FROM exercises WHERE id = ?').get(id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      return res.json(row);
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}