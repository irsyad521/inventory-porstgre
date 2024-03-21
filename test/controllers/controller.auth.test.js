import request from 'supertest';
import app from '../../api/index.js';
import { createUserRepository, findUserByUsername } from '../../api/repository/repository.auth.js';

afterAll(() => {
    jest.clearAllMocks();
});
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mockedToken'),
}));

jest.mock('../../api/repository/repository.auth', () => ({
    createUserRepository: jest.fn().mockResolvedValueOnce({
        _doc: {
            _id: 'mockedUserId',
            username: 'testuser1',
            isAdmin: false,
            role: 'guest',
        },
    }),
    findUserByUsername: jest.fn().mockResolvedValueOnce({
        _id: 'mockedUserId',
        username: 'testuser1',
        isAdmin: false,
        role: 'guest',
        password: '$2a$10$23uTpZYZ/8..9WyMLUHHSOC6OEHtkWBf9x5s651unUk15QB4r3tZu',
        _doc: {
            _id: 'mockedUserId',
            username: 'testuser1',
            isAdmin: false,
            role: 'guest',
        },
    }),
}));

describe('POST /api/auth/signup', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should signup successfully', async () => {
        const requestBody = { username: 'testuser1', password: 'password1234' };

        const response = await request(app).post('/api/auth/signup').send(requestBody);

        expect(response.status).toBe(201);
        expect(response.body).toBeDefined();
    });

    it('should handle username already exists error', async () => {
        const requestBody = { username: 'testuser1', password: 'password1234' };

        createUserRepository.mockRejectedValueOnce({ code: 11000, keyValue: { username: true } });

        const response = await request(app).post('/api/auth/signup').send(requestBody);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toContain('Username already exists');
    });

    it('should handle general errors', async () => {
        const requestBody = { username: 'testuser1', password: 'password1234' };

        const mockError = new Error('Test error');

        createUserRepository.mockRejectedValueOnce(mockError);

        const response = await request(app).post('/api/auth/signup').send(requestBody);

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.statusCode).toBe(500);
        expect(response.body.message).toContain('Test error');
    });
});

describe('POST /api/auth/signin', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('shMock user dataould signin successfully', async () => {
        const requestBody = { username: 'testuser1', password: 'adminpassword' };

        const response = await request(app).post('/api/auth/signin').send(requestBody);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ _id: 'mockedUserId', username: 'testuser1', isAdmin: false, role: 'guest' });
        expect(response.header['set-cookie'][0]).toContain('access_token=mockedToken');
    });

    it('should handle invalid credentials', async () => {
        const requestBody = { username: 'testuser1', password: 'invalidpassword' };

        const mockUserData = {
            _id: 'mockedUserId',
            username: 'testuser1',
            isAdmin: false,
            role: 'guest',
            password: 'mockedHashedPassword',
            _doc: {
                _id: 'mockedUserId',
                username: 'testuser1',
                isAdmin: false,
                role: 'guest',
            },
        };

        findUserByUsername.mockResolvedValueOnce(mockUserData);

        const response = await request(app).post('/api/auth/signin').send(requestBody);

        expect(response.status).toBe(400);
        expect(response.body.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid username or password');
    });

    it('should handle User Not Found', async () => {
        const requestBody = { username: 'nonexistentuser', password: 'invalidpassword' };

        findUserByUsername.mockResolvedValueOnce(null);

        const response = await request(app).post('/api/auth/signin').send(requestBody);

        expect(response.status).toBe(404);
        expect(response.body.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('User not found');
    });
});

describe('POST /api/auth/signout', () => {
    it('should sign out the user', async () => {
        const response = await request(app).post('/api/auth/signout');

        expect(response.status).toBe(200);
        expect(response.body).toBe('User has been signed out');
        expect(response.header['set-cookie'][0]).toContain(
            'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        );
    });
});
