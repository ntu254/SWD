import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@shared/contexts';
import Button from '@components/Button';
import type { ApiError } from '@shared/types';

interface LoginFormProps {
    onToggleRegister: () => void;
    onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleRegister, onSuccess }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            onSuccess();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 animate-shake">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1 block">Email</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    </div>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-semibold text-gray-700">Mật khẩu</label>
                    <a href="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors">
                        Quên mật khẩu?
                    </a>
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                fullWidth
                size="lg"
                disabled={isLoading}
                className="mt-4 !rounded-xl !py-3 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 group relative overflow-hidden"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2 text-sm">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang đăng nhập...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2 font-bold text-base">
                        Đăng Nhập
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                )}
            </Button>

            {/* Toggle */}
            <div className="text-center pt-2">
                <p className="text-gray-500 font-medium">
                    Bạn chưa có tài khoản?
                    <button
                        type="button"
                        onClick={onToggleRegister}
                        className="ml-2 font-bold text-brand-600 hover:text-brand-700 relative inline-block group"
                    >
                        Đăng ký ngay
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full"></span>
                    </button>
                </p>
            </div>
        </form>
    );
};
