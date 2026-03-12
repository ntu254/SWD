package com.wastecollection.dto.notification;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateNotificationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    /** General, Maintenance, Update, Promotion, Alert */
    private String type;

    /** All, Citizen, Collector, Enterprise */
    private String targetAudience;

    /** Low, Normal, High, Urgent */
    private String priority;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
