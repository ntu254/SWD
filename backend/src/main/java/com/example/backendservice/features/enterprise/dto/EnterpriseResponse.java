package com.example.backendservice.features.enterprise.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnterpriseResponse {

    private UUID id;
    private String name;
    private String description;
    private String logoUrl;
    private String address;
    private String phone;
    private String email;
    private String taxCode;
    private UUID ownerId;
    private String ownerName;
    private UUID primaryAreaId;
    private String primaryAreaName;
    private String status;
    private LocalDateTime createdAt;
}
