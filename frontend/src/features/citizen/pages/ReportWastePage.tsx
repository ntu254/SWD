import Button from '@components/Button';
import type { WasteTypeResponse } from '@shared/services/api';
import { wasteReportService } from '@shared/services/api';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Camera,
  CheckCircle2,
  FileText,
  FlaskConical,
  Leaf,
  MapPin,
  Navigation,
  Package,
  RefreshCw,
  Upload,
  Weight,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, label: 'Ảnh rác', icon: Camera },
  { id: 2, label: 'Vị trí', icon: MapPin },
  { id: 3, label: 'Phân loại', icon: FlaskConical },
  { id: 4, label: 'Mô tả', icon: FileText },
  { id: 5, label: 'Xác nhận', icon: CheckCircle2 },
];

const STATIC_TYPE_ICONS: Record<string, React.ReactNode> = {
  RECYCLABLE: <Leaf className="text-brand-600" size={22} />,
  ORGANIC: <Package className="text-green-600" size={22} />,
  HAZARDOUS: <AlertTriangle className="text-red-600" size={22} />,
  GENERAL: <FlaskConical className="text-gray-600" size={22} />,
};
const DEFAULT_ICON = <FlaskConical className="text-gray-500" size={22} />;

const ReportWastePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiScanning, setAiScanning] = useState(false);
  const [wasteType, setWasteType] = useState(''); // stores UUID
  const [location, setLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdReportId, setCreatedReportId] = useState<string>('');
  const [wasteTypes, setWasteTypes] = useState<WasteTypeResponse[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    wasteReportService
      .getActiveWasteTypes()
      .then(types => setWasteTypes(types))
      .catch(() => {
        /* fallback: leave empty */
      });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      // Simulate AI scan
      setAiScanning(true);
      setTimeout(() => {
        setAiSuggestion('Recyclable');
        setAiScanning(false);
      }, 1800);
    };
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocationLoading(false);
      },
      () => {
        setLocation('Tìm vị trí thất bại — nhập địa chỉ thủ công');
        setLocationLoading(false);
      }
    );
  };

  const canNext = () => {
    if (step === 1) return !!imagePreview;
    if (step === 2) return !!location;
    if (step === 3) return !!wasteType;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const report = await wasteReportService.createReport({
        wasteTypeId: wasteType || undefined,
        addressText: location || undefined,
        latitude: lat,
        longitude: lng,
        noteText: description || undefined,
        photoUrl: imagePreview ?? undefined,
      });
      setCreatedReportId(report.reportId);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Gửi báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={42} className="text-brand-600" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Báo cáo thành công!
          </h2>
          <p className="text-gray-500">Cảm ơn bạn đã đóng góp cho môi trường xanh.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 w-full space-y-3 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Mã báo cáo</span>
            <span className="font-bold text-gray-900">{createdReportId || 'RPT-??????'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Trạng thái</span>
            <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 border border-yellow-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              Pending
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Dự kiến thu gom</span>
            <span className="font-semibold text-gray-700">Trong 24 giờ</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Điểm sẽ nhận</span>
            <span className="font-bold text-brand-600">+50 GP</span>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="outline" fullWidth onClick={() => navigate('/citizen/my-reports')}>
            Theo dõi báo cáo
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setStep(1);
              setImagePreview(null);
              setAiSuggestion(null);
              setWasteType('');
              setLocation('');
              setDescription('');
              setWeight('');
              setSubmitted(false);
            }}
          >
            Báo cáo thêm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Báo cáo rác thải</h1>
        <p className="text-gray-500 text-sm mt-1">
          Điền thông tin để tạo báo cáo — AI sẽ hỗ trợ phân loại tự động.
        </p>
      </div>

      {/* ── Step Progress ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                  ${
                    step > s.id
                      ? 'bg-brand-500 text-white'
                      : step === s.id
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s.id ? <CheckCircle2 size={18} /> : <s.icon size={16} />}
                </div>
                <span
                  className={`text-[10px] font-semibold hidden sm:block ${step >= s.id ? 'text-brand-600' : 'text-gray-400'}`}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-4 rounded transition-colors ${step > s.id ? 'bg-brand-400' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Step Panels ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Step 1 — Image Upload */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Camera size={20} className="text-brand-600" /> Upload ảnh rác
            </h2>
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-200 hover:border-brand-400 bg-brand-50/50 rounded-2xl h-56 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group"
              >
                <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={26} className="text-brand-600" />
                </div>
                <p className="font-semibold text-gray-700">Nhấn để tải ảnh</p>
                <p className="text-xs text-gray-400">JPG, PNG, WEBP · Tối đa 10MB</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden h-64 border border-gray-100">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setAiSuggestion(null);
                  }}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow text-gray-600 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
                {/* AI Scanning indicator */}
                {aiScanning && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl">
                      <RefreshCw size={20} className="text-brand-500 animate-spin" />
                      <span className="font-semibold text-gray-800 text-sm">
                        AI đang phân tích...
                      </span>
                    </div>
                  </div>
                )}
                {aiSuggestion && !aiScanning && (
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2 border border-brand-100">
                    <Bot size={16} className="text-brand-600" />
                    <span className="text-sm text-gray-700">
                      AI gợi ý: <span className="font-bold text-brand-600">{aiSuggestion}</span>
                    </span>
                    <span className="text-xs text-gray-400">(94%)</span>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl text-sm font-semibold hover:bg-brand-100 transition-colors"
              >
                <Camera size={16} /> Chụp ảnh
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                <Upload size={16} /> Từ thư viện
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <MapPin size={20} className="text-brand-600" /> Vị trí rác
            </h2>
            {/* Map placeholder */}
            <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-brand-50 border border-brand-100 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mx-auto">
                  <MapPin size={22} className="text-brand-600 fill-brand-100" />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Nhấn "Lấy vị trí" để hiển thị bản đồ
                </p>
              </div>
              {location && (
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-100 shadow-sm flex items-center gap-2">
                  <Navigation size={13} className="text-brand-500" />
                  {location}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <button
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
              >
                {locationLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Navigation size={16} />
                )}
                {locationLoading ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại (GPS)'}
              </button>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Hoặc nhập địa chỉ
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="VD: 123 Nguyễn Trãi, Phường 2, Q.1, TP.HCM"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Waste Type */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <FlaskConical size={20} className="text-brand-600" /> Loại rác
            </h2>
            {aiSuggestion && (
              <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                <Bot size={18} className="text-brand-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    AI gợi ý: <span className="text-brand-600">{aiSuggestion}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    94% độ chính xác — bạn có thể chọn lại nếu cần
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {wasteTypes.length === 0 ? (
                <p className="col-span-2 text-sm text-gray-400 text-center py-4">
                  Đang tải loại rác...
                </p>
              ) : (
                wasteTypes.map((wt: WasteTypeResponse) => {
                  const codeKey = wt.code?.toUpperCase() ?? '';
                  const icon = STATIC_TYPE_ICONS[codeKey] ?? DEFAULT_ICON;
                  const isSelected = wasteType === wt.typeId;
                  return (
                    <button
                      key={wt.typeId}
                      onClick={() => setWasteType(wt.typeId)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-300'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="mb-2">{icon}</div>
                      <p className="font-bold text-gray-800 text-sm">{wt.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {wt.description || `${wt.pointsPerKg} đ/kg`}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Step 4 — Description */}
        {step === 4 && (
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-brand-600" /> Mô tả thêm
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về rác, ví dụ: rác chất thành đống, có mùi..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Weight size={14} className="inline mr-1" />
                Ước tính khối lượng (tùy chọn)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="VD: 5"
                  className="w-32 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                />
                <span className="text-sm text-gray-500 font-medium">kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Confirm */}
        {step === 5 && (
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-brand-600" /> Xác nhận thông tin
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: 'Loại rác',
                  value:
                    wasteTypes.find((w: WasteTypeResponse) => w.typeId === wasteType)?.name ??
                    wasteType,
                },
                { label: 'Vị trí', value: location },
                { label: 'Mô tả', value: description || '—' },
                { label: 'Khối lượng', value: weight ? `${weight} kg` : '—' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-start text-sm bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                >
                  <span className="text-gray-500 font-medium">{item.label}</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[60%]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Report preview"
                className="w-full h-40 object-cover rounded-2xl border border-gray-100"
              />
            )}
            <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Điểm thưởng dự kiến</span>
              <span className="font-display font-bold text-brand-600 text-lg">+50 GP</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
          ) : (
            <button
              onClick={() => navigate('/citizen')}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Hủy
            </button>
          )}

          {step < 5 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2"
            >
              Tiếp theo <ArrowRight size={16} />
            </Button>
          ) : (
            <>
              {submitError && <p className="text-red-500 text-xs">{submitError}</p>}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}{' '}
                Gửi báo cáo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportWastePage;
