package com.example.backendservice.features.enterprise.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.enterprise.dto.CapabilityResponse;
import com.example.backendservice.features.enterprise.dto.CreateCapabilityRequest;
import com.example.backendservice.features.enterprise.entity.EnterpriseCapability;
import com.example.backendservice.features.enterprise.repository.EnterpriseCapabilityRepository;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of EnterpriseCapabilityService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnterpriseCapabilityServiceImpl implements EnterpriseCapabilityService {

        private final EnterpriseCapabilityRepository capabilityRepository;
        private final UserRepository userRepository;
        private final ServiceAreaRepository serviceAreaRepository;
        private final WasteTypeRepository wasteTypeRepository;

        @Override
        @Transactional
        public CapabilityResponse createCapability(UUID enterpriseId, CreateCapabilityRequest request) {
                log.info("Creating capability for enterprise: {}", enterpriseId);

                User enterprise = userRepository.findByUserId(enterpriseId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Enterprise not found: " + enterpriseId));

                ServiceArea area = serviceAreaRepository.findByAreaId(request.getAreaId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Service area not found: " + request.getAreaId()));

                WasteType wasteType = wasteTypeRepository.findByWasteTypeId(request.getWasteTypeId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Waste type not found: " + request.getWasteTypeId()));

                // Check for duplicate
                capabilityRepository.findByEnterpriseUserIdAndWasteTypeIdAndServiceAreaId(
                                enterpriseId, request.getWasteTypeId(), request.getAreaId()).ifPresent(existing -> {
                                        throw new IllegalArgumentException(
                                                        "Capability already exists for this combination");
                                });

                EnterpriseCapability capability = EnterpriseCapability.builder()
                                .enterpriseUser(enterprise)
                                .serviceArea(area)
                                .wasteType(wasteType)
                                .dailyCapacityKg(request.getDailyCapacityKg())
                                .effectiveFrom(LocalDate.now())
                                .build();

                capability = capabilityRepository.save(capability);
                log.info("Capability created: {}", capability.getCapabilityId());

                return toResponse(capability);
        }

        @Override
        public CapabilityResponse getCapabilityById(UUID id) {
                EnterpriseCapability capability = capabilityRepository.findByCapabilityId(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Capability not found: " + id));
                return toResponse(capability);
        }

        @Override
        public List<CapabilityResponse> getCapabilitiesByEnterprise(UUID enterpriseId) {
                log.debug("Getting capabilities for enterprise: {}", enterpriseId);
                return capabilityRepository.findByEnterpriseUserId(enterpriseId)
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<CapabilityResponse> getCapabilitiesByArea(UUID areaId) {
                log.debug("Getting capabilities for area: {}", areaId);
                return capabilityRepository.findByServiceAreaId(areaId)
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public CapabilityResponse updateCapability(UUID id, CreateCapabilityRequest request) {
                log.info("Updating capability: {}", id);

                EnterpriseCapability capability = capabilityRepository.findByCapabilityId(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Capability not found: " + id));

                if (request.getAreaId() != null) {
                        ServiceArea area = serviceAreaRepository.findByAreaId(request.getAreaId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Service area not found: " + request.getAreaId()));
                        capability.setServiceArea(area);
                }

                if (request.getWasteTypeId() != null) {
                        WasteType wasteType = wasteTypeRepository.findByWasteTypeId(request.getWasteTypeId())
                                        .orElseThrow(
                                                        () -> new ResourceNotFoundException("Waste type not found: "
                                                                        + request.getWasteTypeId()));
                        capability.setWasteType(wasteType);
                }

                if (request.getDailyCapacityKg() != null) {
                        capability.setDailyCapacityKg(request.getDailyCapacityKg());
                }

                capability = capabilityRepository.save(capability);
                log.info("Capability updated: {}", capability.getCapabilityId());

                return toResponse(capability);
        }

        @Override
        @Transactional
        public void deleteCapability(UUID id) {
                log.info("Deleting capability: {}", id);

                EnterpriseCapability capability = capabilityRepository.findByCapabilityId(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Capability not found: " + id));

                capabilityRepository.delete(capability);
                log.info("Capability deleted: {}", id);
        }

        @Override
        @Transactional
        public void resetDailyUsedCapacity() {
                log.info("Resetting daily used capacity for all capabilities");
                List<EnterpriseCapability> allCapabilities = capabilityRepository.findAll();
                for (EnterpriseCapability capability : allCapabilities) {
                        capability.resetUsedCapacity();
                }
                capabilityRepository.saveAll(allCapabilities);
                log.info("Daily reset completed for {} capabilities", allCapabilities.size());
        }

        @Override
        @Transactional
        public void incrementUsedCapacity(UUID capabilityId, Double weightKg) {
                log.debug("Incrementing used capacity for capability {} by {} kg", capabilityId, weightKg);
                EnterpriseCapability capability = capabilityRepository.findByCapabilityId(capabilityId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Capability not found: " + capabilityId));
                capability.incrementUsedCapacity(weightKg);
                capabilityRepository.save(capability);
                log.debug("Updated used capacity: {} kg", capability.getUsedCapacityKg());
        }

        private CapabilityResponse toResponse(EnterpriseCapability capability) {
                return CapabilityResponse.builder()
                                .id(capability.getCapabilityId())
                                .enterpriseId(capability.getEnterpriseUserId())
                                .enterpriseName(
                                                capability.getEnterpriseUser() != null
                                                                ? capability.getEnterpriseUser().getDisplayName()
                                                                : null)
                                .areaId(capability.getServiceArea() != null ? capability.getServiceArea().getAreaId()
                                                : null)
                                .areaName(capability.getServiceArea() != null ? capability.getServiceArea().getName()
                                                : null)
                                .wasteTypeId(capability.getWasteType() != null
                                                ? capability.getWasteType().getWasteTypeId()
                                                : null)
                                .wasteTypeName(capability.getWasteType() != null ? capability.getWasteType().getName()
                                                : null)
                                .dailyCapacityKg(capability.getDailyCapacityKg())
                                .usedCapacityKg(capability.getUsedCapacityKg() != null ? capability.getUsedCapacityKg()
                                                : 0.0)
                                .availableCapacityKg(capability.getAvailableCapacity())
                                .pricePerKg(null) // Not in current entity
                                .status(capability.isEffective(LocalDate.now()) ? "ACTIVE" : "INACTIVE")
                                .createdAt(null) // Not tracked in current entity
                                .build();
        }
}
