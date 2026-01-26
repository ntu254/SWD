import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteProcessingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    businessName: string;
}

export const DeleteProcessingModal: React.FC<DeleteProcessingModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    businessName
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-zoom-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 animate-bounce-slow">
                        <AlertTriangle size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa doanh nghiệp?</h3>
                    <p className="text-gray-500 mb-6">
                        Bạn có chắc chắn muốn xóa doanh nghiệp <span className="font-semibold text-gray-800">"{businessName}"</span> không? Hành động này không thể hoàn tác.
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium shadow-red-200 shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        >
                            <Trash2 size={18} /> Xóa ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
