import request from 'supertest';
import app from '../../api/index.js';
import {
    createSupplierRepository,
    deleteSupplierRepository,
    getSuppliersRepository,
    updateSupplierRepository,
} from '../../api/repository/repository.supplier.js';
import { generateToken } from '../../api/utils/generatedToken.js';

afterAll(() => {
    jest.clearAllMocks();
});

jest.mock('../../api/repository/repository.supplier.js', () => ({
    createSupplierRepository: jest.fn(),
    getSuppliersRepository: jest.fn(),
    deleteSupplierRepository: jest.fn(),
    updateSupplierRepository: jest.fn(),
}));

describe('POST /api/supplier/add', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('create Supplier successfully', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);

        const mockSupplierData = {
            _id: 'mockedSupplierId',
            nama_pemasok: 'Supplier Test',
            alamat: 'Jl. Test No. 123',
            kontak: '081234567890',
        };

        createSupplierRepository.mockResolvedValueOnce(mockSupplierData);

        const requestBody = {
            nama_pemasok: 'Supplier Test',
            alamat: 'Jl. Test No. 123',
            kontak: '081234567890',
        };

        const response = await request(app)
            .post('/api/supplier/add')
            .send(requestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(201);
        expect(response.body._id).toBeDefined();
    });

    it('should return 403 if not an admin', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: false, role: 'guest' };
        const adminToken = generateToken(adminPayload);

        const mockSupplierData = {
            _id: 'mockedSupplierId',
            nama_pemasok: 'Supplier Test',
            alamat: 'Jl. Test No. 123',
            kontak: '081234567890',
        };

        createSupplierRepository.mockResolvedValueOnce(mockSupplierData);

        const requestBody = {
            nama_pemasok: 'Supplier Test',
            alamat: 'Jl. Test No. 123',
            kontak: '081234567890',
        };

        const response = await request(app)
            .post('/api/supplier/add')
            .send(requestBody)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(403);
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('You are not allowed create supplier');
    });
});

describe('GET /api/supplier/get', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return suppliers successfully', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const mockSuppliers = [
            {
                id: '2909d9e1-ccb7-46aa-ac92-64ce68820809',
                nama_pemasok: 'konohamaru',
                alamat: 'banten',
                kontak: '0843413234312',
                createdAt: '2024-03-14T03:01:30.101Z',
                updatedAt: '2024-03-14T03:01:35.563Z',
            },
            {
                id: '18509a21-2777-4d04-8108-76d1b7ccca79',
                nama_pemasok: 'bapak haloaz',
                alamat: 'Alamat',
                kontak: '08932343431',
                createdAt: '2024-03-14T02:28:05.075Z',
                updatedAt: '2024-03-14T03:40:46.365Z',
            },
        ];
        const mockTotalSuppliers = 2;
        const mockLastMonthSuppliers = 1;

        getSuppliersRepository.mockResolvedValueOnce({
            suppliers: mockSuppliers,
            totalSuppliers: mockTotalSuppliers,
            lastMonthSuppliers: mockLastMonthSuppliers,
        });

        const response = await request(app)
            .get('/api/supplier/get')
            .query({ startIndex: 0, limit: 10, sortDirection: 'ASC', searchTerm: '' })
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(200);
        expect(response.body.suppliers).toEqual(mockSuppliers);
        expect(response.body.totalSuppliers).toEqual(mockTotalSuppliers);
        expect(response.body.lastMonthSuppliers).toEqual(mockLastMonthSuppliers);
    });

    it('should handle error', async () => {
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const error = new Error('Internal Server Error');
        getSuppliersRepository.mockRejectedValueOnce(error);

        const response = await request(app)
            .get('/api/supplier/get')
            .query({ startIndex: 0, limit: 10, sortDirection: 'ASC', searchTerm: '' })
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ success: false, statusCode: 500, message: 'Internal Server Error' });
    });
});

describe('DELETE /api/supplier/delete/:id', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should delete supplier successfully', async () => {
        const supplierId = 'mockSupplierId';
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);
        const deletedSupplier = { _id: supplierId };

        deleteSupplierRepository.mockResolvedValueOnce(deletedSupplier);

        const response = await request(app)
            .delete(`/api/supplier/delete/${supplierId}`)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Supplier deleted successfully' });
    });

    it('should handle supplier not found', async () => {
        const supplierNotFound = 'mockSupplierNotFound';
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);

        // Simulasikan penghapusan supplier yang tidak ditemukan dengan mengembalikan 0 dari repository
        deleteSupplierRepository.mockResolvedValueOnce(0);

        const response = await request(app)
            .delete(`/api/supplier/delete/${supplierNotFound}`)
            .set('Cookie', [`access_token=${adminToken}`]);

        // Periksa bahwa status respons adalah 404
        expect(response.status).toBe(404);

        // Periksa bahwa pesan kesalahan sesuai dengan yang diharapkan
        expect(response.body.message).toBe('Supplier not found');
    });

    it('should handle internal server error', async () => {
        const supplierId = 'mockSupplierId';
        const adminPayload = { id: 'mockAdminId', isAdmin: false, role: 'guest' };
        const adminToken = generateToken(adminPayload);
        const deletedSupplier = new Error();

        deleteSupplierRepository.mockResolvedValueOnce(deletedSupplier);

        const response = await request(app)
            .delete(`/api/supplier/delete/${supplierId}`)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(403);
    });

    it('should handle unauthorized deletion', async () => {
        const supplierId = 'mockSupplierId';
        const adminPayload = { id: 'mockAdminId', isAdmin: false, role: 'guest' };
        const adminToken = generateToken(adminPayload);
        const deletedSupplier = { _id: supplierId };

        deleteSupplierRepository.mockResolvedValueOnce(deletedSupplier);

        const response = await request(app)
            .delete(`/api/supplier/delete/${supplierId}`)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            success: false,
            statusCode: 403,
            message: 'You are not allowed to delete supplier',
        });
    });
});

describe('Update /api/supplier/update/:id', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should update supplier successfully', async () => {
        const supplierId = 'mockSupplierId';
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);

        const updatedSupplierData = {
            nama_pemasok: 'Updated Supplier Name',
            alamat: 'Updated Supplier Address',
            kontak: 'Updated Supplier Contact',
        };

        // Mock updateSupplierRepository untuk mengembalikan data supplier yang diperbarui
        updateSupplierRepository.mockResolvedValueOnce([1, [updatedSupplierData]]);

        const response = await request(app)
            .put(`/api/supplier/update/${supplierId}`)
            .send(updatedSupplierData)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(updateSupplierRepository).toHaveBeenCalledWith(supplierId, updatedSupplierData);

        expect(response.status).toBe(200);

        expect(response.body).toEqual(updatedSupplierData);
    });

    it('should handle supplier not found', async () => {
        const supplierId = 'mockSupplierId';
        const adminPayload = { id: 'mockAdminId', isAdmin: true, role: 'admin' };
        const adminToken = generateToken(adminPayload);

        const updatedSupplierData = {
            nama_pemasok: 'Updated Supplier Name',
            alamat: 'Updated Supplier Address',
            kontak: 'Updated Supplier Contact',
        };

        updateSupplierRepository.mockResolvedValueOnce([0, []]);

        const response = await request(app)
            .put(`/api/supplier/update/${supplierId}`)
            .send(updatedSupplierData)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(updateSupplierRepository).toHaveBeenCalledWith(supplierId, updatedSupplierData);

        expect(response.status).toBe(404);

        expect(response.body.message).toBe('Supplier not found');
    });

    it('should handle unauthorized deletion', async () => {
        const supplierId = 'mockSupplierId';
        const adminPayload = { id: 'mockAdminId', isAdmin: false, role: 'guest' };
        const adminToken = generateToken(adminPayload);
        const updatedSupplierData = {
            nama_pemasok: 'Updated Supplier Name',
            alamat: 'Updated Supplier Address',
            kontak: 'Updated Supplier Contact',
        };

        updateSupplierRepository.mockResolvedValueOnce([1, [updatedSupplierData]]);

        const response = await request(app)
            .put(`/api/supplier/update/${supplierId}`)
            .set('Cookie', [`access_token=${adminToken}`]);

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            success: false,
            statusCode: 403,
            message: 'You are not allowed to update supplier',
        });
    });
});
