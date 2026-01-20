package com.example.backendservice.features.complaint.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.common.dto.PageResponse;
import com.example.backendservice.features.complaint.dto.ComplaintResponse;
import com.example.backendservice.features.complaint.dto.CreateComplaintRequest;
import com.example.backendservice.features.complaint.dto.UpdateComplaintStatusRequest;
import com.example.backendservice.features.complaint.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaint Management", description = "APIs for managing citizen complaints about system issues")
public class ComplaintController {

    private final ComplaintService complaintService;

    // ===================== CITIZEN ENDPOINTS =====================

    @Operation(summary = "Create new complaint", description = "Citizen creates a new complaint about system issues")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Complaint created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Citizen not found")
    })
    @PostMapping("/citizen/{citizenId}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Parameter(description = "ID of the citizen") @PathVariable Long citizenId,
            @Valid @RequestBody CreateComplaintRequest request) {

        ComplaintResponse response = complaintService.createComplaint(citizenId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint created successfully", response));
    }

    @Operation(summary = "Get citizen's complaints", description = "Retrieves all complaints submitted by a specific citizen")
    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getComplaintsByCitizen(
            @Parameter(description = "ID of the citizen") @PathVariable Long citizenId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ComplaintResponse> complaints = complaintService.getComplaintsByCitizen(citizenId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(complaints)));
    }

    // ===================== ADMIN ENDPOINTS =====================

    @Operation(summary = "Get all complaints (Admin)", description = "Admin retrieves all complaints with optional filters")
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getAllComplaints(
            @Parameter(description = "Filter by status (Pending, In_Progress, Resolved, Rejected)") @RequestParam(required = false) String status,
            @Parameter(description = "Filter by category (POINTS_ERROR, BUG, SERVICE_ISSUE, OTHER)") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by priority (Low, Normal, High, Urgent)") @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ComplaintResponse> complaints = complaintService.getAllComplaints(status, category, priority, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(complaints)));
    }

    @Operation(summary = "Get complaint by ID", description = "Retrieves detailed information about a specific complaint")
    @GetMapping("/{complaintId}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @Parameter(description = "ID of the complaint") @PathVariable Long complaintId) {
        ComplaintResponse response = complaintService.getComplaintById(complaintId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Update complaint status (Admin)", description = "Admin updates the status and response for a complaint")
    @PutMapping("/admin/{complaintId}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
            @Parameter(description = "ID of the complaint") @PathVariable Long complaintId,
            @RequestBody UpdateComplaintStatusRequest request) {

        ComplaintResponse response = complaintService.updateComplaintStatus(complaintId, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated successfully", response));
    }

    @Operation(summary = "Delete complaint (Admin)", description = "Admin deletes a complaint from the system")
    @DeleteMapping("/admin/{complaintId}")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(
            @Parameter(description = "ID of the complaint") @PathVariable Long complaintId) {
        complaintService.deleteComplaint(complaintId);
        return ResponseEntity.ok(ApiResponse.success("Complaint deleted successfully", null));
    }

    @Operation(summary = "Get complaint statistics (Admin)", description = "Admin retrieves statistics about complaints grouped by status")
    @GetMapping("/admin/statistics")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getComplaintStatistics() {
        Map<String, Long> stats = complaintService.getComplaintStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
