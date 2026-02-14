package com.example.backendservice.features.notification.service;

import com.example.backendservice.features.notification.dto.CreateNotificationRequest;
import com.example.backendservice.features.notification.dto.NotificationResponse;
import com.example.backendservice.features.notification.dto.UpdateNotificationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {

    NotificationResponse createNotification(UUID adminId, CreateNotificationRequest request);

    Page<NotificationResponse> getAllNotifications(String type, String targetAudience, Boolean isActive,
            Pageable pageable);

    NotificationResponse getNotificationById(UUID notificationId);

    NotificationResponse updateNotification(UUID notificationId, UpdateNotificationRequest request);

    NotificationResponse toggleNotificationStatus(UUID notificationId);

    void deleteNotification(UUID notificationId);

    Page<NotificationResponse> getActiveNotificationsForUser(String userRole, Pageable pageable);

    long countActiveNotifications();
}
