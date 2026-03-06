import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    RotateCcw,
    Mail,
    Phone,
    UserCheck,
    UserX,
} from 'lucide-react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import * as collectorService from '../services/collectorService';
import type { CollectorResponse, CreateCollectorRequest } from '../types';

export const CollectorPage: React.FC = () => {
    const [collectors, setCollectors] = useState<CollectorResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCollector, setSelectedCollector] = useState<CollectorResponse | null>(null);
    const [formData, setFormData] = useState<CreateCollectorRequest>({
        firstName: '', lastName: '', email: '', phone: '', password: '',
    });

    const loadCollectors = async () => {
        try {
            setLoading(true);
            const res = await collectorService.getCollectors(0, 50);
            const data = res?.data?.content || res?.content || [];
            setCollectors(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadCollectors(); }, []);

    const handleCreate = async () => {
        try {
            await collectorService.createCollector(formData);
            setShowFormModal(false);
            setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
            loadCollectors();
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async () => {
        if (!selectedCollector) return;
        try {
            await collectorService.updateCollector(selectedCollector.id, formData);
            setShowFormModal(false);
            loadCollectors();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!selectedCollector) return;
        try {
            await collectorService.deleteCollector(selectedCollector.id);
            setShowDeleteModal(false);
            loadCollectors();
        } catch (err) { console.error(err); }
    };

    const openEditModal = (c: CollectorResponse) => {
        setSelectedCollector(c);
        setFormData({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, password: '' });
        setShowFormModal(true);
    };

    const openCreateModal = () => {
        setSelectedCollector(null);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
        setShowFormModal(true);
    };

    const filtered = collectors.filter(
        (c) =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <EnterpriseLayout title="Collector Management" subtitle="Manage your collection staff">
            {/* Actions Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search collectors..."
                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none w-64"
                    />
                </div>
                <button onClick={openCreateModal} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                    <Plus size={18} /> Add Collector
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-16"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <UserX size={40} className="text-gray-300 mx-auto mb-3" />
                        <h4 className="text-gray-900 font-semibold mb-1">No collectors found</h4>
                        <p className="text-sm text-gray-500">Add your first collector to get started</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                                                {c.firstName?.[0]}{c.lastName?.[0]}
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4"><div className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /><span className="text-sm text-gray-600">{c.email}</span></div></td>
                                    <td className="px-5 py-4"><div className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400" /><span className="text-sm text-gray-600">{c.phone || '—'}</span></div></td>
                                    <td className="px-5 py-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {c.enabled ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEditModal(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => { setSelectedCollector(c); setShowDeleteModal(true); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ===== FORM MODAL ===== */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedCollector ? 'Edit' : 'Add'} Collector</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="First name" className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last name" className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                            </div>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                            <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                            {!selectedCollector && (
                                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Password" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setShowFormModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={selectedCollector ? handleUpdate : handleCreate} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                                {selectedCollector ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE MODAL ===== */}
            {showDeleteModal && selectedCollector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4 text-center">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Collector</h3>
                        <p className="text-sm text-gray-500 mb-5">Are you sure you want to delete <strong>{selectedCollector.firstName} {selectedCollector.lastName}</strong>?</p>
                        <div className="flex justify-center gap-2">
                            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </EnterpriseLayout>
    );
};

export default CollectorPage;
