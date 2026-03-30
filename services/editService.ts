import { api } from '../api/client';

class EditService {

  async CreatePost(title: string, url_anh: string, content: string, token: string, editor_realname: string
  ) {
    try {
      const response = await api.post('/editor/create-post', {
        title: title,
        url_anh: url_anh,
        content: content,
        editor_realname: editor_realname
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
 
      return {
        success: true,
        data: response.data.post, 
        message: 'Tạo bài viết thành công!'
      };
    } catch (error: any) {
      console.error('Lỗi khi tạo bài:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Tạo bài viết thất bại!'
      };
    }
  }

 
  async AllPosts(token: string) {
    try {
      const response = await api.get('/editor/all-posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
  
      return {
        success: true,
        data: response.data.posts, 
        message: 'Lấy bài viết thành công!'
      };
    } catch (error: any) {
      console.error('Lỗi khi lấy bài viết:', error);
  
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Lấy danh sách bài viết thất bại!'
      };
    }
  }

 
  async UpdatePost(id: number, title: string, token: string, url_anh: string, content: string
  ) {
    try {
      const response = await api.patch('/editor/update-post', {
        id: id,
        title: title,
        url_anh: url_anh,
        content: content
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
   
      return {
        success: true,
        data: response.data.post, 
        message: 'Cập nhật bài viết thành công!'
      };
    } catch (error: any) {
      console.error('Lỗi khi cập nhật bài viết:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Cập nhật bài viết thất bại!'
      };
    }
  }

 
  async Deletepost(id: number, token: string) {
    try {
      const response = await api.delete('/editor/delete-post', {
        data: { id: id },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Xóa bài viết thành công!'
      };
    } catch (error: any) {
      console.error('Lỗi khi xóa bài viết:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Xóa bài viết thất bại!'
      };
    }
  }
}

export default new EditService();