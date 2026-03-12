package com.wastecollection.dto.complaint;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateComplaintRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    /** BUG, FEATURE, POINTS_ERROR, COLLECTION_ISSUE, SERVICE_ISSUE, OTHER */
    @NotBlank(message = "Category is required")
    private String category;

    /** Low, Normal, High, Urgent */
    private String priority;

    private UUID reportId;

    private UUID visitId;

    private UUID rewardTransactionId;
}
