import React, { useState, useEffect } from 'react';
import { Send, Eye } from 'lucide-react';
import { DateTimePicker } from '@shared/components';
import type {
    NotificationFormData,
    NotificationType,
    TargetAudience,
    Priority,
    NotificationResponse,
} from '../types';

interface NotificationFormProps {
    notification?: NotificationResponse | null;
    onSubmit: (data: NotificationFormData) => Promise<void>;
    onReset?: () => void;
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
    notification,
    onSubmit,
    onReset,
}) => {
    const [formData, setFormData] = useState<NotificationFormData>({
        title: '',
        content: '',
        type: 'General' as NotificationType,
        targetAudience: 'All' as TargetAudience,
        priority: 'Normal' as Priority,
        startDate: null,
        endDate: null,
    });
    const [submitting, setSubmitting] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (notification) {
            setFormData({
                title: notification.title,
                content: notification.content,
                type: notification.type,
                targetAudience: notification.targetAudience,
                priority: notification.priority,
                startDate: notification.startDate ? new Date(notification.startDate) : null,
                endDate: notification.endDate ? new Date(notification.endDate) : null,
            });
        }
    }, [notification]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(formData);
            // Reset form after successful creation (not edit)
            if (!notification) {
                handleReset();
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            title: '',
            content: '',
            type: 'General' as NotificationType,
            targetAudience: 'All' as TargetAudience,
            priority: 'Normal' as Priority,
            startDate: null,
            endDate: null,
        });
        onReset?.();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Target Audience */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target
                </label>
                <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                        setFormData({ ...formData, targetAudience: e.target.value as TargetAudience })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    required
                >
                    <option value="All">Everyone</option>
                    <option value="Citizen">Citizen</option>
                    <option value="Collector">Collector</option>
                    <option value="Enterprise">Enterprise</option>
                </select>
            </div>

            {/* Notification Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {['General', 'Maintenance', 'Update', 'Alert', 'Promotion'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value={type}
                                checked={formData.type === type}
                                onChange={(e) =>
                                    setFormData({ ...formData, type: e.target.value as NotificationType })
                                }
                                className="w-4 h-4 accent-brand-600 border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Priority */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                </label>
                <select
                    value={formData.priority}
                    onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as Priority })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    required
                >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
            </div>

            {/* Date & Time */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time (Optional)
                </label>
                <DateTimePicker
                    value={formData.startDate || undefined}
                    onChange={(date) => setFormData({ ...formData, startDate: date || null })}
                    placeholder="Select start date and time"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time (Optional)
                </label>
                <DateTimePicker
                    value={formData.endDate || undefined}
                    onChange={(date) => setFormData({ ...formData, endDate: date || null })}
                    placeholder="Select end date and time"
                    minDate={formData.startDate || undefined}
                />
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter notification title"
                    maxLength={255}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/255</p>
            </div>

            {/* Content */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                </label>
                <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write the message here"
                    rows={4}
                    maxLength={5000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.content.length}/5000</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    disabled={submitting}
                >
                    <Eye size={16} />
                    Preview
                </button>
                <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    disabled={submitting}
                >
                    <Send size={16} />
                    {submitting ? 'Sending...' : notification ? 'Update' : 'Send'}
                </button>
            </div>

            {notification && (
                <button
                    type="button"
                    onClick={handleReset}
                    className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                    Cancel Edit
                </button>
            )}
        </form>
    );
};
