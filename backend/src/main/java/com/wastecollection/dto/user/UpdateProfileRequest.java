package com.wastecollection.dto.user;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String displayName;
    private String phone;
    private String addressText;
}
