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
                .type(request.getType() != null ? request.getType() : "General")
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "All")
                .priority(request.getPriority() != null ? request.getPriority() : "Normal")
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
}
