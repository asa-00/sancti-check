// tests/controllers/authController.test.js
const request = require('supertest');
const app = require('../../src/index');
const authController = require('../../src/controllers/authController');

jest.mock('../../src/models/User');

describe('Auth Controller', () => {
  it('should login successfully', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    jest.spyOn(authController, 'login').mockResolvedValue(mockUser);

    const response = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining(mockUser));
  });
});
