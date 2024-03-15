import { Sequelize } from 'sequelize';
import { db } from '../database/db.js';
import Supplier from './model.supplier.js';

const { DataTypes } = Sequelize;

const Item = db.define(
    'Item',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        nama_barang: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        deskripsi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        harga: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        pemasokId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Suppliers',
                key: 'id',
            },
        },
        gambar_barang: {
            type: DataTypes.STRING,
            defaultValue: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        },
    },
    { timestamps: true },
);

Item.belongsTo(Supplier, { foreignKey: 'pemasokId', as: 'pemasok' });
Supplier.hasMany(Item, { foreignKey: 'pemasokId', as: 'pemasok' });

export default Item;
