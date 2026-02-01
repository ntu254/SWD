import React, { useState } from 'react';
import { Mail, Lock, User, Building2, MapPin, Scale, Factory, Truck, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@shared/contexts';
import Button from '@components/Button';
import type { ApiError } from '@shared/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
    firstName: z.string().min(1, 'Họ không được để trống'),
    lastName: z.string().min(1, 'Tên không được để trống'),
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    onToggleLogin: () => void;
    onSuccess: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleLogin, onSuccess }) => {
    const { register: registerAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });
    const onSubmit = async (data: RegisterFormData) => {
        setFormError(null);
        setIsLoading(true);

        try {
            await registerAuth({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
            });
            onSuccess();
        } catch (err) {
            const apiError = err as ApiError;
            setFormError(apiError.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in slide-in-from-right-4 duration-500">
            {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {formError}
                </div>
            )}

            <div className="space-y-5">
                {/* Row 1: Names */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="group space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Họ</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className={`transition-colors duration-300 ${errors.lastName ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand-500'}`} size={18} />
                            </div>
                            <input
                                type="text"
                                {...register('lastName')}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-[3px] focus:outline-none transition-all duration-200 font-medium
                                    ${errors.lastName
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                        : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/10 hover:border-gray-300'
                                    }`}
                                placeholder="Nguyễn"
                            />
                        </div>
                        {errors.lastName && <p className="text-xs text-red-500 ml-1">{errors.lastName.message}</p>}
                    </div>

                    <div className="group space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Tên</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className={`transition-colors duration-300 ${errors.firstName ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand-500'}`} size={18} />
                            </div>
                            <input
                                type="text"
                                {...register('firstName')}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-[3px] focus:outline-none transition-all duration-200 font-medium
                                    ${errors.firstName
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                        : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/10 hover:border-gray-300'
                                    }`}
                                placeholder="Văn A"
                            />
                        </div>
                        {errors.firstName && <p className="text-xs text-red-500 ml-1">{errors.firstName.message}</p>}
                    </div>
                </div>

                {/* Row 2: Email */}
                <div className="group space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className={`transition-colors duration-300 ${errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand-500'}`} size={18} />
                        </div>
                        <input
                            type="email"
                            {...register('email')}
                            placeholder="name@example.com"
                            className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-[3px] focus:outline-none transition-all duration-200 font-medium
                                ${errors.email
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                    : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/10 hover:border-gray-300'
                                }`}
                        />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
                </div>

                {/* Row 3: Passwords */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="group space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className={`transition-colors duration-300 ${errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand-500'}`} size={18} />
                            </div>
                            <input
                                type="password"
                                {...register('password')}
                                placeholder="••••••••"
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-[3px] focus:outline-none transition-all duration-200 font-medium
                                    ${errors.password
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                        : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/10 hover:border-gray-300'
                                    }`}
                            />
                        </div>
                        {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
                    </div>

                    <div className="group space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Xác nhận</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className={`transition-colors duration-300 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand-500'}`} size={18} />
                            </div>
                            <input
                                type="password"
                                {...register('confirmPassword')}
                                placeholder="••••••••"
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-[3px] focus:outline-none transition-all duration-200 font-medium
                                    ${errors.confirmPassword
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                        : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/10 hover:border-gray-300'
                                    }`}
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword.message}</p>}
                    </div>
                </div>
            </div>

            {/* Submit Button & Trust */}
            <div className="pt-2 space-y-6">
                <Button
                    fullWidth
                    size="lg"
                    type="submit"
                    disabled={isLoading}
                    className="!rounded-xl !py-3.5 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2 font-bold text-lg">
                            Đăng Ký Ngay
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    )}
                </Button>
            </div>

            {/* Toggle Link */}
            <div className="text-center">
                <p className="text-gray-500 text-sm font-medium">
                    Đã có tài khoản?
                    <button
                        type="button"
                        onClick={onToggleLogin}
                        className="ml-2 font-bold text-brand-600 hover:text-brand-700 transition-colors hover:underline decoration-2 underline-offset-4"
                    >
                        Đăng nhập
                    </button>
                </p>
            </div>
        </form>
    );

};
