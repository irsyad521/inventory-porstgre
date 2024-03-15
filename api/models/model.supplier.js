import { Sequelize } from 'sequelize';
import { db } from '../database/db.js';

const { DataTypes } = Sequelize;

const Supplier = db.define(
    'Supplier',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        nama_pemasok: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        alamat: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        kontak: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: true,
    },
);

export default Supplier;
