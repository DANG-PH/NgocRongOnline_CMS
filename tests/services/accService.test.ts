
import accService from '../../services/accService';
import { api } from '../../api/client';

// Mock API
jest.mock('../../api/client', () => ({
    api: {
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        get: jest.fn(),
    },
}));

describe('accService - Advanced & Complex Scenarios', () => {
    const mockToken = 'valid-token';

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // 1. PARAMETERIZED TESTING (Data-Driven)
    // Kỹ thuật này giúp test 5-6 trường hợp chỉ với 1 đoạn code
    // ==========================================
    describe('createAccountSell - Input Validation (Edge Cases)', () => {

        // Mảng chứa các bộ dữ liệu "xấu" để test xem API có được gọi không
        // (Giả sử logic là vẫn gọi API và API trả về lỗi 400)
        const invalidInputs = [
            { price: -5000, desc: 'negative price' },
            { price: 0, desc: 'zero price' },
            // Bạn có thể thêm: { username: '', desc: 'empty username' }
        ];

        test.each(invalidInputs)('should handle API failure when input is invalid: %s', async ({ price, desc }) => {
            // Arrange: Giả lập API trả về lỗi 400 Bad Request khi input sai
            const errorResponse = {
                response: {
                    status: 400,
                    data: { message: `Invalid input: ${desc}` }
                }
            };
            (api.post as jest.Mock).mockRejectedValue(errorResponse);

            // Act & Assert
            // Chúng ta mong đợi service sẽ ném lỗi ra ngoài để UI xử lý
            await expect(
                accService.createAccountSell(mockToken, 'user', 'pass', price, 'url')
            ).rejects.toEqual(errorResponse);

            // Kiểm tra API vẫn được gọi (để backend validate)
            expect(api.post).toHaveBeenCalled();
        });
    });

    // ==========================================
    // 2. HTTP STATUS CODE SIMULATION
    // Test hành vi với các loại lỗi server cụ thể
    // ==========================================
    describe('Error Handling Scenarios', () => {

        it('should handle 401 Unauthorized (Token expired)', async () => {
            // Arrange: Giả lập Token hết hạn
            const unauthorizedError = {
                response: { status: 401, data: { message: 'Token expired' } }
            };
            (api.delete as jest.Mock).mockRejectedValue(unauthorizedError);

            // Act & Assert
            try {
                await accService.deleteAccountSell('expired-token', 1);
            } catch (error: any) {
                // Kiểm tra xem lỗi trả về có đúng status 401 không
                expect(error.response.status).toBe(401);
                expect(error.response.data.message).toBe('Token expired');
            }
        });

        it('should handle 500 Internal Server Error gracefully', async () => {
            // Arrange: Server bị sập
            (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

            // Act & Assert
            await expect(
                accService.accountSellByPartner(mockToken, 1)
            ).rejects.toThrow('Network Error');
        });
    });

    // ==========================================
    // 3. SECURITY & HEADER VERIFICATION
    // Kiểm tra kỹ format của Token
    // ==========================================
    describe('Security Checks', () => {
        it('should attach correct Authorization header format', async () => {
            // Arrange
            (api.post as jest.Mock).mockResolvedValue({ data: { account: {} } });
            const messyToken = '  token-with-spaces  '; // Test token chưa trim (nếu có logic trim)

            // Act
            await accService.createAccountSell(messyToken, 'u', 'p', 1, 'url');

            // Assert
            // Lấy tham số thứ 3 được truyền vào hàm api.post (là config object)
            const configCall = (api.post as jest.Mock).mock.calls[0][2];

            // Kiểm tra header Authorization
            expect(configCall.headers).toHaveProperty('Authorization');
            // Đảm bảo phải có chữ "Bearer "
            expect(configCall.headers['Authorization']).toMatch(/^Bearer\s.+/);
            expect(configCall.headers['Authorization']).toContain(messyToken);
        });
    });

    // ==========================================
    // 4. DATA INTEGRITY (Tính toàn vẹn dữ liệu)
    // Kiểm tra dữ liệu gửi đi không bị biến đổi sai lệch
    // ==========================================
    it('should preserve data types correctly when sending to API', async () => {
        // Arrange
        const largePrice = 9999999999;
        const complexUrl = 'https://domain.com/path?query=1&special=%20';
        (api.post as jest.Mock).mockResolvedValue({ data: {} });

        // Act
        await accService.createAccountSell(mockToken, 'u', 'p', largePrice, complexUrl);

        // Assert
        const payloadCall = (api.post as jest.Mock).mock.calls[0][1];

        // Kiểm tra kiểu dữ liệu (Price phải là number, không bị chuyển thành string)
        expect(typeof payloadCall.price).toBe('number');
        expect(payloadCall.price).toBe(largePrice);

        // Kiểm tra URL không bị encode sai trước khi gửi (nếu axios tự encode thì ok)
        expect(payloadCall.url).toBe(complexUrl);
    });
});