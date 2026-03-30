"use client"
import { useEffect, useState } from "react"
import AdminService from "../../services/adminService"

interface WithdrawRequest {
  id: number;
  user_id: number;
  amount: number;
  bank_name: string;
  bank_number: string;
  bank_owner: string;
  status: string;
  request_at: string;
  success_at: string | null;
}

export default function Admin() {
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchWithdrawRequests();
  }, []);

  const fetchWithdrawRequests = async () => {
  try {
    setLoading(true);
    setError("");

    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      setError("Không tìm thấy thông tin đăng nhập");
      return;
    }

    const userData = JSON.parse(stored);
    const accessToken = userData.access_token;
    if (!accessToken) {
      setError("Không tìm thấy token đăng nhập");
      return;
    }

    const result = await AdminService.allWithdrawl(accessToken);
    
    
    if (result.success) {
      if (result.data.withdraws) {
        setWithdrawRequests(result.data.withdraws || []);
      } else if (Array.isArray(result.data)) {
        setWithdrawRequests(result.data || []);
      } else {
        setWithdrawRequests([]);
      }
    } else {
      setError(result.error || "Lỗi khi tải danh sách");
    }
  } catch (err) {
    console.error("❌ Error:", err);
    setError("Lỗi không xác định");
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (id: number) => {  
  if (!confirm("Bạn có chắc chắn muốn duyệt yêu cầu này?")) return;

  try {
    setProcessingId(id);
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      alert("Không tìm thấy thông tin đăng nhập");
      return;
    }
    
    const userData = JSON.parse(stored);
    const accessToken = userData.access_token;
    const authId = userData.auth_id;  
    
    if (!accessToken || !authId) {
      alert("Không tìm thấy thông tin đăng nhập");
      return;
    }

    const result = await AdminService.approveWithdraw(id, authId, accessToken); 
    
    if (result.success) {
      alert(result.message);
      fetchWithdrawRequests();
    } else {
      alert(result.error || "Lỗi khi duyệt yêu cầu");
    }
  } catch (err) {
    console.error("❌ Approve error:", err);
    alert("Lỗi không xác định");
  } finally {
    setProcessingId(null);
  }
};

const handleReject = async (id: number) => {  
  if (!confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) return;

  try {
    setProcessingId(id);
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      alert("Không tìm thấy thông tin đăng nhập");
      return;
    }
    
    const userData = JSON.parse(stored);
    const accessToken = userData.access_token;
    const authId = userData.auth_id;  
    
    if (!accessToken || !authId) {
      alert("Không tìm thấy thông tin đăng nhập");
      return;
    }

    const result = await AdminService.rejectWithdraw(id, authId, accessToken);  
    
    if (result.success) {
      alert(result.message);
      fetchWithdrawRequests();
    } else {
      alert(result.error || "Lỗi khi từ chối yêu cầu");
    }
  } catch (err) {
    console.error("❌ Reject error:", err);
    alert("Lỗi không xác định");
  } finally {
    setProcessingId(null);
  }
};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            Chờ duyệt
          </span>
        );
      case "SUCCESS":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
            Đã duyệt
          </span>
        );
      case "REJECTED":
      case "ERROR":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
            Đã từ chối
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full">
          <div className="text-red-500 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Lỗi</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchWithdrawRequests()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded mt-4"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý rút tiền</h1>
              <p className="text-gray-600 mt-1">Danh sách các yêu cầu rút tiền từ người dùng</p>
            </div>
            <button
              onClick={fetchWithdrawRequests}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Làm mới
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm font-medium">Chờ duyệt</p>
                <p className="text-3xl font-bold text-yellow-800 mt-1">
                  {withdrawRequests.filter(w => w.status === "PENDING").length}
                </p>
              </div>
              <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Đã duyệt</p>
                <p className="text-3xl font-bold text-green-800 mt-1">
                  {withdrawRequests.filter(w => w.status === "SUCCESS").length}
                </p>
              </div>
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium">Đã từ chối</p>
                <p className="text-3xl font-bold text-red-800 mt-1">
                  {withdrawRequests.filter(w => w.status === "REJECTED" || w.status === "ERROR").length}
                </p>
              </div>
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Withdraw Requests Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Danh sách yêu cầu rút tiền
            </h2>
          </div>

          {withdrawRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg">Chưa có yêu cầu rút tiền nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngân hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số TK
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chủ TK
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawRequests.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{item.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.bank_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {item.bank_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.bank_owner}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">Yêu cầu:</span>
                          <span>{formatDate(item.request_at)}</span>
                          {item.status === "SUCCESS" && item.success_at && (
                            <>
                              <span className="text-xs text-gray-400 mt-1">Thành công:</span>
                              <span className="text-green-600">{formatDate(item.success_at)}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {item.status === "PENDING" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={processingId === item.id}
                              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                            >
                              {processingId === item.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              disabled={processingId === item.id}
                              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                            >
                              {processingId === item.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}