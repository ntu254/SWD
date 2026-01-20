import { Service, Testimonial, NavItem } from '../types/greenloop';
import { Truck, Recycle, Leaf, BarChart3 } from 'lucide-react';
import React from 'react';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Trang Chủ', href: '#home' },
  { label: 'Dịch Vụ', href: '#services' },
  { label: 'Hoạt Động', href: '#gallery' },
  { label: 'Cộng Đồng', href: '#reviews' },
  { label: 'Hỏi Đáp', href: '#faq' },
];

export const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Thu Gom Rác Tái Chế',
    points: '+50 Điểm/kg',
    duration: 'Trong ngày',
    description: 'Thu gom giấy, nhựa, kim loại đã phân loại. Tích điểm đổi quà xanh.',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: '2',
    title: 'Rác Thải Điện Tử',
    points: '+100 Điểm/món',
    duration: '24h - 48h',
    description: 'Thu gom pin, máy tính, điện thoại hỏng. Xử lý an toàn theo tiêu chuẩn môi trường.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Rác Cồng Kềnh',
    points: 'Phí Dịch Vụ',
    duration: 'Đặt lịch trước',
    description: 'Vận chuyển sofa, tủ, nệm cũ. Hỗ trợ tháo dỡ và xử lý đúng quy định.',
    image: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    title: 'Rác Hữu Cơ / Thực Phẩm',
    points: '+20 Điểm/túi',
    duration: 'Hàng ngày',
    description: 'Thu gom rác hữu cơ để sản xuất phân bón vi sinh và khí sinh học (Biogas).',
    image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Nguyễn Văn A',
    role: 'Cư dân Quận 7',
    location: 'TP.HCM',
    content: 'Ứng dụng tuyệt vời! Giờ tôi có thể dễ dàng đặt lịch thu gom rác tái chế và còn được tích điểm đổi quà.',
    avatar: 'https://picsum.photos/seed/nguyen/100/100',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Trần Thị B',
    role: 'Chủ tiệm tạp hóa',
    location: 'Hà Nội',
    content: 'Dịch vụ thu gom rất đúng giờ. Việc phân loại rác giúp khu phố của tôi sạch đẹp hơn hẳn.',
    avatar: 'https://picsum.photos/seed/tran/100/100',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Công ty Môi Trường Xanh',
    role: 'Đối tác xử lý',
    location: 'Đà Nẵng',
    content: 'GreenLoop giúp chúng tôi tối ưu hóa lộ trình thu gom và tiếp cận nguồn nguyên liệu tái chế chất lượng.',
    avatar: 'https://picsum.photos/seed/env/100/100',
    rating: 4,
  },
];

export const FEATURES = [
  {
    title: 'Thu Gom Thông Minh',
    description: 'Kết nối trực tiếp với đơn vị thu gom gần nhất.',
    icon: <Truck className="w-6 h-6 text-brand-500" />,
  },
  {
    title: 'Kinh Tế Tuần Hoàn',
    description: 'Biến rác thải thành tài nguyên, tích điểm thưởng.',
    icon: <Recycle className="w-6 h-6 text-brand-500" />,
  },
  {
    title: 'Sống Xanh',
    description: 'Hướng dẫn phân loại rác tại nguồn chuẩn 2025.',
    icon: <Leaf className="w-6 h-6 text-brand-500" />,
  },
  {
    title: 'Dữ Liệu Minh Bạch',
    description: 'Theo dõi lộ trình rác thải và tác động môi trường.',
    icon: <BarChart3 className="w-6 h-6 text-brand-500" />,
  },
];
