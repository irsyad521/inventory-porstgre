import request from 'supertest';
import app from '../../api/index.js';
import {
    createStockTransactionRepository,
    getAllStockTransactionsRepository,
    getItemByIdRepository,
    getStockTransactionsByYearAndItemIdRepository,
    getTotalStockTransactionsRepository,
    updateItemStockRepository,
} from '../../api/repository/repository.stockTransaction.js';
import { generateToken } from '../../api/utils/generatedToken.js';
import { response } from 'express';

afterAll(() => {
    jest.clearAllMocks();
});

jest.mock('../../api/repository/repository.stockTransaction.js', () => ({
    createStockTransactionRepository: jest.fn(),
    getAllStockTransactionsRepository: jest.fn(),
    getItemByIdRepository: jest.fn(),
    getStockTransactionsByYearAndItemIdRepository: jest.fn(),
    getTotalStockTransactionsRepository: jest.fn(),
    updateItemStockRepository: jest.fn(),
}));

describe('POST /api/stock-transactions/add', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add a stock transaction', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockedStockTransaction = {
            id_barang: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            jumlah: 20,
            tanggal: '2022-02-03',
            jenis: 'masuk',
        };
        const mockedItem = {
            id: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            stock: 5,
        };

        const mockReqBody = {
            id_barang: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            jumlah: 20,
            tanggal: '2022-02-03',
            jenis: 'masuk',
        };

        getItemByIdRepository.mockResolvedValueOnce(mockedItem);
        createStockTransactionRepository.mockResolvedValueOnce(mockedStockTransaction);
        updateItemStockRepository.mockResolvedValueOnce();

        const response = await request(app)
            .post('/api/stock-transactions/add')
            .send(mockReqBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(getItemByIdRepository).toHaveBeenCalledWith('a747dc1d-efe8-4f5a-96e8-59af97819279');
        expect(updateItemStockRepository).toHaveBeenCalledWith('a747dc1d-efe8-4f5a-96e8-59af97819279', 25); // 5 (existing) + 20 (new)
        expect(createStockTransactionRepository).toHaveBeenCalledWith(mockedStockTransaction);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockedStockTransaction);
    });

    it('should return 400 if requested quantity exceeds available stock for outgoing transaction', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockedItem = {
            id: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            stock: 5,
        };

        const mockReqBody = {
            id_barang: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            jumlah: 10,
            tanggal: '2022-02-03',
            jenis: 'keluar',
        };

        getItemByIdRepository.mockResolvedValueOnce(mockedItem);

        const response = await request(app)
            .post('/api/stock-transactions/add')
            .send(mockReqBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Requested quantity exceeds available stock');
    });

    it('should update stock correctly for incoming transaction', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockedItem = {
            id: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            stock: 5,
        };

        const mockReqBody = {
            id_barang: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            jumlah: 10,
            tanggal: '2022-02-03',
            jenis: 'masuk',
        };

        getItemByIdRepository.mockResolvedValueOnce(mockedItem);

        const response = await request(app)
            .post('/api/stock-transactions/add')
            .send(mockReqBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(updateItemStockRepository).toHaveBeenCalledWith('a747dc1d-efe8-4f5a-96e8-59af97819279', 15); // 5 (existing) + 10 (new)
    });

    it('should update stock correctly for outgoing transaction', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockedItem = {
            id: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            stock: 15, // Assumed initial stock is 15
        };

        const mockReqBody = {
            id_barang: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            jumlah: 10,
            tanggal: '2022-02-03',
            jenis: 'keluar',
        };

        getItemByIdRepository.mockResolvedValueOnce(mockedItem);

        const response = await request(app)
            .post('/api/stock-transactions/add')
            .send(mockReqBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(updateItemStockRepository).toHaveBeenCalledWith('a747dc1d-efe8-4f5a-96e8-59af97819279', 5); // 15 (existing) - 10 (outgoing)
    });

    it('should handle errors correctly', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockedItem = {
            id: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            stock: 15,
        };

        const mockReqBody = {
            id_barang: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            jumlah: 10,
            tanggal: '2022-02-03',
            jenis: 'masuk',
        };

        getItemByIdRepository.mockResolvedValueOnce(mockedItem);
        createStockTransactionRepository.mockRejectedValueOnce(new Error('Failed to create stock transaction'));

        const nextMock = jest.fn();

        await request(app)
            .post('/api/stock-transactions/add')
            .send(mockReqBody)
            .set('Cookie', [`access_token=${adminToken}`])
            .expect(500);

        expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
        expect(nextMock.mock.calls[0][0].message).toBe('Failed to create stock transaction');
    });

    it('should return 401 unauthorized', async () => {
        const guestPayload = { id: 'mockGuestId', isAdmin: false, role: 'guest' };
        const guestToken = generateToken(guestPayload);
        const mockReqBody = {
            id_barang: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            jumlah: 20,
            tanggal: '2022-02-03',
            jenis: 'masuk',
        };

        getItemByIdRepository.mockResolvedValueOnce(null);

        const response = await request(app)
            .post('/api/stock-transactions/add')
            .send(mockReqBody)
            .set('Cookie', [`access_token=${guestToken}`]);

        expect(response.body).toEqual({
            success: false,
            statusCode: 403,
            message: 'You are not allowed add stock transaction',
        });
    });

    it('should return 404 if item not found', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockReqBody = {
            id_barang: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
            jumlah: 20,
            tanggal: '2022-02-03',
            jenis: 'masuk',
        };

        getItemByIdRepository.mockResolvedValueOnce(null);

        const response = await request(app)
            .post('/api/stock-transactions/add')
            .send(mockReqBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(getItemByIdRepository).toHaveBeenCalledWith('a747dc1d-efe8-4f5a-96e8-59af97819279');
        expect(response.status).toBe(404);
    });
});

describe('GET /api/stock-transactions/get', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return stock transactions with default parameters', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockedStockTransactions = [
            { id: '1', jumlah: 10, tanggal: '2022-01-01', jenis: 'masuk', id_barang: 'abc123' },
        ];
        const mockedTotalStockTransactions = 100;

        getAllStockTransactionsRepository.mockResolvedValueOnce(mockedStockTransactions);
        getTotalStockTransactionsRepository.mockResolvedValueOnce(mockedTotalStockTransactions);

        const response = await request(app)
            .get('/api/stock-transactions/get')
            .set('Cookie', [`access_token=${adminToken}`]);
        expect(getTotalStockTransactionsRepository).toHaveBeenCalled();
        expect(response.body.stockTransactions).toEqual(mockedStockTransactions);
        expect(response.body.totalStockTransactions).toBe(mockedTotalStockTransactions);
    });

    it('should return stock transactions with custom parameters', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockedStockTransactions = [
            { id: '1', jumlah: 10, tanggal: '2022-01-01', jenis: 'masuk', id_barang: 'abc123' },
        ];
        const mockedTotalStockTransactions = 100;

        getAllStockTransactionsRepository.mockResolvedValueOnce(mockedStockTransactions);
        getTotalStockTransactionsRepository.mockResolvedValueOnce(mockedTotalStockTransactions);

        const customParams = {
            startIndex: 10,
            limit: 25,
            order: 'asc',
            jenis: 'keluar',
            id_barang: 'xyz789',
        };

        const response = await request(app)
            .get('/api/stock-transactions/get')
            .query(customParams)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(getAllStockTransactionsRepository).toHaveBeenCalledWith(
            customParams.startIndex,
            customParams.limit,
            customParams.order,
            customParams.jenis,
            customParams.id_barang,
        );
        expect(getTotalStockTransactionsRepository).toHaveBeenCalled();
        expect(response.body.stockTransactions).toEqual(mockedStockTransactions);
        expect(response.body.totalStockTransactions).toBe(mockedTotalStockTransactions);
    });

    it('should handle errors correctly', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const error = new Error('Internal Server Error');
        getAllStockTransactionsRepository.mockRejectedValueOnce(error);

        const response = await request(app)
            .get('/api/stock-transactions/get')
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.body.message).toBe('Internal Server Error');
    });
});

describe('GET /api/stock-transactions/year-item', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return stock transactions for the specified year and item ID', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockedYear = 2022;
        const mockedItemId = 'abc123';
        const mockedStockTransactions = [
            { id: '1', jumlah: 10, tanggal: '2022-01-01', jenis: 'masuk', id_barang: 'abc123' },
            { id: '2', jumlah: 5, tanggal: '2022-01-15', jenis: 'keluar', id_barang: 'abc123' },
            { id: '3', jumlah: 8, tanggal: '2022-02-01', jenis: 'masuk', id_barang: 'abc123' },
        ];

        getStockTransactionsByYearAndItemIdRepository.mockResolvedValueOnce(mockedStockTransactions);

        const response = await request(app)
            .get('/api/stock-transactions/getyear')
            .query({ year: mockedYear, id_barang: mockedItemId })
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(getStockTransactionsByYearAndItemIdRepository).toHaveBeenCalledWith(mockedYear, mockedItemId);
        expect(response.body.year).toBe(mockedYear);
        expect(response.body.stockTransactions).toEqual(mockedStockTransactions);

        let totalStockIn = 0;
        let totalStockOut = 0;
        mockedStockTransactions.forEach((transaction) => {
            if (transaction.jenis === 'masuk') {
                totalStockIn += transaction.jumlah;
            } else if (transaction.jenis === 'keluar') {
                totalStockOut += transaction.jumlah;
            }
        });
        const expectedEndingStock = totalStockIn - totalStockOut;

        expect(response.body.totalStockIn).toBe(totalStockIn);
        expect(response.body.totalStockOut).toBe(totalStockOut);
        expect(response.body.endingStock).toBe(expectedEndingStock);
    });

    it('should handle errors correctly', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const error = new Error('Internal Server Error');
        getStockTransactionsByYearAndItemIdRepository.mockRejectedValueOnce(error);

        const response = await request(app)
            .get('/api/stock-transactions/getyear')
            .query({ year: 2022, id_barang: 'abc123' })
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.body.message).toBe('Internal Server Error');
    });
});
