import { errorHandler } from '../utils/error.js';
import { validateTransactionDate, validateTransactionType, validateTransactionQuantity } from '../utils/validate.js';
import {
    createStockTransactionRepository,
    getAllStockTransactionsRepository,
    getItemByIdRepository,
    getStockTransactionsByYearAndItemIdRepository,
    getTotalStockTransactionsRepository,
    updateItemStockRepository,
} from '../repository/repository.stockTransaction.js';

export const addStockTransaction = async (req, res, next) => {
    try {
        const { id_barang, jumlah, tanggal, jenis } = req.body;
        const { user } = req;

        if (user.role === 'guest' && !user.isAdmin) {
            return next(errorHandler(403, 'You are not allowed add stock transaction'));
        }

        validateTransactionDate(tanggal);
        validateTransactionType(jenis);
        validateTransactionQuantity(jumlah);

        const existingItem = await getItemByIdRepository(id_barang);
        if (!existingItem) {
            return next(errorHandler(404, 'Item not found'));
        }

        if (jenis === 'keluar' && existingItem.stock < jumlah) {
            return next(errorHandler(400, 'Requested quantity exceeds available stock'));
        }

        let updatedStock;
        if (jenis === 'masuk') {
            updatedStock = existingItem.stock + jumlah;
        } else {
            updatedStock = existingItem.stock - jumlah;
        }

        await updateItemStockRepository(id_barang, updatedStock);

        const newStockTransaction = await createStockTransactionRepository({
            id_barang,
            jumlah,
            tanggal,
            jenis,
        });

        res.status(201).json(newStockTransaction);
    } catch (error) {
        next(error);
    }
};

export const getStockTransactions = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 50;
        const order = req.query.order || 'desc';
        const jenis = req.query.jenis || null;
        const id_barang = req.query.id_barang || null;

        const stockTransactions = await getAllStockTransactionsRepository(startIndex, limit, order, jenis, id_barang);
        const totalStockTransactions = await getTotalStockTransactionsRepository();

        res.status(200).json({
            stockTransactions,
            totalStockTransactions,
        });
    } catch (error) {
        next(error);
    }
};

export const getStockTransactionsByYearAndItemId = async (req, res, next) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const id_barang = req.query.id_barang;

        const stockTransactions = await getStockTransactionsByYearAndItemIdRepository(year, id_barang);

        let totalStockIn = 0;
        let totalStockOut = 0;
        stockTransactions.forEach((transaction) => {
            if (transaction.jenis === 'masuk') {
                totalStockIn += transaction.jumlah;
            } else if (transaction.jenis === 'keluar') {
                totalStockOut += transaction.jumlah;
            }
        });

        const endingStock = totalStockIn - totalStockOut;

        const response = {
            year: year,
            totalStockIn: totalStockIn,
            totalStockOut: totalStockOut,
            endingStock: endingStock,
            stockTransactions: stockTransactions,
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};
