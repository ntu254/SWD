import React from 'react';
import { Eye, Edit, MoreHorizontal, Leaf, Recycle, Box, Battery, Trash2 } from 'lucide-react';

export interface Processor {
    id: string;
    name: string;
    wasteTypes: ('organic' | 'recycle' | 'hazardous' | 'bulky' | 'electronic')[];
    capacity: number; // kg/day
    currentLoad: number; // kg/day
    serviceArea: string[];
    status: 'ACTIVE' | 'PENDING' | 'OVERLOADED';
}

interface ProcessingTableProps {
    data: Processor[];
    onView: (item: Processor) => void;
    onEdit: (item: Processor) => void;
    onDelete: (id: string) => void;
}

export const ProcessingTable: React.FC<ProcessingTableProps> = ({ data, onView, onEdit, onDelete }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'OVERLOADED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return '• Active';
            case 'PENDING': return '• Pending';
            case 'OVERLOADED': return '• Overloaded';
            default: return status;
        }
    };

    const getWasteIcon = (type: string) => {
        switch (type) {
            case 'organic': return <div className="p-1.5 bg-green-100 text-green-600 rounded-lg" title="Organic Waste"><Leaf size={14} /></div>;
            case 'recycle': return <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg" title="Recyclable Waste"><Recycle size={14} /></div>;
            case 'hazardous': return <div className="p-1.5 bg-red-100 text-red-600 rounded-lg" title="Hazardous Waste"><Battery size={14} /></div>;
            case 'bulky': return <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg" title="Bulky Waste"><Box size={14} /></div>;
            case 'electronic': return <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg" title="Electronic Waste"><Trash2 size={14} /></div>;
            default: return null;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Waste Types</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Area</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item) => {
                        const usagePercent = Math.round((item.currentLoad / item.capacity) * 100);
                        let progressBarColor = 'bg-green-500';
                        if (usagePercent > 80) progressBarColor = 'bg-amber-500';
                        if (usagePercent > 95) progressBarColor = 'bg-red-500';

                        return (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {item.wasteTypes.map((t, i) => <div key={i}>{getWasteIcon(t)}</div>)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-full max-w-[180px]">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-900">{item.currentLoad.toLocaleString()} <span className="text-gray-500 font-normal">kg/day</span></span>
                                            {status === 'OVERLOADED' ? <span className="text-[10px] bg-red-500 text-white px-1.5 rounded">Overloaded</span> : null}
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${progressBarColor} rounded-full`} style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
                                        </div>
                                        <div className="text-right text-xs text-gray-400 mt-1">{usagePercent}%</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {item.serviceArea.map((area, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium border border-teal-100">
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status).replace('bg-', 'border-').replace('text-', 'border-opacity-20 ')} ${getStatusColor(item.status)}`}>
                                        {getStatusLabel(item.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onView(item)}
                                            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
