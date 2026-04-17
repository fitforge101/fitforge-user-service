const request = require('supertest');

// Mock the user routes to avoid DB connections, just need to cover app.js itself
jest.mock('./routes/user', () => {
  const router = require('express').Router();
  return router;
});

const app = require('./app');

describe('App', () => {
  it('GET /health should return status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'OK', service: 'user-service' });
  });

  it('should have x-powered-by header disabled', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });
});
