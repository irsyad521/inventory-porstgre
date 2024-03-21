import Supplier from '../models/model.supplier.js';
import {
    createSupplierRepository,
    deleteSupplierRepository,
    getSuppliersRepository,
    updateSupplierRepository,
} from '../repository/repository.supplier.js';
import { errorHandler } from '../utils/error.js';
import { validateSupplierFields } from '../utils/validate.js';

export const addSuplier = async (req, res, next) => {
    let { nama_pemasok, alamat, kontak } = req.body;

    try {
        if (req.user.role == 'guest' && req.user.isAdmin == false) {
            throw next(errorHandler(403, 'You are not allowed create supplier'));
        }

        validateSupplierFields({ nama_pemasok, alamat, kontak });

        const savedSupplier = await createSupplierRepository(nama_pemasok.trim(), alamat.trim(), kontak.trim());

        res.status(201).json(savedSupplier);
    } catch (error) {
        next(error);
    }
};

export const getSupplier = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sortDirection || 'ASC';
        const searchTerm = req.query.searchTerm || '';

        const { suppliers, totalSuppliers, lastMonthSuppliers } = await getSuppliersRepository({
            searchTerm,
            startIndex,
            limit,
            sortDirection,
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
    try {
        if (req.user.role === 'guest' && req.user.isAdmin === false) {
            throw next(errorHandler(403, 'You are not allowed to delete supplier'));
        }
        const deletedSupplier = await deleteSupplierRepository(req.params.supplierId);

        if (deletedSupplier === 0) {
            throw next(errorHandler(404, 'Supplier not found'));
        }
        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateSupplier = async (req, res, next) => {
    let { nama_pemasok, alamat, kontak } = req.body;
    if (req.user.role === 'guest' && req.user.isAdmin === false) {
        return next(errorHandler(403, 'You are not allowed to update supplier'));
    }

    try {
        validateSupplierFields({ nama_pemasok, alamat, kontak });

        const [rowsAffected, [updatedSupplier]] = await updateSupplierRepository(req.params.supplierId, {
            nama_pemasok,
            alamat,
            kontak,
        });

        if (rowsAffected === 0) {
            return next(errorHandler(404, 'Supplier not found'));
        }

        res.status(200).json(updatedSupplier);
    } catch (error) {
        next(error);
    }
};
