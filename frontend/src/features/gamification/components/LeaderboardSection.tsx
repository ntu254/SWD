import React from 'react';
import { Trophy, Medal, Flame } from 'lucide-react';

const LeaderboardSection: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-white via-brand-50/50 to-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-100 rounded-full blur-[100px] mix-blend-multiply" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-100 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-accent-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 border border-accent-200 shadow-sm animate-bounce-slow">
            <Flame size={16} className="fill-accent-500 text-accent-500" />
            Gamification & Rewards
          </div>
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Bảng Xếp Hạng GreenLoop</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Vinh danh những cá nhân và Collector có đóng góp xuất sắc nhất cho môi trường tháng này.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Top Citizens */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-brand-100/50 border border-gray-100 relative group hover:border-brand-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy size={140} className="text-brand-500 rotate-12" />
             </div>
             
             <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Trophy size={28} className="fill-brand-600" />
                </div>
                <div>
                   <h3 className="text-2xl font-display font-bold text-gray-900">Cư Dân Tiêu Biểu</h3>
                   <p className="text-gray-500 text-sm font-medium">Xếp hạng theo điểm phân loại đúng</p>
                </div>
             </div>

             <div className="space-y-3 relative z-10">
                {[
                  { name: 'Nguyễn Thúy An', points: '5,250', rank: 1, avatar: 'https://i.pravatar.cc/150?u=1' },
                  { name: 'Trần Minh Đức', points: '4,800', rank: 2, avatar: 'https://i.pravatar.cc/150?u=2' },
                  { name: 'Phạm Văn Hùng', points: '4,150', rank: 3, avatar: 'https://i.pravatar.cc/150?u=3' },
                ].map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-brand-50 border border-transparent hover:border-brand-100 transition-all group/item cursor-default">
                     <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full shadow-sm text-sm ${
                          idx === 0 ? 'bg-yellow-400 text-white ring-2 ring-yellow-200' : 
                          idx === 1 ? 'bg-gray-400 text-white ring-2 ring-gray-200' : 
                          'bg-orange-400 text-white ring-2 ring-orange-200'
                        }`}>
                          {user.rank}
                        </div>
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                        <span className="font-bold text-gray-800 text-lg">{user.name}</span>
                     </div>
                     <span className="font-display font-bold text-brand-600 bg-white px-4 py-1.5 rounded-full shadow-sm border border-brand-100 group-hover/item:scale-105 transition-transform">
                        {user.points} <span className="text-xs font-sans font-normal text-gray-500">GP</span>
                     </span>
                  </div>
                ))}
             </div>
          </div>

          {/* Top Collectors */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-accent-100/50 border border-gray-100 relative group hover:border-accent-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Medal size={140} className="text-accent-500 rotate-12" />
             </div>

             <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Medal size={28} className="fill-accent-600" />
                </div>
                <div>
                   <h3 className="text-2xl font-display font-bold text-gray-900">Collector Xuất Sắc</h3>
                   <p className="text-gray-500 text-sm font-medium">Xếp hạng theo KPI & Đánh giá</p>
                </div>
             </div>

             <div className="space-y-3 relative z-10">
                {[
                  { name: 'Lê Văn Tám', kpi: '105%', bonus: '+500k', rank: 1, avatar: 'https://i.pravatar.cc/150?u=4' },
                  { name: 'Đỗ Thị Mai', kpi: '102%', bonus: '+300k', rank: 2, avatar: 'https://i.pravatar.cc/150?u=5' },
                  { name: 'Vũ Quốc Huy', kpi: '100%', bonus: '+100k', rank: 3, avatar: 'https://i.pravatar.cc/150?u=6' },
                ].map((col, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-accent-50 border border-transparent hover:border-accent-100 transition-all cursor-default">
                     <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full shadow-sm text-sm ${
                          idx === 0 ? 'bg-yellow-400 text-white ring-2 ring-yellow-200' : 
                          idx === 1 ? 'bg-gray-400 text-white ring-2 ring-gray-200' : 
                          'bg-orange-400 text-white ring-2 ring-orange-200'
                        }`}>
                          {col.rank}
                        </div>
                        <img src={col.avatar} alt={col.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                        <div>
                           <span className="font-bold block text-gray-800 text-lg">{col.name}</span>
                           <span className="inline-flex items-center gap-1 text-xs text-brand-700 font-bold bg-brand-100 px-2 py-0.5 rounded-md mt-1">
                              KPI: {col.kpi}
                           </span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="block font-bold text-accent-600 text-sm uppercase tracking-wide">Thưởng</span>
                        <span className="text-base font-bold text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm mt-1 inline-block">{col.bonus}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;