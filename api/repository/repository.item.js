import Item from '../models/model.item.js';
import StockTransaction from '../models/model.stockTransaction.js';
import Supplier from '../models/model.supplier.js';
import { Op } from 'sequelize';
export const addItemRepository = async (itemData) => {
    try {
        const newItem = await Item.create(itemData);
        return newItem;
    } catch (error) {
        throw error;
    }
};

export const findSupplierByIdRepository = async (supplierId) => {
    try {
        const existingSupplier = await Supplier.findByPk(supplierId);
        return existingSupplier;
    } catch (error) {
        throw error;
    }
};

export const reloadItemWithSupplierRepository = async (item) => {
    try {
        await item.reload({
            include: {
                model: Supplier,
                as: 'pemasok',
            },
        });
        return item;
    } catch (error) {
        throw error;
    }
};

export const getItemsRepository = async (startIndex = 0, limit = 9, order = 'desc', searchTerm = '', slug = '') => {
    try {
        const sortDirection = order === 'asc' ? 'ASC' : 'DESC';

        const items = await Item.findAll({
            where: {
                ...(slug && { slug }),
                ...(searchTerm && {
                    [Op.or]: [
                        { nama_barang: { [Op.iLike]: `%${searchTerm}%` } },
                        { deskripsi: { [Op.iLike]: `%${searchTerm}%` } },
                    ],
                }),
            },
            include: {
                model: Supplier,
                as: 'pemasok',
            },
            order: [['updatedAt', sortDirection]],
            offset: startIndex,
            limit: limit,
        });

        return items;
    } catch (error) {
        throw error;
    }
};

export const getTotalItemsRepository = async () => {
    try {
        const totalItems = await Item.count();
        return totalItems;
    } catch (error) {
        throw error;
    }
};

export const getLastMonthItemsRepository = async () => {
    try {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthItems = await Item.count({
            where: { createdAt: { [Op.gte]: oneMonthAgo } },
        });

        return lastMonthItems;
    } catch (error) {
        throw error;
    }
};

export const deleteItemRepository = async (itemId) => {
    try {
        const deletedItem = await Item.findByPk(itemId);
        if (!deletedItem) {
            throw new Error('Item not found');
        }

        await StockTransaction.destroy({ where: { id_barang: itemId } });

        await deletedItem.destroy();

        return { message: 'Item and stock transactions deleted successfully' };
    } catch (error) {
        throw error;
    }
};

export const updateItemInRepository = async (itemId, updatedFields) => {
    try {
        const { nama_barang, deskripsi, harga, pemasokId, gambar_barang } = updatedFields;

        const slug = nama_barang
            .split(' ')
            .join('-')
            .toLowerCase()
            .replace(/[^a-zA-Z0-9-]/g, '');

        const [updatedRowCount, [updatedItem]] = await Item.update(
            { nama_barang, deskripsi, harga, slug, pemasokId, gambar_barang },
            {
                where: {
                    id: itemId,
                },
                returning: true,
            },
        );

        if (updatedRowCount === 0) {
            return null;
        }

        await updatedItem.reload({
            include: {
                model: Supplier,
                as: 'pemasok',
            },
        });

        return updatedItem;
    } catch (error) {
        throw error;
    }
};
