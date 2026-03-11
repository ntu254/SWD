import { Bot, Camera, CheckCircle, Leaf, RefreshCw, UploadCloud, Zap } from 'lucide-react';
import React, { useState } from 'react';

const AI_RESULTS = [
  { type: 'Nhựa PET', confidence: 94, color: 'bg-blue-100 text-blue-700', points: '+40 GP' },
  { type: 'Giấy Carton', confidence: 91, color: 'bg-amber-100 text-amber-700', points: '+30 GP' },
  { type: 'Kim Loại', confidence: 88, color: 'bg-gray-100 text-gray-700', points: '+50 GP' },
];

const FEATURES = [
  {
    icon: <Camera size={18} className="text-brand-600" />,
    text: 'Chụp ảnh rác — AI nhận diện loại rác ngay lập tức',
  },
  {
    icon: <CheckCircle size={18} className="text-brand-600" />,
    text: 'Gợi ý điểm thu gom phù hợp gần nhất theo GPS',
  },
  {
    icon: <Zap size={18} className="text-brand-600" />,
    text: 'Tích GreenPoints tự động sau mỗi lần phân loại đúng',
  },
];

const AiSection: React.FC = () => {
  const [currentResult, setCurrentResult] = useState(0);
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setCurrentResult(prev => (prev + 1) % AI_RESULTS.length);
    }, 1200);
  };

  const result = AI_RESULTS[currentResult];

  return (
    <section
      id="ai-support"
      className="py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #ecfdf5 0%, #ffffff 50%, #fffbeb 100%)',
      }}
    >
      {/* Organic blob bg */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <svg
          viewBox="0 0 800 600"
          className="absolute -bottom-20 -left-20 w-[520px] opacity-20 fill-brand-200"
        >
          <path d="M400,300 C320,200 200,180 160,280 C120,380 200,480 300,500 C400,520 520,460 540,360 C560,260 480,400 400,300Z" />
        </svg>
        <svg
          viewBox="0 0 800 600"
          className="absolute -top-10 -right-20 w-[480px] opacity-15 fill-accent-200"
        >
          <path d="M400,250 C450,150 580,120 620,220 C660,320 580,430 480,450 C380,470 270,410 250,310 C230,210 350,350 400,250Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ── Text ── */}
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
              <Bot size={15} />
              AI-Powered
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5">
              Chụp ảnh — <span className="text-brand-500">AI phân loại</span> rác ngay
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Không cần tự mình tra cứu. Chụp ảnh rác, AI GreenLoop sẽ nhận diện loại rác và hướng
              dẫn bạn xử lý đúng cách — tất cả trong vài giây.
            </p>

            <ul className="space-y-4 mb-8">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-brand-100">
                    {f.icon}
                  </div>
                  <span className="text-gray-700 leading-snug pt-1">{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
              <Leaf size={14} className="text-brand-500 fill-brand-500" />
              Hỗ trợ bởi Google Gemini Vision · 95% chính xác
            </div>
          </div>

          {/* ── Interactive Mockup ── */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[360px]">
              {/* Glow ring behind card */}
              <div className="absolute inset-0 bg-brand-300/20 rounded-[2rem] blur-2xl scale-105" />

              <div className="relative bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl border border-white/80 p-6 space-y-5">
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                      <Bot size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-gray-800">EcoBot AI</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Active
                  </span>
                </div>

                {/* Upload / image area */}
                <button
                  onClick={handleScan}
                  className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group
                    ${
                      scanning
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-brand-200 bg-brand-50/50 hover:border-brand-400 hover:bg-brand-50'
                    }`}
                >
                  {scanning ? (
                    <>
                      {/* Scan animation */}
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 border-2 border-brand-400 rounded-2xl animate-ping opacity-20" />
                        <div
                          className="absolute inset-2 border border-brand-300 rounded-xl animate-ping opacity-10"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </div>
                      <RefreshCw size={28} className="text-brand-500 animate-spin" />
                      <p className="text-brand-600 font-semibold text-sm">Đang phân tích...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} className="text-brand-600" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Nhấn để thử demo AI</p>
                      <p className="text-xs text-gray-400">Chụp ảnh hoặc tải lên</p>
                    </>
                  )}
                </button>

                {/* AI Result */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-500 ${scanning ? 'opacity-30' : 'opacity-100'} bg-gray-50 border-gray-100`}
                >
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                    Kết quả phân tích
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${result.color}`}>
                      {result.type}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      {result.confidence}% chính xác
                    </span>
                  </div>

                  {/* Confidence bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Điểm thưởng</span>
                    <span className="font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full text-sm">
                      {result.points}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiSection;
