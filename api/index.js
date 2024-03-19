import express from 'express';
import dotenv from 'dotenv';
import { connectDB, db } from './database/db.js';
import itemsRoutes from './routes/router.item.js';
import supplierRoutes from './routes/router.supplier.js';
import stockTransactionRoutes from './routes/router.stockTransaction.js';
import authRoutes from './routes/router.auth.js';
import userRoutes from './routes/router.user.js';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const __dirname = path.resolve();

app.use('/api/items', itemsRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/stock-transactions', stockTransactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use(express.static(path.join(__dirname, './dist')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist', 'index.html'));
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

export default app;

db.authenticate()
    .then(() => {
        // console.log('Sequelize connected');
    })
    .catch((err) => {
        console.error('Sequelize connection failed:', err);
    });

connectDB()
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error(err);
    });
