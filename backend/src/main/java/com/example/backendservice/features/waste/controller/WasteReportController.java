package com.example.backendservice.features.waste.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.waste.dto.CreateWasteReportRequest;
import com.example.backendservice.features.waste.dto.SuggestedReportDTO;
import com.example.backendservice.features.waste.dto.WasteReportResponse;
import com.example.backendservice.features.waste.service.WasteReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/waste-reports")
@RequiredArgsConstructor
@Tag(name = "Waste Reports", description = "APIs báo cáo rác từ Citizen")
public class WasteReportController {

    private final WasteReportService wasteReportService;

    @PostMapping
    @Operation(summary = "Tạo báo cáo rác mới")
    public ResponseEntity<ApiResponse<WasteReportResponse>> createReport(
            @Valid @RequestBody CreateWasteReportRequest request) {
        WasteReportResponse response = wasteReportService.createReport(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo báo cáo thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin báo cáo theo ID")
    public ResponseEntity<ApiResponse<WasteReportResponse>> getReportById(@PathVariable UUID id) {
        WasteReportResponse response = wasteReportService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/citizen/{citizenId}")
    @Operation(summary = "Lấy danh sách báo cáo của Citizen")
    public ResponseEntity<ApiResponse<Page<WasteReportResponse>>> getReportsByCitizen(
            @PathVariable UUID citizenId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<WasteReportResponse> response = wasteReportService.getReportsByCitizen(citizenId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/area/{areaId}")
    @Operation(summary = "Lấy danh sách báo cáo theo khu vực")
    public ResponseEntity<ApiResponse<Page<WasteReportResponse>>> getReportsByArea(
            @PathVariable UUID areaId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<WasteReportResponse> response = wasteReportService.getReportsByArea(areaId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/pending")
    @Operation(summary = "Lấy danh sách báo cáo đang chờ xử lý")
    public ResponseEntity<ApiResponse<Page<WasteReportResponse>>> getPendingReports(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<WasteReportResponse> response = wasteReportService.getPendingReports(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/suggested")
    @Operation(summary = "Lấy danh sách báo cáo đề xuất ưu tiên (Enterprise)")
    public ResponseEntity<ApiResponse<List<SuggestedReportDTO>>> getSuggestedReports(
            @RequestParam(required = false) UUID enterpriseId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(defaultValue = "10") int limit) {
        List<SuggestedReportDTO> response = wasteReportService.getSuggestedReports(enterpriseId, areaId, limit);
        return ResponseEntity.ok(ApiResponse.success("Danh sách báo cáo đề xuất theo độ ưu tiên", response));
    }

    @GetMapping("/{id}/priority-score")
    @Operation(summary = "Tính điểm ưu tiên cho báo cáo")
    public ResponseEntity<ApiResponse<Double>> calculatePriorityScore(@PathVariable UUID id) {
        Double score = wasteReportService.calculatePriorityScore(id);
        return ResponseEntity.ok(ApiResponse.success("Điểm ưu tiên của báo cáo", score));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật báo cáo")
    public ResponseEntity<ApiResponse<WasteReportResponse>> updateReport(
            @PathVariable UUID id,
            @Valid @RequestBody CreateWasteReportRequest request) {
        WasteReportResponse response = wasteReportService.updateReport(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", response));
    }

    @PatchMapping("/{id}/accept")
    @Operation(summary = "Chấp nhận báo cáo (Enterprise)")
    public ResponseEntity<ApiResponse<WasteReportResponse>> acceptReport(@PathVariable UUID id) {
        WasteReportResponse response = wasteReportService.acceptReport(id);
        return ResponseEntity.ok(ApiResponse.success("Đã chấp nhận báo cáo", response));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Từ chối báo cáo (Enterprise)")
    public ResponseEntity<ApiResponse<WasteReportResponse>> rejectReport(
            @PathVariable UUID id,
            @RequestParam String reason) {
        WasteReportResponse response = wasteReportService.rejectReport(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối báo cáo", response));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Hủy báo cáo (Citizen)")
    public ResponseEntity<ApiResponse<WasteReportResponse>> cancelReport(@PathVariable UUID id) {
        WasteReportResponse response = wasteReportService.cancelReport(id);
        return ResponseEntity.ok(ApiResponse.success("Đã hủy báo cáo", response));
    }
}
