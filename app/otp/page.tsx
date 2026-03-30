"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminService from '../../services/adminService';

interface FormData {
  otp: string;
}

function Otp() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ otp: "" });
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stored = localStorage.getItem("currentUser");
      const sessionId = stored ? JSON.parse(stored).sessionId : null;
      
      if (!sessionId) {
        alert("Không tìm thấy sessionId. Vui lòng đăng nhập lại!");
        router.push("/login");
        return;
      }


      const result = await AdminService.verifyOtp(formData.otp, sessionId);

      if (result.success) {

       
        const dataOld = JSON.parse(localStorage.getItem("currentUser") || "{}");
        
       
        const userData = {
          ...dataOld,
          ...result.data,
        };

     
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log("Saved user data:", userData);

        alert("Xác thực OTP thành công!");
        
      
        router.push("/admin");
      } else {
        alert(result.error || "Xác thực OTP thất bại!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi verify OTP:", error);
      alert("Đã xảy ra lỗi không mong đợi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/br.jpg')" }}
    >
      <div className="bg-white/[0.08] backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(124,58,237,0.3)] rounded-3xl p-8 w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-[2rem] font-extrabold text-transparent bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 bg-clip-text">
            Nhập OTP
          </h2>
          <p className="text-white/70 mt-2">Vui lòng nhập mã OTP đã được gửi</p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="otp"
              placeholder="Nhập mã OTP"
              value={formData.otp}
              onChange={handleInputChange}
              disabled={loading}
              required
              maxLength={6}
              className="w-full h-14 px-4 bg-white/[0.08] border border-white/20 rounded-2xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/40 placeholder:text-base placeholder:tracking-normal"
            />
            <p className="text-white/50 text-xs mt-2 text-center">
              Mã OTP gồm 6 chữ số
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-2xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang xác thực...
              </span>
            ) : (
              "Xác nhận OTP"
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-white/70 hover:text-white text-sm underline transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </form>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-cyan-900/50 z-0" />
    </div>
  );
}

export default Otp;