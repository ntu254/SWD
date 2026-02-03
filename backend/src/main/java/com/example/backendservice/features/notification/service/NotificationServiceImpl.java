package com.example.backendservice.features.notification.service;

import com.example.backendservice.features.notification.dto.CreateNotificationRequest;
import com.example.backendservice.features.notification.dto.NotificationResponse;
import com.example.backendservice.features.notification.dto.UpdateNotificationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of NotificationService
 * Using in-memory storage since there's no Notification entity yet
 */
@Service
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    // In-memory storage for notifications (placeholder until entity is created)
    private final ConcurrentHashMap<UUID, NotificationResponse> notifications = new ConcurrentHashMap<>();

    @Override
    public NotificationResponse createNotification(UUID adminId, CreateNotificationRequest request) {
        log.info("Creating notification by admin: {}", adminId);

        NotificationResponse notification = NotificationResponse.builder()
                .id(UUID.randomUUID())
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "General")
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "All")
                .priority(request.getPriority() != null ? request.getPriority() : "Normal")
                .isActive(true)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdById(adminId)
                .createdByName("Admin")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        notifications.put(notification.getId(), notification);
        log.info("Notification created: {}", notification.getId());

        return notification;
    }

    @Override
    public NotificationResponse updateNotification(UUID notificationId, UpdateNotificationRequest request) {
        log.info("Updating notification: {}", notificationId);

        NotificationResponse notification = notifications.get(notificationId);
        if (notification == null) {
            throw new IllegalArgumentException("Notification not found: " + notificationId);
        }

        // Update fields if provided
        if (request.getTitle() != null) {
            notification.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            notification.setContent(request.getContent());
        }
        notification.setUpdatedAt(LocalDateTime.now());

        notifications.put(notificationId, notification);
        log.info("Notification updated: {}", notificationId);

        return notification;
    }

    @Override
    public void deleteNotification(UUID notificationId) {
        log.info("Deleting notification: {}", notificationId);
        notifications.remove(notificationId);
    }

    @Override
    public Page<NotificationResponse> getAllNotifications(String type, String targetAudience, Boolean isActive,
            Pageable pageable) {
        log.debug("Getting all notifications with filters");

        List<NotificationResponse> filtered = new ArrayList<>(notifications.values());

        // Filter by type
        if (type != null && !type.isEmpty()) {
            filtered = filtered.stream()
                    .filter(n -> type.equals(n.getType()))
                    .toList();
        }

        // Filter by targetAudience
        if (targetAudience != null && !targetAudience.isEmpty()) {
            filtered = filtered.stream()
                    .filter(n -> targetAudience.equals(n.getTargetAudience()))
                    .toList();
        }

        // Filter by isActive
        if (isActive != null) {
            filtered = filtered.stream()
                    .filter(n -> isActive.equals(n.getIsActive()))
                    .toList();
        }

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        if (start > filtered.size()) {
            return new PageImpl<>(List.of(), pageable, filtered.size());
        }

        return new PageImpl<>(
                filtered.subList(start, end),
                pageable,
                filtered.size());
    }

    @Override
    public NotificationResponse getNotificationById(UUID notificationId) {
        NotificationResponse notification = notifications.get(notificationId);
        if (notification == null) {
            throw new IllegalArgumentException("Notification not found: " + notificationId);
        }
        return notification;
    }

    @Override
    public NotificationResponse toggleNotificationStatus(UUID notificationId) {
        log.info("Toggling notification status: {}", notificationId);

        NotificationResponse notification = notifications.get(notificationId);
        if (notification == null) {
            throw new IllegalArgumentException("Notification not found: " + notificationId);
        }

        notification.setIsActive(!notification.getIsActive());
        notification.setUpdatedAt(LocalDateTime.now());
        notifications.put(notificationId, notification);

        return notification;
    }

    @Override
    public Page<NotificationResponse> getActiveNotificationsForUser(String userRole, Pageable pageable) {
        log.debug("Getting active notifications for role: {}", userRole);

        LocalDateTime now = LocalDateTime.now();

        List<NotificationResponse> filtered = notifications.values().stream()
                .filter(n -> n.getIsActive() != null && n.getIsActive())
                .filter(n -> n.getStartDate() == null || !n.getStartDate().isAfter(now))
                .filter(n -> n.getEndDate() == null || !n.getEndDate().isBefore(now))
                .filter(n -> "All".equals(n.getTargetAudience()) ||
                        (userRole != null && n.getTargetAudience().contains(userRole)))
                .toList();

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        if (start > filtered.size()) {
            return new PageImpl<>(List.of(), pageable, filtered.size());
        }

        return new PageImpl<>(
                filtered.subList(start, end),
                pageable,
                filtered.size());
    }

    @Override
    public long countActiveNotifications() {
        LocalDateTime now = LocalDateTime.now();

        return notifications.values().stream()
                .filter(n -> n.getIsActive() != null && n.getIsActive())
                .filter(n -> n.getStartDate() == null || !n.getStartDate().isAfter(now))
                .filter(n -> n.getEndDate() == null || !n.getEndDate().isBefore(now))
                .count();
    }
}
