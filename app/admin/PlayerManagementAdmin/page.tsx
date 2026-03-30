"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import adminService from "@/services/adminService";

type TabType = 'user' | 'wallet' | 'game' | 'accounts';

interface UserData {
  token: string;
  role: string;
}

export default function PlayerManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('user');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  // User Management States - Change Role
  const [roleUsername, setRoleUsername] = useState("");
  const [newRole, setNewRole] = useState("");

  // User Management States - Ban/Unban
  const [banUsername, setBanUsername] = useState("");

  // Wallet Management States - Update Money
  const [moneyUserId, setMoneyUserId] = useState("");
  const [moneyAmount, setMoneyAmount] = useState("");

  // Wallet Management States - Update Status
  const [statusUserId, setStatusUserId] = useState("");
  const [walletStatus, setWalletStatus] = useState("open");

  // Game Balance States
  const [gameUserId, setGameUserId] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceType, setBalanceType] = useState("vangNapTuWeb");

  // Create Disciple States
  const [discipleUserId, setDiscipleUserId] = useState("");
  const [sucManh, setSucManh] = useState("");

  // Account View States
  const [partnerId, setPartnerId] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountType, setAccountType] = useState<'sell' | 'buyer' | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      toast.error('Bạn cần đăng nhập để truy cập trang này');
      window.location.href = '/login';
      return;
    }
    
    try {
      const user = JSON.parse(stored);
      const token = user.access_token || "";
      const role = user.role || "";

      if (role !== "ADMIN") {
        toast.error('Bạn không có quyền truy cập trang này!');
        window.location.href = '/';
        return;
      }

      setUserData({ token, role });
    } catch (error) {
      toast.error('Lỗi khi đọc thông tin người dùng');
      window.location.href = '/login';
    }
  }, []);

  // User Management Functions
  const handleChangeRole = async () => {
    if (!roleUsername || !newRole) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.changeRole(roleUsername, newRole, userData!.token);
      if (result?.success) {
        toast.success(result.message);
        setRoleUsername("");
        setNewRole("");
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thay đổi vai trò');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!banUsername) {
      toast.error('Vui lòng nhập username');
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.banUser(banUsername, userData!.token);
      if (result?.success) {
        toast.success(result.message);
        setBanUsername("");
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi ban user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!banUsername) {
      toast.error('Vui lòng nhập username');
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.unbanUser(banUsername, userData!.token);
      if (result?.success) {
        toast.success(result.message);
        setBanUsername("");
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi unban user');
    } finally {
      setLoading(false);
    }
  };

  // Wallet Management Functions
  const handleUpdateMoney = async () => {
    if (!moneyUserId || !moneyAmount) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.updateMoney(moneyUserId, Number(moneyAmount), userData!.token);
      if (result?.success) {
        toast.success(result.message);
        setMoneyUserId("");
        setMoneyAmount("");
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật số dư');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusUserId) {
      toast.error('Vui lòng nhập User ID');
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.updateStatus(statusUserId, walletStatus, userData!.token);
      if (result?.success) {
        toast.success(result.message);
        setStatusUserId("");
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái ví');
    } finally {
      setLoading(false);
    }
  };

  // Game Management Functions
  const handleUpdateBalance = async () => {
    if (!gameUserId || !balanceAmount) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.updateBalace(
        Number(gameUserId), 
        Number(balanceAmount), 
        userData!.token, 
        balanceType
      );
      if (result?.success) {
        toast.success(result.message);
        setGameUserId("");
        setBalanceAmount("");
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật số dư game');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeTu = async () => {
    if (!discipleUserId || !sucManh) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.createDeTu(
        Number(discipleUserId), 
        Number(sucManh), 
        userData!.token
      );
      if (result?.success) {
        toast.success(result.message);
        setDiscipleUserId("");
        setSucManh("");
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo đệ tử');
    } finally {
      setLoading(false);
    }
  };

  // Account View Functions
  const handleViewAccountsByPartner = async () => {
    if (!partnerId) {
      toast.error('Vui lòng nhập Partner ID');
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.accountSellByPartner(Number(partnerId), userData!.token);
      
      if (result?.success) {
        const accountData = result.data?.accounts || [];
        setAccounts(accountData);
        setAccountType('sell');
        toast.success(result.message || 'Lấy danh sách thành công!');
      } else {
        toast.error('Không thể lấy danh sách tài khoản');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi lấy danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllAccountBuyer = async () => {
    if (!partnerId) {
      toast.error('Vui lòng nhập Partner ID');
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.allAccountBuyer(Number(partnerId), userData!.token);
      
      if (result?.success) {
        const accountData = result.data?.accounts || [];
        setAccounts(accountData);
        setAccountType('buyer');
        toast.success(result.message || 'Lấy danh sách thành công!');
      } else {
        toast.error('Không thể lấy danh sách tài khoản');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi lấy danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản Lý Người Chơi</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'user' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Quản Lý User
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'wallet' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Quản Lý Ví
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'game' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Quản Lý Game
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'accounts' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Xem Tài Khoản
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'user' && (
          <div className="space-y-6">
            {/* Change Role */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Thay Đổi Vai Trò</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={roleUsername}
                  onChange={(e) => setRoleUsername(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Vai trò mới (VD: ADMIN, USER)"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleChangeRole}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Thay Đổi'}
                </button>
              </div>
            </div>

            {/* Ban/Unban User */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Cấm/Bỏ Cấm User</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={banUsername}
                  onChange={(e) => setBanUsername(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleBanUser}
                  disabled={loading}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Cấm User'}
                </button>
                <button
                  onClick={handleUnbanUser}
                  disabled={loading}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Bỏ Cấm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Management Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Update Money */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Cập Nhật Số Dư</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="User ID"
                  value={moneyUserId}
                  onChange={(e) => setMoneyUserId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Số tiền"
                  value={moneyAmount}
                  onChange={(e) => setMoneyAmount(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleUpdateMoney}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Cập Nhật'}
                </button>
              </div>
            </div>

            {/* Update Wallet Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Khóa/Mở Khóa Ví</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="User ID"
                  value={statusUserId}
                  onChange={(e) => setStatusUserId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={walletStatus}
                  onChange={(e) => setWalletStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">Mở</option>
                  <option value="locked">Khóa</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Cập Nhật Trạng Thái'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Management Tab */}
        {activeTab === 'game' && (
          <div className="space-y-6">
            {/* Update Balance */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Cập Nhật Vàng/Ngọc Trong Game</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="User ID"
                  value={gameUserId}
                  onChange={(e) => setGameUserId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Số lượng"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={balanceType}
                  onChange={(e) => setBalanceType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vangNapTuWeb">Vàng</option>
                  <option value="ngocNapTuWeb">Ngọc</option>
                </select>
                <button
                  onClick={handleUpdateBalance}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Cập Nhật'}
                </button>
              </div>
            </div>

            {/* Create Disciple */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Tạo Đệ Tử</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="User ID"
                  value={discipleUserId}
                  onChange={(e) => setDiscipleUserId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Sức mạnh"
                  value={sucManh}
                  onChange={(e) => setSucManh(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateDeTu}
                  disabled={loading}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Tạo Đệ Tử'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accounts View Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            {/* View Accounts */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Xem Tài Khoản</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Partner ID"
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleViewAccountsByPartner}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang tải...' : 'Xem Acc Bán'}
                </button>
                <button
                  onClick={handleViewAllAccountBuyer}
                  disabled={loading}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang tải...' : 'Xem Acc Đã Mua'}
                </button>
              </div>
            </div>

            {/* Display Accounts */}
            {accounts.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        {accountType === 'sell' ? (
                          <>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mô Tả</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Giá</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày Tạo</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Password</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {accountType === 'sell' ? (
                        accounts.map((account, index) => (
                          <tr key={account.id || index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{account.id || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{account.description || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {account.price ? `${account.price.toLocaleString()} VNĐ` : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                account.status === 'SOLD' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {account.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {account.createdAt ? new Date(account.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        accounts.map((account, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{account.username || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{account.password || 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Tổng số tài khoản: <span className="font-semibold">{accounts.length}</span>
                  </p>
                </div>
              </div>
            )}
            
        
          </div>
        )}
      </div>
    </div>
  );
}