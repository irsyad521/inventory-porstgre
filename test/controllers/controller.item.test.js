import request from 'supertest';
import app from '../../api/index.js';
import {
    addItemRepository,
    deleteItemRepository,
    findSupplierByIdRepository,
    getItemsRepository,
    getLastMonthItemsRepository,
    getTotalItemsRepository,
    reloadItemWithSupplierRepository,
    updateItemInRepository,
} from '../../api/repository/repository.item.js';
import { generateToken } from '../../api/utils/generatedToken.js';

afterAll(() => {
    jest.clearAllMocks();
});

jest.mock('../../api/repository/repository.item.js', () => ({
    addItemRepository: jest.fn(),
    findSupplierByIdRepository: jest.fn(),
    reloadItemWithSupplierRepository: jest.fn(),
    getItemsRepository: jest.fn(),
    getLastMonthItemsRepository: jest.fn(),
    getTotalItemsRepository: jest.fn(),
    deleteItemRepository: jest.fn(),
    updateItemInRepository: jest.fn(),
}));

describe('POST /api/items/add', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('create Item successfully', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);

        const mockSupplierData = {
            id: 'mockedSupplierId',
            nama_pemasok: 'Supplier Test',
            alamat: 'Jl. Test No. 123',
            kontak: '081234567890',
        };

        findSupplierByIdRepository.mockResolvedValueOnce(mockSupplierData);

        const requestBody = {
            id: 'mockedItemId',
            nama_barang: 'minum',
            deskripsi: 'roti yang dibakar',
            harga: 8000,
            pemasokId: '18509a21-2777-4d04-8108-76d1b7ccca79',
        };

        addItemRepository.mockResolvedValueOnce({
            ...requestBody,
        });

        reloadItemWithSupplierRepository.mockResolvedValueOnce({
            ...requestBody,
            pemasok: mockSupplierData,
        });

        const response = await request(app)
            .post('/api/items/add')
            .send(requestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(201);

        expect(response.body.id).toBeDefined();
        expect(response.statusCode).toBe(201);
    });

    it('throws forbidden error for guest user', async () => {
        const guestPayload = { id: 'mockGuestId', isAdmin: false, role: 'guest' };
        const guestToken = generateToken(guestPayload);

        const requestBody = {
            nama_barang: 'minum',
            deskripsi: 'roti yang dibakar',
            harga: 8000,
            pemasokId: '18509a21-2777-4d04-8108-76d1b7ccca79',
        };

        const response = await request(app)
            .post('/api/items/add')
            .send(requestBody)
            .set('Cookie', [`access_token=${guestToken}`]);

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not allowed Add item');
    });

    it('throws not found error if supplier not found', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);

        const requestBody = {
            nama_barang: 'minum',
            deskripsi: 'roti yang dibakar',
            harga: 8000,
            pemasokId: '18509a21-2777-4d04-8108-76d1b7ccca79',
        };

        findSupplierByIdRepository.mockResolvedValueOnce(null);

        const response = await request(app)
            .post('/api/items/add')
            .send(requestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Supplier not found');
    });
});

describe('GET /api/items/get', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('returns items, total items, and last month items successfully', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockItems = [
            {
                id: 'a747dc1d-efe8-4f5a-96e8-59af97819279',
                nama_barang: 'ayam122',
                deskripsi: 'ayam tiren',
                harga: 10000,
                slug: 'ayam122',
                stock: 0,
                pemasokId: '90f73945-7d37-4819-bd62-78ee0f0ec507',
                gambar_barang:
                    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
                createdAt: '2024-03-21T13:14:42.658Z',
                updatedAt: '2024-03-21T13:56:39.573Z',
                pemasok: {
                    id: '90f73945-7d37-4819-bd62-78ee0f0ec507',
                    nama_pemasok: 'bapak2',
                    alamat: 'alamat',
                    kontak: '0893234343123',
                    createdAt: '2024-03-21T09:01:10.170Z',
                    updatedAt: '2024-03-21T09:01:10.170Z',
                },
            },
        ];
        const mockTotalItems = 1;
        const mockLastMonthItems = 2;

        getItemsRepository.mockResolvedValueOnce(mockItems);
        getTotalItemsRepository.mockResolvedValueOnce(mockTotalItems);
        getLastMonthItemsRepository.mockResolvedValueOnce(mockLastMonthItems);

        const response = await request(app)
            .get('/api/items/get')
            .query({ startIndex: 0, limit: 9, order: 'desc', searchTerm: '', slug: '' })
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(200);
        expect(response.body.items).toBeDefined();
        expect(response.body.totalItems).toBe(mockTotalItems);
        expect(response.body.lastMonthItems).toEqual(mockLastMonthItems);
    });

    it('handles error if an error occurs during retrieval', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockError = new Error('Failed to retrieve items');

        // Set mockRejectedValueOnce untuk mengembalikan error saat memanggil fungsi repository
        getItemsRepository.mockRejectedValueOnce(mockError);

        const next = jest.fn();

        // Kirim permintaan ke endpoint
        const response = await request(app)
            .get('/api/items/get')
            .query({ startIndex: 0, limit: 9, order: 'desc', searchTerm: '', slug: '' })
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.body).toEqual({
            success: false,
            statusCode: 500,
            message: 'Failed to retrieve items',
        });
    });
});

describe('DELETE /api/items/delete/:itemId', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deletes item successfully', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockItemId = 'a747dc1d-efe8-4f5a-96e8-59af97819279';
        const mockResult = { message: 'Item deleted successfully' };

        // Set mockResolvedValueOnce untuk mengembalikan hasil yang berhasil saat pemanggilan fungsi repository
        deleteItemRepository.mockResolvedValueOnce(mockResult);

        const response = await request(app)
            .delete(`/api/items/delete/${mockItemId}`)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResult);
    });

    it('returns 403 error if user is not allowed to delete item', async () => {
        const guestPayload = { id: 'mockGuestId', isAdmin: false, role: 'guest' };
        const guestToken = generateToken(guestPayload);
        const mockItemId = 'a747dc1d-efe8-4f5a-96e8-59af97819279';

        // Kirim permintaan DELETE ke endpoint dengan token guest
        const response = await request(app)
            .delete(`/api/items/delete/${mockItemId}`)
            .set('Cookie', [`access_token=${guestToken}`]);

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not allowed delete item');
    });
});

describe('PUT /api/items/update/:itemId', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('updates item successfully', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockItemId = 'a747dc1d-efe8-4f5a-96e8-59af97819279';
        const mockRequestBody = {
            nama_barang: 'Updated Item',
            deskripsi: 'Updated Description',
            harga: 15000,
            pemasokId: '90f73945-7d37-4819-bd62-78ee0f0ec507',
            gambar_barang: 'https://example.com/updated-image.png',
        };
        const mockUpdatedItem = {
            id: mockItemId,
            ...mockRequestBody,
        };

        findSupplierByIdRepository.mockResolvedValueOnce({});

        updateItemInRepository.mockResolvedValueOnce(mockUpdatedItem);

        const response = await request(app)
            .put(`/api/items/update/${mockItemId}`)
            .send(mockRequestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUpdatedItem);
    });

    it('returns 403 error if user is not allowed to update item', async () => {
        const guestPayload = { id: 'mockGuestId', isAdmin: false, role: 'guest' };
        const guestToken = generateToken(guestPayload);
        const mockItemId = 'a747dc1d-efe8-4f5a-96e8-59af97819279';

        const response = await request(app)
            .put(`/api/items/update/${mockItemId}`)
            .set('Cookie', [`access_token=${guestToken}`])
            .send({});

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not allowed update item');
    });

    it('returns 404 error if supplier is not found', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockItemId = 'a747dc1d-efe8-4f5a-96e8-59af97819279';
        const mockRequestBody = {
            nama_barang: 'Updated Item',
            deskripsi: 'Updated Description',
            harga: 15000,
            pemasokId: '90f73945-7d37-4819-bd62-78ee0f0ec507',
            gambar_barang: 'https://example.com/updated-image.png',
        };

        findSupplierByIdRepository.mockResolvedValueOnce(null);

        const response = await request(app)
            .put(`/api/items/update/${mockItemId}`)
            .set('Cookie', [`access_token=${adminToken}`])
            .send({ mockRequestBody });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Supplier not found');
    });

    it('returns 404 error if item is not found', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockItemId = 'a747dc1d-efe8-4f5a-96e8-59af97819279';
        const mockRequestBody = {
            nama_barang: 'Updated Item',
            deskripsi: 'Updated Description',
            harga: 15000,
            pemasokId: '90f73945-7d37-4819-bd62-78ee0f0ec507',
            gambar_barang: 'https://example.com/updated-image.png',
        };

        findSupplierByIdRepository.mockResolvedValueOnce({});

        updateItemInRepository.mockResolvedValueOnce(null);

        const response = await request(app)
            .put(`/api/items/update/${mockItemId}`)
            .set('Cookie', [`access_token=${adminToken}`])
            .send(mockRequestBody);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Item not found');
    });
});
