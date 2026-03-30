import editService from '../../services/editService';
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

describe('EditService (Quản lý bài viết)', () => {
    const mockToken = 'test-editor-token';

    // Reset mock sau mỗi test case
    afterEach(() => {
        jest.clearAllMocks();
    });


    // 1. TEST CREATE POST (Tạo bài viết)

    describe('CreatePost', () => {
        const postData = {
            title: 'Tiêu đề mới',
            url_anh: 'anh.jpg',
            content: 'Nội dung bài viết',
            editor_realname: 'Admin Name'
        };

        it('should create post successfully', async () => {
            // Arrange
            const mockResponse = { data: { post: { id: 1, ...postData } } };
            (api.post as jest.Mock).mockResolvedValue(mockResponse);

            // Act
            const result = await editService.CreatePost(
                postData.title,
                postData.url_anh,
                postData.content,
                mockToken,
                postData.editor_realname
            );

            // Assert
            expect(api.post).toHaveBeenCalledWith(
                '/editor/create-post',
                {
                    title: postData.title,
                    url_anh: postData.url_anh,
                    content: postData.content,
                    editor_realname: postData.editor_realname
                },
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );

            expect(result).toEqual({
                success: true,
                data: mockResponse.data.post,
                message: 'Tạo bài viết thành công!',
            });
        });

        it('should handle error when creation fails', async () => {
            // Arrange: Giả lập lỗi từ Server trả về message custom
            const errorResponse = {
                response: { data: { message: 'Tiêu đề bị trùng!' } }
            };
            (api.post as jest.Mock).mockRejectedValue(errorResponse);

            // Act
            const result = await editService.CreatePost(
                postData.title, postData.url_anh, postData.content, mockToken, postData.editor_realname
            );

            // Assert
            expect(result).toEqual({
                success: false,
                error: 'Tiêu đề bị trùng!',
            });
        });
    });


    // 2. TEST ALL POSTS (Lấy danh sách)

    describe('AllPosts', () => {
        it('should fetch all posts successfully', async () => {
            const mockPosts = [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }];
            (api.get as jest.Mock).mockResolvedValue({ data: { posts: mockPosts } });

            const result = await editService.AllPosts(mockToken);

            expect(api.get).toHaveBeenCalledWith('/editor/all-posts', {
                headers: { Authorization: `Bearer ${mockToken}` },
            });

            expect(result).toEqual({
                success: true,
                data: mockPosts,
                message: 'Lấy bài viết thành công!',
            });
        });

        it('should handle fetch error', async () => {
            // Giả lập lỗi mặc định khi không có response.data.message
            (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

            const result = await editService.AllPosts(mockToken);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Lấy danh sách bài viết thất bại!');
        });
    });

    // ==========================================
    // 3. TEST UPDATE POST (Cập nhật)
    // ==========================================
    describe('UpdatePost', () => {
        const updateData = {
            id: 1,
            title: 'Tiêu đề sửa',
            url_anh: 'anh_moi.jpg',
            content: 'Nội dung sửa'
        };

        it('should update post successfully', async () => {
            const mockResponse = { data: { post: { ...updateData } } };
            (api.patch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await editService.UpdatePost(
                updateData.id,
                updateData.title,
                mockToken,
                updateData.url_anh,
                updateData.content
            );

            expect(api.patch).toHaveBeenCalledWith(
                '/editor/update-post',
                {
                    id: updateData.id,
                    title: updateData.title,
                    url_anh: updateData.url_anh,
                    content: updateData.content
                },
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );

            expect(result.message).toBe('Cập nhật bài viết thành công!');
        });

        it('should return error message on failure', async () => {
            const errorResponse = {
                response: { data: { error: 'Không tìm thấy bài viết' } }
            };
            (api.patch as jest.Mock).mockRejectedValue(errorResponse);

            const result = await editService.UpdatePost(1, 'Title', mockToken, 'url', 'content');

            expect(result).toEqual({
                success: false,
                error: 'Không tìm thấy bài viết',
            });
        });
    });

    // ==========================================
    // 4. TEST DELETE POST (Xóa)
    // ==========================================
    describe('Deletepost', () => {
        it('should delete post successfully', async () => {
            // Arrange
            const postId = 10;
            (api.delete as jest.Mock).mockResolvedValue({ data: { status: 'deleted' } });

            // Act
            const result = await editService.Deletepost(postId, mockToken);

            // Assert: Kiểm tra cú pháp gọi axios delete có chứa `data: { id: ... }` không
            expect(api.delete).toHaveBeenCalledWith(
                '/editor/delete-post',
                {
                    data: { id: postId },
                    headers: { Authorization: `Bearer ${mockToken}` }
                }
            );

            expect(result).toEqual({
                success: true,
                data: { status: 'deleted' },
                message: 'Xóa bài viết thành công!',
            });
        });

        it('should handle delete error', async () => {
            (api.delete as jest.Mock).mockRejectedValue(new Error('Server Error'));

            const result = await editService.Deletepost(99, mockToken);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Xóa bài viết thất bại!');
        });
    });
});