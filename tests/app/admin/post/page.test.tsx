import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostPage from '@/app/admin/post/page';
import EditService from '@/services/editService';
import toast from 'react-hot-toast';

jest.mock('@/services/editService');
jest.mock('react-hot-toast');

const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

window.scrollTo = jest.fn();

describe('PostPage Management', () => {
    const mockToken = 'test-token-123';
    const mockUser = JSON.stringify({ access_token: mockToken });

    const mockPosts = [
        {
            id: 1,
            title: 'Bài viết 1',
            url_anh: 'http://img.com/1.jpg',
            content: 'Nội dung 1',
            editor_realname: 'Tác giả A',
            status: 'PUBLISHED',
            create_at: '2023-01-01'
        },
        {
            id: 2,
            title: 'Bài viết 2',
            url_anh: 'http://img.com/2.jpg',
            content: 'Nội dung 2',
            editor_realname: 'Tác giả B',
            status: 'DRAFT',
            create_at: '2023-01-02'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.clear();
        window.localStorage.setItem('currentUser', mockUser);
    });

    it('renders posts list correctly', async () => {
        (EditService.AllPosts as jest.Mock).mockResolvedValue({
            success: true,
            data: mockPosts
        });

        render(<PostPage />);

        expect(screen.getByText('Đang tải danh sách bài viết...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Bài viết 1')).toBeInTheDocument();
            expect(screen.getByText('Bài viết 2')).toBeInTheDocument();
            expect(screen.getByText('Nội dung 1')).toBeInTheDocument();
        });

        expect(EditService.AllPosts).toHaveBeenCalledWith(mockToken);
    });

    it('shows validation errors when submitting empty form', async () => {
        (EditService.AllPosts as jest.Mock).mockResolvedValue({ success: true, data: [] });
        render(<PostPage />);

        await waitFor(() => screen.getByText('Chưa có bài viết nào'));

        const submitBtn = screen.getByRole('button', { name: /Tạo Bài Viết/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Tiêu đề không được để trống')).toBeInTheDocument();
            expect(screen.getByText('URL ảnh không được để trống')).toBeInTheDocument();
            expect(screen.getByText('Nội dung không được để trống')).toBeInTheDocument();
            expect(screen.getByText('Tên tác giả không được để trống')).toBeInTheDocument();
        });

        expect(EditService.CreatePost).not.toHaveBeenCalled();
    });

    it('creates a new post successfully', async () => {
        (EditService.AllPosts as jest.Mock).mockResolvedValue({ success: true, data: [] });
        (EditService.CreatePost as jest.Mock).mockResolvedValue({ success: true, message: 'Tạo OK' });

        render(<PostPage />);
        await waitFor(() => screen.getByText('Chưa có bài viết nào'));

        fireEvent.change(screen.getByLabelText(/Tiêu đề/i), { target: { value: 'New Post' } });
        fireEvent.change(screen.getByLabelText(/Tên tác giả/i), { target: { value: 'Me' } });
        fireEvent.change(screen.getByLabelText(/URL Ảnh/i), { target: { value: 'img.jpg' } });
        fireEvent.change(screen.getByLabelText(/Nội dung/i), { target: { value: 'New Content' } });

        fireEvent.click(screen.getByRole('button', { name: /Tạo Bài Viết/i }));

        await waitFor(() => {
            expect(EditService.CreatePost).toHaveBeenCalledWith(
                'New Post', 'img.jpg', 'New Content', mockToken, 'Me'
            );
            expect(toast.success).toHaveBeenCalledWith('Tạo OK');
        });

        expect(EditService.AllPosts).toHaveBeenCalledTimes(2);
    });

    it('populates form and updates post', async () => {
        (EditService.AllPosts as jest.Mock).mockResolvedValue({ success: true, data: mockPosts });
        (EditService.UpdatePost as jest.Mock).mockResolvedValue({ success: true, message: 'Update OK' });

        render(<PostPage />);
        await waitFor(() => screen.getByText('Bài viết 1'));

        const editBtns = screen.getAllByText('Sửa');
        fireEvent.click(editBtns[0]);

        expect(screen.getByLabelText(/Tiêu đề/i)).toHaveValue('Bài viết 1');
        expect(window.scrollTo).toHaveBeenCalled();

        fireEvent.change(screen.getByLabelText(/Tiêu đề/i), { target: { value: 'Bài viết 1 Updated' } });

        fireEvent.click(screen.getByRole('button', { name: /Cập Nhật/i }));

        await waitFor(() => {
            expect(EditService.UpdatePost).toHaveBeenCalledWith(
                1, 'Bài viết 1 Updated', mockToken, 'http://img.com/1.jpg', 'Nội dung 1'
            );
            expect(toast.success).toHaveBeenCalledWith('Update OK');
        });
    });

    it('opens modal and deletes post', async () => {
        (EditService.AllPosts as jest.Mock).mockResolvedValue({ success: true, data: mockPosts });
        (EditService.Deletepost as jest.Mock).mockResolvedValue({ success: true, message: 'Xóa OK' });

        render(<PostPage />);
        await waitFor(() => screen.getByText('Bài viết 1'));

        const deleteBtns = screen.getAllByText('Xóa');
        fireEvent.click(deleteBtns[0]);

        expect(screen.getByText('Xác Nhận Xóa Bài Viết')).toBeInTheDocument();
        expect(screen.getByText('Bài viết 1')).toBeInTheDocument();

        const confirmDeleteBtn = screen.getByRole('button', { name: 'Xóa Bài Viết' });
        fireEvent.click(confirmDeleteBtn);

        await waitFor(() => {
            expect(EditService.Deletepost).toHaveBeenCalledWith(1, mockToken);
            expect(toast.success).toHaveBeenCalledWith('Xóa OK');
        });

        await waitFor(() => {
            expect(screen.queryByText('Xác Nhận Xóa Bài Viết')).not.toBeInTheDocument();
        });
    });
});