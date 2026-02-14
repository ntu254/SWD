package com.example.backendservice.features.notification.service;

import com.example.backendservice.common.sse.SseEventData;
import com.example.backendservice.common.sse.SseService;
import com.example.backendservice.features.notification.dto.CreateNotificationRequest;
import com.example.backendservice.features.notification.dto.NotificationResponse;
import com.example.backendservice.features.notification.dto.UpdateNotificationRequest;
import com.example.backendservice.features.notification.entity.Notification;
import com.example.backendservice.features.notification.repository.NotificationRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    @Override
    @Transactional
    public NotificationResponse createNotification(UUID adminId, CreateNotificationRequest request) {
        User admin = userRepository.findByUserId(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found: " + adminId));

        Notification notification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "General")
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "All")
                .priority(request.getPriority() != null ? request.getPriority() : "Normal")
                .isActive(true)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(admin)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Notification created [id={}, admin={}]", notification.getNotificationId(), adminId);

        // Broadcast via SSE
        NotificationResponse response = toResponse(notification);
        sseService.sendEvent(SseEventData.notification(response, notification.getTargetAudience()));

        return response;
    }

    @Override
    public Page<NotificationResponse> getAllNotifications(String type, String targetAudience, Boolean isActive,
            Pageable pageable) {
        Specification<Notification> spec = buildFilterSpec(type, targetAudience, isActive);
        return notificationRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public NotificationResponse getNotificationById(UUID notificationId) {
        return toResponse(findOrThrow(notificationId));
    }

    @Override
    @Transactional
    public NotificationResponse updateNotification(UUID notificationId, UpdateNotificationRequest request) {
        Notification notification = findOrThrow(notificationId);

        if (request.getTitle() != null)
            notification.setTitle(request.getTitle());
        if (request.getContent() != null)
            notification.setContent(request.getContent());
        if (request.getType() != null)
            notification.setType(request.getType());
        if (request.getTargetAudience() != null)
            notification.setTargetAudience(request.getTargetAudience());
        if (request.getPriority() != null)
            notification.setPriority(request.getPriority());
        if (request.getIsActive() != null)
            notification.setIsActive(request.getIsActive());
        if (request.getStartDate() != null)
            notification.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            notification.setEndDate(request.getEndDate());

        notification = notificationRepository.save(notification);
        log.info("Notification updated [id={}]", notificationId);
        return toResponse(notification);
    }

    @Override
    @Transactional
    public NotificationResponse toggleNotificationStatus(UUID notificationId) {
        Notification notification = findOrThrow(notificationId);
        notification.setIsActive(!notification.getIsActive());
        notification = notificationRepository.save(notification);
        log.info("Notification toggled [id={}, active={}]", notificationId, notification.getIsActive());
        return toResponse(notification);
    }

    @Override
    @Transactional
    public void deleteNotification(UUID notificationId) {
        Notification notification = findOrThrow(notificationId);
        notificationRepository.delete(notification);
        log.info("Notification deleted [id={}]", notificationId);
    }

    @Override
    public Page<NotificationResponse> getActiveNotificationsForUser(String userRole, Pageable pageable) {
        return notificationRepository.findActiveForRole(userRole, LocalDateTime.now(), pageable)
                .map(this::toResponse);
    }

    @Override
    public long countActiveNotifications() {
        return notificationRepository.countActive(LocalDateTime.now());
    }

    // ========== Private Helpers ==========

    private Notification findOrThrow(UUID id) {
        return notificationRepository.findByNotificationId(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
    }

    private Specification<Notification> buildFilterSpec(String type, String targetAudience, Boolean isActive) {
        return (root, query, cb) -> {
            var predicates = new ArrayList<Predicate>();
            if (type != null && !type.isBlank()) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (targetAudience != null && !targetAudience.isBlank()) {
                predicates.add(cb.equal(root.get("targetAudience"), targetAudience));
            }
            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getNotificationId())
                .title(n.getTitle())
                .content(n.getContent())
                .type(n.getType())
                .targetAudience(n.getTargetAudience())
                .priority(n.getPriority())
                .isActive(n.getIsActive())
                .startDate(n.getStartDate())
                .endDate(n.getEndDate())
                .createdById(n.getCreatedByUserId())
                .createdByName(n.getCreatedBy() != null ? n.getCreatedBy().getFullName() : null)
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
