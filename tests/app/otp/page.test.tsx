import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OtpPage from '@/app/otp/page';
import AdminService from '@/services/adminService';
import { useRouter } from 'next/navigation';

// 1. Mock các module cần thiết
jest.mock('@/services/adminService');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// 2. Mock LocalStorage
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// 3. Mock window.alert
window.alert = jest.fn();

describe('OTP Verification Page', () => {
    const mockPush = jest.fn();
    const mockSessionUser = JSON.stringify({ sessionId: 'session-123', username: 'user' });

    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.clear();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    it('renders the OTP form correctly', () => {
        render(<OtpPage />);

        expect(screen.getByText('Nhập OTP')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Nhập mã OTP')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Xác nhận OTP/i })).toBeInTheDocument();
    });

    it('redirects to login if no sessionId in localStorage', async () => {
        // Arrange: localStorage rỗng
        render(<OtpPage />);

        // Act: Submit form
        fireEvent.click(screen.getByRole('button', { name: /Xác nhận OTP/i }));

        // Assert
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Không tìm thấy sessionId. Vui lòng đăng nhập lại!');
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('handles input change correctly', () => {
        render(<OtpPage />);

        const input = screen.getByPlaceholderText('Nhập mã OTP');
        fireEvent.change(input, { target: { value: '123456' } });

        expect(input).toHaveValue('123456');
    });

    it('verifies OTP successfully and redirects to admin', async () => {
        // Arrange
        window.localStorage.setItem('currentUser', mockSessionUser);
        const mockApiResponse = {
            success: true,
            data: { access_token: 'new-token', role: 'ADMIN' }
        };
        (AdminService.verifyOtp as jest.Mock).mockResolvedValue(mockApiResponse);

        render(<OtpPage />);

        // Act
        fireEvent.change(screen.getByPlaceholderText('Nhập mã OTP'), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /Xác nhận OTP/i }));

        // Assert
        await waitFor(() => {
            expect(AdminService.verifyOtp).toHaveBeenCalledWith('123456', 'session-123');

            // Kiểm tra localStorage được cập nhật data mới
            const updatedUser = JSON.parse(window.localStorage.getItem('currentUser') || '{}');
            expect(updatedUser.access_token).toBe('new-token');
            expect(updatedUser.role).toBe('ADMIN');

            expect(window.alert).toHaveBeenCalledWith('Xác thực OTP thành công!');
            expect(mockPush).toHaveBeenCalledWith('/admin');
        });
    });

    it('shows error alert when OTP verification fails', async () => {
        // Arrange
        window.localStorage.setItem('currentUser', mockSessionUser);
        (AdminService.verifyOtp as jest.Mock).mockResolvedValue({
            success: false,
            error: 'Mã OTP sai'
        });

        render(<OtpPage />);

        // Act
        fireEvent.change(screen.getByPlaceholderText('Nhập mã OTP'), { target: { value: '000000' } });
        fireEvent.click(screen.getByRole('button', { name: /Xác nhận OTP/i }));

        // Assert
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Mã OTP sai');
            expect(mockPush).not.toHaveBeenCalled(); // Không được chuyển trang
        });
    });

    it('handles unexpected API errors gracefully', async () => {
        // Arrange
        window.localStorage.setItem('currentUser', mockSessionUser);
        (AdminService.verifyOtp as jest.Mock).mockRejectedValue(new Error('Network Error'));

        render(<OtpPage />);

        // Act
        fireEvent.change(screen.getByPlaceholderText('Nhập mã OTP'), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /Xác nhận OTP/i }));

        // Assert
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Đã xảy ra lỗi không mong đợi!');
        });
    });

    it('navigates back to login when clicking "Quay lại đăng nhập"', () => {
        render(<OtpPage />);

        fireEvent.click(screen.getByText('Quay lại đăng nhập'));

        expect(mockPush).toHaveBeenCalledWith('/login');
    });
});