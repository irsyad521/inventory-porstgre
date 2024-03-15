import User from '../models/model.user.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    const { username, password, role } = req.body;

    if (role !== 'user' && role !== 'guest') {
        return next(errorHandler(400, 'Invalid role'));
    }

    if (!username || !password || !role || username.trim() === '' || password.trim() === '') {
        return next(errorHandler(400, 'All fields are required'));
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

export const signin = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password || username.trim() === '' || password.trim() === '') {
        return next(errorHandler(400, 'All fields are required'));
    }

    try {
        const validUser = await User.findOne({ username });
        if (!validUser) {
            return next(errorHandler(404, 'User not found'));
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(400, 'Invalid username or password'));
        }

        const token = jwt.sign(
            { id: validUser._id, isAdmin: validUser.isAdmin, role: validUser.role },
            process.env.JWT_SECRET,
        );

        const { password: pass, ...rest } = validUser._doc;

        res.status(200)
            .cookie('access_token', token, {
                httpOnly: true,
            })
            .json(rest);
    } catch (error) {
        next(error);
    }
};

export const signout = (req, res, next) => {
    try {
        res.clearCookie('access_token').status(200).json('User has been signed out');
    } catch (error) {
        next(error);
    }
};
