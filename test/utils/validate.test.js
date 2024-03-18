import {
    isValidDate,
    validateTransactionDate,
    validateUsername,
    validatePassword,
    validateItemFields,
    validateSupplierFields,
    validateRole,
    validateTransactionType,
    validateTransactionQuantity,
} from '../../api/utils/validate.js';

describe('isValidDate', () => {
    test('returns true for valid date string', () => {
        expect(isValidDate('2024-03-18')).toBe(true);
    });

    test('returns false for invalid date string', () => {
        expect(isValidDate('2024/03/18')).toBe(false);
    });
});

describe('validateTransactionDate', () => {
    test('throws error for invalid transaction date format', () => {
        expect(() => validateTransactionDate('2024/03/18')).toThrow('Invalid transaction date');
    });

    test('passes for valid transaction date format', () => {
        expect(() => validateTransactionDate('2024-03-18')).not.toThrow();
    });
});

describe('validateUsername', () => {
    test('throws error for empty username', () => {
        expect(() => validateUsername('')).toThrow('Username is required');
    });

    test('throws error for username with spaces', () => {
        expect(() => validateUsername('user name')).toThrow('Username cannot contain spaces');
    });

    test('throws error for username with special characters', () => {
        expect(() => validateUsername('user@name')).toThrow('Username can only contain letters and numbers');
    });

    test('throws error for username with fewer than 7 characters', () => {
        expect(() => validateUsername('use')).toThrow('Username must be between 7 and 20 characters');
    });

    test('throws error for username with more than 20 characters', () => {
        expect(() => validateUsername('thisUsernameIsTooLongToBeValid')).toThrow(
            'Username must be between 7 and 20 characters',
        );
    });

    test('throws error for non-lowercase username', () => {
        expect(() => validateUsername('UserName')).toThrow('Username must be lowercase');
    });

    test('passes for valid username', () => {
        expect(() => validateUsername('validuser123')).not.toThrow();
    });
});

describe('validatePassword', () => {
    test('throws error for empty password', () => {
        expect(() => validatePassword('')).toThrow();
    });

    test('throws error for password with less than 6 characters', () => {
        expect(() => validatePassword('short')).toThrow('Password must be at least 6 characters');
    });

    test('passes for valid password', () => {
        expect(() => validatePassword('validpassword')).not.toThrow();
    });
});

describe('validateItemFields', () => {
    test('throws error if any required field is missing', () => {
        expect(() => validateItemFields({})).toThrow('Please provide all required fields');
        expect(() => validateItemFields({ nama_barang: 'Product A' })).toThrow('Please provide all required fields');
        expect(() => validateItemFields({ nama_barang: 'Product A', deskripsi: 'Description' })).toThrow(
            'Please provide all required fields',
        );
        expect(() => validateItemFields({ nama_barang: 'Product A', deskripsi: 'Description', harga: 10000 })).toThrow(
            'Please provide all required fields',
        );
        expect(() =>
            validateItemFields({
                deskripsi: 'Description',
                harga: 1000,
                pemasokId: '18509a21-2777-4d04-8108-76d1b7ccca79',
            }),
        ).toThrow('Please provide all required fields');
    });

    test('passes if all required fields are provided', () => {
        expect(() =>
            validateItemFields({
                nama_barang: 'Product A',
                deskripsi: 'Description',
                harga: 10000,
                pemasokId: '18509a21-2777-4d04-8108-76d1b7ccca79',
            }),
        ).not.toThrow();
    });
});

describe('validateSupplierFields', () => {
    test('throws error if any required field is missing or empty', () => {
        expect(() => validateSupplierFields({})).toThrow('Please provide all required fields for supplier');
        expect(() => validateSupplierFields({ nama_pemasok: 'Supplier A' })).toThrow(
            'Please provide all required fields for supplier',
        );
        expect(() => validateSupplierFields({ nama_pemasok: 'Supplier A', alamat: 'Address' })).toThrow(
            'Please provide all required fields for supplier',
        );
        expect(() =>
            validateSupplierFields({ nama_pemasok: 'Supplier A', alamat: 'Address', kontak: '12345' }),
        ).not.toThrow();
        expect(() => validateSupplierFields({ alamat: 'Address', kontak: '12345' })).toThrow(
            'Please provide all required fields for supplier',
        );
    });

    test('passes if all required fields are provided and not empty', () => {
        expect(() =>
            validateSupplierFields({ nama_pemasok: 'Supplier A', alamat: 'Address', kontak: '12345' }),
        ).not.toThrow();
    });
});

describe('validateRole', () => {
    test('throws error for invalid role', () => {
        expect(() => validateRole('admin')).toThrow('Invalid role');
        expect(() => validateRole('moderator')).toThrow('Invalid role');
        expect(() => validateRole('')).toThrow('Invalid role');
    });

    test('passes for valid role', () => {
        expect(() => validateRole('user')).not.toThrow();
        expect(() => validateRole('guest')).not.toThrow();
    });
});

describe('validateTransactionType', () => {
    test('throws error for invalid transaction type', () => {
        expect(() => validateTransactionType('purchase')).toThrow('Invalid transaction type');
        expect(() => validateTransactionType('sale')).toThrow('Invalid transaction type');
        expect(() => validateTransactionType('')).toThrow('Invalid transaction type');
    });

    test('passes for valid transaction type', () => {
        expect(() => validateTransactionType('masuk')).not.toThrow();
        expect(() => validateTransactionType('keluar')).not.toThrow();
    });
});

describe('validateTransactionQuantity', () => {
    test('throws error for non-positive transaction quantity', () => {
        expect(() => validateTransactionQuantity(-5)).toThrow('Transaction quantity must be a positive integer');
        expect(() => validateTransactionQuantity(0)).toThrow('Transaction quantity must be a positive integer');
        expect(() => validateTransactionQuantity(-1.5)).toThrow('Transaction quantity must be a positive integer');
    });

    test('passes for positive integer transaction quantity', () => {
        expect(() => validateTransactionQuantity(10)).not.toThrow();
        expect(() => validateTransactionQuantity(100)).not.toThrow();
    });
});
