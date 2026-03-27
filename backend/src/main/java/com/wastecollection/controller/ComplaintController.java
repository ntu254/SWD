package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.complaint.*;
import com.wastecollection.security.SecurityUtils;
import com.wastecollection.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "Submit and manage complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit a new complaint")
    public ResponseEntity<ApiResponse<ComplaintDto>> create(
            @Valid @RequestBody CreateComplaintRequest request) {
        ComplaintDto dto = complaintService.createComplaint(securityUtils.getCurrentUserId(), request);
        return ResponseEntity.status(201).body(ApiResponse.success("Complaint submitted", dto));
    }

    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my complaints")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintDto>>> getMine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                complaintService.getMyComplaints(securityUtils.getCurrentUserId(), page, size)));
    }

    @GetMapping("/{complaintId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get complaint detail by ID")
    public ResponseEntity<ApiResponse<ComplaintDto>> get(@PathVariable UUID complaintId) {
        return ResponseEntity.ok(ApiResponse.success(
                complaintService.getComplaint(complaintId, securityUtils.getCurrentUserId())));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: list all complaints")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(
                complaintService.getAllComplaints(page, size, status)));
    }

    @PutMapping("/{complaintId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: resolve a complaint")
    public ResponseEntity<ApiResponse<ComplaintDto>> resolve(
            @PathVariable UUID complaintId,
            @Valid @RequestBody ResolveComplaintRequest request) {
        ComplaintDto dto = complaintService.resolveComplaint(complaintId, securityUtils.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Complaint resolved", dto));
    }

    @GetMapping("/{complaintId}/evidence")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE')")
    @Operation(summary = "Get collection evidence (photos, notes) related to this complaint")
    public ResponseEntity<ApiResponse<CollectionEvidenceDto>> getEvidence(@PathVariable UUID complaintId) {
        CollectionEvidenceDto dto = complaintService.getComplaintEvidence(complaintId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
