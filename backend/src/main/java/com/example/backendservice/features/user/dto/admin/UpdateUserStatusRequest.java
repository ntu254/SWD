package com.example.backendservice.features.user.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UpdateUserStatusRequest {

    @NotBlank(message = "Account status is required")
    @Pattern(regexp = "ACTIVE|DISABLED|BANNED", message = "Account status must be ACTIVE, DISABLED, or BANNED")
    private String accountStatus;

    /**
     * Optional reason for banning (required when accountStatus = BANNED)
     */
    private String banReason;

    public UpdateUserStatusRequest() {
    }

    public UpdateUserStatusRequest(String accountStatus, String banReason) {
        this.accountStatus = accountStatus;
        this.banReason = banReason;
    }

    public static UpdateUserStatusRequestBuilder builder() {
        return new UpdateUserStatusRequestBuilder();
    }

    public static class UpdateUserStatusRequestBuilder {
        private String accountStatus;
        private String banReason;

        UpdateUserStatusRequestBuilder() {
        }

        public UpdateUserStatusRequestBuilder accountStatus(String accountStatus) {
            this.accountStatus = accountStatus;
            return this;
        }

        public UpdateUserStatusRequestBuilder banReason(String banReason) {
            this.banReason = banReason;
            return this;
        }

        public UpdateUserStatusRequest build() {
            return new UpdateUserStatusRequest(accountStatus, banReason);
        }
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public String getBanReason() {
        return banReason;
    }

    public void setBanReason(String banReason) {
        this.banReason = banReason;
    }
}
