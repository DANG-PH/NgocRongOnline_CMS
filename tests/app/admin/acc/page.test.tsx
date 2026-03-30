import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import AccountManagementComplete from '@/app/admin/acc/page';
import accService from '@/services/accService';

// Mock service dùng đường dẫn Alias
jest.mock('@/services/accService');

// Mock LocalStorage
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('AccountManagementComplete', () => {
    const mockToken = 'fake-token-123';
    const mockUser = JSON.stringify({ access_token: mockToken, partner_id: 1 });

    const mockAccounts = [
        {
            id: 1,
            url: 'http://img.com/1.jpg',
            description: 'Acc VIP 1',
            price: 100000,
            status: 'ACTIVE',
            partner_id: 1,
            createdAt: '2023-01-01',
            buyer_id: null
        },
        {
            id: 2,
            url: 'http://img.com/2.jpg',
            description: 'Acc VIP 2',
            price: 200000,
            status: 'SOLD',
            partner_id: 1,
            createdAt: '2023-01-02',
            buyer_id: 99
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.clear();
        jest.spyOn(window, 'confirm').mockImplementation(() => true);
    });

    // --- TEST CASE 1: HIỂN THỊ DANH SÁCH ---
    it('renders correctly and loads accounts from localStorage partner_id', async () => {
        window.localStorage.setItem('currentUser', mockUser);
        (accService.accountSellByPartner as jest.Mock).mockResolvedValue({
            success: true,
            data: mockAccounts
        });

        render(<AccountManagementComplete />);

        // Kiểm tra hiển thị tiêu đề và dữ liệu
        await waitFor(() => {
            expect(screen.getByText('Quản Lý Account')).toBeInTheDocument();
            expect(screen.getByText('Acc VIP 1')).toBeInTheDocument();
            expect(screen.getByText('Acc VIP 2')).toBeInTheDocument();
        });

        // Kiểm tra service được gọi đúng tham số
        expect(accService.accountSellByPartner).toHaveBeenCalledWith(mockToken, 1);
    });

    // --- TEST CASE 2: TÌM KIẾM ---
    it('handles search by partner ID', async () => {
        window.localStorage.setItem('currentUser', mockUser);
        (accService.accountSellByPartner as jest.Mock).mockResolvedValue({
            success: true,
            data: []
        });

        render(<AccountManagementComplete />);

        const searchInput = screen.getByPlaceholderText(/Nhập Partner ID/i);
        const searchBtn = screen.getByRole('button', { name: /Tìm kiếm/i });

        fireEvent.change(searchInput, { target: { value: '5' } });
        fireEvent.click(searchBtn);

        await waitFor(() => {
            expect(accService.accountSellByPartner).toHaveBeenCalledWith(mockToken, 5);
        });
    });

    // --- TEST CASE 3: TẠO MỚI ---
    it('opens form and creates a new account', async () => {
        window.localStorage.setItem('currentUser', mockUser);
        (accService.accountSellByPartner as jest.Mock).mockResolvedValue({
            success: true,
            data: mockAccounts
        });
        (accService.createAccountSell as jest.Mock).mockResolvedValue({
            success: true,
            message: 'Tạo thành công'
        });

        render(<AccountManagementComplete />);
        await waitFor(() => screen.getByText('Acc VIP 1'));

        // Mở form
        fireEvent.click(screen.getByText('+ Thêm Account'));

        // Điền form
        fireEvent.change(screen.getByPlaceholderText('Nhập username'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByPlaceholderText('Nhập password'), { target: { value: '123456' } });
        fireEvent.change(screen.getByPlaceholderText('https://example.com/image.jpg'), { target: { value: 'img.jpg' } });
        fireEvent.change(screen.getByPlaceholderText('Nhập mô tả account'), { target: { value: 'New Desc' } });
        fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '50000' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: 'Tạo Account' }));

        await waitFor(() => {
            expect(accService.createAccountSell).toHaveBeenCalledWith(
                mockToken, 'newuser', '123456', 50000, 'img.jpg'
            );
        });
    });

    // --- TEST CASE 4: CẬP NHẬT ---
    it('populates form and updates an account', async () => {
        window.localStorage.setItem('currentUser', mockUser);
        (accService.accountSellByPartner as jest.Mock).mockResolvedValue({
            success: true,
            data: mockAccounts
        });
        (accService.updateAccountSell as jest.Mock).mockResolvedValue({
            success: true,
            message: 'Update thành công'
        });

        render(<AccountManagementComplete />);
        await waitFor(() => screen.getByText('Acc VIP 1'));

        // Click sửa item đầu tiên
        const editBtns = screen.getAllByText('Sửa');
        fireEvent.click(editBtns[0]);

        // Sửa giá
        const priceInput = screen.getByDisplayValue('100000');
        fireEvent.change(priceInput, { target: { value: '150000' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: 'Cập Nhật' }));

        await waitFor(() => {
            expect(accService.updateAccountSell).toHaveBeenCalledWith(
                mockToken, 1, 'http://img.com/1.jpg', 'Acc VIP 1', 150000
            );
        });
    });

    // --- TEST CASE 5: XÓA ---
    it('deletes an account after confirmation', async () => {
        window.localStorage.setItem('currentUser', mockUser);
        (accService.accountSellByPartner as jest.Mock).mockResolvedValue({
            success: true,
            data: mockAccounts
        });
        (accService.deleteAccountSell as jest.Mock).mockResolvedValue({
            success: true,
            message: 'Xóa thành công'
        });

        render(<AccountManagementComplete />);
        await waitFor(() => screen.getByText('Acc VIP 1'));

        // Click xóa item đầu tiên
        const deleteBtns = screen.getAllByText('Xóa');
        fireEvent.click(deleteBtns[0]);

        // Kiểm tra xem confirm có được gọi không (đã mock return true ở beforeEach)
        expect(window.confirm).toHaveBeenCalled();

        await waitFor(() => {
            expect(accService.deleteAccountSell).toHaveBeenCalledWith(mockToken, 1);
        });
    });
});