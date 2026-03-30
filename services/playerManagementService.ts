import { api } from '../api/client';

class playerManagementService {
    async UserOnlineVer2(token: string) {
        const response = await api.get('/player_manager/user-online-ver2', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        });
         return {
        success: true,
        data: response.data, 
        message: response.data.message || 'Lấy danh sách người chơi online thành công!'
      };
    }

    async profile (token: string, id: number) {
        const response = await api.get(`/player_manager/player-profile/${id}`, {
            headers: {
            'Authorization': `Bearer ${token}`
        }
        });
        return {
        success: true,
        data: response.data, 
        message: response.data.message || 'Lấy thông tin người chơi thành công!'
      };
    }
    

    async balanceWeb (token : string , id : number){
        const response = await api.get('/player_manager/balance-web',{
            headers:{
                'Authorization': `Bearer ${token}`
            },
            params: {
                id: id
                }
            });
            return {
                success: true,
                data: response.data, 
                message: response.data.message || 'Lấy thông tin người chơi thành công!'
            }
    }

    async userItems (token: string, user_id: number) {
        const response = await api.get('/player_manager/user-items',{
            headers:{
                'Authorization': `Bearer ${token}`
            },
             params: {
                user_id: user_id
                }
            });
            return {
                success: true,
                data: response.data, 
                message: response.data.message || 'Lấy thông tin người chơi thành công!'
            }
        }
 
    async pay (token: string , userId: number){
        const response = await api.get('/player_manager/pay',{
             headers:{
                'Authorization': `Bearer ${token}`
            },
             params: {
                userId: userId
                }
            });
            return {
                success: true,
                data: response.data, 
                message: response.data.message || 'Lấy thông tin người chơi thành công!'
            }
    }

    async sendEmail (token : string , who : string , title : string , content : string){
        const response = await api.post('/player_manager/send-email',{
             who: who,
             title: title,
             content: content
        },{
             headers:{
                'Authorization': `Bearer ${token}`
            }
        });
            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Gửi email thành công!'
            }
        }
}

export default new playerManagementService();