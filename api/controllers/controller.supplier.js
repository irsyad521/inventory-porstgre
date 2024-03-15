import Supplier from '../models/model.supplier.js';
import { errorHandler } from '../utils/error.js';

export const addSuplier = async (req, res, next) => {
    const { nama_pemasok, alamat, kontak } = req.body;

    if (!nama_pemasok || !alamat || !kontak || nama_pemasok === ' ' || alamat === ' ' || kontak === ' ') {
        return next(errorHandler(403, 'Please provide all required fields for supplier'));
    }

    if (req.user.role == 'guest' && req.user.isAdmin == false) {
        return next(errorHandler(403, 'You are not allowed create supplier'));
    }

    try {
        const newSupplier = {
            nama_pemasok: nama_pemasok.trim(),
            alamat: alamat.trim(),
            kontak: kontak.trim(),
        };

        const savedSupplier = await Supplier.create(newSupplier);

        res.status(201).json(savedSupplier);
    } catch (error) {
        next(error);
    }
};

export const getSupplier = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const validSortDirection = ['ASC', 'DESC'];
        const sortDirection = validSortDirection.includes(req.query.sortDirection) ? req.query.sortDirection : 'ASC';

        const suppliers = await Supplier.findAll({
            where: {
                ...(req.query.searchTerm && {
                    [Sequelize.Op.or]: [
                        { nama_pemasok: { [Sequelize.Op.iLike]: `%${req.query.searchTerm}%` } },
                        { alamat: { [Sequelize.Op.iLike]: `%${req.query.searchTerm}%` } },
                        { kontak: { [Sequelize.Op.iLike]: `%${req.query.searchTerm}%` } },
                    ],
                }),
            },
            order: [['updatedAt', sortDirection]],
            offset: startIndex,
            limit: limit,
        });

        const totalSuppliers = await Supplier.count();
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthSuppliers = await Supplier.count({
            createdAt: { $gte: oneMonthAgo },
        });

        res.status(200).json({
            suppliers,
            totalSuppliers,
            lastMonthSuppliers,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSupplier = async (req, res, next) => {
    if (req.user.role == 'guest' && req.user.isAdmin == false) {
        return next(errorHandler(403, 'You are not allowed delete supplier'));
    }
    try {
        const deletedSupplier = await Supplier.destroy({ where: { id: req.params.supplierId } });
        if (!deletedSupplier) {
            return next(errorHandler(404, 'Supplier not found'));
        }
        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateSupplier = async (req, res, next) => {
    const { nama_pemasok, alamat, kontak } = req.body;

    if (!nama_pemasok || !alamat || !kontak || nama_pemasok === ' ' || alamat === ' ' || kontak === ' ') {
        return next(errorHandler(403, 'Please provide all required fields for supplier'));
    }

    if (req.user.role == 'guest' && req.user.isAdmin == false) {
        return next(errorHandler(403, 'You are not allowed update supplier'));
    }

    try {
        const newSupplier = {
            nama_pemasok: nama_pemasok.trim(),
            alamat: alamat.trim(),
            kontak: kontak.trim(),
        };

        const updatedSupplier = await Supplier.update(newSupplier, {
            where: { id: req.params.supplierId },
            returning: true,
        });

        if (!updatedSupplier) {
            return next(errorHandler(404, 'Supplier not found'));
        }

        if (updatedSupplier[0] === 0) {
            return next(errorHandler(404, 'Supplier not found'));
        }

        res.status(200).json(updatedSupplier[1][0]);
    } catch (error) {
        next(error);
    }
};
