import { Sequelize } from 'sequelize';
import { db } from '../database/db.js';
import Item from './model.item.js';

const { DataTypes } = Sequelize;

const StockTransaction = db.define(
    'StockTransaction',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        id_barang: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Item,
                key: 'id',
            },
        },
        jumlah: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        jenis: {
            type: DataTypes.ENUM('masuk', 'keluar'),
            allowNull: false,
        },
        tanggal: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    { timestamps: true },
);

StockTransaction.belongsTo(Item, { foreignKey: 'id_barang' });

export default StockTransaction;
