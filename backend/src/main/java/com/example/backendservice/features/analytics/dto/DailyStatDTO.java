package com.example.backendservice.features.analytics.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatDTO {

    private LocalDate date;
    private Long tasksCreated;
    private Long tasksCompleted;
    private Double weightCollectedKg;
    private Integer pointsAwarded;
}
