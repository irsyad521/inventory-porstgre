import express from 'express';
import {
    addStockTransaction,
    getStockTransactions,
    getStockTransactionsByYearAndItemId,
} from '../controllers/controller.stockTransaction.js';
import { verifyToken } from '../utils/verifiyUser.js';

const router = express.Router();

router.post('/add', verifyToken, addStockTransaction);
router.get('/get', verifyToken, getStockTransactions);
router.get('/getyear', verifyToken, getStockTransactionsByYearAndItemId);

export default router;
