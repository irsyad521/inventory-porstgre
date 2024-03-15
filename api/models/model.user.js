import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ['admin', 'user', 'guest'],
            default: 'guest',
        },
    },
    { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
