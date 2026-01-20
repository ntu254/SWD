export interface Service {
    id: string;
    title: string;
    points: string; // Reward points instead of price
    duration: string; // Pickup window
    description: string;
    image: string;
    popular?: boolean;
}

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    location: string;
    content: string;
    avatar: string;
    rating: number;
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
