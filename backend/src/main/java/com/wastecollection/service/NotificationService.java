package com.wastecollection.service;

import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.notification.*;
import com.wastecollection.entity.Notification;
import com.wastecollection.entity.User;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.NotificationRepository;
import com.wastecollection.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public NotificationDto createNotification(UUID adminId, CreateNotificationRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        Notification notification = Notification.builder()
                .createdBy(admin)
                .title(request.getTitle())
                .content(request.getContent())
                .type(normalizeType(request.getType()))
                .targetAudience(normalizeAudience(request.getTargetAudience()))
                .priority(normalizePriority(request.getPriority()))
                .isActive(true)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        return mapToDto(notificationRepository.save(notification));
    }

    public PageResponse<NotificationDto> getNotificationsForUser(String audience, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository
                .findActiveForAudience(audience, LocalDateTime.now(), pageable);
        return toPageResponse(notifications);
    }

    public PageResponse<NotificationDto> getAllNotifications(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications = notificationRepository.findAll(pageable);
        return toPageResponse(notifications);
    }

    @Transactional
    public NotificationDto deactivateNotification(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        notification.setIsActive(false);
        return mapToDto(notificationRepository.save(notification));
    }

    public NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .type(n.getType())
                .targetAudience(n.getTargetAudience())
                .priority(n.getPriority())
                .isActive(n.getIsActive())
                .startDate(n.getStartDate())
                .endDate(n.getEndDate())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private PageResponse<NotificationDto> toPageResponse(Page<Notification> page) {
        return new PageResponse<>(
                page.getContent().stream().map(this::mapToDto).toList(),
                page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    private String normalizeAudience(String audience) {
        if (audience == null || audience.isBlank()) {
            return "All";
        }

        return switch (audience.trim().toUpperCase(Locale.ROOT)) {
            case "CITIZEN" -> "Citizen";
            case "COLLECTOR" -> "Collector";
            case "ENTERPRISE" -> "Enterprise";
            default -> "All";
        };
    }

    private String normalizePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return "Normal";
        }

        return switch (priority.trim().toUpperCase(Locale.ROOT)) {
            case "LOW" -> "Low";
            case "HIGH" -> "High";
            case "URGENT" -> "Urgent";
            default -> "Normal";
        };
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            return "General";
        }

        return switch (type.trim().toUpperCase(Locale.ROOT)) {
            case "MAINTENANCE" -> "Maintenance";
            case "UPDATE" -> "Update";
            case "PROMOTION" -> "Promotion";
            case "ALERT" -> "Alert";
            default -> "General";
        };
    }
}
