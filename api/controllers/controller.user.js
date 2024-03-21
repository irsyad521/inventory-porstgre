import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import { validatePassword, validateRole, validateUsername } from '../utils/validate.js';
import {
    createUserWithRoleRepository,
    deleteUserRepository,
    getAllUsersRepository,
    updateUserRepository,
} from '../repository/repository.user.js';

export const createUser = async (req, res, next) => {
    let { username, password, role } = req.body;

    try {
        if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
            throw next(errorHandler(403, 'You are not allowed create user'));
        }

        role = role.trim();
        username = username.trim();
        password = password.trim();

        validateRole(role);
        validateUsername(username);
        validatePassword(password);
        const hashedPassword = bcryptjs.hashSync(password, 10);

        const response = await createUserWithRoleRepository(username, hashedPassword, role);
        const { password: pass, ...rest } = response._doc;

        res.status(201).json(rest);
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        if (!req.user.isAdmin && req.user.role !== 'admin') {
            throw errorHandler(403, 'You are not allowed to see all users');
        }

        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sort = req.query.sort || 'desc';

        const users = await getAllUsersRepository(startIndex, limit, sort);

        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    let { username, password, role } = req.body;

    try {
        if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
            return next(errorHandler(403, 'You are not allowed to update this user'));
        }

        if (role !== 'user' && role !== 'guest' && role !== 'admin') {
            return next(errorHandler(400, 'Invalid role'));
        }

        username = username.trim();
        validateRole(role);
        validateUsername(username);
        validatePassword(password);

        const trimmedPassword = password.trim();
        const hashedPassword = bcryptjs.hashSync(trimmedPassword, 10);

        const updatedUser = await updateUserRepository(req.params.userId, {
            username: username,
            password: hashedPassword,
            role: role,
            isAdmin: role === 'admin' ? true : false,
        });

        const { password: userPassword, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
            return next(errorHandler(403, 'You are not allowed to delete this user'));
        }

        const deletedUser = await deleteUserRepository(req.params.userId);
        if (!deletedUser) {
            return next(errorHandler(404, 'User not found'));
        }

        res.status(200).json('User has been deleted');
    } catch (error) {
        next(error);
    }
};
