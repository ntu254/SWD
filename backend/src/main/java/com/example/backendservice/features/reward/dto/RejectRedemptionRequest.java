package com.example.backendservice.features.reward.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class RejectRedemptionRequest {

    private String reason;

    public RejectRedemptionRequest() {
    }

    public RejectRedemptionRequest(String reason) {
        this.reason = reason;
    }

    public static RejectRedemptionRequestBuilder builder() {
        return new RejectRedemptionRequestBuilder();
    }

    public static class RejectRedemptionRequestBuilder {
        private String reason;

        RejectRedemptionRequestBuilder() {
        }

        public RejectRedemptionRequestBuilder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public RejectRedemptionRequest build() {
            return new RejectRedemptionRequest(reason);
        }
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
