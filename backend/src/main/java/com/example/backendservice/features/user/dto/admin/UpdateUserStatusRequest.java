package com.example.backendservice.features.user.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {

    @NotBlank(message = "Account status is required")
    @Pattern(regexp = "ACTIVE|DISABLED|BANNED", message = "Account status must be ACTIVE, DISABLED, or BANNED")
    private String accountStatus;

    /**
     * Optional reason for banning (required when accountStatus = BANNED)
     */
    private String banReason;
}
