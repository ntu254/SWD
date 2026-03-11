package com.example.backendservice.features.task.dto;

import com.example.backendservice.features.task.entity.TaskStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
<<<<<<< HEAD
import java.util.ArrayList;
=======
>>>>>>> 94efa8069bf4a55749c276d366d098ff82648738
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
<<<<<<< HEAD
    @JsonProperty("id")
    private UUID taskId;
    private UUID reportId;
=======
    private UUID id;
    private UUID wasteReportId;
    private UUID enterpriseId;
>>>>>>> 94efa8069bf4a55749c276d366d098ff82648738
    private UUID areaId;
    private String areaName;
    private LocalDate scheduledDate;
    private TaskStatus status;
    private String priority;
<<<<<<< HEAD

    // Waste report details (enriched from linked WasteReport)
    private String citizenName;
    private String citizenPhone;
    @JsonProperty("wasteType")
    private String wasteTypeName;
    private String address;
    private Double latitude;
    private Double longitude;
    private String description;
    private String photoUrl;
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

=======
    private String notes;
    private String rejectionReason;
    
    // Details from WasteReport
    private String citizenName;
    private String citizenPhone;
    private String address; // Derived from Report or Location
    private Double latitude;
    private Double longitude;
    private String wasteType;
    private String description;
    private List<String> imageUrls;
    
>>>>>>> 94efa8069bf4a55749c276d366d098ff82648738
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
