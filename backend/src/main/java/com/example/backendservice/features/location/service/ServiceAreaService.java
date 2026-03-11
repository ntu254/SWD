package com.example.backendservice.features.location.service;

import com.example.backendservice.features.location.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ServiceAreaService {

    ServiceAreaResponse createServiceArea(CreateServiceAreaRequest request);

    ServiceAreaResponse getServiceAreaById(UUID areaId);

    List<ServiceAreaResponse> getAllActiveServiceAreas();

    Page<ServiceAreaResponse> getAllServiceAreas(Pageable pageable);

    Page<ServiceAreaResponse> getServiceAreasByCity(String city, Pageable pageable);

    Page<ServiceAreaResponse> getServiceAreasByDistrict(String districtCode, Pageable pageable);

    ServiceAreaResponse updateServiceArea(UUID areaId, CreateServiceAreaRequest request);

    void deactivateServiceArea(UUID areaId);

    void activateServiceArea(UUID areaId);
}
