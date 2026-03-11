import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import Button from '@components/Button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { authService } from '@shared/services/api/authService';

// Schema for Step 1: Email
const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
});

// Schema for Step 2: OTP & New Password
const resetPasswordSchema = z.object({
    otp: z.string().length(6, 'Mã OTP phải có 6 ký tự'),
    newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface ForgotPasswordFormProps {
    onBack: () => void;
    onSuccess?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack, onSuccess }) => {
    const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form 1: Email
    const {
        register: registerEmail,
        handleSubmit: handleSubmitEmail,
        formState: { errors: emailErrors },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    // Form 2: Reset (OTP + New Password)
    const {
        register: registerReset,
        handleSubmit: handleSubmitReset,
        formState: { errors: resetErrors },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSendEmail = async (data: ForgotPasswordData) => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            await authService.forgotPassword(data.email);
            setSubmittedEmail(data.email);
            setStep('reset');
        } catch (error: any) {
            console.error("Forgot password error:", error);
            // Quick fix: assuming error response structure, ideally use a helper
            setErrorMsg(error?.response?.data?.message || 'Không thể gửi email. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const onResetPassword = async (data: ResetPasswordData) => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            await authService.resetPassword(submittedEmail, data.otp, data.newPassword);
            setStep('success');
            if (onSuccess) {
                // Optional: Delay slightly or just notify parent
                // onSuccess(); 
            }
        } catch (error: any) {
            console.error("Reset password error:", error);
            setErrorMsg(error?.response?.data?.message || 'Đặt lại mật khẩu thất bại. Mã OTP có thể không đúng hoặc đã hết hạn.');
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="text-green-600 w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">Thành công!</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Mật khẩu của bạn đã được cập nhật. Bạn đã được tự động đăng nhập.
                    </p>
                </div>
                <Button
                    variant="primary"
                    fullWidth
                    onClick={onSuccess || onBack} // Usually navigation to dashboard or home
                    className="!rounded-xl"
                >
                    Tiếp tục đến trang chủ
                    <ArrowRight size={18} className="ml-2" />
                </Button>
            </div>
        );
    }

    if (step === 'reset') {
        return (
            <form onSubmit={handleSubmitReset(onResetPassword)} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-2">
                    <h3 className="text-xl font-bold text-gray-800">Đặt lại mật khẩu</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Nhập mã OTP đã gửi đến <strong>{submittedEmail}</strong>
                    </p>
                </div>

                {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                        {errorMsg}
                    </div>
                )}

                <div className="space-y-4">
                    {/* OTP Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1 block">Mã OTP (6 số)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <KeyRound className={`group-focus-within:text-brand-500 transition-colors ${resetErrors.otp ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                            </div>
                            <input
                                type="text"
                                {...registerReset('otp')}
                                placeholder="123456"
                                maxLength={6}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-400 tracking-widest
                                    ${resetErrors.otp
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                        : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/10'
                                    }`}
                            />
                        </div>
                        {resetErrors.otp && (
                            <p className="text-xs text-red-500 font-medium ml-1">{resetErrors.otp.message}</p>
                        )}
                    </div>

                    {/* New Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1 block">Mật khẩu mới</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className={`group-focus-within:text-brand-500 transition-colors ${resetErrors.newPassword ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                            </div>
                            <input
                                type="password"
                                {...registerReset('newPassword')}
                                placeholder="••••••••"
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-400
                                    ${resetErrors.newPassword
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                        : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/10'
                                    }`}
                            />
                        </div>
                        {resetErrors.newPassword && (
                            <p className="text-xs text-red-500 font-medium ml-1">{resetErrors.newPassword.message}</p>
                        )}
                    </div>
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
                            Đang xử lý...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2 font-bold text-base">
                            Đặt lại mật khẩu
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    )}
                </Button>

                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="text-sm font-semibold text-gray-500 hover:text-brand-600 flex items-center justify-center gap-2 mx-auto transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Quay lại nhập email
                    </button>
                </div>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmitEmail(onSendEmail)} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">Quên mật khẩu?</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Nhập email của bạn để nhận mã OTP xác thực
                </p>
            </div>

            {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                    {errorMsg}
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1 block">Email</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className={`group-focus-within:text-brand-500 transition-colors ${emailErrors.email ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                    </div>
                    <input
                        type="email"
                        {...registerEmail('email')}
                        placeholder="name@example.com"
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-400
                            ${emailErrors.email
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/10'
                            }`}
                    />
                </div>
                {emailErrors.email && (
                    <p className="text-xs text-red-500 font-medium ml-1 animate-in slide-in-from-top-1">{emailErrors.email.message}</p>
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
                        Gửi OTP
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
