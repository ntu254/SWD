package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.dto.enterprise.CitizenRewardRuleDto;
import com.wastecollection.dto.enterprise.RewardRuleRequest;
import com.wastecollection.service.EnterpriseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enterprise/reward-rules")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ENTERPRISE', 'ADMIN')")
@Tag(name = "Enterprise - Reward Rules", description = "Configure citizen reward rules for waste collection and sorting quality")
public class EnterpriseRewardRuleController {

    private final EnterpriseService enterpriseService;

    @GetMapping
    @Operation(summary = "List all active reward rules")
    public ResponseEntity<ApiResponse<List<CitizenRewardRuleDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(enterpriseService.getRewardRules()));
    }

    @PostMapping
    @Operation(summary = "Create a new reward rule (waste type + sorting level → points)")
    public ResponseEntity<ApiResponse<CitizenRewardRuleDto>> create(
            @Valid @RequestBody RewardRuleRequest request) {
        CitizenRewardRuleDto dto = enterpriseService.createRewardRule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Reward rule created", dto));
    }

    @PutMapping("/{ruleId}")
    @Operation(summary = "Update an existing reward rule")
    public ResponseEntity<ApiResponse<CitizenRewardRuleDto>> update(
            @PathVariable UUID ruleId,
            @RequestBody RewardRuleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Reward rule updated",
                enterpriseService.updateRewardRule(ruleId, request)));
    }

    @DeleteMapping("/{ruleId}")
    @Operation(summary = "Deactivate a reward rule")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID ruleId) {
        enterpriseService.deactivateRewardRule(ruleId);
        return ResponseEntity.ok(ApiResponse.success("Reward rule deactivated", null));
    }
}
