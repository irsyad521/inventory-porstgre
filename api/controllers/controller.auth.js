import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import { createUserRepository, findUserByUsername } from '../repository/repository.auth.js';
import { validateUsername, validatePassword } from '../utils/validate.js';
import { generateToken } from '../utils/generatedToken.js';

export const signup = async (req, res, next) => {
    let { username, password } = req.body;

    try {
        validateUsername(username);
        validatePassword(password);
        username = username.trim();
        password = password.trim();

        const hashedPassword = bcryptjs.hashSync(password, 10);

        const response = await createUserRepository(username, hashedPassword);

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
    let { username, password } = req.body;

    try {
        validateUsername(username);
        validatePassword(password);
        username = username.trim();
        password = password.trim();

        const validUser = await findUserByUsername(username);
        if (!validUser) {
            throw next(errorHandler(404, 'User not found'));
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);

        if (!validPassword) {
            throw next(errorHandler(400, 'Invalid username or password'));
        }

        let isAdminToken = false;
        if (validUser.isAdmin) {
            isAdminToken = true;
        }

        const userToken = generateToken({ id: validUser._id, isAdmin: isAdminToken, role: validUser.role });

        const { password: pass, ...rest } = validUser._doc;

        res.status(200)
            .cookie('access_token', userToken, {
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
