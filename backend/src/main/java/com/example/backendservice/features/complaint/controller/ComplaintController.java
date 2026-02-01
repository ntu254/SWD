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
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/complaints")
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
            @Parameter(description = "ID of the citizen") @PathVariable UUID citizenId,
            @Valid @RequestBody CreateComplaintRequest request) {

        ComplaintResponse response = complaintService.createComplaint(citizenId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint created successfully", response));
    }

    @Operation(summary = "Get citizen's complaints", description = "Retrieves all complaints submitted by a specific citizen")
    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getComplaintsByCitizen(
            @Parameter(description = "ID of the citizen") @PathVariable UUID citizenId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ComplaintResponse> complaints = complaintService.getComplaintsByCitizen(citizenId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(complaints)));
    }

    // ===================== ENTERPRISE ENDPOINTS =====================

    @Operation(summary = "Get complaints by enterprise", description = "Retrieves all complaints for collectors in an enterprise")
    @GetMapping("/enterprise/{enterpriseId}")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getComplaintsByEnterprise(
            @Parameter(description = "ID of the enterprise") @PathVariable UUID enterpriseId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ComplaintResponse> complaints = complaintService.getComplaintsByEnterprise(enterpriseId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(complaints)));
    }

    @Operation(summary = "Get complaints by collector", description = "Retrieves all complaints about a specific collector")
    @GetMapping("/collector/{collectorId}")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getComplaintsByCollector(
            @Parameter(description = "ID of the collector") @PathVariable UUID collectorId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ComplaintResponse> complaints = complaintService.getComplaintsByCollector(collectorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(complaints)));
    }

    @Operation(summary = "Count complaints by collector", description = "Returns the total number of complaints for a collector")
    @GetMapping("/collector/{collectorId}/count")
    public ResponseEntity<ApiResponse<Long>> countComplaintsByCollector(
            @Parameter(description = "ID of the collector") @PathVariable UUID collectorId) {
        long count = complaintService.countComplaintsByCollector(collectorId);
        return ResponseEntity.ok(ApiResponse.success("Số khiếu nại của collector", count));
    }

    @Operation(summary = "Start investigation", description = "Admin/Enterprise starts investigating a complaint")
    @PatchMapping("/{complaintId}/investigate")
    public ResponseEntity<ApiResponse<ComplaintResponse>> startInvestigation(
            @Parameter(description = "ID of the complaint") @PathVariable UUID complaintId,
            @Parameter(description = "ID of the admin handling") @RequestParam UUID adminId) {
        ComplaintResponse response = complaintService.startInvestigation(complaintId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Bắt đầu điều tra khiếu nại", response));
    }

    @Operation(summary = "Resolve complaint", description = "Admin/Enterprise resolves a complaint with a response")
    @PatchMapping("/{complaintId}/resolve")
    public ResponseEntity<ApiResponse<ComplaintResponse>> resolveComplaint(
            @Parameter(description = "ID of the complaint") @PathVariable UUID complaintId,
            @Parameter(description = "ID of the admin handling") @RequestParam UUID adminId,
            @Parameter(description = "Resolution response") @RequestParam String response) {
        ComplaintResponse result = complaintService.resolveComplaint(complaintId, adminId, response);
        return ResponseEntity.ok(ApiResponse.success("Đã giải quyết khiếu nại", result));
    }

    @Operation(summary = "Reject complaint", description = "Admin/Enterprise rejects a complaint with a reason")
    @PatchMapping("/{complaintId}/reject")
    public ResponseEntity<ApiResponse<ComplaintResponse>> rejectComplaint(
            @Parameter(description = "ID of the complaint") @PathVariable UUID complaintId,
            @Parameter(description = "ID of the admin handling") @RequestParam UUID adminId,
            @Parameter(description = "Rejection reason") @RequestParam String reason) {
        ComplaintResponse result = complaintService.rejectComplaint(complaintId, adminId, reason);
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối khiếu nại", result));
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
            @Parameter(description = "ID of the complaint") @PathVariable UUID complaintId) {
        ComplaintResponse response = complaintService.getComplaintById(complaintId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Update complaint status (Admin)", description = "Admin updates the status and response for a complaint")
    @PutMapping("/admin/{complaintId}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
            @Parameter(description = "ID of the complaint") @PathVariable UUID complaintId,
            @RequestBody UpdateComplaintStatusRequest request) {

        ComplaintResponse response = complaintService.updateComplaintStatus(complaintId, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated successfully", response));
    }

    @Operation(summary = "Delete complaint (Admin)", description = "Admin deletes a complaint from the system")
    @DeleteMapping("/admin/{complaintId}")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(
            @Parameter(description = "ID of the complaint") @PathVariable UUID complaintId) {
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
