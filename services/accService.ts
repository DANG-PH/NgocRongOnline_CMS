import { api } from '../api/client';

class accService {
    // đăng acc cần bán 
    async createAccountSell (token: string, username: string , password: string, price: number, url: string) {
        const response = await api.post('/partner/create-account-sell', {
        username: username,
        password: password,
        price: price,
        url: url,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
       return {
        success: true,
        data: response.data.account, 
        message: 'Tạo acc thành công!'
      };
    }
    // cap nhat acc can ban 
    async updateAccountSell (token: string, id: number,  url: string , description: string, price: number) {
        const response = await api.patch('/partner/update-account-sell', {
        id: id,
        url: url,
        description: description,
        price: price,
      }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        });
         return {
        success: true,
        data: response.data.account, 
        message: 'Cập nhật acc thành công!'
      };

    }

    // xoa acc can ban
    async deleteAccountSell (token: string, id: number) {
        const response = await api.delete('/partner/delete-account-sell', {
        data: { id: id },
        headers: {
            'Authorization': `Bearer ${token}`
        }
        });
         return {
        success: true,
        data: response.data, 
        message: 'Xóa acc thành công!'
      };
    }

    async accountSellByPartner(token: string, partner_id: number) {
      const response = await api.get('/partner/account-sell-by-partner', {
        params: {
          partner_id: partner_id
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.accounts
      };
    }

 
}

export default new accService();