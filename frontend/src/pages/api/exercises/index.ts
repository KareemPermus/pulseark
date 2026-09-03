import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    const { muscle_group } = req.query;
    try {
      if (isSupabase()) {
        let q = db.from('exercises').select('id, name, muscle_group, description, image_url');
        if (muscle_group) q = q.eq('muscle_group', muscle_group as string);
        const { data, error } = await q.order('name');
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } else {
        let rows;
        if (muscle_group) {
          rows = db.prepare('SELECT id, name, muscle_group, description, image_url FROM exercises WHERE muscle_group = ? ORDER BY name').all(muscle_group);
        } else {
          rows = db.prepare('SELECT id, name, muscle_group, description, image_url FROM exercises ORDER BY name').all();
        }
        return res.json(rows);
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    const { name, muscle_group, description, image_url } = req.body;
    if (!name || !muscle_group) return res.status(400).json({ error: 'name and muscle_group required' });
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    try {
      if (isSupabase()) {
        const { data, error } = await db.from('exercises').insert({ name, muscle_group, description: description || null, image_url: image_url || null, slug }).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
      } else {
        const r = db.prepare('INSERT INTO exercises (name, muscle_group, description, image_url, slug) VALUES (?,?,?,?,?)').run(name, muscle_group, description || null, image_url || null, slug);
        return res.status(201).json({ id: r.lastInsertRowid, name, muscle_group, description: description || null, image_url: image_url || null });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}