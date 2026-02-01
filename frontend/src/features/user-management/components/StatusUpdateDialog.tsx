import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import type { AdminUserResponse, AccountStatus, UpdateUserStatusRequest } from '../types';

const statusUpdateSchema = z.object({
    accountStatus: z.enum(['ACTIVE', 'DISABLED', 'BANNED'], {
        errorMap: () => ({ message: 'Please select a valid status' }),
    }),
    banReason: z.string().optional(),
}).refine((data) => {
    if (data.accountStatus === 'BANNED' && !data.banReason?.trim()) {
        return false;
    }
    return true;
}, {
    message: 'Ban reason is required when banning a user',
    path: ['banReason'],
});

type FormData = z.infer<typeof statusUpdateSchema>;

interface StatusUpdateDialogProps {
    isOpen: boolean;
    user: AdminUserResponse | null;
    onClose: () => void;
    onSubmit: (data: UpdateUserStatusRequest) => Promise<void>;
}

export const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
    isOpen,
    user,
    onClose,
    onSubmit,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(statusUpdateSchema),
        defaultValues: {
            accountStatus: user?.accountStatus as 'ACTIVE' | 'DISABLED' | 'BANNED',
            banReason: user?.banReason || '',
        },
    });

    const selectedStatus = watch('accountStatus');
    const isBanned = selectedStatus === 'BANNED';

    const handleFormSubmit = async (data: FormData) => {
        try {
            await onSubmit({
                accountStatus: data.accountStatus as AccountStatus,
                banReason: data.banReason,
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Status update error:', error);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full ${isBanned ? 'border-2 border-red-200' : ''
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isBanned ? 'border-red-100 bg-red-50' : 'border-gray-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        {isBanned && (
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="text-red-600" size={20} />
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-gray-900">Update User Status</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
                    {/* Status Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('accountStatus')}
                            className={`w-full px-3 py-2 rounded-lg border ${errors.accountStatus
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-brand-500'
                                } focus:ring-2 focus:border-transparent outline-none transition-all cursor-pointer`}
                        >
                            <option value="">Select status...</option>
                            <option value="ACTIVE">✅ Active</option>
                            <option value="DISABLED">⏸ Disabled</option>
                            <option value="BANNED">🚫 Banned</option>
                        </select>
                        {errors.accountStatus && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.accountStatus.message}
                            </p>
                        )}
                    </div>

                    {/* Ban Reason (visible when BANNED or DISABLED) */}
                    {(selectedStatus === 'BANNED' || selectedStatus === 'DISABLED') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason {selectedStatus === 'BANNED' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                {...register('banReason')}
                                rows={4}
                                className={`w-full px-3 py-2 rounded-lg border ${errors.banReason
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-brand-500'
                                    } focus:ring-2 focus:border-transparent outline-none transition-all resize-none`}
                                placeholder={`Explain why this user is being ${selectedStatus.toLowerCase()}...`}
                            />
                            {errors.banReason && (
                                <p className="mt-1 text-sm text-red-600">{errors.banReason.message}</p>
                            )}
                        </div>
                    )}

                    {/* Warning Message */}
                    {isBanned && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold mb-1">Warning</p>
                                    <p>Banning this user will immediately revoke their access to the system. They will need admin approval to be reinstated.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2 ${isBanned
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-brand-600 hover:bg-brand-700'
                                } text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            {isSubmitting ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StatusUpdateDialog;
