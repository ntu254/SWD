package com.example.backendservice.features.notification.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.common.sse.SseEventData;
import com.example.backendservice.common.sse.SseService;
import com.example.backendservice.features.notification.dto.CreateNotificationRequest;
import com.example.backendservice.features.notification.dto.NotificationResponse;
import com.example.backendservice.features.notification.dto.UpdateNotificationRequest;
import com.example.backendservice.features.notification.entity.Notification;
import com.example.backendservice.features.notification.repository.NotificationRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    @Override
    public NotificationResponse createNotification(Long adminId, CreateNotificationRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "id", adminId));

        Notification notification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "General")
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "All")
                .priority(request.getPriority() != null ? request.getPriority() : "Normal")
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(admin)
                .isActive(true)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        NotificationResponse response = mapToResponse(savedNotification);

        // Send real-time notification via SSE
        sendNotificationViaSSE(response);

        return response;
    }

    @Override
    public NotificationResponse updateNotification(Long notificationId, UpdateNotificationRequest request) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (request.getTitle() != null) {
            notification.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            notification.setContent(request.getContent());
        }
        if (request.getType() != null) {
            notification.setType(request.getType());
        }
        if (request.getTargetAudience() != null) {
            notification.setTargetAudience(request.getTargetAudience());
        }
        if (request.getPriority() != null) {
            notification.setPriority(request.getPriority());
        }
        if (request.getIsActive() != null) {
            notification.setIsActive(request.getIsActive());
        }
        if (request.getStartDate() != null) {
            notification.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            notification.setEndDate(request.getEndDate());
        }

        Notification updatedNotification = notificationRepository.save(notification);
        NotificationResponse response = mapToResponse(updatedNotification);

        // Send real-time update notification via SSE if still active
        if (Boolean.TRUE.equals(updatedNotification.getIsActive())) {
            sendNotificationUpdateViaSSE(response);
        }

        return response;
    }

    @Override
    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAllNotifications(String type, String targetAudience, Boolean isActive,
            Pageable pageable) {
        return notificationRepository.findAllWithFilters(type, targetAudience, isActive, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        return mapToResponse(notification);
    }

    @Override
    public NotificationResponse toggleNotificationStatus(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        notification.setIsActive(!notification.getIsActive());
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponse(updatedNotification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getActiveNotificationsForUser(String userRole, Pageable pageable) {
        return notificationRepository.findActiveNotificationsForAudience(userRole, LocalDateTime.now(), pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long countActiveNotifications() {
        return notificationRepository.countByIsActiveTrue();
    }

    /**
     * Send new notification to users via SSE
     */
    private void sendNotificationViaSSE(NotificationResponse notification) {
        try {
            SseEventData eventData = SseEventData.notification(notification, notification.getTargetAudience());
            sseService.sendEvent(eventData);
            log.info("SSE notification sent: {} to audience: {}", notification.getTitle(),
                    notification.getTargetAudience());
        } catch (Exception e) {
            log.error("Failed to send SSE notification: {}", e.getMessage());
        }
    }

    /**
     * Send notification update to users via SSE
     */
    private void sendNotificationUpdateViaSSE(NotificationResponse notification) {
        try {
            SseEventData eventData = SseEventData.builder()
                    .eventType("NOTIFICATION_UPDATE")
                    .payload(notification)
                    .timestamp(LocalDateTime.now())
                    .targetAudience(notification.getTargetAudience())
                    .build();
            sseService.sendEvent(eventData);
            log.info("SSE notification update sent: {}", notification.getTitle());
        } catch (Exception e) {
            log.error("Failed to send SSE notification update: {}", e.getMessage());
        }
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse.NotificationResponseBuilder builder = NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .targetAudience(notification.getTargetAudience())
                .priority(notification.getPriority())
                .isActive(notification.getIsActive())
                .startDate(notification.getStartDate())
                .endDate(notification.getEndDate())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt());

        if (notification.getCreatedBy() != null) {
            builder.createdById(notification.getCreatedBy().getId());
            builder.createdByName(notification.getCreatedBy().getFullName());
        }

        return builder.build();
    }
}
