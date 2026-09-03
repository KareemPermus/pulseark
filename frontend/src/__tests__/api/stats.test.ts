import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/stats/weekly';

delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('/api/stats/weekly', () => {
  it('GET returns weekly stats', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('total_workouts');
    expect(data).toHaveProperty('total_duration_minutes');
    expect(data).toHaveProperty('total_sets');
    expect(data).toHaveProperty('workouts_by_day');
    expect(Array.isArray(data.workouts_by_day)).toBe(true);
  });

  it('returns 405 for POST', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });
});