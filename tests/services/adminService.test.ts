import adminService from '../../services/adminService';
import { api } from '../../api/client';

// 1. Mock API Client
jest.mock('../../api/client', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('AdminService', () => {
    const mockToken = 'test-token-123';

    // Clear mock sau mỗi bài test
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================================
    // NHÓM 1: CÁC HÀM XỬ LÝ LỖI BÊN TRONG (Trả về success: false)
    // ==========================================================

    describe('allWithdrawl (Quản lý rút tiền)', () => {
        it('should return data on success', async () => {
            // Arrange
            const mockData = [{ id: 1, amount: 500 }];
            (api.get as jest.Mock).mockResolvedValue({ data: mockData });

            // Act
            const result = await adminService.allWithdrawl(mockToken);

            // Assert
            expect(api.get).toHaveBeenCalledWith('/cashier/all-withdraw', {
                headers: { Authorization: `Bearer ${mockToken}` },
            });
            expect(result).toEqual({
                success: true,
                data: mockData,
                message: 'Lấy danh sách rút tiền thành công!',
            });
        });

        it('should handle 401 Unauthorized error', async () => {
            // Arrange: Giả lập lỗi 401 từ Axios
            const error401 = { response: { status: 401 } };
            (api.get as jest.Mock).mockRejectedValue(error401);

            // Act
            const result = await adminService.allWithdrawl(mockToken);

            // Assert: Hàm không ném lỗi mà trả về object báo lỗi
            expect(result).toEqual({
                success: false,
                error: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!',
            });
        });

        it('should handle 403 Forbidden error', async () => {
            // Arrange
            const error403 = { response: { status: 403 } };
            (api.get as jest.Mock).mockRejectedValue(error403);

            // Act
            const result = await adminService.allWithdrawl(mockToken);

            // Assert
            expect(result).toEqual({
                success: false,
                error: 'Bạn không có quyền truy cập!',
            });
        });
    });

    describe('approveWithdraw (Duyệt rút tiền)', () => {
        it('should call PATCH with correct payload', async () => {
            (api.patch as jest.Mock).mockResolvedValue({ data: {} });

            await adminService.approveWithdraw(1, 100, mockToken);

            expect(api.patch).toHaveBeenCalledWith(
                '/cashier/approve-withdraw',
                { id: 1, finance_id: 100, status: 'SUCCESS' },
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );
        });
    });

    describe('Auth Functions (Login & OTP)', () => {
        it('login: should return error on wrong credentials (401)', async () => {
            const error401 = { response: { status: 401 } };
            (api.post as jest.Mock).mockRejectedValue(error401);

            const result = await adminService.login('admin', 'wrongpass');

            expect(result).toEqual({
                success: false,
                error: 'Tài khoản hoặc mật khẩu không đúng!',
            });
        });

        it('verifyOtp: should verify successfully', async () => {
            (api.post as jest.Mock).mockResolvedValue({ data: { token: 'abc' } });

            const result = await adminService.verifyOtp('123456', 'session-id');

            expect(api.post).toHaveBeenCalledWith('/auth/verify-otp', {
                otp: '123456',
                sessionId: 'session-id'
            });
            expect(result.success).toBe(true);
        });
    });

    // ==========================================================
    // NHÓM 2: CÁC HÀM NÉM LỖI RA NGOÀI (throw error)
    // ==========================================================

    describe('Admin Actions (Throw Errors)', () => {

        it('changeRole: should call API correctly', async () => {
            // Arrange
            (api.patch as jest.Mock).mockResolvedValue({ data: 'ok' });

            // Act
            const result = await adminService.changeRole('user1', 'admin', mockToken);

            // Assert
            expect(api.patch).toHaveBeenCalledWith(
                '/admin/change-role',
                { username: 'user1', newRole: 'admin' },
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );
            expect(result.success).toBe(true);
        });

        it('banUser: should throw error if API fails', async () => {
            // Arrange: API bị lỗi mạng
            const networkError = new Error('Network Error');
            (api.patch as jest.Mock).mockRejectedValue(networkError);

            // Act & Assert
            // Vì hàm banUser dùng "throw error", ta phải dùng expect(...).rejects
            await expect(
                adminService.banUser('baduser', mockToken)
            ).rejects.toThrow('Network Error');
        });

        it('updateMoney: should call API correctly', async () => {
            (api.patch as jest.Mock).mockResolvedValue({ data: 'ok' });

            await adminService.updateMoney('user1', 50000, mockToken);

            expect(api.patch).toHaveBeenCalledWith(
                '/admin/money',
                { userId: 'user1', amount: 50000 },
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );
        });
    });

    describe('Data Fetching with Params', () => {
        it('accountSellByPartner: should pass query params correctly', async () => {
            // Arrange
            const mockAccounts = [{ id: 1 }];
            (api.get as jest.Mock).mockResolvedValue({ data: mockAccounts });

            // Act
            const result = await adminService.accountSellByPartner(99, mockToken);

            // Assert
            expect(api.get).toHaveBeenCalledWith(
                '/admin/account-sell-by-partner',
                {
                    headers: { Authorization: `Bearer ${mockToken}` },
                    params: { partner_id: 99 }, // Quan trọng: kiểm tra params
                }
            );
            expect(result.data).toEqual(mockAccounts);
        });

        it('createDeTu: should post correct data', async () => {
            (api.post as jest.Mock).mockResolvedValue({ data: 'ok' });

            await adminService.createDeTu(10, 5000, mockToken);

            expect(api.post).toHaveBeenCalledWith(
                '/admin/create-de-tu',
                { userId: 10, sucManh: 5000 },
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );
        });
    });
});