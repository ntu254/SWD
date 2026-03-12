package com.wastecollection.dto.reward;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RedeemItemRequest {

    @NotNull(message = "Item ID is required")
    private UUID itemId;
}
