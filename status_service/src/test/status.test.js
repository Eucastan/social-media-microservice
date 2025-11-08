import request from 'supertest';
import app from '../app.js';
import { sequelize } from '../models/index.js';
import { SignToken } from '../utils/authvalidate.js';

describe('Status API', () => {
  let token;

  beforeAll(async () => {
    // Reset database for a clean test environment
    await sequelize.sync({ force: true });
    token = SignToken({ id: 1, username: 'testuser' });
  });

  afterAll(async () => {
    // Gracefully close DB connection after tests
    await sequelize.close();
  });

  describe('GET /api/statuses/user/:userId', () => {
    beforeEach(async () => {
      // Seed the database with test data
      await sequelize.models.Status.destroy({ where: {} });
      await sequelize.models.Status.create({
        userId: 1,
        mediaUrl: 'http://example.com/image.jpg',
        mediaType: 'image',
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000)
      });
    });

    it('should return statuses for a valid user', async () => {
      const res = await request(app)
        .get('/api/statuses/user/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toMatchObject({
        userId: 1,
        mediaType: 'image'
      });
    });

    it('should return an empty list for user with no statuses', async () => {
      const res = await request(app)
        .get('/api/statuses/user/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toEqual([]);
    });
  });
});
