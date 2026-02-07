const request = require('supertest');

process.env.JWT_SECRET = 'test-secret-key';

const app = require('../index');

describe('Express App', () => {
  test('GET /api/health returns { status: "ok" }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('unknown routes return 404 JSON', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('JSON parsing middleware works', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ test: true })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
  });
});
