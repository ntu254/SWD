import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { Processor } from './ProcessingTable';

interface ProcessingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Processor, 'id' | 'currentLoad'>) => void;
    initialData?: Processor | null;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        capacity: 0,
        status: 'ACTIVE' as 'ACTIVE' | 'PENDING' | 'OVERLOADED',
        wasteTypes: [] as string[],
        serviceArea: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    capacity: initialData.capacity,
                    status: initialData.status,
                    wasteTypes: initialData.wasteTypes,
                    serviceArea: initialData.serviceArea.join(', '),
                });
            } else {
                setFormData({
                    name: '',
                    capacity: 0,
                    status: 'ACTIVE',
                    wasteTypes: [],
                    serviceArea: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            wasteTypes: formData.wasteTypes as any[],
            serviceArea: formData.serviceArea.split(',').map(s => s.trim()).filter(Boolean)
        });
        onClose();
    };

    const toggleWasteType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            wasteTypes: prev.wasteTypes.includes(type)
                ? prev.wasteTypes.filter(t => t !== type)
                : [...prev.wasteTypes, type]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {initialData ? 'Update Business' : 'Add New Business'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {initialData ? 'Edit business information.' : 'Enter recycling business details into the system.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="e.g. GreenCycle Ltd"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg/day)</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="OVERLOADED">Overloaded</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Area (separated by comma)</label>
                            <input
                                type="text"
                                value={formData.serviceArea}
                                onChange={e => setFormData({ ...formData, serviceArea: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="e.g. District 1, District 3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Accepted Waste Types</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'organic', label: 'Organic' },
                                    { id: 'recycle', label: 'Recyclable' },
                                    { id: 'hazardous', label: 'Hazardous' },
                                    { id: 'bulky', label: 'Bulky' },
                                    { id: 'electronic', label: 'Electronic' },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => toggleWasteType(type.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${formData.wasteTypes.includes(type.id)
                                            ? 'bg-brand-50 text-brand-700 border-brand-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium flex items-center gap-2"
                            >
                                <Save size={18} /> {initialData ? 'Save Changes' : 'Save Business'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
