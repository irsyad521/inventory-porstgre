import { Op } from 'sequelize';
import StockTransaction from '../models/model.stockTransaction.js';
import Item from '../models/model.item.js';
import { errorHandler } from '../utils/error.js';
import { isValidDate } from '../utils/validate.js';

export const addStockTransaction = async (req, res, next) => {
    const { id_barang, jumlah, tanggal, jenis } = req.body;

    if (req.user.role == 'guest' && req.user.isAdmin == false) {
        return next(errorHandler(403, 'You are not allowed add stock transaction'));
    }

    try {
        if (!isValidDate(tanggal)) {
            return next(errorHandler(400, 'Invalid transaction date'));
        }

        if (jenis !== 'masuk' && jenis !== 'keluar') {
            return next(errorHandler(400, 'Invalid transaction type'));
        }

        if (parseInt(jumlah) <= 0) {
            return next(errorHandler(400, 'Transaction quantity must be a positive integer'));
        }

        const existingItem = await Item.findByPk(id_barang);
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

        await Item.update({ stock: updatedStock }, { where: { id: id_barang } });

        const newStockTransaction = await StockTransaction.create({
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
        const sortDirection = req.query.order === 'asc' ? 'ASC' : 'DESC';

        const whereClause = {};
        if (req.query.jenis) {
            whereClause.jenis = req.query.jenis;
        }
        if (req.query.id_barang) {
            whereClause.id_barang = req.query.id_barang;
        }
        if (req.query.searchTerm) {
            whereClause[Op.or] = [
                { jenis: { [Op.iLike]: `%${req.query.searchTerm}%` } },
                { id_barang: { [Op.iLike]: `%${req.query.searchTerm}%` } },
            ];
        }

        const stockTransactions = await StockTransaction.findAll({
            where: whereClause,
            order: [['tanggal', sortDirection]],
            offset: startIndex,
            limit: limit,
        });

        const totalStockTransactions = await StockTransaction.count();

        res.status(200).json({
            stockTransactions,
            totalStockTransactions,
        });
    } catch (error) {
        next(error);
    }
};

export const getStockTransactionsByMonth = async (req, res, next) => {
    try {
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const id_barang = req.query.id_barang;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const whereClause = {
            tanggal: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
            },
        };

        if (id_barang) {
            whereClause.id_barang = id_barang;
        }

        const stockTransactions = await StockTransaction.findAll({
            where: whereClause,
        });

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
            month: month,
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

export const getStockTransactionsByYearAndItemId = async (req, res, next) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const id_barang = req.query.id_barang;

        const startDate = new Date(year, 0);
        const endDate = new Date(year + 1, 0);

        const whereClause = {
            tanggal: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
        };

        if (id_barang) {
            whereClause.id_barang = id_barang;
        }

        const stockTransactions = await StockTransaction.findAll({
            where: whereClause,
        });

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
