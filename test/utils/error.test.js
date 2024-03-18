import { errorHandler } from '../../api/utils/error';

describe('errorHandler', () => {
    test('returns an error object with provided status code and message', () => {
        const statusCode = 400;
        const message = 'Bad request';

        const error = errorHandler(statusCode, message);

        expect(error.statusCode).toBe(statusCode);
        expect(error.message).toBe(message);
    });
});
