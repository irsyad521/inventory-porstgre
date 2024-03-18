import mongoose from 'mongoose';
import User from '../models/model.user.js';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGGO);

const initialUsers = [
    {
        username: 'adminpassword',
        password: '$2a$10$23uTpZYZ/8..9WyMLUHHSOC6OEHtkWBf9x5s651unUk15QB4r3tZu', // adminpassword
        isAdmin: true,
        role: 'admin',
    },
    {
        username: 'userpassword',
        password: '$2a$10$Khbw00qyzKbQB0DHOe8.Q.zv.BF2XNvHStEjwq6WvbbTI4p3zT2qW', // userpassword
        isAdmin: false,
        role: 'user',
    },
    {
        username: 'guestpassword',
        password: '$2a$10$BX.7ZWPwpuq/8.T8e2KLuenSufUDdErSuYIsRDQ.qEw.6iDCqdLjO', // guestpassword
        isAdmin: false,
        role: 'guest',
    },
];

async function seedDatabase() {
    try {
        await User.deleteMany();
        await User.insertMany(initialUsers);
        console.log('Seeder berhasil menambahkan data ke koleksi users.');
    } catch (error) {
        console.error('Seeder gagal:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();
