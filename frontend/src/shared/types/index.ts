export interface Service {
    id: string;
    title: string;
    description: string;
    image?: string;
    points?: string;
    duration?: string;
    popular?: boolean;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    location: string;
    rating: number;
    content: string;
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
