import React from 'react';
import Button from '@components/Button';
import { Recycle, Leaf, Camera, Smartphone } from 'lucide-react';

interface HeroProps {
  onBookNow: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookNow }) => {
  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-200 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-accent-100 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full mb-6 text-sm font-semibold tracking-wide uppercase">
              <Leaf size={16} className="fill-brand-500 text-brand-500" />
              Chung Tay Vì Một Việt Nam Xanh
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Nền Tảng Quản Lý <span className="text-brand-500">Rác Thải</span> Toàn Diện
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Kết nối Cư dân, Collector và Doanh nghiệp tái chế: Báo cáo rác thải nhanh chóng, theo dõi tiến độ thu gom, tích điểm thưởng và đổi quà hấp dẫn. AI hỗ trợ phân loại (tùy chọn).
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => window.location.href = '/auth'} size="lg" className="group shadow-brand-500/30">
                <Camera className="mr-2 w-5 h-5" />
                Đăng Ký Ngay
              </Button>
              <Button variant="outline" size="lg">
                <Smartphone className="mr-2 w-5 h-5" />
                Tải App GreenLoop
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-6 text-gray-500 text-sm font-medium">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/seed/${i + 50}/50/50`}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <div>
                <span className="text-brand-600 font-bold block text-lg">50,000+</span>
                Yêu cầu đã xử lý
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative z-10 w-full max-w-md mx-auto aspect-square">
              {/* Blob Shape Background */}
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] text-brand-200 fill-current">
                <path transform="translate(100 100)" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,96.8,-4.8C95.4,9.6,85.8,23.5,75.1,35.4C64.4,47.3,52.6,57.2,39.9,64.8C27.2,72.4,13.6,77.7,-0.4,78.4C-14.4,79.1,-28.8,75.2,-41.2,67.4C-53.6,59.6,-64,47.9,-72.1,34.7C-80.2,21.5,-86,6.8,-83.4,-6.8C-80.8,-20.4,-69.8,-32.9,-58.5,-43.3C-47.2,-53.7,-35.6,-62,-23.4,-68.8C-11.2,-75.6,1.6,-80.9,14.2,-80.3L26.8,-79.7Z" />
              </svg>

              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Recycling Community"
                className="relative z-20 w-full h-full object-cover rounded-[3rem] shadow-2xl animate-float mask-image"
                style={{
                  maskImage: 'url(#blob)',
                  WebkitMaskImage: 'url(#blob)'
                }}
              />

              {/* Floating Cards */}
              <div className="absolute top-10 -right-4 z-30 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="bg-green-100 p-2 rounded-full">
                  <Leaf className="w-6 h-6 text-green-600 fill-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Rác đã phân loại</p>
                  <p className="font-bold text-gray-800">1,250 Tấn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;