import React, { useState, useRef } from 'react';
import { X, Camera, MapPin, CheckCircle, Upload, ScanLine, Loader2, AlertTriangle, Edit3 } from 'lucide-react';
import Button from '@components/Button';
import { analyzeWasteImage } from '@services/geminiService';

interface SmartReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmartReportModal: React.FC<SmartReportModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: AI Analysis, 3: Details, 4: Success
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ type: string; confidence: string; points: number; message: string } | null>(null);
  const [location, setLocation] = useState("Đang lấy tọa độ...");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        analyzeImage(base64.split(',')[1]); // Send base64 data without prefix
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Data: string) => {
    setStep(2);
    setIsAnalyzing(true);
    // Simulate GPS fetch
    setTimeout(() => setLocation("10.762622, 106.660172 (Quận 1, TP.HCM)"), 1000);

    // Call AI
    const result = await analyzeWasteImage(base64Data);
    setAiResult(result);
    setIsAnalyzing(false);
  };

  const handleConfirmAnalysis = () => {
    setStep(3);
  };

  const handleSubmitReport = () => {
    setStep(4);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setImagePreview(null);
      setAiResult(null);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-brand-500 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Camera size={24} />
            <h2 className="text-xl font-display font-bold">Báo Cáo Rác & Tích Điểm</h2>
          </div>
          <button onClick={handleClose} className="hover:bg-brand-600 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-3 border-dashed border-gray-300 rounded-3xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-50 hover:border-brand-300 transition-all group"
              >
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-brand-500" />
                </div>
                <p className="text-gray-600 font-medium">Chạm để chụp hoặc tải ảnh lên</p>
                <p className="text-xs text-gray-400 mt-2">AI sẽ tự động nhận diện loại rác</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          )}

          {/* Step 2: Analysis */}
          {step === 2 && (
            <div className="flex flex-col items-center py-4">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6 bg-black">
                <img src={imagePreview || ''} alt="Waste" className="w-full h-full object-contain opacity-80" />
                {isAnalyzing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <ScanLine className="w-16 h-16 animate-pulse text-brand-400 mb-4" />
                    <p className="font-display text-lg animate-pulse">AI đang phân tích...</p>
                  </div>
                ) : (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-brand-300 font-bold uppercase tracking-wider">Đã phát hiện</p>
                        <p className="text-xl font-bold">{aiResult?.type}</p>
                      </div>
                      <div className="bg-brand-500 px-3 py-1 rounded-full text-xs font-bold">
                        {aiResult?.confidence} Độ tin cậy
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isAnalyzing && aiResult && (
                <div className="w-full space-y-4 animate-in slide-in-from-bottom-4">
                  <div className="bg-accent-50 border border-accent-200 p-4 rounded-xl flex gap-3">
                    <AlertTriangle className="text-accent-500 shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-gray-700">{aiResult.message}</p>
                      <p className="text-sm font-bold text-accent-600 mt-1">
                        Điểm thưởng dự kiến: +{aiResult.points} GreenPoints
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" fullWidth onClick={() => setStep(1)}>Chụp Lại</Button>
                    <Button fullWidth onClick={handleConfirmAnalysis}>Xác Nhận Đúng</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Loại Rác (Đã xác nhận)</label>
                <div className="flex items-center justify-between p-3 bg-brand-50 rounded-xl border border-brand-200">
                  <span className="font-medium text-brand-800">{aiResult?.type}</span>
                  <Edit3 size={16} className="text-brand-500 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Vị Trí (GPS)</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 text-sm">
                  <MapPin size={16} className="text-red-500" />
                  {location}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ghi Chú Cho Collector</label>
                <textarea
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  rows={3}
                  placeholder="VD: Rác đã được phân loại vào túi xanh, đặt trước cổng..."
                ></textarea>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-500">
                * Báo cáo của bạn sẽ được gửi tới Doanh nghiệp xử lý trong khu vực. Trạng thái sẽ được cập nhật liên tục.
              </div>

              <Button fullWidth size="lg" onClick={handleSubmitReport}>Gửi Báo Cáo Ngay</Button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Báo Cáo Thành Công!</h3>
              <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                Cảm ơn bạn đã chung tay bảo vệ môi trường.
                <br />
                Yêu cầu đang ở trạng thái: <span className="font-bold text-yellow-500">Pending</span>.
                <br />
                <span className="font-bold text-brand-600 text-lg block mt-2">+{aiResult?.points} GreenPoints</span>
              </p>
              <Button onClick={handleClose} variant="secondary">Về Trang Chủ</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartReportModal;