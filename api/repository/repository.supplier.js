import Supplier from '../models/model.supplier.js';

export const createSupplierRepository = async (nama_pemasok, alamat, kontak) => {
    try {
        return await Supplier.create({ nama_pemasok, alamat, kontak });
    } catch (error) {
        throw error;
    }
};

export const getSuppliersRepository = async ({ searchTerm, startIndex = 0, limit = 9, sortDirection = 'ASC' }) => {
    try {
        const suppliers = await Supplier.findAll({
            where: {
                ...(searchTerm && {
                    [Sequelize.Op.or]: [
                        { nama_pemasok: { [Sequelize.Op.iLike]: `%${searchTerm}%` } },
                        { alamat: { [Sequelize.Op.iLike]: `%${searchTerm}%` } },
                        { kontak: { [Sequelize.Op.iLike]: `%${searchTerm}%` } },
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
            where: { createdAt: { $gte: oneMonthAgo } },
        });

        return {
            suppliers,
            totalSuppliers,
            lastMonthSuppliers,
        };
    } catch (error) {
        throw error;
    }
};

export const deleteSupplierRepository = async (supplierId) => {
    try {
        return await Supplier.destroy({ where: { id: supplierId } });
    } catch (error) {
        throw error;
    }
};

export const updateSupplierRepository = async (supplierId, updatedSupplierData) => {
    try {
        return await Supplier.update(updatedSupplierData, {
            where: { id: supplierId },
            returning: true,
        });
    } catch (error) {
        throw error;
    }
};
