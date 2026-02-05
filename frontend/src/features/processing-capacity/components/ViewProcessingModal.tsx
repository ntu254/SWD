import React from 'react';
import { X, MapPin, Activity, Trash2, Edit } from 'lucide-react';
import { Processor } from './ProcessingTable';

interface ViewProcessingModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: Processor | null;
    onEdit: () => void;
    onDelete: () => void;
}

export const ViewProcessingModal: React.FC<ViewProcessingModalProps> = ({ isOpen, onClose, data, onEdit, onDelete }) => {
    if (!isOpen || !data) return null;

    const usagePercent = Math.round((data.currentLoad / data.capacity) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-zoom-in">
                {/* Header with Image style or Status Color */}
                <div className={`h-24 ${data.status === 'OVERLOADED' ? 'bg-red-50' : 'bg-brand-50'} flex items-center justify-center`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold shadow-sm ${data.status === 'OVERLOADED' ? 'bg-red-100 text-red-600' : 'bg-white text-brand-600'}`}>
                        {data.name.charAt(0)}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Body */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 border ${data.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' :
                            data.status === 'OVERLOADED' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                            {data.status === 'ACTIVE' ? '• Active' :
                                data.status === 'OVERLOADED' ? '• Overloaded' : '• Pending Approval'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Activity className="text-gray-400 mt-1" size={20} />
                            <div className="flex-1">
                                <div className="text-sm text-gray-500 mb-1">Current Capacity</div>
                                <div className="flex items-end justify-between mb-2">
                                    <div className="font-semibold text-gray-900 text-lg">
                                        {data.currentLoad.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ {data.capacity.toLocaleString()} kg/day</span>
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">{usagePercent}%</div>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${usagePercent > 95 ? 'bg-red-500' : usagePercent > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <MapPin className="text-gray-400 mt-1" size={20} />
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Service Area</div>
                                <div className="flex flex-wrap gap-2">
                                    {data.serviceArea.map((area, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-white text-gray-700 rounded text-sm font-medium border border-gray-200 shadow-sm">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={() => { onDelete(); onClose(); }}
                            className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} /> Delete Business
                        </button>
                        <button
                            onClick={() => { onEdit(); onClose(); }}
                            className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-medium flex items-center justify-center gap-2"
                        >
                            <Edit size={18} /> Edit Business
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
