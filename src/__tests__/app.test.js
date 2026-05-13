const request = require('supertest');
const app = require('../index');

describe('GET /', () => {
  it('returns hello message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Hello from demo-app!');
    expect(res.body.version).toBe('1.0.0');
  });
});

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/greet/:name', () => {
  it('greets a user by name', async () => {
    const res = await request(app).get('/api/greet/Ravi');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Hello, Ravi!');
  });

  it('returns 404 for missing name segment', async () => {
    const res = await request(app).get('/api/greet');
    expect(res.statusCode).toBe(404);
  });
});
