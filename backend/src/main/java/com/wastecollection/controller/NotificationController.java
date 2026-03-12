package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.notification.*;
import com.wastecollection.security.SecurityUtils;
import com.wastecollection.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "View and manage notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @GetMapping("/api/notifications")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get active notifications visible to the current user's role")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDto>>> getForUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String role = securityUtils.getCurrentUser().getRole().name(); // ADMIN, CITIZEN, COLLECTOR, ENTERPRISE
        // Map to audience values used in notifications table
        String audience = switch (role) {
            case "CITIZEN" -> "Citizen";
            case "COLLECTOR" -> "Collector";
            case "ENTERPRISE" -> "Enterprise";
            default -> "All";
        };
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getNotificationsForUser(audience, page, size)));
    }

    @GetMapping("/api/admin/notifications")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: list all notifications")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getAllNotifications(page, size)));
    }

    @PostMapping("/api/admin/notifications")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: create a notification")
    public ResponseEntity<ApiResponse<NotificationDto>> create(
            @Valid @RequestBody CreateNotificationRequest request) {
        NotificationDto dto = notificationService.createNotification(securityUtils.getCurrentUserId(), request);
        return ResponseEntity.status(201).body(ApiResponse.success("Notification created", dto));
    }

    @PutMapping("/api/admin/notifications/{notificationId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: deactivate a notification")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID notificationId) {
        notificationService.deactivateNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification deactivated", null));
    }
}
