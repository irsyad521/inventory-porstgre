import { errorHandler } from '../utils/error.js';
import { validateItemFields } from '../utils/validate.js';
import {
    addItemRepository,
    deleteItemRepository,
    findSupplierByIdRepository,
    getItemsRepository,
    getLastMonthItemsRepository,
    getTotalItemsRepository,
    reloadItemWithSupplierRepository,
    updateItemInRepository,
} from '../repository/repository.item.js';

export const addItem = async (req, res, next) => {
    const { nama_barang, deskripsi, harga, pemasokId, gambar_barang } = req.body;

    try {
        if (req.user.role == 'guest' && req.user.isAdmin == false) {
            throw next(errorHandler(403, 'You are not allowed Add item'));
        }

        validateItemFields({ nama_barang, deskripsi, harga, pemasokId });

        const existingSupplier = await findSupplierByIdRepository(pemasokId);
        if (!existingSupplier) {
            throw next(errorHandler(404, 'Supplier not found'));
        }

        const slug = nama_barang
            .split(' ')
            .join('-')
            .toLowerCase()
            .replace(/[^a-zA-Z0-9-]/g, '');

        const newItemData = {
            nama_barang,
            deskripsi,
            harga,
            slug,
            pemasokId,
            gambar_barang,
        };

        const newItem = await addItemRepository(newItemData);
        const newItemWithSupplier = await reloadItemWithSupplierRepository(newItem);

        res.status(201).json(newItemWithSupplier);
    } catch (error) {
        if (error && error.name === 'SequelizeUniqueConstraintError' && error.fields && error.fields.slug) {
            throw next(errorHandler(400, 'Duplicate item name'));
        }
        next(error);
    }
};

export const getItem = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const order = req.query.order || 'desc';
        const searchTerm = req.query.searchTerm || '';
        const slug = req.query.slug || '';

        const items = await getItemsRepository(startIndex, limit, order, searchTerm, slug);
        const totalItems = await getTotalItemsRepository();
        const lastMonthItems = await getLastMonthItemsRepository();

        res.status(200).json({
            items,
            totalItems,
            lastMonthItems,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteItem = async (req, res, next) => {
    try {
        if (req.user.role == 'guest' && req.user.isAdmin == false) {
            throw next(errorHandler(403, 'You are not allowed delete item'));
        }
        const result = await deleteItemRepository(req.params.itemId);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateItem = async (req, res, next) => {
    const { nama_barang, deskripsi, harga, pemasokId, gambar_barang } = req.body;

    try {
        if (req.user.role == 'guest' && req.user.isAdmin == false) {
            throw errorHandler(403, 'You are not allowed update item');
        }

        validateItemFields({ nama_barang, deskripsi, harga, pemasokId });
        const existingSupplier = await findSupplierByIdRepository(pemasokId);
        if (!existingSupplier) {
            throw errorHandler(404, 'Supplier not found');
        }

        const updatedItem = await updateItemInRepository(req.params.itemId, {
            nama_barang,
            deskripsi,
            harga,
            pemasokId,
            gambar_barang,
        });

        if (!updatedItem) {
            throw errorHandler(404, 'Item not found');
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        next(error);
    }
};
