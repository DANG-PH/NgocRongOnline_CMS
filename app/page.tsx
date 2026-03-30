"use client"
import React, { useState } from 'react';
import AdminService from '../services/adminService';
import { useRouter } from 'next/navigation'

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
}

function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      const result = await AdminService.login(formData.username, formData.password);
      
      if (result.success) {
        console.log("✅ Login success:", result.data);

        // Lưu sessionId và username vào localStorage
        const sessionData = {
          sessionId: result.data.sessionId,
          username: formData.username
        };

        localStorage.setItem('currentUser', JSON.stringify(sessionData));
        console.log("💾 Saved session data:", sessionData);

        // Ghi nhớ username nếu checkbox được chọn
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', formData.username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }

        alert(result.message || 'Đăng nhập thành công! Vui lòng nhập OTP.');
        
        // Chuyển sang trang OTP
        router.push('/otp');
      } else {
        alert(result.error || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert('Đã xảy ra lỗi không mong đợi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Đăng Nhập</h2>
          <p className="text-blue-100">Chào mừng bạn quay trở lại</p>
        </div>

        {/* Form */}
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xl">👤</span>
              </div>
              <input
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.username 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xl">🔒</span>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ghi nhớ tài khoản</span>
            </label>
            <button 
              type="button" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Đang đăng nhập...
              </div>
            ) : (
              <span className="flex items-center justify-center">
                Đăng nhập
              </span>
            )}
          </button>

          {/* Info Note */}
          <div className="text-center text-sm text-gray-500">
            Sau khi đăng nhập, bạn sẽ cần nhập mã OTP
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;