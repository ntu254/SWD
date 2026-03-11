import React, { useMemo } from 'react';
import { Bell, BellRing, Tag, Users } from 'lucide-react';
import type { NotificationResponse } from '../types';

interface KPICardsProps {
    notifications: NotificationResponse[];
}

export const KPICards: React.FC<KPICardsProps> = ({ notifications }) => {
    const stats = useMemo(() => {
        const total = notifications.length;
        const active = notifications.filter((n) => n.isActive).length;

        const byType = notifications.reduce(
            (acc, n) => {
                acc[n.type] = (acc[n.type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const byTarget = notifications.reduce(
            (acc, n) => {
                acc[n.targetAudience] = (acc[n.targetAudience] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return { total, active, byType, byTarget };
    }, [notifications]);

    const cards = [
        {
            title: 'Total Notifications',
            value: stats.total,
            icon: Bell,
            color: 'bg-blue-50 text-blue-600',
            bgColor: 'bg-blue-500',
        },
        {
            title: 'Active Notifications',
            value: stats.active,
            icon: BellRing,
            color: 'bg-green-50 text-green-600',
            bgColor: 'bg-green-500',
        },
        {
            title: 'Most Common Type',
            value: Object.keys(stats.byType).length > 0
                ? Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0][0]
                : 'N/A',
            icon: Tag,
            color: 'bg-purple-50 text-purple-600',
            bgColor: 'bg-purple-500',
        },
        {
            title: 'Most Targeted',
            value: Object.keys(stats.byTarget).length > 0
                ? Object.entries(stats.byTarget).sort((a, b) => b[1] - a[1])[0][0]
                : 'N/A',
            icon: Users,
            color: 'bg-orange-50 text-orange-600',
            bgColor: 'bg-orange-500',
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
                            <p className="text-xl font-bold text-gray-900 mb-0.5">
                                {card.value}
                            </p>
                            <p className="text-xs text-gray-500">{card.title}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
