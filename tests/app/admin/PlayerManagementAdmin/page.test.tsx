import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlayerManagement from '@/app/admin/PlayerManagementAdmin/page';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

// 1. Mock adminService và toast
jest.mock('@/services/adminService');
jest.mock('react-hot-toast');

// 2. Mock LocalStorage và window.location
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true
});

describe('PlayerManagementAdmin Page', () => {
    const mockToken = 'admin-token';
    const mockAdminUser = JSON.stringify({ access_token: mockToken, role: 'ADMIN' });

    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.clear();
        // Default logged in as ADMIN
        window.localStorage.setItem('currentUser', mockAdminUser);
    });

    // --- TEST CASE 1: CHECK PERMISSION ---
    it('redirects to login if not logged in', () => {
        window.localStorage.clear();
        render(<PlayerManagement />);
        expect(toast.error).toHaveBeenCalledWith('Bạn cần đăng nhập để truy cập trang này');
        expect(window.location.href).toBe('/login');
    });

    it('redirects to home if role is not ADMIN', () => {
        window.localStorage.setItem('currentUser', JSON.stringify({ role: 'USER' }));
        render(<PlayerManagement />);
        expect(toast.error).toHaveBeenCalledWith('Bạn không có quyền truy cập trang này!');
        expect(window.location.href).toBe('/');
    });

    it('renders correctly for ADMIN', async () => {
        render(<PlayerManagement />);
        expect(screen.getByText('Quản Lý Người Chơi')).toBeInTheDocument();
        // Mặc định tab User Management được chọn
        expect(screen.getByText('Thay Đổi Vai Trò')).toBeInTheDocument();
    });

    // --- TEST CASE 2: TAB SWITCHING ---
    it('switches tabs correctly', async () => {
        render(<PlayerManagement />);

        // Switch to Wallet Tab
        fireEvent.click(screen.getByText('Quản Lý Ví'));
        expect(screen.getByText('Cập Nhật Số Dư')).toBeInTheDocument();

        // Switch to Game Tab
        fireEvent.click(screen.getByText('Quản Lý Game'));
        expect(screen.getByText('Cập Nhật Vàng/Ngọc Trong Game')).toBeInTheDocument();

        // Switch to Accounts Tab
        fireEvent.click(screen.getByText('Xem Tài Khoản'));
        expect(screen.getByText('Xem Tài Khoản')).toBeInTheDocument();
    });

    // --- TEST CASE 3: USER MANAGEMENT TAB ---
    describe('User Management Tab', () => {
        it('handles Change Role', async () => {
            (adminService.changeRole as jest.Mock).mockResolvedValue({ success: true, message: 'Success' });
            render(<PlayerManagement />);

            // Fill inputs
            const userInputs = screen.getAllByPlaceholderText('Username');
            fireEvent.change(userInputs[0], { target: { value: 'testuser' } });
            fireEvent.change(screen.getByPlaceholderText('Vai trò mới (VD: ADMIN, USER)'), { target: { value: 'ADMIN' } });

            // Click button
            fireEvent.click(screen.getByText('Thay Đổi'));

            await waitFor(() => {
                expect(adminService.changeRole).toHaveBeenCalledWith('testuser', 'ADMIN', mockToken);
                expect(toast.success).toHaveBeenCalledWith('Success');
            });
        });

        it('handles Ban User', async () => {
            (adminService.banUser as jest.Mock).mockResolvedValue({ success: true, message: 'Banned' });
            render(<PlayerManagement />);

            // Fill inputs (Ban section is below Change Role)
            const userInputs = screen.getAllByPlaceholderText('Username');
            fireEvent.change(userInputs[1], { target: { value: 'baduser' } }); // Input thứ 2 là của Ban User

            // Click button
            fireEvent.click(screen.getByText('Cấm User'));

            await waitFor(() => {
                expect(adminService.banUser).toHaveBeenCalledWith('baduser', mockToken);
                expect(toast.success).toHaveBeenCalledWith('Banned');
            });
        });
    });

    // --- TEST CASE 4: WALLET MANAGEMENT TAB ---
    describe('Wallet Management Tab', () => {
        beforeEach(() => {
            render(<PlayerManagement />);
            fireEvent.click(screen.getByText('Quản Lý Ví'));
        });

        it('handles Update Money', async () => {
            (adminService.updateMoney as jest.Mock).mockResolvedValue({ success: true, message: 'Money Updated' });

            // Fill inputs
            const idInputs = screen.getAllByPlaceholderText('User ID');
            fireEvent.change(idInputs[0], { target: { value: '101' } });
            fireEvent.change(screen.getByPlaceholderText('Số tiền'), { target: { value: '50000' } });

            fireEvent.click(screen.getByText('Cập Nhật'));

            await waitFor(() => {
                expect(adminService.updateMoney).toHaveBeenCalledWith('101', 50000, mockToken);
            });
        });

        it('handles Update Wallet Status', async () => {
            (adminService.updateStatus as jest.Mock).mockResolvedValue({ success: true, message: 'Status Updated' });

            // Fill inputs
            const idInputs = screen.getAllByPlaceholderText('User ID');
            fireEvent.change(idInputs[1], { target: { value: '102' } }); // Input thứ 2

            // Select dropdown
            const select = screen.getByDisplayValue('Mở'); // Default val
            fireEvent.change(select, { target: { value: 'locked' } });

            fireEvent.click(screen.getByText('Cập Nhật Trạng Thái'));

            await waitFor(() => {
                expect(adminService.updateStatus).toHaveBeenCalledWith('102', 'locked', mockToken);
            });
        });
    });

    // --- TEST CASE 5: GAME MANAGEMENT TAB ---
    describe('Game Management Tab', () => {
        beforeEach(() => {
            render(<PlayerManagement />);
            fireEvent.click(screen.getByText('Quản Lý Game'));
        });

        it('handles Update Game Balance', async () => {
            (adminService.updateBalace as jest.Mock).mockResolvedValue({ success: true, message: 'Game Balance Updated' });

            const idInputs = screen.getAllByPlaceholderText('User ID');
            fireEvent.change(idInputs[0], { target: { value: '202' } });
            fireEvent.change(screen.getByPlaceholderText('Số lượng'), { target: { value: '100' } });

            fireEvent.click(screen.getByText('Cập Nhật'));

            await waitFor(() => {
                expect(adminService.updateBalace).toHaveBeenCalledWith(202, 100, mockToken, 'vangNapTuWeb');
            });
        });
    });

    // --- TEST CASE 6: ACCOUNTS VIEW TAB ---
    describe('Accounts View Tab', () => {
        beforeEach(() => {
            render(<PlayerManagement />);
            fireEvent.click(screen.getByText('Xem Tài Khoản'));
        });

        it('handles View Accounts Sell', async () => {
            const mockAccounts = [{ id: 1, description: 'Acc 1', price: 100, status: 'SOLD' }];
            (adminService.accountSellByPartner as jest.Mock).mockResolvedValue({
                success: true,
                data: { accounts: mockAccounts }
            });

            fireEvent.change(screen.getByPlaceholderText('Partner ID'), { target: { value: '5' } });
            fireEvent.click(screen.getByText('Xem Acc Bán'));

            await waitFor(() => {
                expect(adminService.accountSellByPartner).toHaveBeenCalledWith(5, mockToken);
                expect(screen.getByText('Acc 1')).toBeInTheDocument();
                expect(screen.getByText('SOLD')).toBeInTheDocument();
            });
        });
    });
});