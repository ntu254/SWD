package com.example.backendservice.features.notification.service;

import com.example.backendservice.features.notification.dto.CreateNotificationRequest;
import com.example.backendservice.features.notification.dto.NotificationResponse;
import com.example.backendservice.features.notification.dto.UpdateNotificationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    // Admin operations
    NotificationResponse createNotification(Long adminId, CreateNotificationRequest request);

    NotificationResponse updateNotification(Long notificationId, UpdateNotificationRequest request);

    void deleteNotification(Long notificationId);

    Page<NotificationResponse> getAllNotifications(String type, String targetAudience, Boolean isActive,
            Pageable pageable);

    NotificationResponse getNotificationById(Long notificationId);

    NotificationResponse toggleNotificationStatus(Long notificationId);

    // User operations
    Page<NotificationResponse> getActiveNotificationsForUser(String userRole, Pageable pageable);

    long countActiveNotifications();
}
