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
@Tag(name = "Notification Management", description = "APIs for managing system notifications to users")
public class NotificationController {

    private final NotificationService notificationService;

    // ===================== ADMIN ENDPOINTS =====================

    @Operation(summary = "Create notification (Admin)", description = "Admin creates a new notification to inform users about maintenance, updates, etc.")
    @PostMapping("/admin/{adminId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @Parameter(description = "ID of the admin creating notification") @PathVariable UUID adminId,
            @Valid @RequestBody CreateNotificationRequest request) {

        NotificationResponse response = notificationService.createNotification(adminId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification created successfully", response));
    }

    @Operation(summary = "Get all notifications (Admin)", description = "Admin retrieves all notifications with optional filters")
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getAllNotifications(
            @Parameter(description = "Filter by type (General, Maintenance, Update, Alert, Promotion)") @RequestParam(required = false) String type,
            @Parameter(description = "Filter by target audience (All, Citizen, Collector, Enterprise)") @RequestParam(required = false) String targetAudience,
            @Parameter(description = "Filter by active status") @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<NotificationResponse> notifications = notificationService.getAllNotifications(type, targetAudience,
                isActive, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(notifications)));
    }

    @Operation(summary = "Get notification by ID (Admin)", description = "Retrieves detailed information about a specific notification")
    @GetMapping("/admin/{notificationId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(
            @Parameter(description = "ID of the notification") @PathVariable UUID notificationId) {
        NotificationResponse response = notificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Update notification (Admin)", description = "Admin updates an existing notification")
    @PutMapping("/admin/{notificationId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> updateNotification(
            @Parameter(description = "ID of the notification") @PathVariable UUID notificationId,
            @RequestBody UpdateNotificationRequest request) {

        NotificationResponse response = notificationService.updateNotification(notificationId, request);
        return ResponseEntity.ok(ApiResponse.success("Notification updated successfully", response));
    }

    @Operation(summary = "Toggle notification status (Admin)", description = "Admin toggles the active status of a notification")
    @PatchMapping("/admin/{notificationId}/toggle")
    public ResponseEntity<ApiResponse<NotificationResponse>> toggleNotificationStatus(
            @Parameter(description = "ID of the notification") @PathVariable UUID notificationId) {
        NotificationResponse response = notificationService.toggleNotificationStatus(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification status toggled successfully", response));
    }

    @Operation(summary = "Delete notification (Admin)", description = "Admin deletes a notification from the system")
    @DeleteMapping("/admin/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @Parameter(description = "ID of the notification") @PathVariable UUID notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", null));
    }

    // ===================== USER ENDPOINTS =====================

    @Operation(summary = "Get active notifications for user", description = "Retrieves active notifications for a specific user role")
    @GetMapping("/user/{userRole}")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getActiveNotificationsForUser(
            @Parameter(description = "User role (Citizen, Collector, Enterprise)") @PathVariable String userRole,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<NotificationResponse> notifications = notificationService.getActiveNotificationsForUser(userRole,
                pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(notifications)));
    }

    @Operation(summary = "Count active notifications", description = "Returns the total count of active notifications")
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countActiveNotifications() {
        long count = notificationService.countActiveNotifications();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
