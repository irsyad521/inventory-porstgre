import { Op } from 'sequelize';
import Item from '../models/model.item.js';
import StockTransaction from '../models/model.stockTransaction.js';
import { errorHandler } from '../utils/error.js';
import Supplier from '../models/model.supplier.js';

export const addItem = async (req, res, next) => {
    const { nama_barang, deskripsi, harga, pemasokId, gambar_barang } = req.body;
    console.log(req.body);

    if (!nama_barang || !deskripsi || !harga || !pemasokId) {
        return next(errorHandler(400, 'Please provide all required fields'));
    }

    if (req.user.role == 'guest' && req.user.isAdmin == false) {
        return next(errorHandler(403, 'You are not allowed Add item'));
    }

    try {
        const existingSupplier = await Supplier.findByPk(pemasokId);
        if (!existingSupplier) {
            return next(errorHandler(404, 'Supplier not found'));
        }

        const slug = nama_barang
            .split(' ')
            .join('-')
            .toLowerCase()
            .replace(/[^a-zA-Z0-9-]/g, '');

        const newItem = await Item.create({
            nama_barang,
            deskripsi,
            harga,
            slug,
            pemasokId,
            gambar_barang,
        });

        await newItem.reload({
            include: {
                model: Supplier,
                as: 'pemasok',
            },
        });

        res.status(201).json(newItem);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError' && error.fields && error.fields.slug) {
            return next(errorHandler(400, 'Duplicate item name'));
        }
        next(error);
    }
};

export const getItem = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.order === 'asc' ? 'ASC' : 'DESC';

        const items = await Item.findAll({
            where: {
                ...(req.query.slug && { slug: req.query.slug }),
                ...(req.query.searchTerm && {
                    [Op.or]: [
                        { nama_barang: { [Op.iLike]: `%${req.query.searchTerm}%` } },
                        { deskripsi: { [Op.iLike]: `%${req.query.searchTerm}%` } },
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

        const totalItems = await Item.count();
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthItems = await Item.count({
            createdAt: { $gte: oneMonthAgo },
        });

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
    if (req.user.role == 'guest' && req.user.isAdmin == false) {
        return next(errorHandler(403, 'You are not allowed delete item'));
    }
    try {
        const deletedItem = await Item.findByPk(req.params.itemId);
        if (!deletedItem) {
            return next(errorHandler(404, 'Item not found'));
        }

        await StockTransaction.destroy({ where: { id_barang: req.params.itemId } });

        await deletedItem.destroy();

        res.status(200).json({ message: 'Item and stock transactions deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateItem = async (req, res, next) => {
    const { nama_barang, deskripsi, harga, pemasokId, gambar_barang } = req.body;
    if (!nama_barang || !deskripsi || !harga || !pemasokId) {
        return next(errorHandler(400, 'Please provide all required fields'));
    }

    if (req.user.role == 'guest' && req.user.isAdmin == false) {
        return next(errorHandler(403, 'You are not allowed update item'));
    }

    try {
        const existingSupplier = await Supplier.findByPk(pemasokId);
        if (!existingSupplier) {
            return next(errorHandler(404, 'Supplier not found'));
        }

        const slug = nama_barang
            .split(' ')
            .join('-')
            .toLowerCase()
            .replace(/[^a-zA-Z0-9-]/g, '');

        const [updatedRowCount, [updatedItem]] = await Item.update(
            { nama_barang, deskripsi, harga, slug, pemasokId, gambar_barang },
            {
                where: {
                    id: req.params.itemId,
                },
                returning: true,
            },
        );

        if (updatedRowCount === 0) {
            return next(errorHandler(404, 'Item not found'));
        }

        await updatedItem.reload({
            include: {
                model: Supplier,
                as: 'pemasok',
            },
        });

        res.status(200).json(updatedItem);
    } catch (error) {
        next(error);
    }
};
