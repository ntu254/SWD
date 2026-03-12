package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.user.UpdateProfileRequest;
import com.wastecollection.dto.user.UserDto;
import com.wastecollection.security.SecurityUtils;
import com.wastecollection.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Manage own profile")
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    @GetMapping("/me")
    @Operation(summary = "Get own profile")
    public ResponseEntity<ApiResponse<UserDto>> getMyProfile() {
        UserDto dto = userService.getProfile(securityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping("/me")
    @Operation(summary = "Update own profile")
    public ResponseEntity<ApiResponse<UserDto>> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserDto dto = userService.updateProfile(securityUtils.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", dto));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload avatar image")
    public ResponseEntity<ApiResponse<UserDto>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        UserDto dto = userService.uploadAvatar(securityUtils.getCurrentUserId(), file);
        return ResponseEntity.ok(ApiResponse.success("Avatar updated", dto));
    }
}
