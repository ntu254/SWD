package com.example.backendservice.features.enterprise.service;

import com.example.backendservice.features.enterprise.dto.CapabilityResponse;
import com.example.backendservice.features.enterprise.dto.CreateCapabilityRequest;
import com.example.backendservice.features.enterprise.entity.Enterprise;
import com.example.backendservice.features.enterprise.entity.EnterpriseCapability;
import com.example.backendservice.features.enterprise.repository.EnterpriseCapabilityRepository;
import com.example.backendservice.features.enterprise.repository.EnterpriseRepository;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnterpriseCapabilityServiceImpl implements EnterpriseCapabilityService {

    private final EnterpriseCapabilityRepository capabilityRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final WasteTypeRepository wasteTypeRepository;

    @Override
    @Transactional
    public CapabilityResponse createCapability(UUID enterpriseId, CreateCapabilityRequest request) {
        log.info("Creating capability for enterprise: {}", enterpriseId);

        Enterprise enterprise = enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new EntityNotFoundException("Enterprise not found with id: " + enterpriseId));

        ServiceArea area = serviceAreaRepository.findById(request.getAreaId())
                .orElseThrow(
                        () -> new EntityNotFoundException("ServiceArea not found with id: " + request.getAreaId()));

        WasteType wasteType = wasteTypeRepository.findById(request.getWasteTypeId())
                .orElseThrow(
                        () -> new EntityNotFoundException("WasteType not found with id: " + request.getWasteTypeId()));

        EnterpriseCapability capability = EnterpriseCapability.builder()
                .enterprise(enterprise)
                .area(area)
                .wasteType(wasteType)
                .dailyCapacityKg(request.getDailyCapacityKg())
                .usedCapacityKg(0.0)
                .pricePerKg(request.getPricePerKg())
                .status("ACTIVE")
                .build();

        capability = capabilityRepository.save(capability);
        log.info("Created capability with id: {}", capability.getId());

        return mapToResponse(capability);
    }

    @Override
    @Transactional(readOnly = true)
    public CapabilityResponse getCapabilityById(UUID id) {
        EnterpriseCapability capability = findById(id);
        return mapToResponse(capability);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CapabilityResponse> getCapabilitiesByEnterprise(UUID enterpriseId) {
        List<EnterpriseCapability> capabilities = capabilityRepository.findByEnterpriseId(enterpriseId);
        return capabilities.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CapabilityResponse> getCapabilitiesByArea(UUID areaId) {
        List<EnterpriseCapability> capabilities = capabilityRepository.findByAreaId(areaId);
        return capabilities.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CapabilityResponse updateCapability(UUID id, CreateCapabilityRequest request) {
        log.info("Updating capability: {}", id);

        EnterpriseCapability capability = findById(id);
        capability.setDailyCapacityKg(request.getDailyCapacityKg());
        capability.setPricePerKg(request.getPricePerKg());

        capability = capabilityRepository.save(capability);
        return mapToResponse(capability);
    }

    @Override
    @Transactional
    public void deleteCapability(UUID id) {
        log.info("Deleting capability: {}", id);
        EnterpriseCapability capability = findById(id);
        capability.setStatus("INACTIVE");
        capabilityRepository.save(capability);
    }

    @Override
    @Transactional
    public void resetDailyUsedCapacity() {
        log.info("Resetting daily used capacity for all capabilities");
        List<EnterpriseCapability> all = capabilityRepository.findAll();
        for (EnterpriseCapability cap : all) {
            cap.setUsedCapacityKg(0.0);
        }
        capabilityRepository.saveAll(all);
    }

    private EnterpriseCapability findById(UUID id) {
        return capabilityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Capability not found with id: " + id));
    }

    private CapabilityResponse mapToResponse(EnterpriseCapability capability) {
        return CapabilityResponse.builder()
                .id(capability.getId())
                .enterpriseId(capability.getEnterprise().getId())
                .enterpriseName(capability.getEnterprise().getName())
                .areaId(capability.getArea().getId())
                .areaName(capability.getArea().getName())
                .wasteTypeId(capability.getWasteType().getId())
                .wasteTypeName(capability.getWasteType().getName())
                .dailyCapacityKg(capability.getDailyCapacityKg())
                .usedCapacityKg(capability.getUsedCapacityKg())
                .availableCapacityKg(capability.getAvailableCapacity())
                .pricePerKg(capability.getPricePerKg())
                .status(capability.getStatus())
                .createdAt(capability.getCreatedAt())
                .build();
    }
}
