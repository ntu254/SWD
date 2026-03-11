import { ArrowRight, Building2, Leaf, Recycle } from 'lucide-react';
import React from 'react';

interface CTASectionProps {
  onAction: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onAction }) => {
  return (
    <section
      id="cta"
      className="relative py-28 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1a0f 0%, #064e3b 45%, #065f46 100%)' }}
    >
      {/* Organic blob decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-brand-600/5 rounded-full blur-2xl" />
      </div>

      {/* Dot grid subtle overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, #6ee7b7 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating eco icons */}
      <div
        className="absolute top-10 left-[8%] opacity-20 animate-float"
        style={{ animationDelay: '0s' }}
      >
        <Leaf size={40} className="text-brand-300 fill-brand-300" />
      </div>
      <div
        className="absolute bottom-12 right-[10%] opacity-20 animate-float"
        style={{ animationDelay: '2s' }}
      >
        <Recycle size={48} className="text-brand-300" />
      </div>
      <div className="absolute top-1/2 left-[5%] opacity-10 animate-bounce-slow">
        <Leaf size={24} className="text-brand-400 fill-brand-400" />
      </div>
      <div
        className="absolute top-8 right-[15%] opacity-10 animate-float"
        style={{ animationDelay: '1s' }}
      >
        <Recycle size={28} className="text-brand-300" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center max-w-3xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-brand-200 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider mb-8">
          <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
          Tham gia ngay hôm nay
        </div>

        <h2 className="font-display text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Hành động ngay. <span className="text-brand-300">Trái Đất cần bạn.</span>
        </h2>

        <p className="text-lg text-brand-100/80 mb-10 leading-relaxed max-w-xl mx-auto">
          Hàng nghìn người dùng đã bắt đầu. Báo cáo rác, tích điểm và đổi quà — hoặc đăng ký làm đối
          tác doanh nghiệp tái chế.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all duration-200 hover:scale-105 group text-base"
          >
            <Recycle size={20} />
            Báo cáo rác ngay
            <ArrowRight
              size={18}
              className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
            />
          </button>

          <button
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 text-white font-bold rounded-2xl border border-white/30 hover:border-white/60 transition-all duration-200 hover:scale-105 text-base"
          >
            <Building2 size={20} />
            Đăng ký đối tác doanh nghiệp
          </button>
        </div>

        {/* Trust strip */}
        <div className="mt-12 flex items-center justify-center gap-8 flex-wrap text-sm text-brand-200/60">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
            Miễn phí cho cư dân
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
            Không cần thẻ tín dụng
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
            50,000+ người dùng tin tưởng
          </span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
