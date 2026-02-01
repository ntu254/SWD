import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { ComplaintStatistics } from '../types';

interface StatisticsCardsProps {
    statistics: ComplaintStatistics | null;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
    if (!statistics) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
                    >
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Pending',
            value: statistics.Pending || 0,
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600',
        },
        {
            title: 'In Progress',
            value: statistics.In_Progress || 0,
            icon: AlertCircle,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Resolved',
            value: statistics.Resolved || 0,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Rejected',
            value: statistics.Rejected || 0,
            icon: XCircle,
            color: 'bg-red-100 text-red-600',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-lg ${card.color}`}>
                                <Icon size={18} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 mb-0.5">{card.value}</p>
                            <p className="text-xs text-gray-500">{card.title}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
