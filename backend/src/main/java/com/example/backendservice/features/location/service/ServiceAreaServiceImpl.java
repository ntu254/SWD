package com.example.backendservice.features.location.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.location.dto.*;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceAreaServiceImpl implements ServiceAreaService {

    private final ServiceAreaRepository serviceAreaRepository;

    @Override
    @Transactional
    public ServiceAreaResponse createServiceArea(CreateServiceAreaRequest request) {
        ServiceArea serviceArea = ServiceArea.builder()
                .name(request.getName())
                .geoBoundaryWkt(request.getGeoPolygon())
                .isActive(true)
                .build();

        serviceArea = serviceAreaRepository.save(serviceArea);
        log.info("Created service area: {}", serviceArea.getName());

        return toResponse(serviceArea);
    }

    @Override
    public ServiceAreaResponse getServiceAreaById(UUID areaId) {
        ServiceArea serviceArea = serviceAreaRepository.findByAreaId(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("Service area not found: " + areaId));
        return toResponse(serviceArea);
    }

    @Override
    public List<ServiceAreaResponse> getAllActiveServiceAreas() {
        return serviceAreaRepository.findAllActive().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ServiceAreaResponse> getAllServiceAreas(Pageable pageable) {
        return serviceAreaRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<ServiceAreaResponse> getServiceAreasByCity(String city, Pageable pageable) {
        // ServiceArea doesn't have city field, search by name containing city
        List<ServiceArea> areas = serviceAreaRepository.findByNameContainingIgnoreCase(city);
        List<ServiceAreaResponse> responses = areas.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    public Page<ServiceAreaResponse> getServiceAreasByDistrict(String districtCode, Pageable pageable) {
        // ServiceArea doesn't have districtCode field, search by name containing
        // district
        List<ServiceArea> areas = serviceAreaRepository.findByNameContainingIgnoreCase(districtCode);
        List<ServiceAreaResponse> responses = areas.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    @Transactional
    public ServiceAreaResponse updateServiceArea(UUID areaId, CreateServiceAreaRequest request) {
        ServiceArea serviceArea = serviceAreaRepository.findByAreaId(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("Service area not found: " + areaId));

        serviceArea.setName(request.getName());
        serviceArea.setGeoBoundaryWkt(request.getGeoPolygon());

        serviceArea = serviceAreaRepository.save(serviceArea);
        log.info("Updated service area: {}", serviceArea.getName());

        return toResponse(serviceArea);
    }

    @Override
    @Transactional
    public void deactivateServiceArea(UUID areaId) {
        ServiceArea serviceArea = serviceAreaRepository.findByAreaId(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("Service area not found: " + areaId));

        serviceArea.setIsActive(false);
        serviceAreaRepository.save(serviceArea);
        log.info("Deactivated service area: {}", serviceArea.getName());
    }

    @Override
    @Transactional
    public void activateServiceArea(UUID areaId) {
        ServiceArea serviceArea = serviceAreaRepository.findByAreaId(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("Service area not found: " + areaId));

        serviceArea.setIsActive(true);
        serviceAreaRepository.save(serviceArea);
        log.info("Activated service area: {}", serviceArea.getName());
    }

    private ServiceAreaResponse toResponse(ServiceArea serviceArea) {
        return ServiceAreaResponse.builder()
                .areaId(serviceArea.getAreaId())
                .name(serviceArea.getName())
                .wardCode(null)
                .districtCode(null)
                .city(null)
                .geoPolygon(serviceArea.getGeoBoundaryWkt())
                .isActive(serviceArea.getIsActive())
                .createdAt(serviceArea.getCreatedAt())
                .build();
    }
}
