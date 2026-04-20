const request = require('supertest');
const express = require('express');

// Mock Profile model before requiring the router
jest.mock('../models/Profile');
const Profile = require('../models/Profile');

// Mock verifyToken to simulate an authenticated user
jest.mock('../middleware/verifyToken', () => (req, res, next) => {
  req.user = { userId: 'user-123' };
  next();
});

const userRouter = require('./user');

// Build a minimal express app for testing
const app = express();
app.use(express.json());
app.use('/users', userRouter);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /users/:userId ───
  describe('GET /users/:userId', () => {
    it('should return 403 if userId does not match authenticated user', async () => {
      const res = await request(app).get('/users/other-user');
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Forbidden: Access denied');
    });

    it('should return 404 if profile not found', async () => {
      Profile.findOne.mockResolvedValue(null);
      const res = await request(app).get('/users/user-123');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Profile not found');
    });

    it('should return profile if found', async () => {
      Profile.findOne.mockResolvedValue({ userId: 'user-123', name: 'Test User' });
      const res = await request(app).get('/users/user-123');
      expect(res.status).toBe(200);
      expect(res.body.userId).toBe('user-123');
    });

    it('should return 500 on database error', async () => {
      Profile.findOne.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/users/user-123');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('DB error');
    });
  });

  // ─── POST /users ───
  describe('POST /users', () => {
    it('should return 403 if userId in body does not match authenticated user', async () => {
      const res = await request(app).post('/users').send({ userId: 'other-user' });
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Forbidden: You can only create your own profile');
    });

    it('should create and return a profile with status 201', async () => {
      const mockProfile = { userId: 'user-123', name: 'Test User' };
      Profile.create.mockResolvedValue(mockProfile);
      const res = await request(app).post('/users').send({ userId: 'user-123', name: 'Test User' });
      expect(res.status).toBe(201);
      expect(res.body.userId).toBe('user-123');
    });

    it('should return 500 on database error', async () => {
      Profile.create.mockRejectedValue(new Error('Create failed'));
      const res = await request(app).post('/users').send({ userId: 'user-123' });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Create failed');
    });
  });

  // ─── PUT /users/:userId ───
  describe('PUT /users/:userId', () => {
    it('should return 403 if userId does not match authenticated user', async () => {
      const res = await request(app).put('/users/other-user').send({ name: 'Hacker' });
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Forbidden: Access denied');
    });

    it('should update and return the profile', async () => {
      const mockProfile = { userId: 'user-123', name: 'Updated Name' };
      Profile.findOneAndUpdate.mockResolvedValue(mockProfile);
      const res = await request(app).put('/users/user-123').send({ name: 'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('should return 500 on database error', async () => {
      Profile.findOneAndUpdate.mockRejectedValue(new Error('Update failed'));
      const res = await request(app).put('/users/user-123').send({});
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Update failed');
    });
  });
});
