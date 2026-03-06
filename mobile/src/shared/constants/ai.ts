import { WasteType } from '../types/ai';

export const WASTE_TYPE_CONFIG: Record<WasteType, { label: string; color: string; bgColor: string; icon: string }> = {
    [WasteType.RECYCLABLE]: {
        label: 'Tái chế được',
        color: '#3B82F6', // blue-500
        bgColor: 'rgba(59, 130, 246, 0.2)',
        icon: '♻️'
    },
    [WasteType.ORGANIC]: {
        label: 'Hữu cơ',
        color: '#10B981', // green-500
        bgColor: 'rgba(16, 185, 129, 0.2)',
        icon: '🍎'
    },
    [WasteType.HAZARDOUS]: {
        label: 'Nguy hại',
        color: '#EF4444', // red-500
        bgColor: 'rgba(239, 68, 68, 0.2)',
        icon: '☣️'
    },
    [WasteType.NON_RECYCLABLE]: {
        label: 'Rác thải còn lại',
        color: '#9CA3AF', // gray-400
        bgColor: 'rgba(156, 163, 175, 0.2)',
        icon: '🗑️'
    },
    [WasteType.UNKNOWN]: {
        label: 'Không xác định',
        color: '#F59E0B', // yellow-500
        bgColor: 'rgba(245, 158, 11, 0.2)',
        icon: '❓'
    }
};
