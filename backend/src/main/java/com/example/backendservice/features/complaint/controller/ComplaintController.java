package com.example.backendservice.features.complaint.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.common.dto.PageResponse;
import com.example.backendservice.features.complaint.dto.*;
import com.example.backendservice.features.complaint.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaint Management", description = "APIs for managing citizen complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    // ===================== CITIZEN ENDPOINTS =====================

    @Operation(summary = "Create complaint", description = "Citizen creates a new complaint")
    @PostMapping("/citizen/{citizenId}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Parameter(description = "Citizen user ID") @PathVariable UUID citizenId,
            @Valid @RequestBody CreateComplaintRequest request) {

        ComplaintResponse response = complaintService.createComplaint(citizenId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint created successfully", response));
    }

    @Operation(summary = "Get citizen's complaints", description = "Get paginated complaints for a specific citizen")
    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getCitizenComplaints(
            @Parameter(description = "Citizen user ID") @PathVariable UUID citizenId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ComplaintResponse> result = complaintService.getCitizenComplaints(citizenId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    // ===================== PUBLIC ENDPOINT =====================

    @Operation(summary = "Get complaint by ID", description = "Get detailed complaint information")
    @GetMapping("/{complaintId}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @Parameter(description = "Complaint ID") @PathVariable UUID complaintId) {

        ComplaintResponse response = complaintService.getComplaintById(complaintId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ===================== ADMIN ENDPOINTS =====================

    @Operation(summary = "Get all complaints with filters", description = "Admin retrieves paginated complaints with optional filters")
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getAllComplaints(
            @Parameter(description = "Filter by status") @RequestParam(required = false) String status,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by priority") @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ComplaintResponse> result = complaintService.getAllComplaints(status, category, priority, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    @Operation(summary = "Update complaint status", description = "Admin updates the status of a complaint")
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
            @Parameter(description = "Complaint ID") @PathVariable("id") UUID complaintId,
            @Valid @RequestBody UpdateComplaintStatusRequest request) {

        ComplaintResponse response = complaintService.updateComplaintStatus(complaintId, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated successfully", response));
    }

    @Operation(summary = "Delete complaint", description = "Admin deletes a complaint")
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(
            @Parameter(description = "Complaint ID") @PathVariable("id") UUID complaintId) {

        complaintService.deleteComplaint(complaintId);
        return ResponseEntity.ok(ApiResponse.success("Complaint deleted successfully", null));
    }

    @Operation(summary = "Get complaint statistics", description = "Admin views statistics about complaints")
    @GetMapping("/admin/statistics")
    public ResponseEntity<ApiResponse<ComplaintStatisticsResponse>> getStatistics() {
        ComplaintStatisticsResponse stats = complaintService.getStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
