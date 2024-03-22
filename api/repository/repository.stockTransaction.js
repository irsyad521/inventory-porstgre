import StockTransaction from '../models/model.stockTransaction.js';
import Item from '../models/model.item.js';
import { Op } from 'sequelize';

export const getItemByIdRepository = async (itemId) => {
    try {
        return await Item.findByPk(itemId);
    } catch (error) {
        throw error;
    }
};

export const updateItemStockRepository = async (itemId, updatedStock) => {
    try {
        return await Item.update({ stock: updatedStock }, { where: { id: itemId } });
    } catch (error) {
        throw error;
    }
};

export const createStockTransactionRepository = async (transactionData) => {
    try {
        return await StockTransaction.create(transactionData);
    } catch (error) {
        throw error;
    }
};

export const getAllStockTransactionsRepository = async (startIndex, limit, order, jenis, id_barang) => {
    try {
        const sortDirection = order === 'asc' ? 'ASC' : 'DESC';
        const whereClause = {};

        if (jenis) {
            whereClause.jenis = jenis;
        }
        if (id_barang) {
            whereClause.id_barang = id_barang;
        }

        return await StockTransaction.findAll({
            where: whereClause,
            order: [['tanggal', sortDirection]],
            offset: startIndex,
            limit: limit,
        });
    } catch (error) {
        throw error;
    }
};

export const getTotalStockTransactionsRepository = async () => {
    try {
        return await StockTransaction.count();
    } catch (error) {
        throw error;
    }
};

export const getStockTransactionsByYearAndItemIdRepository = async (year, id_barang) => {
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

    try {
        return await StockTransaction.findAll({
            where: whereClause,
        });
    } catch (error) {
        throw error;
    }
};
