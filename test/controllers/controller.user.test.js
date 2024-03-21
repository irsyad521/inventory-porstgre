import request from 'supertest';
import app from '../../api/index.js';
import {
    createUserWithRoleRepository,
    getAllUsersRepository,
    updateUserRepository,
    deleteUserRepository,
} from '../../api/repository/repository.user.js';
import { generateToken } from '../../api/utils/generatedToken.js';

afterAll(() => {
    jest.clearAllMocks();
});

jest.mock('../../api/repository/repository.user.js', () => ({
    createUserWithRoleRepository: jest.fn(),
    getAllUsersRepository: jest.fn(),
    updateUserRepository: jest.fn(),
    deleteUserRepository: jest.fn(),
}));

describe('POST /api/user/createUser', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('create User successfully', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);

        const mockUserData = {
            _id: 'mockedUserId',
            username: 'testuser1',
            isAdmin: false,
            password: '$2a$10$23uTpZYZ/8..9WyMLUHHSOC6OEHtkWBf9x5s651unUk15QB4r3tZu',
            role: 'guest',
            _doc: {
                _id: 'mockedUserId',
                username: 'testuser1',
                isAdmin: false,
                role: 'guest',
            },
        };

        createUserWithRoleRepository.mockResolvedValueOnce(mockUserData);

        const requestBody = { username: 'testuser1', password: 'adminpassword', role: 'guest' };

        const response = await request(app)
            .post('/api/user/createUser')
            .send(requestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(201);
    });

    it('should return 403 if not an admin', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: false, role: 'guest' };
        const adminToken = generateToken(adminPayload);

        const mockUserData = {
            _id: 'mockedUserId',
            username: 'testuser2131',
            isAdmin: false,
            password: '$2a$10$23uTpZYZ/8..9WyMLUHHSOC6OEHtkWBf9x5s651unUk15QB4r3tZu',
            role: 'guest',
            _doc: {
                _id: 'mockedUserId',
                username: 'testuser2131',
                isAdmin: false,
                role: 'guest',
            },
        };

        createUserWithRoleRepository.mockResolvedValueOnce(mockUserData);

        const requestBody = { username: 'testuser1', password: 'adminpassword', role: 'guest' };

        const response = await request(app)
            .post('/api/user/createUser')
            .send(requestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('You are not allowed create user');
    });
});

describe('GET /api/user/getUsers', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return users when user is admin', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);

        const mockUsers = [
            {
                _id: '65f98ff1cffae32562056008',
                username: 'testuser212',
                isAdmin: false,
                role: 'guest',
                createdAt: '2024-03-19T13:15:29.899Z',
                updatedAt: '2024-03-19T13:15:29.899Z',
                __v: 0,
            },
            {
                _id: '65f93f0859ff7b2f56b737c4',
                username: 'testuser2',
                isAdmin: false,
                role: 'guest',
                createdAt: '2024-03-19T07:30:16.118Z',
                updatedAt: '2024-03-19T07:30:16.118Z',
                __v: 0,
            },
        ];
        getAllUsersRepository.mockResolvedValueOnce(mockUsers);

        const response = await request(app)
            .get('/api/user/getUsers')
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(200);
    });

    it('should return 403 error when user is not admin', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: false, role: 'guest' };
        const adminToken = generateToken(adminPayload);

        const mockUsers = [
            {
                _id: '65f98ff1cffae32562056008',
                username: 'testuser212',
                isAdmin: false,
                role: 'guest',
                createdAt: '2024-03-19T13:15:29.899Z',
                updatedAt: '2024-03-19T13:15:29.899Z',
                __v: 0,
            },
        ];
        getAllUsersRepository.mockResolvedValueOnce(mockUsers);

        const response = await request(app)
            .get('/api/user/getUsers')
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            success: false,
            statusCode: 403,
            message: 'You are not allowed to see all users',
        });
    });
});

describe('PUT /api/user/:userId', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update user successfully as admin', async () => {
        //
        const userId = 'mockUserId';
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const requestBody = { username: 'updateusername', password: 'userpassword', role: 'guest' };
        const updatedUser = {
            _id: userId,
            username: requestBody.username,
            password: '$2a$10$Khbw00qyzKbQB0DHOe8.Q.zv.BF2XNvHStEjwq6WvbbTI4p3zT2qW',
            role: requestBody.role,
            isAdmin: false,
            _doc: {
                _id: userId,
                username: requestBody.username,
                role: requestBody.role,
                isAdmin: false,
            },
        };

        updateUserRepository.mockResolvedValueOnce(updatedUser);

        const response = await request(app)
            .put(`/api/user/updateUser/${userId}`)
            .send(requestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedUser._doc);
    });

    it('should return 403 if user is not admin', async () => {
        // Mock data
        const userId = 'mockUserId';
        const userPayload = { id: userId, isAdmin: false, role: 'guest' };
        const userToken = generateToken(userPayload);
        const requestBody = { username: 'newUsername', password: 'newPassword', role: 'guest' };

        const response = await request(app)
            .put(`/api/user/updateUser/${userId}`)
            .send(requestBody)
            .set('Cookie', [`access_token=${userToken}`]);

        expect(updateUserRepository).not.toHaveBeenCalled();

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            success: false,
            statusCode: 403,
            message: 'You are not allowed to update this user',
        });
    });

    it('should return 400 if role is invalid', async () => {
        const userId = 'mockUserId';
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const requestBody = { username: 'newUsername', password: 'newPassword', role: 'invalidRole' };

        const response = await request(app)
            .put(`/api/user/updateUser/${userId}`)
            .send(requestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(updateUserRepository).not.toHaveBeenCalled();

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, statusCode: 400, message: 'Invalid role' });
    });

    it('should handle error in catch block', async () => {
        const userId = 'mockUserId';
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const requestBody = { username: 'newusername', password: 'newPassword', role: 'guest' };
        const error = new Error();

        updateUserRepository.mockRejectedValueOnce(error);

        const response = await request(app)
            .put(`/api/user/updateUser/${userId}`)
            .send(requestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ success: false, statusCode: 500, message: 'Internal Server Error' });
    });
});

describe('DELETE /api/user/:userId', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete user successfully', async () => {
        const userId = 'mockUserId';
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const deletedUser = { _id: userId };

        deleteUserRepository.mockResolvedValueOnce(deletedUser);

        const response = await request(app)
            .delete(`/api/user/deleteUser/${userId}`)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(deleteUserRepository).toHaveBeenCalledWith(userId);

        expect(response.status).toBe(200);
        expect(response.body).toEqual('User has been deleted');
    });

    it('should handle error in catch block', async () => {
        const userId = 'mockUserId';
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const error = new Error();
        deleteUserRepository.mockRejectedValueOnce(error);

        const response = await request(app)
            .delete(`/api/user/deleteUser/${userId}`)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(deleteUserRepository).toHaveBeenCalledWith(userId);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ success: false, statusCode: 500, message: 'Internal Server Error' });
    });
});
