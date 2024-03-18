import { signup, signin, signout } from '../../api/controllers/controller.auth.js';
import User from '../../api/models/model.user.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../../api/utils/error.js';

jest.mock('../../api/models/model.user.js', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
    hashSync: jest.fn(),
    compareSync: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

const req = { body: {} };
const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
};
const next = jest.fn();

describe('signup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create new user and return user data without password', async () => {
        req.body.username = 'testuser';
        req.body.password = 'testpassword';

        const newUser = { _doc: { username: 'testuser', role: 'user' } };
        User.mockReturnValue({ save: jest.fn().mockResolvedValue(newUser) });

        await signup(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ username: 'testuser', role: 'user' });
    });

    test('should handle error if username already exists', async () => {
        req.body.username = 'existinguser';
        req.body.password = 'testpassword';

        const error = { code: 11000, keyValue: { username: 'existinguser' } };
        User.mockReturnValue({ save: jest.fn().mockRejectedValue(error) });

        await signup(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Username already exists' }));
    });

    test('should handle other errors', async () => {
        req.body.username = 'testuser';
        req.body.password = 'testpassword';

        const error = new Error('Some error occurred');
        User.mockReturnValue({ save: jest.fn().mockRejectedValue(error) });

        await signup(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('signin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should sign in user with valid credentials', async () => {
        req.body.username = 'testuser';
        req.body.password = 'testpassword';

        const validUser = { _doc: { username: 'testuser', role: 'user', _id: '123456' } };
        User.findOne = jest.fn().mockResolvedValue(validUser);
        bcryptjs.compareSync.mockReturnValue(true);
        jwt.sign.mockReturnValue('mocked_token');

        await signin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalledWith('access_token', 'mocked_token', { httpOnly: true });
        expect(res.json).toHaveBeenCalledWith({ username: 'testuser', role: 'user', _id: '123456' });
    });

    test('should respond with 404 if user not found', async () => {
        req.body.username = 'nonexistentuser';
        req.body.password = 'testpassword';

        User.findOne = jest.fn().mockResolvedValue(null);

        await signin(req, res, next);

        expect(next).toHaveBeenCalledWith(errorHandler(404, 'User not found'));
    });

    test('should respond with 400 if invalid credentials', async () => {
        req.body.username = 'testuser';
        req.body.password = 'wrongpassword';

        const validUser = { _doc: { username: 'testuser', role: 'user' } };
        User.findOne = jest.fn().mockResolvedValue(validUser);
        bcryptjs.compareSync.mockReturnValue(false);

        await signin(req, res, next);

        expect(next).toHaveBeenCalledWith(errorHandler(400, 'Invalid username or password'));
    });

    test('should handle errors', async () => {
        req.body.username = 'testuser';
        req.body.password = 'testpassword';

        const error = new Error('Test error');
        User.findOne = jest.fn().mockRejectedValue(error);

        await signin(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('Signout Function', () => {
    test('should clear access_token cookie and respond with 200', async () => {
        const req = {};
        const res = {
            clearCookie: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await signout(req, res, next);

        expect(res.clearCookie).toHaveBeenCalledWith('access_token');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith('User has been signed out');
    });

    test('should handle errors', async () => {
        const req = {};
        const res = {
            clearCookie: jest.fn().mockImplementation(() => {
                throw new Error('Test error');
            }),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await signout(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
