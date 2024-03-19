import { errorHandler } from '../utils/error.js';
export const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
};

export const validateTransactionDate = (tanggal) => {
    if (!isValidDate(tanggal)) {
        throw errorHandler(400, 'Invalid transaction date');
    }
};

export const validateUsername = (username) => {
    if (!username || username === '') {
        throw errorHandler(400, 'Username is required');
    }
    if (username.length < 7 || username.length > 20) {
        throw errorHandler(400, 'Username must be between 7 and 20 characters');
    }
    if (username.includes(' ')) {
        throw errorHandler(400, 'Username cannot contain spaces');
    }
    if (username !== username.toLowerCase()) {
        throw errorHandler(400, 'Username must be lowercase');
    }
    if (!username.match(/^[a-zA-Z0-9]+$/)) {
        throw errorHandler(400, 'Username can only contain letters and numbers');
    }
};

export const validatePassword = (password) => {
    if (!password || password === '') {
        throw errorHandler(400, 'Password is required');
    }
    if (password.length < 6) {
        throw errorHandler(400, 'Password must be at least 6 characters');
    }
};

export const validateItemFields = ({ nama_barang, deskripsi, harga, pemasokId }) => {
    if (!nama_barang || !deskripsi || !harga || !pemasokId) {
        throw errorHandler(400, 'Please provide all required fields');
    }
};

export const validateSupplierFields = ({ nama_pemasok, alamat, kontak }) => {
    if (!nama_pemasok || !alamat || !kontak || nama_pemasok === '' || alamat === '' || kontak === '') {
        throw errorHandler(400, 'Please provide all required fields for supplier');
    }
};

export const validateRole = (role) => {
    if (role !== 'user' && role !== 'guest') {
        throw errorHandler(400, 'Invalid role');
    }
};

export const validateTransactionType = (jenis) => {
    if (jenis !== 'masuk' && jenis !== 'keluar') {
        throw errorHandler(400, 'Invalid transaction type');
    }
};

export const validateTransactionQuantity = (jumlah) => {
    if (parseInt(jumlah) <= 0) {
        throw errorHandler(400, 'Transaction quantity must be a positive integer');
    }
};
