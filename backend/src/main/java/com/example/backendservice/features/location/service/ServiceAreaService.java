package com.example.backendservice.features.location.service;

import com.example.backendservice.features.location.dto.CreateServiceAreaRequest;
import com.example.backendservice.features.location.dto.ServiceAreaResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ServiceAreaService {

    ServiceAreaResponse createServiceArea(CreateServiceAreaRequest request);

    ServiceAreaResponse getServiceAreaById(UUID id);

    Page<ServiceAreaResponse> getAllServiceAreas(String status, Pageable pageable);

    ServiceAreaResponse updateServiceArea(UUID id, CreateServiceAreaRequest request);

    void deleteServiceArea(UUID id);

    void activateServiceArea(UUID id);

    void deactivateServiceArea(UUID id);
}
