import playerManagementService from '../../services/playerManagementService';
import { api } from '../../api/client';

// 1. Mock API Client
jest.mock('../../api/client', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

describe('playerManagementService', () => {
    const mockToken = 'player-token-123';

    // Xóa lịch sử gọi hàm sau mỗi bài test
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // 1. UserOnlineVer2 (GET - No Params)
    // ==========================================
    describe('UserOnlineVer2', () => {
        it('should fetch online users successfully', async () => {
            // Arrange
            const mockResponse = { data: { users: [], message: 'Custom msg' } };
            (api.get as jest.Mock).mockResolvedValue(mockResponse);

            // Act
            const result = await playerManagementService.UserOnlineVer2(mockToken);

            // Assert
            expect(api.get).toHaveBeenCalledWith('/player_manager/user-online-ver2', {
                headers: { Authorization: `Bearer ${mockToken}` },
            });
            expect(result).toEqual({
                success: true,
                data: mockResponse.data,
                message: 'Custom msg',
            });
        });

        it('should use default message if API response has no message', async () => {
            (api.get as jest.Mock).mockResolvedValue({ data: {} }); // Không có message

            const result = await playerManagementService.UserOnlineVer2(mockToken);

            expect(result.message).toBe('Lấy danh sách người chơi online thành công!');
        });
    });

    // ==========================================
    // 2. profile (GET - URL Params)
    // ==========================================
    describe('profile', () => {
        it('should fetch profile with correct ID in URL', async () => {
            const userId = 101;
            (api.get as jest.Mock).mockResolvedValue({ data: {} });

            await playerManagementService.profile(mockToken, userId);

            // Kiểm tra xem ID có được gắn vào URL không
            expect(api.get).toHaveBeenCalledWith(
                `/player_manager/player-profile/${userId}`,
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );
        });
    });

    // ==========================================
    // 3. balanceWeb (GET - Query Params)
    // ==========================================
    describe('balanceWeb', () => {
        it('should fetch balance with correct params', async () => {
            const id = 99;
            (api.get as jest.Mock).mockResolvedValue({ data: {} });

            await playerManagementService.balanceWeb(mockToken, id);

            expect(api.get).toHaveBeenCalledWith('/player_manager/balance-web', {
                headers: { Authorization: `Bearer ${mockToken}` },
                params: { id: id },
            });
        });
    });

    // ==========================================
    // 4. userItems (GET - Query Params: user_id)
    // ==========================================
    describe('userItems', () => {
        it('should fetch items with correct user_id param', async () => {
            const userId = 55;
            (api.get as jest.Mock).mockResolvedValue({ data: {} });

            await playerManagementService.userItems(mockToken, userId);

            expect(api.get).toHaveBeenCalledWith('/player_manager/user-items', {
                headers: { Authorization: `Bearer ${mockToken}` },
                params: { user_id: userId }, // Lưu ý: key ở đây là user_id
            });
        });
    });

    // ==========================================
    // 5. pay (GET - Query Params: userId)
    // ==========================================
    describe('pay', () => {
        it('should call pay API with correct userId param', async () => {
            const uId = 77;
            (api.get as jest.Mock).mockResolvedValue({ data: {} });

            await playerManagementService.pay(mockToken, uId);

            expect(api.get).toHaveBeenCalledWith('/player_manager/pay', {
                headers: { Authorization: `Bearer ${mockToken}` },
                params: { userId: uId }, // Lưu ý: key ở đây là userId
            });
        });
    });

    // ==========================================
    // 6. sendEmail (POST - Body Data)
    // ==========================================
    describe('sendEmail', () => {
        it('should post email data correctly', async () => {
            // Arrange
            const emailData = {
                who: 'player1',
                title: 'Welcome',
                content: 'Hello World',
            };
            (api.post as jest.Mock).mockResolvedValue({ data: { status: 'sent' } });

            // Act
            const result = await playerManagementService.sendEmail(
                mockToken,
                emailData.who,
                emailData.title,
                emailData.content
            );

            // Assert
            expect(api.post).toHaveBeenCalledWith(
                '/player_manager/send-email',
                {
                    who: emailData.who,
                    title: emailData.title,
                    content: emailData.content,
                },
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );

            expect(result.message).toBe('Gửi email thành công!'); // Default msg check
        });
    });

    // ==========================================
    // 7. Error Propagation (Kiểm tra việc ném lỗi)
    // ==========================================
    describe('Error Handling', () => {
        // Vì service của bạn không có try/catch, nên khi API lỗi, nó phải ném lỗi ra ngoài
        it('should propagate error when API fails', async () => {
            const error = new Error('Server Down');
            (api.get as jest.Mock).mockRejectedValue(error);

            // Chúng ta mong đợi hàm này sẽ throw error
            await expect(
                playerManagementService.UserOnlineVer2(mockToken)
            ).rejects.toThrow('Server Down');
        });
    });
});