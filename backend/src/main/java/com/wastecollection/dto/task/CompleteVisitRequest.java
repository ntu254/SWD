package com.wastecollection.dto.task;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CompleteVisitRequest {

    @NotBlank(message = "Visit status is required")
    private String visitStatus;

    private String collectorNote;

    /** URLs of evidence photos already uploaded to Cloudinary */
    private List<String> photoUrls;

    /** Waste items collected during this visit */
    private List<WasteItemInput> wasteItems;

    @Data
    public static class WasteItemInput {
        private UUID wasteTypeId;
        private Double weightKg;
        private String sortingLevel;
        private String contaminationNote;
    }
}
