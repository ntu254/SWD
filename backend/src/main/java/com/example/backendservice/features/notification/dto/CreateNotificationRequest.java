package com.example.backendservice.features.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(max = 5000, message = "Content must be less than 5000 characters")
    private String content;

    private String type; // General, Maintenance, Update, Alert, Promotion

    private String targetAudience; // All, Citizen, Collector, Enterprise

    private String priority; // Low, Normal, High, Urgent

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
