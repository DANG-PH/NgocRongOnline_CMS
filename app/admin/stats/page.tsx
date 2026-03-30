// app/admin/stats/page.tsx
"use client"

import { useState } from "react"

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState("7days")

  const revenueData = [
    { day: "Thứ 2", revenue: 4500000, orders: 45 },
    { day: "Thứ 3", revenue: 6200000, orders: 62 },
    { day: "Thứ 4", revenue: 5800000, orders: 58 },
    { day: "Thứ 5", revenue: 7200000, orders: 72 },
    { day: "Thứ 6", revenue: 8900000, orders: 89 },
    { day: "Thứ 7", revenue: 12000000, orders: 120 },
    { day: "CN", revenue: 14500000, orders: 145 },
  ]

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0)
  const avgRevenue = Math.round(totalRevenue / revenueData.length)
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    return `${(amount / 1000).toFixed(0)}K`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">💰 Thống Kê Doanh Thu</h1>
          <p className="text-gray-600 mt-2">Theo dõi doanh thu theo ngày</p>
        </div>
        
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FFC000] font-medium"
        >
          <option value="7days">7 ngày qua</option>
          <option value="30days">30 ngày qua</option>
          <option value="90days">90 ngày qua</option>
          <option value="year">Năm nay</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Tổng doanh thu</p>
              <p className="text-2xl font-bold mt-2">{formatShortCurrency(totalRevenue)}</p>
              <p className="text-green-100 text-sm mt-2">↑ 15% so với tuần trước</p>
            </div>
            <div className="text-5xl opacity-20">💵</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Trung bình/ngày</p>
              <p className="text-2xl font-bold mt-2">{formatShortCurrency(avgRevenue)}</p>
              <p className="text-blue-100 text-sm mt-2">↑ 8% so với tuần trước</p>
            </div>
            <div className="text-5xl opacity-20">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Tổng đơn hàng</p>
              <p className="text-3xl font-bold mt-2">{totalOrders}</p>
              <p className="text-purple-100 text-sm mt-2">↑ 12% so với tuần trước</p>
            </div>
            <div className="text-5xl opacity-20">🛒</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Cao nhất</p>
              <p className="text-2xl font-bold mt-2">{formatShortCurrency(maxRevenue)}</p>
              <p className="text-yellow-100 text-sm mt-2">Chủ nhật</p>
            </div>
            <div className="text-5xl opacity-20">🏆</div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Biểu đồ doanh thu 7 ngày</h2>
        
        <div className="space-y-4">
          {revenueData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700 w-20">{item.day}</span>
                <span className="font-bold text-gray-900">{formatCurrency(item.revenue)}</span>
              </div>
              
              <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 rounded-lg transition-all duration-700 flex items-center justify-end pr-3"
                  style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                >
                  <span className="text-white text-xs font-bold">
                    {item.orders} đơn
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Chi tiết theo ngày</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trung bình/đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueData.map((item, index) => {
                const avgPerOrder = Math.round(item.revenue / item.orders)
                const percentage = ((item.revenue / totalRevenue) * 100).toFixed(1)
                
                return (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📅</span>
                        <span className="text-sm font-medium text-gray-900">{item.day}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(item.revenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.orders}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatCurrency(avgPerOrder)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">{percentage}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-[#FFC000] to-yellow-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">💡 Thông tin</h3>
            <p className="text-yellow-50">
              Doanh thu tăng mạnh vào cuối tuần. Chủ nhật có doanh thu cao nhất với <strong>{formatCurrency(maxRevenue)}</strong>.
            </p>
          </div>
          <div className="text-6xl opacity-30">📈</div>
        </div>
      </div>
    </div>
  )
}