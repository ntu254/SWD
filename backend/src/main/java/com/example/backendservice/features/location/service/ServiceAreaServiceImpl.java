package com.example.backendservice.features.location.service;

import com.example.backendservice.features.location.dto.CreateServiceAreaRequest;
import com.example.backendservice.features.location.dto.ServiceAreaResponse;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceAreaServiceImpl implements ServiceAreaService {

    private final ServiceAreaRepository serviceAreaRepository;

    @Override
    @Transactional
    public ServiceAreaResponse createServiceArea(CreateServiceAreaRequest request) {
        log.info("Creating service area: {}", request.getName());

        ServiceArea area = ServiceArea.builder()
                .name(request.getName())
                .description(request.getDescription())
                .centerLat(request.getCenterLat())
                .centerLng(request.getCenterLng())
                .radiusKm(request.getRadiusKm())
                .boundaryGeoJson(request.getBoundaryGeoJson())
                .status("ACTIVE")
                .build();

        area = serviceAreaRepository.save(area);
        log.info("Created service area with id: {}", area.getId());

        return mapToResponse(area);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceAreaResponse getServiceAreaById(UUID id) {
        ServiceArea area = findById(id);
        return mapToResponse(area);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServiceAreaResponse> getAllServiceAreas(String status, Pageable pageable) {
        Page<ServiceArea> areas;
        if (status != null && !status.isEmpty()) {
            areas = serviceAreaRepository.findAll(pageable); // TODO: Add findByStatus with Pageable
        } else {
            areas = serviceAreaRepository.findAll(pageable);
        }
        return areas.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ServiceAreaResponse updateServiceArea(UUID id, CreateServiceAreaRequest request) {
        log.info("Updating service area: {}", id);

        ServiceArea area = findById(id);
        area.setName(request.getName());
        area.setDescription(request.getDescription());
        area.setCenterLat(request.getCenterLat());
        area.setCenterLng(request.getCenterLng());
        area.setRadiusKm(request.getRadiusKm());
        if (request.getBoundaryGeoJson() != null) {
            area.setBoundaryGeoJson(request.getBoundaryGeoJson());
        }

        area = serviceAreaRepository.save(area);
        return mapToResponse(area);
    }

    @Override
    @Transactional
    public void deleteServiceArea(UUID id) {
        log.info("Deleting service area: {}", id);
        ServiceArea area = findById(id);
        serviceAreaRepository.delete(area);
    }

    @Override
    @Transactional
    public void activateServiceArea(UUID id) {
        ServiceArea area = findById(id);
        area.setStatus("ACTIVE");
        serviceAreaRepository.save(area);
    }

    @Override
    @Transactional
    public void deactivateServiceArea(UUID id) {
        ServiceArea area = findById(id);
        area.setStatus("INACTIVE");
        serviceAreaRepository.save(area);
    }

    private ServiceArea findById(UUID id) {
        return serviceAreaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ServiceArea not found with id: " + id));
    }

    private ServiceAreaResponse mapToResponse(ServiceArea area) {
        return ServiceAreaResponse.builder()
                .id(area.getId())
                .name(area.getName())
                .description(area.getDescription())
                .centerLat(area.getCenterLat())
                .centerLng(area.getCenterLng())
                .radiusKm(area.getRadiusKm())
                .status(area.getStatus())
                .createdAt(area.getCreatedAt())
                .updatedAt(area.getUpdatedAt())
                .build();
    }
}
