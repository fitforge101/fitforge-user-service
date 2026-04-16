const request = require('supertest');
const app = require('../app');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

jest.mock('../models/Profile');

describe('User Routes', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ userId: 'user123' }, JWT_SECRET);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/:userId', () => {
    it('should return profile if found', async () => {
      const mockProfile = { userId: 'user123', name: 'John' };
      Profile.findOne.mockResolvedValue(mockProfile);

      const res = await request(app)
        .get('/users/user123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe('user123');
      expect(Profile.findOne).toHaveBeenCalledWith({ userId: 'user123' });
    });

    it('should return 404 if profile not found', async () => {
      Profile.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get('/users/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Profile not found');
    });

    it('should return 500 on server error', async () => {
      Profile.findOne.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .get('/users/user123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('DB Error');
    });
  });

  describe('POST /users', () => {
    it('should create a new profile', async () => {
      const profileData = { userId: 'user456', name: 'Jane' };
      Profile.create.mockResolvedValue(profileData);

      const res = await request(app)
        .post('/users')
        .send(profileData);

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe('user456');
    });

    it('should return 500 on creation error', async () => {
      Profile.create.mockRejectedValue(new Error('Creation failed'));

      const res = await request(app)
        .post('/users')
        .send({ name: 'Error' });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Creation failed');
    });
  });

  describe('PUT /users/:userId', () => {
    it('should update profile', async () => {
      const updateData = { name: 'Updated Name' };
      Profile.findOneAndUpdate.mockResolvedValue({ userId: 'user123', ...updateData });

      const res = await request(app)
        .put('/users/user123')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user123' },
        updateData,
        { new: true, upsert: true }
      );
    });

    it('should return 500 on update error', async () => {
      Profile.findOneAndUpdate.mockRejectedValue(new Error('Update failed'));

      const res = await request(app)
        .put('/users/user123')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(500);
    });
  });

  describe('Health Check', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });
});
