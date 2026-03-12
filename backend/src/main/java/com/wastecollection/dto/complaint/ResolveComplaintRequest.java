package com.wastecollection.dto.complaint;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResolveComplaintRequest {

    @NotBlank(message = "Decision is required")
    private String decision;

    private String note;

    private Boolean isAccepted;

    /** Optional admin public response shown to the submitter */
    private String adminResponse;
}
