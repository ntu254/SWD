package com.example.backendservice.features.notification.service;

import com.example.backendservice.features.notification.dto.CreateNotificationRequest;
import com.example.backendservice.features.notification.dto.NotificationResponse;
import com.example.backendservice.features.notification.dto.UpdateNotificationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {

    // Admin operations
    NotificationResponse createNotification(UUID adminId, CreateNotificationRequest request);

    NotificationResponse updateNotification(UUID notificationId, UpdateNotificationRequest request);

    void deleteNotification(UUID notificationId);

    Page<NotificationResponse> getAllNotifications(String type, String targetAudience, Boolean isActive,
            Pageable pageable);

    NotificationResponse getNotificationById(UUID notificationId);

    NotificationResponse toggleNotificationStatus(UUID notificationId);

    // User operations
    Page<NotificationResponse> getActiveNotificationsForUser(String userRole, Pageable pageable);

    long countActiveNotifications();
}
