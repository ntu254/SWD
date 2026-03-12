package com.wastecollection.service;

import com.wastecollection.dto.enterprise.*;
import com.wastecollection.dto.user.UpdateProfileRequest;
import com.wastecollection.dto.user.UserDto;
import com.wastecollection.entity.*;
import com.wastecollection.exception.BadRequestException;
import com.wastecollection.exception.ForbiddenException;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnterpriseService {

    private final EnterpriseCapabilityRepository capabilityRepository;
    private final UserRepository userRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final WasteTypeRepository wasteTypeRepository;
    private final CitizenRewardRuleRepository rewardRuleRepository;
    private final CollectorKpiDailyRepository kpiRepository;
    private final CollectorRepository collectorRepository;
    private final UserService userService;

    // ── Capabilities ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EnterpriseCapabilityDto> getCapabilities(UUID enterpriseId) {
        return capabilityRepository.findByEnterprise_UserId(enterpriseId)
                .stream().map(this::mapToDto).toList();
    }

    @Transactional
    public EnterpriseCapabilityDto addCapability(UUID enterpriseId, CreateCapabilityRequest request) {
        User enterprise = userRepository.findById(enterpriseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise", "id", enterpriseId));
        ServiceArea area = serviceAreaRepository.findById(request.getServiceAreaId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceArea", "id", request.getServiceAreaId()));
        WasteType wasteType = wasteTypeRepository.findById(request.getWasteTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("WasteType", "id", request.getWasteTypeId()));

        EnterpriseCapability capability = EnterpriseCapability.builder()
                .enterprise(enterprise)
                .serviceArea(area)
                .wasteType(wasteType)
                .dailyCapacityKg(request.getDailyCapacityKg())
                .usedCapacityKg(0.0)
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .build();

        return mapToDto(capabilityRepository.save(capability));
    }

    @Transactional
    public void deleteCapability(UUID capabilityId) {
        if (!capabilityRepository.existsById(capabilityId)) {
            throw new ResourceNotFoundException("EnterpriseCapability", "id", capabilityId);
        }
        capabilityRepository.deleteById(capabilityId);
    }

    // ── Reward Rules ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CitizenRewardRuleDto> getRewardRules() {
        return rewardRuleRepository.findByIsActiveTrue()
                .stream().map(this::mapRuleToDto).toList();
    }

    @Transactional
    public CitizenRewardRuleDto createRewardRule(RewardRuleRequest request) {
        WasteType wt = wasteTypeRepository.findById(request.getWasteTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("WasteType", "id", request.getWasteTypeId()));
        CitizenRewardRule rule = CitizenRewardRule.builder()
                .wasteType(wt)
                .sortingLevel(request.getSortingLevel())
                .pointsFixed(request.getPointsFixed())
                .pointsPerKg(request.getPointsPerKg())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return mapRuleToDto(rewardRuleRepository.save(rule));
    }

    @Transactional
    public CitizenRewardRuleDto updateRewardRule(UUID ruleId, RewardRuleRequest request) {
        CitizenRewardRule rule = rewardRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("RewardRule", "id", ruleId));
        if (request.getWasteTypeId() != null) {
            WasteType wt = wasteTypeRepository.findById(request.getWasteTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("WasteType", "id", request.getWasteTypeId()));
            rule.setWasteType(wt);
        }
        if (request.getSortingLevel() != null) rule.setSortingLevel(request.getSortingLevel());
        if (request.getPointsFixed() != null) rule.setPointsFixed(request.getPointsFixed());
        if (request.getPointsPerKg() != null) rule.setPointsPerKg(request.getPointsPerKg());
        if (request.getEffectiveFrom() != null) rule.setEffectiveFrom(request.getEffectiveFrom());
        if (request.getEffectiveTo() != null) rule.setEffectiveTo(request.getEffectiveTo());
        if (request.getIsActive() != null) rule.setIsActive(request.getIsActive());
        return mapRuleToDto(rewardRuleRepository.save(rule));
    }

    @Transactional
    public void deactivateRewardRule(UUID ruleId) {
        CitizenRewardRule rule = rewardRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("RewardRule", "id", ruleId));
        rule.setIsActive(false);
        rewardRuleRepository.save(rule);
    }

    // ── Collectors ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UserDto> getCollectors(UUID enterpriseId) {
        return collectorRepository.findByEnterprise_UserId(enterpriseId)
                .stream()
                .map(c -> userService.mapToDto(c.getUser()))
                .toList();
    }

    @Transactional
    public UserDto updateCollector(UUID enterpriseId, UUID collectorUserId, UpdateProfileRequest request) {
        Collector collector = collectorRepository.findByUser_UserId(collectorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Collector", "id", collectorUserId));
        if (!collector.getEnterprise().getUserId().equals(enterpriseId)) {
            throw new ForbiddenException("Collector does not belong to your enterprise");
        }
        User user = collector.getUser();
        if (request.getFirstName() != null)   user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)    user.setLastName(request.getLastName());
        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getPhone() != null)       user.setPhone(request.getPhone());
        return userService.mapToDto(userRepository.save(user));
    }

    @Transactional
    public void deactivateCollector(UUID enterpriseId, UUID collectorUserId) {
        Collector collector = collectorRepository.findByUser_UserId(collectorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Collector", "id", collectorUserId));
        if (!collector.getEnterprise().getUserId().equals(enterpriseId)) {
            throw new ForbiddenException("Collector does not belong to your enterprise");
        }
        User user = collector.getUser();
        user.setAccountStatus(User.AccountStatus.DISABLED);
        userRepository.save(user);
    }

    // ── KPI Config ────────────────────────────────────────────────────────────

    @Transactional
    public KpiConfigDto setCollectorKpi(UUID enterpriseId, KpiConfigRequest request) {
        // Verify collector belongs to this enterprise
        Collector collector = collectorRepository.findByUser_UserId(request.getCollectorUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Collector", "id", request.getCollectorUserId()));
        if (!collector.getEnterprise().getUserId().equals(enterpriseId)) {
            throw new ForbiddenException("Collector does not belong to your enterprise");
        }

        ServiceArea area = serviceAreaRepository.findById(request.getAreaId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceArea", "id", request.getAreaId()));
        LocalDate kpiDate = request.getKpiDate() != null ? request.getKpiDate() : LocalDate.now();

        CollectorKpiDaily kpi = kpiRepository
                .findByCollector_UserIdAndKpiDate(request.getCollectorUserId(), kpiDate)
                .orElse(CollectorKpiDaily.builder()
                        .collector(collector.getUser())
                        .area(area)
                        .kpiDate(kpiDate)
                        .actualVisits(0)
                        .actualWeightKg(0.0)
                        .status("PENDING")
                        .build());
        kpi.setArea(area);
        if (request.getMinVisits() != null) kpi.setMinVisits(request.getMinVisits());
        if (request.getMinWeightKg() != null) kpi.setMinWeightKg(request.getMinWeightKg());
        return mapKpiToDto(kpiRepository.save(kpi));
    }

    @Transactional(readOnly = true)
    public List<KpiConfigDto> getCollectorKpiHistory(UUID collectorId) {
        return kpiRepository.findByCollector_UserIdOrderByKpiDateDesc(collectorId)
                .stream().map(this::mapKpiToDto).toList();
    }

    @Transactional(readOnly = true)
    public KpiConfigDto getCollectorKpiToday(UUID collectorId) {
        CollectorKpiDaily kpi = kpiRepository
                .findByCollector_UserIdAndKpiDate(collectorId, LocalDate.now())
                .orElse(CollectorKpiDaily.builder()
                        .actualVisits(0)
                        .actualWeightKg(0.0)
                        .status("PENDING")
                        .build());
        return mapKpiToDto(kpi);
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private EnterpriseCapabilityDto mapToDto(EnterpriseCapability c) {
        return EnterpriseCapabilityDto.builder()
                .capabilityId(c.getCapabilityId())
                .enterpriseUserId(c.getEnterprise().getUserId())
                .serviceAreaId(c.getServiceArea().getAreaId())
                .serviceAreaName(c.getServiceArea().getName())
                .wasteTypeId(c.getWasteType().getWasteTypeId())
                .wasteTypeName(c.getWasteType().getName())
                .dailyCapacityKg(c.getDailyCapacityKg())
                .usedCapacityKg(c.getUsedCapacityKg())
                .effectiveFrom(c.getEffectiveFrom())
                .effectiveTo(c.getEffectiveTo())
                .build();
    }

    private CitizenRewardRuleDto mapRuleToDto(CitizenRewardRule r) {
        return CitizenRewardRuleDto.builder()
                .ruleId(r.getRuleId())
                .wasteTypeId(r.getWasteType() != null ? r.getWasteType().getWasteTypeId() : null)
                .wasteTypeName(r.getWasteType() != null ? r.getWasteType().getName() : null)
                .sortingLevel(r.getSortingLevel())
                .pointsFixed(r.getPointsFixed())
                .pointsPerKg(r.getPointsPerKg())
                .effectiveFrom(r.getEffectiveFrom())
                .effectiveTo(r.getEffectiveTo())
                .isActive(r.getIsActive())
                .build();
    }

    KpiConfigDto mapKpiToDto(CollectorKpiDaily k) {
        return KpiConfigDto.builder()
                .kpiId(k.getKpiId())
                .collectorUserId(k.getCollector() != null ? k.getCollector().getUserId() : null)
                .collectorName(k.getCollector() != null ? k.getCollector().getDisplayName() : null)
                .areaId(k.getArea() != null ? k.getArea().getAreaId() : null)
                .areaName(k.getArea() != null ? k.getArea().getName() : null)
                .kpiDate(k.getKpiDate())
                .minVisits(k.getMinVisits())
                .actualVisits(k.getActualVisits())
                .minWeightKg(k.getMinWeightKg())
                .actualWeightKg(k.getActualWeightKg())
                .status(k.getStatus())
                .build();
    }
}
