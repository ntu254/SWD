package com.example.backendservice.common.sse;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Event data that will be sent to clients via SSE
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SseEventData {

    private String eventType; // NOTIFICATION, COMPLAINT_UPDATE, SYSTEM_ALERT
    private Object payload; // The actual data
    private LocalDateTime timestamp;
    private String targetAudience; // All, Citizen, Collector, Enterprise, or specific userId

    public static SseEventData notification(Object payload, String targetAudience) {
        return SseEventData.builder()
                .eventType("NOTIFICATION")
                .payload(payload)
                .timestamp(LocalDateTime.now())
                .targetAudience(targetAudience)
                .build();
    }

    public static SseEventData complaintUpdate(Object payload, String targetUserId) {
        return SseEventData.builder()
                .eventType("COMPLAINT_UPDATE")
                .payload(payload)
                .timestamp(LocalDateTime.now())
                .targetAudience(targetUserId)
                .build();
    }

    public static SseEventData systemAlert(Object payload) {
        return SseEventData.builder()
                .eventType("SYSTEM_ALERT")
                .payload(payload)
                .timestamp(LocalDateTime.now())
                .targetAudience("All")
                .build();
    }
}
