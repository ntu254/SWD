import React from 'react';
import { Recycle, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-brand-500 p-2 rounded-xl text-white">
                                <Recycle size={20} />
                            </div>
                            <span className="font-display text-xl font-bold text-white">
                                Green<span className="text-brand-500">Loop</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Nền tảng công nghệ tiên phong trong quản lý rác thải đô thị và thúc đẩy kinh tế tuần hoàn tại Việt Nam.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-brand-500 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-brand-500 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-brand-500 transition-colors"><Twitter size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Liên Kết Nhanh</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-brand-500 transition-colors">Về Chúng Tôi</a></li>
                            <li><a href="#services" className="hover:text-brand-500 transition-colors">Dịch Vụ</a></li>
                            <li><a href="#gallery" className="hover:text-brand-500 transition-colors">Hoạt Động</a></li>
                            <li><a href="#reviews" className="hover:text-brand-500 transition-colors">Cộng Đồng</a></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Hỗ Trợ</h4>
                        <ul className="space-y-3 text-sm">
                            <li>Hướng Dẫn Phân Loại</li>
                            <li>Điểm Thu Gom Pin Cũ</li>
                            <li>Đổi Quà GreenPoints</li>
                            <li>Đăng Ký Đối Tác</li>
                            <li>Chính Sách Bảo Mật</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Liên Hệ</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-brand-500 shrink-0" size={18} />
                                <span>Tòa nhà Innovation, Quận 1,<br />TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-brand-500 shrink-0" size={18} />
                                <span>1900 1234</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-brand-500 shrink-0" size={18} />
                                <span>lienhe@greenloop.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} GreenLoop Platform. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
