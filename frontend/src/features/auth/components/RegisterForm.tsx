import React, { useState } from 'react';
import { Mail, Lock, User, Building2, MapPin, Scale, Factory, Truck, ArrowRight, Check } from 'lucide-react';
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
            setError(apiError.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const roleConfig = {
        citizen: {
            icon: User,
            label: 'Cư Dân',
            color: 'bg-brand-500',
            border: 'border-brand-200',
            activeBorder: 'border-brand-500',
            text: 'text-brand-700',
            bg: 'bg-brand-50'
        },
        enterprise: {
            icon: Building2,
            label: 'Doanh Nghiệp',
            color: 'bg-blue-600',
            border: 'border-blue-200',
            activeBorder: 'border-blue-600',
            text: 'text-blue-700',
            bg: 'bg-blue-50'
        },
        collector: {
            icon: Truck,
            label: 'Collector',
            color: 'bg-accent-500',
            border: 'border-accent-200',
            activeBorder: 'border-accent-500',
            text: 'text-accent-700',
            bg: 'bg-accent-50'
        },
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 animate-shake">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                </div>
            )}

            {/* Role Selector - Modern Cards */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 ml-1 block">Chọn vai trò của bạn</label>
                <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(roleConfig) as UserRole[]).map((r) => {
                        const config = roleConfig[r];
                        const Icon = config.icon;
                        const isSelected = role === r;

                        return (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${isSelected
                                    ? `${config.activeBorder} ${config.bg} shadow-lg scale-105 z-10`
                                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center">
                                        <Check size={12} className={config.text} strokeWidth={3} />
                                    </div>
                                )}
                                <div className={`p-3 rounded-xl transition-all duration-300 ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-50 group-hover:bg-gray-100'
                                    }`}>
                                    <Icon className={`transition-colors duration-300 ${isSelected ? config.text : 'text-gray-400 group-hover:text-gray-600'
                                        }`} size={24} />
                                </div>
                                <p className={`text-xs font-bold transition-colors duration-300 ${isSelected ? 'text-gray-900' : 'text-gray-500'
                                    }`}>{config.label}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1 block">Họ</label>
                        <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all duration-300 font-medium"
                            placeholder="Nguyễn"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1 block">Tên</label>
                        <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all duration-300 font-medium"
                            placeholder="Văn A"
                        />
                    </div>
                </div>

                {/* Email */}
                {/* Email & Password Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative group space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1 block">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all duration-300 font-medium"
                            />
                        </div>
                    </div>

                    <div className="relative group space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1 block">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all duration-300 font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Enterprise Fields */}
                {role === 'enterprise' && (
                    <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="h-px bg-gray-100" />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1 block">Tên công ty</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Building2 className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="Công ty ABC"
                                        className="w-full pl-12 pr-4 py-3.5 bg-blue-50/30 border border-blue-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all duration-300 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="relative group space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1 block">Công suất</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Scale className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="number"
                                        name="wasteCapacity"
                                        value={formData.wasteCapacity}
                                        onChange={handleInputChange}
                                        placeholder="Tấn/tháng"
                                        className="w-full pl-12 pr-4 py-3.5 bg-blue-50/30 border border-blue-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all duration-300 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="relative group space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1 block">Địa chỉ</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM"
                                    className="w-full pl-12 pr-4 py-3.5 bg-blue-50/30 border border-blue-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all duration-300 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <Button
                fullWidth
                size="lg"
                disabled={isLoading}
                className="mt-6 !rounded-2xl !py-4 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 group relative overflow-hidden"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2 font-bold text-lg">
                        Đăng Ký
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                )}
            </Button>

            {/* Toggle */}
            <div className="text-center pt-2">
                <p className="text-gray-500 font-medium">
                    Đã có tài khoản?
                    <button
                        type="button"
                        onClick={onToggleLogin}
                        className="ml-2 font-bold text-brand-600 hover:text-brand-700 relative inline-block group"
                    >
                        Đăng nhập ngay
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full"></span>
                    </button>
                </p>
            </div>
        </form>
    );
};
