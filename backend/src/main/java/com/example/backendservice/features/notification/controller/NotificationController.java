package com.example.backendservice.features.notification.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.common.dto.PageResponse;
import com.example.backendservice.features.notification.dto.CreateNotificationRequest;
import com.example.backendservice.features.notification.dto.NotificationResponse;
import com.example.backendservice.features.notification.dto.UpdateNotificationRequest;
import com.example.backendservice.features.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "APIs for managing system notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // ===================== ADMIN ENDPOINTS =====================

    @Operation(summary = "Create notification (Admin)")
    @PostMapping("/admin/{adminId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @Parameter(description = "Admin user ID") @PathVariable UUID adminId,
            @Valid @RequestBody CreateNotificationRequest request) {

        NotificationResponse response = notificationService.createNotification(adminId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification created successfully", response));
    }

    @Operation(summary = "Get all notifications with filters (Admin)")
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getAllNotifications(
            @Parameter(description = "Filter by type") @RequestParam(required = false) String type,
            @Parameter(description = "Filter by target audience") @RequestParam(required = false) String targetAudience,
            @Parameter(description = "Filter by active status") @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<NotificationResponse> result = notificationService.getAllNotifications(type, targetAudience, isActive,
                pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    @Operation(summary = "Get notification by ID (Admin)")
    @GetMapping("/admin/{notificationId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(
            @Parameter(description = "Notification ID") @PathVariable UUID notificationId) {

        NotificationResponse response = notificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Update notification (Admin)")
    @PutMapping("/admin/{notificationId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> updateNotification(
            @Parameter(description = "Notification ID") @PathVariable UUID notificationId,
            @RequestBody UpdateNotificationRequest request) {

        NotificationResponse response = notificationService.updateNotification(notificationId, request);
        return ResponseEntity.ok(ApiResponse.success("Notification updated successfully", response));
    }

    @Operation(summary = "Toggle notification active status (Admin)")
    @PatchMapping("/admin/{notificationId}/toggle")
    public ResponseEntity<ApiResponse<NotificationResponse>> toggleNotificationStatus(
            @Parameter(description = "Notification ID") @PathVariable UUID notificationId) {

        NotificationResponse response = notificationService.toggleNotificationStatus(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification status toggled successfully", response));
    }

    @Operation(summary = "Delete notification (Admin)")
    @DeleteMapping("/admin/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @Parameter(description = "Notification ID") @PathVariable UUID notificationId) {

        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", null));
    }

    // ===================== USER ENDPOINTS =====================

    @Operation(summary = "Get active notifications for user role")
    @GetMapping("/user/{role}")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getActiveNotificationsForUser(
            @Parameter(description = "User role (Citizen, Collector, Enterprise)") @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<NotificationResponse> result = notificationService.getActiveNotificationsForUser(role, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    @Operation(summary = "Count active notifications")
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countActiveNotifications() {
        long count = notificationService.countActiveNotifications();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
