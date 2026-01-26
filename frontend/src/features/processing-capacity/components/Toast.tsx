import React, { useEffect, useState } from 'react';
import { CheckCircle, X, AlertTriangle, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    type?: 'success' | 'error' | 'warning' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'success' }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let progressTimer: NodeJS.Timeout;

        if (isVisible) {
            setProgress(100);
            timer = setTimeout(() => {
                onClose();
            }, 3000);

            progressTimer = setInterval(() => {
                setProgress((prev) => Math.max(0, prev - 1));
            }, 30);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(progressTimer);
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={24} className="text-emerald-500" />;
            case 'error': return <X size={24} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={24} className="text-amber-500" />;
            case 'info': return <Info size={24} className="text-blue-500" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return 'border-emerald-500';
            case 'error': return 'border-red-500';
            case 'warning': return 'border-amber-500';
            case 'info': return 'border-blue-500';
        }
    };

    const getProgressColor = () => {
        switch (type) {
            case 'success': return 'bg-emerald-500';
            case 'error': return 'bg-red-500';
            case 'warning': return 'bg-amber-500';
            case 'info': return 'bg-blue-500';
        }
    };

    return (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
            <div className={`relative bg-white shadow-xl rounded-xl overflow-hidden min-w-[320px] border-l-4 ${getBorderColor()} flex flex-col`}>
                <div className="p-4 flex items-start gap-3">
                    <div className="mt-0.5">
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">
                            {type === 'success' ? 'Thành công!' : type === 'error' ? 'Lỗi!' : type === 'warning' ? 'Cảnh báo' : 'Thông tin'}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 -mr-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-gray-100">
                    <div
                        className={`h-full ${getProgressColor()} transition-all duration-75 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
