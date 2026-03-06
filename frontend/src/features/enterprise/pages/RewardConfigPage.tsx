import React, { useEffect, useState } from 'react';
import { Award, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import * as rewardRuleService from '../services/rewardRuleService';
import type { RewardRuleResponse, CreateRewardRuleRequest } from '../types';

export const RewardConfigPage: React.FC = () => {
    const [rules, setRules] = useState<RewardRuleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selected, setSelected] = useState<RewardRuleResponse | null>(null);
    const [formData, setFormData] = useState<CreateRewardRuleRequest>({
        wasteTypeId: '', basePoints: 10, qualityMultiplier: 1.0, timeBonusPoints: 5,
    });

    const loadRules = async () => {
        try {
            setLoading(true);
            const res = await rewardRuleService.getAllRules();
            setRules(res.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadRules(); }, []);

    const handleSave = async () => {
        try {
            if (selected) {
                await rewardRuleService.updateRule(selected.id, formData);
            } else {
                await rewardRuleService.createRule(formData);
            }
            setShowFormModal(false);
            loadRules();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await rewardRuleService.deleteRule(selected.id);
            setShowDeleteModal(false);
            loadRules();
        } catch (err) { console.error(err); }
    };

    const handleToggle = async (rule: RewardRuleResponse) => {
        try {
            if (rule.active) {
                await rewardRuleService.deactivateRule(rule.id);
            } else {
                await rewardRuleService.activateRule(rule.id);
            }
            loadRules();
        } catch (err) { console.error(err); }
    };

    const openCreate = () => {
        setSelected(null);
        setFormData({ wasteTypeId: '', basePoints: 10, qualityMultiplier: 1.0, timeBonusPoints: 5 });
        setShowFormModal(true);
    };

    const openEdit = (r: RewardRuleResponse) => {
        setSelected(r);
        setFormData({
            wasteTypeId: r.wasteTypeId,
            basePoints: r.basePoints,
            qualityMultiplier: r.qualityMultiplier,
            timeBonusPoints: r.timeBonusPoints,
        });
        setShowFormModal(true);
    };

    return (
        <EnterpriseLayout title="Reward Configuration" subtitle="Configure point rules for citizens by waste type">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Reward Rules</h2>
                    <p className="text-sm text-gray-500">Define how points are awarded to citizens for each waste type</p>
                </div>
                <button onClick={openCreate} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                    <Plus size={18} /> Add Rule
                </button>
            </div>

            {/* Rules Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
            ) : rules.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                    <Award size={40} className="text-gray-300 mx-auto mb-3" />
                    <h4 className="text-gray-900 font-semibold mb-1">No reward rules</h4>
                    <p className="text-sm text-gray-500">Create your first rule to start awarding points</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rules.map((rule) => (
                        <div key={rule.id} className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${rule.active ? 'border-emerald-200 hover:shadow-md' : 'border-gray-200 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">{rule.wasteTypeName || 'Unknown Type'}</h4>
                                <button onClick={() => handleToggle(rule)} className="text-gray-400 hover:text-emerald-600 transition-colors" title={rule.active ? 'Deactivate' : 'Activate'}>
                                    {rule.active ? <ToggleRight size={24} className="text-emerald-600" /> : <ToggleLeft size={24} />}
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Base Points</span>
                                    <span className="font-semibold text-gray-900">{rule.basePoints} pts</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Quality Multiplier</span>
                                    <span className="font-semibold text-gray-900">×{rule.qualityMultiplier}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Time Bonus</span>
                                    <span className="font-semibold text-gray-900">+{rule.timeBonusPoints} pts</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
                                <button onClick={() => openEdit(rule)} className="flex-1 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">Edit</button>
                                <button onClick={() => { setSelected(rule); setShowDeleteModal(true); }} className="flex-1 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{selected ? 'Edit' : 'Create'} Reward Rule</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Waste Type ID</label>
                                <input type="text" value={formData.wasteTypeId} onChange={(e) => setFormData({ ...formData, wasteTypeId: e.target.value })} placeholder="UUID of waste type" className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 font-medium">Base Points</label>
                                    <input type="number" value={formData.basePoints} onChange={(e) => setFormData({ ...formData, basePoints: +e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-medium">Multiplier</label>
                                    <input type="number" step="0.1" value={formData.qualityMultiplier} onChange={(e) => setFormData({ ...formData, qualityMultiplier: +e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-medium">Time Bonus</label>
                                    <input type="number" value={formData.timeBonusPoints} onChange={(e) => setFormData({ ...formData, timeBonusPoints: +e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setShowFormModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">{selected ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4 text-center">
                        <Trash2 size={32} className="text-red-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Rule</h3>
                        <p className="text-sm text-gray-500 mb-5">Delete reward rule for <strong>{selected.wasteTypeName}</strong>?</p>
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

export default RewardConfigPage;
