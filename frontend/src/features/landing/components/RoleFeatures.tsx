import React, { useState } from 'react';
import { User, Truck, Building2, CheckCircle, BarChart, MapPin, TrendingUp, Clock, Navigation } from 'lucide-react';
import Button from '@components/Button';

type RoleType = 'citizen' | 'enterprise' | 'collector' | 'admin';

const ROLE_DATA = {
  citizen: {
    title: 'Dành Cho Cư Dân (Citizen)',
    desc: 'Tham gia mạng lưới xanh, báo cáo rác thải thông minh và nhận quà hấp dẫn.',
    features: [
      'AI Advisory: Hỗ trợ gợi ý loại rác từ ảnh chụp (Cư dân xác nhận phân loại).',
      'Tracking: Theo dõi trạng thái rác (Pending -> Collected) theo thời gian thực.',
      'Gamification: Tích điểm GreenPoints, đua Top bảng xếp hạng khu vực.',
      'Feedback: Đánh giá chất lượng thu gom của Collector.'
    ],
    cta: 'Tải App Cư Dân'
  },
  enterprise: {
    title: 'Doanh Nghiệp Tái Chế',
    desc: 'Quản lý năng lực xử lý, tối ưu hóa vận hành và giám sát đội ngũ.',
    features: [
      'Dashboard: Giám sát toàn bộ KPI, công suất xử lý theo thời gian thực.',
      'Điều phối: Gán việc tự động cho Collector dựa trên vị trí và năng lực.',
      'Analytics: Báo cáo khối lượng rác, hiệu suất thu gom theo khu vực.',
      'Cấu hình: Thiết lập quy tắc tính điểm thưởng và tiếp nhận loại rác.'
    ],
    cta: 'Đăng Ký Đối Tác'
  },
  collector: {
    title: 'Người Thu Gom (Collector)',
    desc: 'Tăng thu nhập, nhận thưởng bonus và tối ưu lộ trình làm việc.',
    features: [
      'Nhận việc thông minh: Nhận yêu cầu gần nhất từ Doanh nghiệp.',
      'Bonus KPI: Thưởng thêm khi đạt định mức (số kg/ngày, số đơn/ngày).',
      'Check-in: Xác nhận hoàn tất thu gom bằng hình ảnh minh bạch.',
      'Đánh giá: Chấm điểm phân loại rác của người dân để cộng điểm.'
    ],
    cta: 'Đăng Ký Collector'
  },
  admin: {
    title: 'Quản Trị Viên (Admin)',
    desc: 'Giám sát toàn hệ thống, quản lý rewards và giải quyết khiếu nại.',
    features: [
      'Dashboard: Theo dõi toàn bộ hoạt động hệ thống real-time.',
      'User Management: Quản lý Citizen, Enterprise, Collector.',
      'Reward Management: Thiết lập quà tặng và duyệt redemption.',
      'Complaint Resolution: Xử lý khiếu nại từ citizen về chất lượng.'
    ],
    cta: 'Đăng Nhập Admin'
  }
};

const RoleFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RoleType>('citizen');

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Giải Pháp Toàn Diện</h2>
          <p className="text-gray-600">Kết nối chặt chẽ 4 nhân tố quan trọng của nền kinh tế tuần hoàn.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-full inline-flex">
            {(['citizen', 'enterprise', 'collector', 'admin'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === role
                  ? 'bg-white text-brand-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                  } flex items-center gap-2 capitalize`}
              >
                {role === 'citizen' && <User size={16} />}
                {role === 'enterprise' && <Building2 size={16} />}
                {role === 'collector' && <Truck size={16} />}
                {role === 'admin' && <BarChart size={16} />}
                {role === 'citizen' ? 'Cư Dân' : role === 'enterprise' ? 'Doanh Nghiệp' : role === 'collector' ? 'Collector' : 'Admin'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center bg-brand-50 rounded-3xl p-8 md:p-12 border border-brand-100">
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-3xl font-display font-bold text-gray-900">{ROLE_DATA[activeTab].title}</h3>
            <p className="text-lg text-gray-700">{ROLE_DATA[activeTab].desc}</p>

            <ul className="space-y-4">
              {ROLE_DATA[activeTab].features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 bg-white p-1 rounded-full text-brand-500 shadow-sm">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Button size="lg">{ROLE_DATA[activeTab].cta}</Button>
            </div>
          </div>

          <div className="relative h-full min-h-[300px] flex items-center justify-center">
            {/* Abstract UI Mockup based on role */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm rotate-3 border border-gray-100 transition-all duration-300 hover:rotate-0">
              {activeTab === 'citizen' && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="font-bold text-gray-800">Báo Cáo Mới</span>
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">Pending</span>
                  </div>
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=300&h=200" alt="Plastic" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <CheckCircle className="text-white drop-shadow-md" size={32} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Loại rác:</span>
                    <span className="font-bold text-brand-600">Nhựa Tái Chế</span>
                  </div>
                  <div className="w-full bg-brand-500 text-white text-center py-2 rounded-lg font-bold shadow-brand-500/20 shadow-lg">
                    +50 GreenPoints
                  </div>
                </div>
              )}

              {activeTab === 'enterprise' && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart className="text-brand-500" />
                    <span className="font-bold">Hiệu Suất Khu Vực A</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-green-50 p-2 rounded-xl text-center border border-green-100">
                      <div className="text-xs text-gray-500 mb-1">Đã thu gom</div>
                      <div className="font-bold text-green-700 text-lg">1,205 <span className="text-xs">kg</span></div>
                    </div>
                    <div className="flex-1 bg-blue-50 p-2 rounded-xl text-center border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1">KPI Collector</div>
                      <div className="font-bold text-blue-700 text-lg">98%</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                    Danh sách yêu cầu chờ duyệt: <span className="font-bold text-gray-800">5</span>
                  </div>
                </div>
              )}

              {activeTab === 'collector' && (
                <div className="space-y-5 animate-in slide-in-from-bottom-4">
                  {/* KPI Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                      <div className="text-xs text-gray-500 font-medium mb-1">Đơn Hoàn Thành</div>
                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-blue-600">08</span>
                        <span className="text-xs text-gray-400 mb-1">/12</span>
                      </div>
                      <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2">
                        <div className="bg-blue-500 h-1.5 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-2xl border border-green-100">
                      <div className="text-xs text-gray-500 font-medium mb-1">Thưởng (Bonus)</div>
                      <div className="text-2xl font-bold text-green-600">450k</div>
                      <div className="text-[10px] text-green-700 bg-green-200 px-1.5 py-0.5 rounded inline-block mt-2 flex items-center gap-1">
                        <TrendingUp size={10} /> +12%
                      </div>
                    </div>
                  </div>

                  {/* Assigned Task Detail */}
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 relative overflow-hidden group/card hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                      Nhiệm vụ mới
                    </div>

                    <div className="flex gap-3 mb-3 relative">
                      <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                        <img src="https://i.pravatar.cc/150?u=8" alt="Customer" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Nguyễn Văn A</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={10} />
                          <span>Vừa xong • 2 phút trước</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                          <Truck size={12} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-700 block">Rác Nhựa Tái Chế</span>
                          <span className="text-[10px] text-gray-500">Ước lượng: 5kg</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                          <MapPin size={12} />
                        </div>
                        <span className="text-xs text-gray-600 leading-tight">123 Nguyễn Huệ, P. Bến Nghé, Q.1</span>
                      </div>
                    </div>

                    {/* Confirmation Button */}
                    <button className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group-hover/card:bg-brand-600">
                      <Navigation size={16} />
                      <span>Xác Nhận & Di Chuyển</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart className="text-brand-500" size={20} />
                    <span className="font-bold text-gray-800">System Overview</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1">Total Users</div>
                      <div className="text-2xl font-bold text-blue-600">1,245</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                      <div className="text-xs text-gray-500 mb-1">Active Tasks</div>
                      <div className="text-2xl font-bold text-green-600">387</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <div className="text-xs text-gray-500 mb-1">Complaints</div>
                      <div className="text-2xl font-bold text-amber-600">12</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                      <div className="text-xs text-gray-500 mb-1">Redemptions</div>
                      <div className="text-2xl font-bold text-purple-600">56</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white p-4 rounded-xl">
                    <div className="text-xs opacity-90 mb-1">System Performance</div>
                    <div className="text-lg font-bold">98.5% Uptime</div>
                    <div className="text-[10px] opacity-75 mt-1">All services operational ✓</div>
                  </div>
                </div>
              )}
            </div>

            {/* Decorative blob behind */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-brand-200 to-accent-200 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleFeatures;