import Button from '@components/Button';
import { useAuth } from '@shared/contexts';
import type { CitizenComplaintResponse, ComplaintCategory } from '@shared/services/api';
import { citizenComplaintService } from '@shared/services/api';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const COMPLAINT_TYPES = [
  { id: 'collector_behavior', label: 'Hành vi Collector', desc: 'Thái độ, cách xử lý không đúng' },
  { id: 'delayed_collection', label: 'Thu gom chậm trễ', desc: 'Quá 48h chưa được thu gom' },
  { id: 'wrong_points', label: 'Điểm không đúng', desc: 'Điểm thưởng tính sai' },
  { id: 'system_bug', label: 'Lỗi hệ thống', desc: 'App báo lỗi, không hoạt động' },
  { id: 'other', label: 'Khác', desc: 'Vấn đề không thuộc danh mục trên' },
];

const CATEGORY_MAP: Record<string, ComplaintCategory> = {
  collector_behavior: 'COLLECTION_ISSUE',
  delayed_collection: 'SERVICE_ISSUE',
  wrong_points: 'POINTS_ERROR',
  system_bug: 'BUG',
  other: 'OTHER',
};

const STATUS_MAP: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  Pending: {
    label: 'Đang xử lý',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <Clock size={12} />,
  },
  In_Progress: {
    label: 'Đang xử lý',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Clock size={12} />,
  },
  Resolved: {
    label: 'Đã giải quyết',
    badge: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle2 size={12} />,
  },
  Rejected: {
    label: 'Đã từ chối',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: <X size={12} />,
  },
};

const ComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pastComplaints, setPastComplaints] = useState<CitizenComplaintResponse[]>([]);
  const [createdId, setCreatedId] = useState<string>('');

  const citizenId: string = (user as any)?.userId ?? (user?.id != null ? String(user.id) : '');

  useEffect(() => {
    if (!citizenId) return;
    citizenComplaintService
      .getMyCcomplaints(citizenId, 0, 20)
      .then(page => setPastComplaints((page as any)?.content ?? []))
      .catch(() => {});
  }, [citizenId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !description.trim() || !citizenId) return;
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const res = await citizenComplaintService.createComplaint(citizenId, {
        title: COMPLAINT_TYPES.find(t => t.id === selectedType)?.label ?? selectedType,
        content: description,
        category: CATEGORY_MAP[selectedType] ?? 'OTHER',
      });
      setCreatedId((res as any)?.complaintId ?? '');
      setSubmitted(true);
      citizenComplaintService
        .getMyCcomplaints(citizenId, 0, 20)
        .then(page => setPastComplaints((page as any)?.content ?? []))
        .catch(() => {});
    } catch {
      setSubmitError('Gửi khiếu nại thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAttachments(prev => [...prev, reader.result as string]);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Khiếu nại & Phản hồi</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gửi vấn đề bạn gặp phải — đội ngũ sẽ phản hồi trong 24 giờ.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* ── Form ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} className="text-brand-600" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900">Đã gửi khiếu nại!</h3>
              <p className="text-gray-500 text-sm">
                Mã khiếu nại:{' '}
                <span className="font-bold text-gray-800">
                  {createdId ? createdId.slice(0, 8).toUpperCase() : 'N/A'}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Chúng tôi sẽ phản hồi trong vòng 24 giờ qua email của bạn.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setSelectedType('');
                  setDescription('');
                  setAttachments([]);
                }}
              >
                Gửi khiếu nại khác
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare size={16} className="text-brand-600" /> Tạo khiếu nại mới
              </h3>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại khiếu nại *
                </label>
                <div className="space-y-2">
                  {COMPLAINT_TYPES.map(t => (
                    <label
                      key={t.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-brand-200 ${
                        selectedType === t.id
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-100 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="complaintType"
                        value={t.id}
                        checked={selectedType === t.id}
                        onChange={() => setSelectedType(t.id)}
                        className="mt-0.5 accent-brand-500"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{t.label}</p>
                        <p className="text-xs text-gray-500">{t.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mô tả chi tiết *
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả vấn đề bạn gặp phải..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none transition-all"
                  required
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ảnh đính kèm (tùy chọn)
                </label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((src, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {attachments.length < 3 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-300 transition-colors">
                      <Upload size={18} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400">Thêm ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFile}
                      />
                    </label>
                  )}
                </div>
              </div>

              {submitError && <p className="text-xs text-red-500">{submitError}</p>}
              <Button
                type="submit"
                fullWidth
                disabled={!selectedType || !description.trim() || submitLoading}
              >
                <MessageSquare size={16} className="mr-2" />{' '}
                {submitLoading ? 'Đang gửi...' : 'Gửi khiếu nại'}
              </Button>
            </form>
          )}
        </div>

        {/* ── Past Complaints ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-500" /> Khiếu nại của tôi
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {pastComplaints.length === 0 && (
              <div className="py-6 text-center text-xs text-gray-400">Chưa có khiếu nại nào</div>
            )}
            {pastComplaints.map(c => {
              const s = STATUS_MAP[c.status] ?? STATUS_MAP['Pending'];
              return (
                <div key={c.complaintId} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-800">{c.title}</p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}
                    >
                      {s.icon} {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {c.complaintId.slice(0, 8).toUpperCase()} ·{' '}
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </p>
                  {c.adminResponse && (
                    <p className="text-xs text-gray-600 bg-green-50 border border-green-100 rounded-lg p-2">
                      {c.adminResponse}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;
