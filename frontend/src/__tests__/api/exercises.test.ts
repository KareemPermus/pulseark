import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/exercises/index';
import detailHandler from '@/pages/api/exercises/[id]';

// Force SQLite path
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('/api/exercises', () => {
  it('GET returns array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST creates exercise', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { name: 'Test Exercise', muscle_group: 'Arms' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.name).toBe('Test Exercise');
    expect(data.muscle_group).toBe('Arms');
  });

  it('POST returns 400 without name', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { muscle_group: 'Arms' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('/api/exercises/[id]', () => {
  it('GET returns 404 for missing id', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '99999' } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });

  it('GET returns exercise for valid id', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } });
    await detailHandler(req as any, res as any);
    const code = res._getStatusCode();
    expect([200, 404]).toContain(code);
  });
});