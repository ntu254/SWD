import { Calendar, Check, Eye, Filter, MapPin, RefreshCw, UserPlus, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import * as enterpriseService from '../services/enterpriseService';
import type { TaskFilters, TaskResponse } from '../types';

export const TaskManagementPage: React.FC = () => {
  // Resolves the task UUID regardless of field name returned by backend
  const getTaskId = (task: TaskResponse) => task.id ?? task.taskId ?? '';

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enterpriseId, setEnterpriseId] = useState<string>('');
  const [filters, setFilters] = useState<TaskFilters>({ page: 0, size: 10 });
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_ENTERPRISE_APPROVAL');
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Assign modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [collectorId, setCollectorId] = useState('');

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadEnterprise = useCallback(async () => {
    try {
      const res = await enterpriseService.getMyEnterprise();
      setEnterpriseId(res.data.id);
      return res.data.id;
    } catch (err) {
      console.error(err);
      return '';
    }
  }, []);

  const loadTasks = useCallback(
    async (entId?: string) => {
      try {
        setLoading(true);
        const id = entId || enterpriseId;
        if (!id) return;

        let res;
        if (statusFilter === 'PENDING_ENTERPRISE_APPROVAL') {
          res = await enterpriseService.getPendingApprovalTasks(id, filters.page, filters.size);
        } else if (statusFilter) {
          res = await enterpriseService.getTasksByStatus(statusFilter, filters.page, filters.size);
        } else {
          res = await enterpriseService.getAllTasks(filters.page, filters.size);
        }

        setTasks(res.content || []);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [enterpriseId, filters, statusFilter]
  );

  useEffect(() => {
    loadEnterprise().then(id => {
      if (id) loadTasks(id);
    });
  }, []);

  useEffect(() => {
    if (enterpriseId) loadTasks();
  }, [filters, statusFilter]);

  const handleAccept = async (task: TaskResponse) => {
    try {
      await enterpriseService.acceptTask(getTaskId(task), enterpriseId);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!selectedTask) return;
    try {
      await enterpriseService.rejectTask(getTaskId(selectedTask), enterpriseId, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    if (!selectedTask || !collectorId) return;
    try {
      await enterpriseService.assignTask({
        taskId: getTaskId(selectedTask),
        collectorUserId: collectorId,
      });
      setShowAssignModal(false);
      setCollectorId('');
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const STATUS_TABS: { label: string; value: string }[] = [
    { label: 'Pending Approval', value: 'PENDING_ENTERPRISE_APPROVAL' },
    { label: 'Accepted', value: 'PENDING' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Collected', value: 'COLLECTED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'All', value: '' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-blue-100 text-blue-700',
      PENDING_ENTERPRISE_APPROVAL: 'bg-orange-100 text-orange-700',
      PENDING_APPROVAL: 'bg-orange-100 text-orange-700',
      ACCEPTED: 'bg-blue-100 text-blue-700',
      ASSIGNED: 'bg-indigo-100 text-indigo-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      ON_THE_WAY: 'bg-purple-100 text-purple-700',
      COLLECTED: 'bg-emerald-100 text-emerald-700',
      COMPLETED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-600',
      FAILED: 'bg-red-100 text-red-600',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <EnterpriseLayout
      title="Collection Requests"
      subtitle="Manage and assign waste collection tasks"
    >
      {/* Status Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 flex gap-1 overflow-x-auto shadow-sm">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setFilters(p => ({ ...p, page: 0 }));
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center">
          <button
            onClick={() => loadTasks()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={28} className="text-gray-300" />
            </div>
            <h4 className="text-gray-900 font-semibold mb-1">No tasks found</h4>
            <p className="text-sm text-gray-500">Try changing the status filter</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Waste Type
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Citizen
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map(task => (
                    <tr key={getTaskId(task)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{task.wasteType || '—'}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                          {task.description || ''}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">
                            {task.address || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">{task.citizenName || '—'}</p>
                        <p className="text-xs text-gray-400">{task.citizenPhone || ''}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadge(task.status)}`}
                        >
                          {task.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* View detail */}
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Accept (only for pending enterprise approval) */}
                          {task.status === 'PENDING_ENTERPRISE_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleAccept(task)}
                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Accept"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowRejectModal(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}

                          {/* Assign (for accepted/pending-assignment tasks) */}
                          {task.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowAssignModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Assign collector"
                            >
                              <UserPlus size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {filters.page * filters.size + 1}–
                {Math.min((filters.page + 1) * filters.size, totalElements)} of {totalElements}
              </p>
              <div className="flex gap-1">
                <button
                  disabled={filters.page === 0}
                  onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={filters.page >= totalPages - 1}
                  onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========== REJECT MODAL ========== */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Task</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting this collection request.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none"
              rows={3}
              placeholder="Reason for rejection..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowRejectModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== ASSIGN MODAL ========== */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Assign Collector</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter the Collector User ID to assign this task.
            </p>
            <input
              type="text"
              value={collectorId}
              onChange={e => setCollectorId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
              placeholder="Collector User ID (UUID)"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAssignModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!collectorId.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== DETAIL MODAL ========== */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Task Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadge(selectedTask.status)}`}
                  >
                    {selectedTask.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Waste Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTask.wasteType || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Citizen</p>
                  <p className="text-sm text-gray-700">{selectedTask.citizenName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm text-gray-700">{selectedTask.citizenPhone || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-sm text-gray-700">{selectedTask.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Description</p>
                <p className="text-sm text-gray-700">{selectedTask.description || '—'}</p>
              </div>
              {selectedTask.rejectionReason && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-400">Rejection Reason</p>
                  <p className="text-sm text-red-700">{selectedTask.rejectionReason}</p>
                </div>
              )}
              {selectedTask.imageUrls?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Images</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedTask.imageUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Report ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-400 pt-2">
                Created: {new Date(selectedTask.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </EnterpriseLayout>
  );
};

export default TaskManagementPage;
