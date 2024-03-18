import User from '../models/model.user.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { validatePassword, validateUsername } from '../utils/validate.js';

export const signup = async (req, res, next) => {
    const { username, password } = req.body;

    username = username.trim();
    password = password.trim();

    validateUsername(username);
    validatePassword(password);

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

    username = username.trim();
    password = password.trim();

    validateUsername(username);
    validatePassword(password);

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
            { expiresIn: '1h' },
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
