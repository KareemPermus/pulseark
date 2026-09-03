import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/workouts/index';
import detailHandler from '@/pages/api/workouts/[id]';

delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('/api/workouts', () => {
  it('GET returns array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(Array.isArray(JSON.parse(res._getData()))).toBe(true);
  });

  it('POST creates workout', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { title: 'Test Workout', date: '2025-01-20T10:00:00Z', duration_minutes: 30 } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Test Workout');
    expect(data.sets).toBeDefined();
  });

  it('POST returns 400 without title', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('/api/workouts/[id]', () => {
  it('GET returns 404 for missing', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '99999' } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });

  it('DELETE returns success', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '99999' } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });

  it('returns 405 for PATCH', async () => {
    const { req, res } = createMocks({ method: 'PATCH', query: { id: '1' } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });
});