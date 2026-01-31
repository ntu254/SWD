package com.example.backendservice.common.sse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

/**
 * Controller for managing SSE connections
 */
@RestController
@RequestMapping("/api/v1/sse")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Server-Sent Events", description = "APIs for real-time notifications via SSE")
public class SseController {

    private final SseService sseService;

    /**
     * Subscribe to SSE events
     * Frontend should call this endpoint to establish a connection
     */
    @Operation(summary = "Subscribe to SSE", description = "Establishes SSE connection for real-time notifications")
    @GetMapping(value = "/subscribe/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(
            @Parameter(description = "User ID") @PathVariable String userId,
            @Parameter(description = "User role (Citizen, Collector, Enterprise, Admin)") @RequestParam(defaultValue = "Citizen") String role) {

        log.info("SSE subscription request from user: {}, role: {}", userId, role);
        return sseService.createConnection(userId, role);
    }

    /**
     * Get SSE connection statistics (Admin only)
     */
    @Operation(summary = "Get SSE statistics", description = "Returns the count of active SSE connections")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalConnections", sseService.getActiveConnectionCount(),
                "connectionsByRole", sseService.getConnectionCountByRole()));
    }

    /**
     * Test endpoint to broadcast a message (Admin only - for testing)
     */
    @Operation(summary = "Test broadcast", description = "Sends a test broadcast message to all users (Admin only)")
    @PostMapping("/test-broadcast")
    public ResponseEntity<String> testBroadcast(
            @RequestParam String message,
            @RequestParam(defaultValue = "All") String targetAudience) {

        SseEventData event = SseEventData.builder()
                .eventType("TEST_MESSAGE")
                .payload(message)
                .timestamp(java.time.LocalDateTime.now())
                .targetAudience(targetAudience)
                .build();

        sseService.sendEvent(event);

        return ResponseEntity.ok("Message broadcasted to: " + targetAudience);
    }
}
