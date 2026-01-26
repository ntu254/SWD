package com.example.backendservice.common.sse;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Event data that will be sent to clients via SSE
 */
public class SseEventData {

    private String eventType; // NOTIFICATION, COMPLAINT_UPDATE, SYSTEM_ALERT
    private Object payload; // The actual data
    private LocalDateTime timestamp;
    private String targetAudience; // All, Citizen, Collector, Enterprise, or specific userId

    public SseEventData() {
    }

    public SseEventData(String eventType, Object payload, LocalDateTime timestamp, String targetAudience) {
        this.eventType = eventType;
        this.payload = payload;
        this.timestamp = timestamp;
        this.targetAudience = targetAudience;
    }

    public static SseEventDataBuilder builder() {
        return new SseEventDataBuilder();
    }

    public static class SseEventDataBuilder {
        private String eventType;
        private Object payload;
        private LocalDateTime timestamp;
        private String targetAudience;

        SseEventDataBuilder() {
        }

        public SseEventDataBuilder eventType(String eventType) {
            this.eventType = eventType;
            return this;
        }

        public SseEventDataBuilder payload(Object payload) {
            this.payload = payload;
            return this;
        }

        public SseEventDataBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public SseEventDataBuilder targetAudience(String targetAudience) {
            this.targetAudience = targetAudience;
            return this;
        }

        public SseEventData build() {
            return new SseEventData(eventType, payload, timestamp, targetAudience);
        }
    }

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

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }
}
