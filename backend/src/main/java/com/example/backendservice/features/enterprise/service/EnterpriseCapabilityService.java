package com.example.backendservice.features.enterprise.service;

import com.example.backendservice.features.enterprise.dto.CapabilityResponse;
import com.example.backendservice.features.enterprise.dto.CreateCapabilityRequest;

import java.util.List;
import java.util.UUID;

public interface EnterpriseCapabilityService {

    CapabilityResponse createCapability(UUID enterpriseId, CreateCapabilityRequest request);

    CapabilityResponse getCapabilityById(UUID id);

    List<CapabilityResponse> getCapabilitiesByEnterprise(UUID enterpriseId);

    List<CapabilityResponse> getCapabilitiesByArea(UUID areaId);

    CapabilityResponse updateCapability(UUID id, CreateCapabilityRequest request);

    void deleteCapability(UUID id);

    void resetDailyUsedCapacity(); // Scheduled daily reset
}
