import User from '../models/model.user.js';

export const createUserWithRoleRepository = async (username, hashedPassword, role) => {
    try {
        const newUser = new User({
            username,
            password: hashedPassword,
            role,
        });

        return await newUser.save();
    } catch (error) {
        throw error;
    }
};

export const getAllUsersRepository = async (startIndex, limit, sort) => {
    try {
        const sortDirection = sort === 'asc' ? 1 : -1;

        const users = await User.find({}, { password: 0 })
            .sort({ createdAt: sortDirection })
            .skip(parseInt(startIndex))
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments();

        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });

        return {
            users,
            totalUsers,
            lastMonthUsers,
        };
    } catch (error) {
        throw error;
    }
};

export const updateUserRepository = async (userId, updateData) => {
    try {
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw errorHandler(404, 'User not found');
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
        return updatedUser;
    } catch (error) {
        throw error;
    }
};

export const deleteUserRepository = async (userId) => {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        return deletedUser;
    } catch (error) {
        throw error;
    }
};
