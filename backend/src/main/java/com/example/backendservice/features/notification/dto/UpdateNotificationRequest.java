package com.example.backendservice.features.notification.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateNotificationRequest {

    private String title;
    private String content;
    private String type;
    private String targetAudience;
    private String priority;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
