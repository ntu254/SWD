import { useAuth } from '@shared/contexts';
import { collectorTaskService } from '@shared/services/api/collectorTaskService';
import { AlertCircle, ArrowLeft, CheckCircle2, ImageIcon, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function UploadProofPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proofImageUrl, setProofImageUrl] = useState('');
  const [actualWeightKg, setActualWeightKg] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const collectorId = (user as any)?.userId ?? (user?.id != null ? String(user.id) : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImageUrl.trim()) {
      setError('Vui lòng nhập URL ảnh bằng chứng.');
      return;
    }
    if (!collectorId || !id) {
      setError('Thông tin không hợp lệ.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await collectorTaskService.uploadProof(collectorId, id, {
        proofImageUrl: proofImageUrl.trim(),
        actualWeightKg: actualWeightKg ? parseFloat(actualWeightKg) : undefined,
        note: note.trim() || undefined,
      });
      setSuccess(true);
      // After 2 seconds navigate back to task
      setTimeout(() => navigate(`/collector/tasks/${id}`), 2000);
    } catch {
      setError('Không thể tải ảnh bằng chứng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Hoàn thành!</h2>
        <p className="text-gray-500 text-sm">Bằng chứng đã được tải lên thành công.</p>
        <p className="text-xs text-gray-400">Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/collector/tasks/${id}`)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tải ảnh bằng chứng</h1>
          <p className="text-xs text-gray-400 mt-0.5">Xác nhận hoàn thành nhiệm vụ thu gom</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
      >
        {/* Proof image URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="flex items-center gap-1.5">
              <ImageIcon size={14} className="text-emerald-600" />
              URL ảnh bằng chứng *
            </span>
          </label>
          <input
            type="url"
            value={proofImageUrl}
            onChange={e => setProofImageUrl(e.target.value)}
            placeholder="https://..."
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {proofImageUrl && (
            <img
              src={proofImageUrl}
              alt="Preview"
              className="mt-3 w-full max-h-48 rounded-xl border border-gray-200 object-cover"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Actual weight */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Khối lượng thực tế (kg)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={actualWeightKg}
            onChange={e => setActualWeightKg(e.target.value)}
            placeholder="Ví dụ: 5.5"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ghi chú (tuỳ chọn)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Thêm ghi chú nếu có..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          <Upload size={16} />
          {loading ? 'Đang tải lên...' : 'Xác nhận hoàn thành'}
        </button>
      </form>
    </div>
  );
}
