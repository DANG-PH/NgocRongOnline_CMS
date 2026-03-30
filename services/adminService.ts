import { api } from '../api/client';

class AdminService {

  // admin/cashier
  // Lấy danh sách tất cả các yêu cầu rút tiền
  async allWithdrawl(token: string) {
    try {
      const response = await api.get(
        '/cashier/all-withdraw',
       {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách rút tiền thành công!'
      };
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách rút tiền:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Bạn không có quyền truy cập!'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Lấy danh sách rút tiền thất bại!'
      };
    }
  }

  // Duyệt yêu cầu rút tiền
  async approveWithdraw(id: number, finance_id: number, token: string) {
    try {
      const response = await api.patch(
        '/cashier/approve-withdraw',
        {
          id: id,
          finance_id: finance_id,
          status: "SUCCESS"
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return {
        success: true,
        data: response.data,
        message: 'Duyệt yêu cầu rút tiền thành công!'
      };
    } catch (error: any) {
      console.error('Lỗi khi duyệt yêu cầu rút tiền:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Bạn không có quyền thực hiện thao tác này!'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Duyệt yêu cầu rút tiền thất bại!'
      };
    }
  }

  // tu choi yêu cầu rút tiền
  async rejectWithdraw(id: number, finance_id: number, token: string) {
    try {
      const response = await api.patch(
        '/cashier/reject-withdraw',
        {
          id: id,
          finance_id: finance_id,
          status: "SUCCESS"
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return {
        success: true,
        data: response.data,
        message: 'Từ chối yêu cầu rút tiền thành công!'
      };
    } catch (error: any) {
      console.error('Lỗi khi từ chối yêu cầu rút tiền:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Bạn không có quyền thực hiện thao tác này!'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Từ chối yêu cầu rút tiền thất bại!'
      };
    }
  }
  // Xác thực OTP
  async verifyOtp(otp: string, sessionId: string) {
    try {
      const response = await api.post('/auth/verify-otp', {
        otp: otp,
        sessionId: sessionId
      });
      return {
        success: true,
        data: response.data,
        message: 'Xác thực OTP thành công!'
      };
    } catch (error: any) {
      console.error('Lỗi khi xác thực OTP:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Mã OTP không đúng hoặc đã hết hạn!'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Xác thực OTP thất bại!'
      };
    }
  }

  async login(username: string, password: string) {
    try {
      const response = await api.post('/auth/login', {
        username: username,
        password: password
      });
      return {
        success: true,
        data: response.data,
        message: 'Đăng nhập thành công!'
      };
    } catch (error: any) {
      console.error('Lỗi khi đăng nhập:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Tài khoản hoặc mật khẩu không đúng!'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Đăng nhập thất bại!'
      };
    }
  }



  //admin
  async changeRole(username: string , newRole: string, token: string) {
    try {
      const response = await api.patch('/admin/change-role',{
        username: username,
        newRole: newRole
      },{
        headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      return {
        success: true,
        data: response.data,
        message: 'Thay đổi vai trò thành công!'
      };
    } catch (error: any) {
      throw error;
    }
  }

  async banUser(username: string , token: string) {
    try {
      const response = await api.patch('/admin/ban-user',{
        username: username
      },{
        headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      return {
        success: true,
        data: response.data,
        message: 'Ban user thành công!'
      };
    } catch (error: any) {
      throw error;
    }
  }

  async unbanUser(username: string , token: string) {
    try {
      const response = await api.patch('/admin/unban-user',{
        username: username
      },{
        headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      return {
        success: true,
        data: response.data,
        message: 'Unban user thành công!'
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateMoney(userId: string , amount: number, token: string) {
    try {
      const response = await api.patch('/admin/money',{
        userId: userId,
        amount: amount
      },{
        headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      return {  
        success: true,
        data: response.data,
        message: 'Cập nhật số dư thành công!'
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateStatus (userId: string , status: string, token: string) {
    try {
      const response = await api.patch('/admin/status',{
        userId: userId,
        status: status
      },{
        headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật trạng thái ví thành công!'
      };
    } catch (error: any) {
      throw error;
    }
  }

  async accountSellByPartner(partnerId: number, token: string) {
    try {
      const response = await api.get('/admin/account-sell-by-partner', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          partner_id: partnerId
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách acc theo partner thành công!'
      };
    } catch (error: any) {
      throw error;
    }
  }

  async allAccountBuyer(partnerId: number, token: string){
    try {
      const response = await api.get('/admin/all-account-buyer', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          partner_id: partnerId
        }
      });
      return {
        success: true,
        data: response.data,
        message: 'Lấy tất cả acc của người mua thành công!'
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateBalace(id: number, amount: number, token: string , type: string) {
    try {
      const response = await api.patch('/admin/update-balance',{
        id: id,
        amount: amount,
        type: type
      },{
        headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật thành công!'
      };
    } catch (error: any) {
      throw error;
    }
  }

  async createDeTu (userId: number, sucManh: number, token: string ) {
    try {
      const response = await api.post('/admin/create-de-tu',{
        userId: userId,
        sucManh: sucManh
      },{
        headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      return {
        success: true,
        data: response.data,
        message: 'Tạo đệ tử thành công!'
      };
    } catch (error: any) {
      throw error;
    }
  }

}

export default new AdminService();