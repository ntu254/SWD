import React, { useEffect } from 'react';
import { useAuth } from '@shared/contexts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import type { AdminUserResponse, CreateUserRequest, UpdateUserRequest } from '../types';

const createUserSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone format'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    role: z.enum(['CITIZEN', 'ENTERPRISE', 'COLLECTOR'], {
        errorMap: () => ({ message: 'Invalid role selected' }),
    }),
});

const updateUserSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone format'),
});

type CreateFormData = z.infer<typeof createUserSchema>;
type UpdateFormData = z.infer<typeof updateUserSchema>;

interface UserFormDialogProps {
    isOpen: boolean;
    user: AdminUserResponse | null;
    onClose: () => void;
    onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
    isOpen,
    user,
    onClose,
    onSubmit,
}) => {
    const { user: currentUser } = useAuth();
    const isEditMode = !!user;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CreateFormData | UpdateFormData>({
        resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
        defaultValues: isEditMode
            ? {
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
            }
            : undefined,
    });

    useEffect(() => {
        if (isOpen && user) {
            reset({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
            });
        } else if (isOpen && !user) {
            // Default values for new user based on current user role
            reset({
                role: (currentUser?.role === 'ENTERPRISE' ? 'COLLECTOR' : '') as any,
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phone: '',
            });
        } else if (!isOpen) {
            reset();
        }
    }, [isOpen, user, reset, currentUser]);

    const handleFormSubmit = async (data: CreateFormData | UpdateFormData) => {
        try {
            await onSubmit(data as CreateUserRequest | UpdateUserRequest);
            onClose();
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit User' : 'Create New User'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('firstName')}
                                type="text"
                                className={`w-full px-3 py-2 rounded-lg border ${errors.firstName
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-brand-500'
                                    } focus:ring-2 focus:border-transparent outline-none transition-all`}
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('lastName')}
                                type="text"
                                className={`w-full px-3 py-2 rounded-lg border ${errors.lastName
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-brand-500'
                                    } focus:ring-2 focus:border-transparent outline-none transition-all`}
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    {!isEditMode && (
                        <>
                            {/* Email (Create only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`w-full px-3 py-2 rounded-lg border ${(errors as any).email
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-brand-500'
                                        } focus:ring-2 focus:border-transparent outline-none transition-all`}
                                    placeholder="john.doe@example.com"
                                />
                                {(errors as any).email && (
                                    <p className="mt-1 text-sm text-red-600">{(errors as any).email.message}</p>
                                )}
                            </div>

                            {/* Password (Create only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className={`w-full px-3 py-2 rounded-lg border ${(errors as any).password
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-brand-500'
                                        } focus:ring-2 focus:border-transparent outline-none transition-all`}
                                    placeholder="Minimum 6 characters"
                                />
                                {(errors as any).password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {(errors as any).password.message}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('phone')}
                            type="tel"
                            className={`w-full px-3 py-2 rounded-lg border ${errors.phone
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-brand-500'
                                } focus:ring-2 focus:border-transparent outline-none transition-all`}
                            placeholder="+84123456789"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                    </div>

                    {!isEditMode && (
                        /* Role (Create only) */
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('role')}
                                className={`w-full px-3 py-2 rounded-lg border ${(errors as any).role
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-brand-500'
                                    } focus:ring-2 focus:border-transparent outline-none transition-all cursor-pointer`}
                                disabled={currentUser?.role === 'ENTERPRISE'}
                            >
                                <option value="">Select role...</option>
                                {currentUser?.role !== 'ENTERPRISE' && (
                                    <>
                                        <option value="CITIZEN">👤 Citizen</option>
                                        <option value="ENTERPRISE">🏭 Enterprise</option>
                                    </>
                                )}
                                <option value="COLLECTOR">🚚 Collector</option>
                            </select>
                            {(errors as any).role && (
                                <p className="mt-1 text-sm text-red-600">{(errors as any).role.message}</p>
                            )}
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
                            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            {isSubmitting
                                ? 'Saving...'
                                : isEditMode
                                    ? 'Update User'
                                    : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormDialog;
