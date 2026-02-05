import React, { useMemo } from 'react';
import { Layers, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Processor } from './ProcessingTable';

interface ProcessingStatsProps {
    data: Processor[];
}

export const ProcessingStats: React.FC<ProcessingStatsProps> = ({ data }) => {
    const stats = useMemo(
        () => [
            {
                label: 'Total Businesses',
                value: data.length,
                icon: Layers,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
            },
            {
                label: 'Active',
                value: data.filter((i) => i.status === 'ACTIVE').length,
                icon: CheckCircle,
                color: 'text-green-600',
                bg: 'bg-green-50',
            },
            {
                label: 'Pending Approval',
                value: data.filter((i) => i.status === 'PENDING').length,
                icon: Clock,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
            },
            {
                label: 'Overloaded',
                value: data.filter((i) => i.status === 'OVERLOADED').length,
                icon: AlertCircle,
                color: 'text-red-600',
                bg: 'bg-red-50',
            },
        ],
        [data]
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};
