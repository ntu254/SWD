import Button from '@components/Button';
import { ArrowRight, Bot, Camera, Leaf, MapPin } from 'lucide-react';
import React from 'react';

interface HeroProps {
  onBookNow: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookNow }) => {
  return (
    <section
      id="home"
      className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, #d1fae5 0%, transparent 70%), linear-gradient(to bottom right, #ecfdf5, #ffffff, #f0fdf4)',
      }}
    >
      {/* Dot grid texture overlay */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Organic blobs */}
      <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-8%] w-[640px] h-[640px] bg-brand-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[5%] left-[-12%] w-[520px] h-[520px] bg-accent-100/50 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-brand-100/30 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* ── Text Content ── */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-brand-200 text-brand-700 rounded-full mb-7 text-sm font-semibold tracking-wide shadow-sm">
              <Leaf size={15} className="fill-brand-500 text-brand-500" />
              Chung Tay Vì Một Việt Nam Xanh
            </div>

            {/* Headline — 3-phrase punch */}
            <h1 className="font-display text-5xl lg:text-[4.25rem] font-bold text-gray-900 leading-tight mb-6">
              Báo cáo rác.{' '}
              <span className="text-brand-500 relative inline-block">
                Kiếm điểm.
                {/* underline squiggle */}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M0 6 Q50 0 100 5 Q150 10 200 4"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              Bảo vệ Trái Đất.
            </h1>

            <p className="text-lg text-gray-600 mb-9 leading-relaxed max-w-lg">
              Kết nối cư dân, collector và doanh nghiệp tái chế trong một nền tảng: báo cáo nhanh,
              tích điểm GreenPoints, đổi quà hấp dẫn. AI hỗ trợ phân loại rác tự động.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={onBookNow} size="lg" className="shadow-lg shadow-brand-500/25 group">
                <Camera className="mr-2 w-5 h-5" />
                Báo cáo rác ngay
                <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = '/map')}
                className="border-brand-500 text-brand-700 hover:bg-brand-50"
              >
                <MapPin className="mr-2 w-5 h-5" />
                Xem bản đồ rác
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-11 flex items-center gap-6 text-gray-500 text-sm font-medium">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img
                    key={i}
                    src={`https://picsum.photos/seed/${i + 50}/50/50`}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                ))}
              </div>
              <div>
                <span className="text-brand-600 font-bold block text-lg">50,000+</span>
                Yêu cầu đã xử lý
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <span className="text-gray-800 font-bold block text-lg">4.9 ★</span>
                Đánh giá người dùng
              </div>
            </div>
          </div>

          {/* ── Hero Visual ── */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative z-10 w-full max-w-md mx-auto aspect-square">
              {/* Organic blob SVG */}
              <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[118%] h-[118%] fill-brand-100"
              >
                <path
                  transform="translate(100 100)"
                  d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,96.8,-4.8C95.4,9.6,85.8,23.5,75.1,35.4C64.4,47.3,52.6,57.2,39.9,64.8C27.2,72.4,13.6,77.7,-0.4,78.4C-14.4,79.1,-28.8,75.2,-41.2,67.4C-53.6,59.6,-64,47.9,-72.1,34.7C-80.2,21.5,-86,6.8,-83.4,-6.8C-80.8,-20.4,-69.8,-32.9,-58.5,-43.3C-47.2,-53.7,-35.6,-62,-23.4,-68.8C-11.2,-75.6,1.6,-80.9,14.2,-80.3L26.8,-79.7Z"
                />
              </svg>

              {/* Main image */}
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Recycling Community"
                className="relative z-20 w-full h-full object-cover rounded-[3rem] shadow-2xl shadow-brand-500/20 animate-float"
              />

              {/* Glassmorphism card — Recycled waste */}
              <div className="absolute top-10 -right-6 z-30 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/60 flex items-center gap-3 animate-bounce-slow">
                <div className="bg-brand-100 p-2 rounded-xl">
                  <Leaf className="w-6 h-6 text-brand-600 fill-brand-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Rác tái chế
                  </p>
                  <p className="font-bold text-gray-900 text-base">1,250 Tấn</p>
                </div>
              </div>

              {/* Glassmorphism card — AI accuracy */}
              <div
                className="absolute bottom-16 -left-6 z-30 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/60 flex items-center gap-3 animate-float"
                style={{ animationDelay: '1.5s' }}
              >
                <div className="bg-accent-100 p-2 rounded-xl">
                  <Bot className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    AI phân loại
                  </p>
                  <p className="font-bold text-gray-900 text-base">95% chính xác</p>
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
