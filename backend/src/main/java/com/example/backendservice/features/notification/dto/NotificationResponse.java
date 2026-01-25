package com.example.backendservice.features.notification.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private UUID id;
    private String title;
    private String content;
    private String type;
    private String targetAudience;
    private String priority;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private UUID createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
