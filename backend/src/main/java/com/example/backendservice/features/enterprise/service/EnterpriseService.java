package com.example.backendservice.features.enterprise.service;

import com.example.backendservice.features.enterprise.dto.CreateEnterpriseRequest;
import com.example.backendservice.features.enterprise.dto.EnterpriseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface EnterpriseService {

    EnterpriseResponse createEnterprise(CreateEnterpriseRequest request, UUID ownerId);

    EnterpriseResponse getEnterpriseById(UUID id);

    Page<EnterpriseResponse> getAllEnterprises(String status, Pageable pageable);

    EnterpriseResponse updateEnterprise(UUID id, CreateEnterpriseRequest request);

    void deleteEnterprise(UUID id);

    void activateEnterprise(UUID id);

    void suspendEnterprise(UUID id);

    EnterpriseResponse getMyEnterprise(UUID ownerId);
}
