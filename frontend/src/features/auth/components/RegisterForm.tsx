import React, { useState } from 'react';
import { Mail, Lock, User, Building2, MapPin, Scale, Factory, ArrowRight } from 'lucide-react';
import { useAuth } from '@shared/contexts';
import Button from '@components/Button';
import type { ApiError } from '@shared/types';

type UserRole = 'citizen' | 'enterprise' | 'collector';

interface RegisterFormProps {
    onToggleLogin: () => void;
    onSuccess: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleLogin, onSuccess }) => {
    const { register } = useAuth();
    const [role, setRole] = useState<UserRole>('citizen');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        companyName: '',
        address: '',
        wasteCapacity: '',
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
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            });
            onSuccess();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const roleConfig = {
        citizen: { icon: User, label: 'Cư Dân', color: 'bg-brand-500' },
        enterprise: { icon: Building2, label: 'Doanh Nghiệp', color: 'bg-blue-600' },
        collector: { icon: Factory, label: 'Collector', color: 'bg-accent-500' },
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Role Selector */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Vai trò</label>
                <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(roleConfig) as UserRole[]).map((r) => {
                        const config = roleConfig[r];
                        const Icon = config.icon;
                        return (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`p-4 rounded-xl border-2 transition-all ${role === r
                                        ? `${config.color} border-transparent text-white shadow-lg scale-105`
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="mx-auto mb-2" size={24} />
                                <p className="text-xs font-bold">{config.label}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Họ</label>
                    <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Nguyễn"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Tên</label>
                    <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Văn A"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                    />
                </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu</label>
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

            {/* Enterprise Fields */}
            {role === 'enterprise' && (
                <>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 ml-1">Tên công ty</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                placeholder="Công ty XYZ"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 ml-1">Địa chỉ</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="123 Đường ABC, Q1"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 ml-1">Công suất (tấn/tháng)</label>
                        <div className="relative">
                            <Scale className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input
                                type="number"
                                name="wasteCapacity"
                                value={formData.wasteCapacity}
                                onChange={handleInputChange}
                                placeholder="50"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Submit */}
            <Button fullWidth size="lg" disabled={isLoading} className="mt-4 group">
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        Đăng Ký
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                )}
            </Button>

            {/* Toggle */}
            <div className="text-center mt-6">
                <p className="text-gray-600">
                    Đã có tài khoản?
                    <button
                        type="button"
                        onClick={onToggleLogin}
                        className="ml-2 font-bold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                        Đăng nhập ngay
                    </button>
                </p>
            </div>
        </form>
    );
};
