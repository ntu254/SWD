import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
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
            setError(apiError.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                    />
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-bold text-gray-700">Mật khẩu</label>
                    <a href="#" className="text-xs font-bold text-brand-600 hover:underline">Quên mật khẩu?</a>
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <Button
                fullWidth
                size="lg"
                disabled={isLoading}
                className="mt-4 group relative overflow-hidden"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        Đăng Nhập
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                )}
            </Button>

            {/* Toggle to Register */}
            <div className="text-center mt-6">
                <p className="text-gray-600">
                    Bạn chưa có tài khoản?
                    <button
                        type="button"
                        onClick={onToggleRegister}
                        className="ml-2 font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all"
                    >
                        Đăng ký ngay
                    </button>
                </p>
            </div>
        </form>
    );
};
