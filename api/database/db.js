import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const db = new Sequelize({
    username: process.env.USERNAME_SQL,
    database: process.env.DATABASE_SQL,
    password: process.env.PASSWORD_SQL,
    host: process.env.HOST_SQL,
    port: process.env.PORT_SQL,
    dialect: process.env.DIALECT_SQL,
});

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGGO);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
