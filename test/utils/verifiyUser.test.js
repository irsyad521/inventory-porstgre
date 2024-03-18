import { verifyToken } from '../../api/utils/verifiyUser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

describe('verifyToken', () => {
    test('calls next with Unauthorized error if no token provided', () => {
        const req = { cookies: {} };
        const res = {};
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].statusCode).toBe(401);
        expect(next.mock.calls[0][0].message).toBe('Unauthorized');
    });

    test('calls next with Unauthorized error if token is invalid', () => {
        const req = { cookies: { access_token: 'invalid_token' } };
        const res = {};
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].statusCode).toBe(401);
        expect(next.mock.calls[0][0].message).toBe('Unauthorized');
    });

    test('adds user object to request if token is valid', () => {
        const user = { id: '65f56d2e253c05afb0380e13', username: 'admin' };
        const token = jwt.sign(user, process.env.JWT_SECRET);
        const req = { cookies: { access_token: token } };
        const res = {};
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.user).toEqual(expect.objectContaining(user));
    });
});
