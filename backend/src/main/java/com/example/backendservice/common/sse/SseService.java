package com.example.backendservice.common.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service to manage SSE connections and broadcast events to clients
 */
@Service
@Slf4j
public class SseService {

    // Store emitters by user role (for broadcast to role-based groups)
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> roleEmitters = new ConcurrentHashMap<>();

    // Store emitters by user ID (for targeted notifications)
    private final Map<String, SseEmitter> userEmitters = new ConcurrentHashMap<>();

    // Default timeout: 30 minutes
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L;

    /**
     * Create a new SSE connection for a user
     * 
     * @param userId   User's ID
     * @param userRole User's role (Citizen, Collector, Enterprise, Admin)
     * @return SseEmitter for the connection
     */
    public SseEmitter createConnection(String userId, String userRole) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        // Store by user ID
        userEmitters.put(userId, emitter);

        // Store by role
        roleEmitters.computeIfAbsent(userRole, k -> new CopyOnWriteArrayList<>()).add(emitter);
        roleEmitters.computeIfAbsent("All", k -> new CopyOnWriteArrayList<>()).add(emitter);

        // Cleanup on completion/error/timeout
        emitter.onCompletion(() -> removeEmitter(userId, userRole, emitter));
        emitter.onError(e -> {
            log.warn("SSE error for user {}: {}", userId, e.getMessage());
            removeEmitter(userId, userRole, emitter);
        });
        emitter.onTimeout(() -> {
            log.info("SSE timeout for user {}", userId);
            removeEmitter(userId, userRole, emitter);
        });

        // Send initial connection event
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Connection established for user: " + userId));
            log.info("SSE connection established for user: {}, role: {}", userId, userRole);
        } catch (IOException e) {
            log.error("Failed to send initial SSE event: {}", e.getMessage());
            emitter.complete();
        }

        return emitter;
    }

    /**
     * Send event to a specific user
     */
    public void sendToUser(String userId, SseEventData eventData) {
        SseEmitter emitter = userEmitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventData.getEventType())
                        .data(eventData));
                log.debug("Event sent to user {}: {}", userId, eventData.getEventType());
            } catch (IOException e) {
                log.warn("Failed to send to user {}: {}", userId, e.getMessage());
                userEmitters.remove(userId);
            }
        }
    }

    /**
     * Broadcast event to all users with a specific role
     */
    public void sendToRole(String role, SseEventData eventData) {
        CopyOnWriteArrayList<SseEmitter> emitters = roleEmitters.get(role);
        if (emitters != null) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name(eventData.getEventType())
                            .data(eventData));
                } catch (IOException e) {
                    emitters.remove(emitter);
                }
            }
            log.debug("Event broadcasted to role {}: {} recipients", role, emitters.size());
        }
    }

    /**
     * Broadcast event to all connected users
     */
    public void sendToAll(SseEventData eventData) {
        sendToRole("All", eventData);
    }

    /**
     * Send event based on target audience
     */
    public void sendEvent(SseEventData eventData) {
        String target = eventData.getTargetAudience();

        if ("All".equalsIgnoreCase(target)) {
            sendToAll(eventData);
        } else if (target != null && target.matches("\\d+")) {
            // If target is a numeric ID, send to specific user
            sendToUser(target, eventData);
        } else {
            // Otherwise, treat as role
            sendToRole(target, eventData);
        }
    }

    /**
     * Remove emitter from all collections
     */
    private void removeEmitter(String userId, String userRole, SseEmitter emitter) {
        userEmitters.remove(userId);

        CopyOnWriteArrayList<SseEmitter> roleList = roleEmitters.get(userRole);
        if (roleList != null) {
            roleList.remove(emitter);
        }

        CopyOnWriteArrayList<SseEmitter> allList = roleEmitters.get("All");
        if (allList != null) {
            allList.remove(emitter);
        }

        log.debug("Removed SSE emitter for user: {}", userId);
    }

    /**
     * Get count of active connections
     */
    public int getActiveConnectionCount() {
        return userEmitters.size();
    }

    /**
     * Get count of connections by role
     */
    public Map<String, Integer> getConnectionCountByRole() {
        Map<String, Integer> counts = new ConcurrentHashMap<>();
        roleEmitters.forEach((role, emitters) -> counts.put(role, emitters.size()));
        return counts;
    }

    /**
     * Heartbeat to keep connections alive
     * Runs every 30 seconds
     */
    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        SseEventData heartbeat = SseEventData.builder()
                .eventType("HEARTBEAT")
                .payload("ping")
                .timestamp(java.time.LocalDateTime.now())
                .targetAudience("All")
                .build();

        sendToAll(heartbeat);
        log.trace("Heartbeat sent to {} connections", getActiveConnectionCount());
    }
}
