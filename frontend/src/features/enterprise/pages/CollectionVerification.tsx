import React, { useState, useEffect } from 'react';
import {
    getTasksByStatus,
    getVisitsByTask,
    verifyCollectionVisit
} from '../services/enterpriseService';
import { TaskResponse } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

export function CollectionVerification() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState<string | null>(null);

    // Track which task is expanded to show visits
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [taskVisits, setTaskVisits] = useState<Record<string, any[]>>({});
    const [loadingVisits, setLoadingVisits] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            // Fetch tasks that are COLLECTED but the visit needs verification
            const res = await getTasksByStatus('COLLECTED', 0, 50);
            setTasks(res.content);
        } catch (error) {
            console.error('Error loading task verification:', error);
            alert('Không thể tải danh sách cần duyệt.');
        } finally {
            setLoading(false);
        }
    };

    const handleExpandTask = async (taskId: string) => {
        if (expandedTaskId === taskId) {
            setExpandedTaskId(null);
            return;
        }

        setExpandedTaskId(taskId);

        if (!taskVisits[taskId]) {
            try {
                setLoadingVisits(prev => ({ ...prev, [taskId]: true }));
                const res = await getVisitsByTask(taskId);
                setTaskVisits(prev => ({ ...prev, [taskId]: res.content }));
            } catch (error) {
                console.error('Error loading visits:', error);
                alert('Không thể tải chi tiết thu gom.');
            } finally {
                setLoadingVisits(prev => ({ ...prev, [taskId]: false }));
            }
        }
    };

    const handleVerify = async (visitId: string, taskId: string) => {
        try {
            setVerifying(visitId);
            await verifyCollectionVisit(visitId);
            alert('Duyệt thành công! Đã cộng điểm cho Citizen.');

            // For simplicity, reload to reflect correct verified status
            // In a more robust UI, you might remove the item from the list instead
            await loadTasks();
            handleExpandTask(taskId); // Collapse
        } catch (error) {
            console.error('Verification error:', error);
            alert('Lỗi khi duyệt thu gom.');
        } finally {
            setVerifying(null);
        }
    };

    if (loading && tasks.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Duyệt Bằng Chứng Thu Gom</h1>
                <p className="text-sm text-gray-500">
                    Xem ảnh chụp thực tế và duyệt số Kg để cộng điểm cho người dân.
                </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Danh sách chờ duyệt</h2>
                </div>

                {tasks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Không có yêu cầu duyệt nào.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {tasks.map((task) => (
                            <li key={task.id} className="p-4">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => handleExpandTask(task.id)}
                                >
                                    <div>
                                        <p className="font-medium text-emerald-800">Task #{task.id.slice(-6)}</p>
                                        <p className="text-sm text-gray-500">Người báo cáo: {task.citizenName}</p>
                                        <p className="text-sm text-gray-500">Địa chỉ: {task.address}</p>
                                    </div>
                                    <div className="text-emerald-600 font-medium">
                                        {expandedTaskId === task.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                    </div>
                                </div>

                                {expandedTaskId === task.id && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        {loadingVisits[task.id] ? (
                                            <p className="text-sm text-gray-500">Đang tải chứng từ...</p>
                                        ) : taskVisits[task.id]?.length === 0 ? (
                                            <p className="text-sm text-gray-500">Không tìm thấy chứng từ thu gom nào.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {taskVisits[task.id]?.map((visit) => (
                                                    <div key={visit.visitId} className="bg-white p-4 border border-gray-200 rounded shadow-sm">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <p className="text-sm font-medium">Collector: {visit.collectorName || 'Ẩn danh'}</p>
                                                                <p className="text-xs text-gray-500">Hoàn thành lúc: {visit.completedAt ? new Date(visit.completedAt).toLocaleString() : 'Chưa có'}</p>
                                                                <p className="text-xs text-gray-500">Trạng thái: <span className="font-semibold">{visit.visitStatus || 'COMPLETED'}</span></p>
                                                            </div>
                                                            {visit.visitStatus === 'VERIFIED' ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    Đã duyệt
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleVerify(visit.visitId, task.id); }}
                                                                    disabled={verifying === visit.visitId}
                                                                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    {verifying === visit.visitId ? 'Đang duyệt...' : 'Duyệt & Cộng điểm'}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Waste Items */}
                                                        {visit.wasteItems && visit.wasteItems.length > 0 && (
                                                            <div className="mb-4">
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Thông tin rác (Collector nhập)</h4>
                                                                <ul className="space-y-2">
                                                                    {visit.wasteItems.map((item: any) => (
                                                                        <li key={item.itemId} className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                                                                            <span>{item.wasteTypeName || 'Loại rác'}</span>
                                                                            <span className="font-medium text-emerald-700">{item.quantityKg} kg</span>
                                                                            <span className="text-gray-500 text-xs">({item.pointsAwarded || 0} điểm)</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Proof Photos */}
                                                        {visit.evidencePhotos && visit.evidencePhotos.length > 0 && (
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ảnh minh chứng</h4>
                                                                <div className="flex gap-2 overflow-x-auto">
                                                                    {visit.evidencePhotos.map((photo: any) => (
                                                                        <img
                                                                            key={photo.photoId}
                                                                            src={photo.photoUrl}
                                                                            alt="Chứng từ"
                                                                            className="h-32 w-auto object-cover rounded border border-gray-200"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
