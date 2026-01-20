export interface Service {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    description: string;
}

export interface Testimonial {
    name: string;
    role: string;
    location: string;
    rating: number;
    comment: string;
    avatar: string;
}

export interface NavItem {
    label: string;
    href: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

// Export API types
export * from './api';
