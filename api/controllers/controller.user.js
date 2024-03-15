import { errorHandler } from '../utils/error.js';
import User from '../models/model.user.js';
import bcryptjs from 'bcryptjs';

export const createUser = async (req, res, next) => {
    const { username, password, role } = req.body;

    if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
        return next(errorHandler(403, 'You are not allowed create user'));
    }

    if (role !== 'user' && role !== 'guest') {
        return next(errorHandler(400, 'Invalid role'));
    }

    if (!username || !password || !role || username.trim() === '' || password.trim() === '') {
        return next(errorHandler(400, 'All fields are required'));
    }

    if (password && password.length < 6) {
        return next(errorHandler(400, 'Password must be at least 6 characters'));
    }

    if (username) {
        if (username.length < 7 || username.length > 20) {
            return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
        }
        if (username.includes(' ')) {
            return next(errorHandler(400, 'Username cannot contain spaces'));
        }
        if (username !== username.toLowerCase()) {
            return next(errorHandler(400, 'Username must be lowercase'));
        }
        if (!username.match(/^[a-zA-Z0-9]+$/)) {
            return next(errorHandler(400, 'Username can only contain letters and numbers'));
        }
    }

    try {
        const hashedPassword = bcryptjs.hashSync(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role,
        });

        const response = await newUser.save();
        const { password: pass, ...rest } = response._doc;

        res.status(201).json(rest);
    } catch (error) {
        if (error.code === 11000 && error.keyValue.username) {
            return next(errorHandler(400, 'Username already exists'));
        }
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    if (!req.user.isAdmin && req.user.role !== 'admin') {
        return next(errorHandler(403, 'You are not allowed to see all users'));
    }
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        const users = await User.find().sort({ createdAt: sortDirection }).skip(startIndex).limit(limit);

        const usersWithoutPassword = users.map((user) => {
            const { password, ...rest } = user._doc;
            return rest;
        });

        const totalUsers = await User.countDocuments();

        const now = new Date();

        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastMonthUsers = await User.countDocuments({
            createdAt: { $gte: oneMonthAgo },
        });

        res.status(200).json({
            users: usersWithoutPassword,
            totalUsers,
            lastMonthUsers,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    const { username, password, role } = req.body;

    if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
        return next(errorHandler(403, 'You are not allowed to update this user'));
    }

    if (!username || !password || !role || username.trim() === '' || password.trim() === '') {
        return next(errorHandler(400, 'All fields are required'));
    }

    if (role !== 'user' && role !== 'guest' && role !== 'admin') {
        return next(errorHandler(400, 'Invalid role'));
    }

    if (password) {
        if (password.length < 6) {
            return next(errorHandler(400, 'Password must be at least 6 characters'));
        }
    }

    if (username) {
        if (username.length < 7 || username.length > 20) {
            return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
        }
        if (username.includes(' ')) {
            return next(errorHandler(400, 'Username cannot contain spaces'));
        }
        if (username !== username.toLowerCase()) {
            return next(errorHandler(400, 'Username must be lowercase'));
        }
        if (!username.match(/^[a-zA-Z0-9]+$/)) {
            return next(errorHandler(400, 'Username can only contain letters and numbers'));
        }
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            {
                $set: {
                    username: username,
                    password: hashedPassword,
                    role: role,
                    isAdmin: role === 'admin' ? true : false,
                },
            },
            { new: true },
        );
        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
        return next(errorHandler(403, 'You are not allowed to Delete this user'));
    }
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.status(200).json('User has been deleted');
    } catch (error) {
        next(error);
    }
};
