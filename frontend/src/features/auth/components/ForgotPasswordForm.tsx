import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '@components/Button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';

// Schema
const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
    onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordData) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Reset password for:", data.email);
        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="text-green-600 w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">Kiểm tra email của bạn</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
                    </p>
                </div>
                <Button
                    variant="outline"
                    fullWidth
                    onClick={onBack}
                    className="!rounded-xl"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Quay lại đăng nhập
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">Quên mật khẩu?</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                </p>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1 block">Email</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className={`group-focus-within:text-brand-500 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                    </div>
                    <input
                        type="email"
                        {...register('email')}
                        placeholder="name@example.com"
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-400
                            ${errors.email
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/10'
                            }`}
                    />
                </div>
                {errors.email && (
                    <p className="text-xs text-red-500 font-medium ml-1 animate-in slide-in-from-top-1">{errors.email.message}</p>
                )}
            </div>

            <Button
                fullWidth
                size="lg"
                type="submit"
                disabled={isLoading}
                className="mt-4 !rounded-xl !py-3 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 group"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2 text-sm">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang gửi...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2 font-bold text-base">
                        Gửi liên kết
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                )}
            </Button>

            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-sm font-semibold text-gray-500 hover:text-brand-600 flex items-center justify-center gap-2 mx-auto transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Quay lại đăng nhập
                </button>
            </div>
        </form>
    );
};
