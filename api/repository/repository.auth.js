import User from '../models/model.user.js';

export const createUserRepository = async (username, hashedPassword) => {
    try {
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        return await newUser.save();
    } catch (error) {
        throw error;
    }
};

export const findUserByUsername = async (username) => {
    try {
        return await User.findOne({ username });
    } catch (error) {
        throw error;
    }
};
