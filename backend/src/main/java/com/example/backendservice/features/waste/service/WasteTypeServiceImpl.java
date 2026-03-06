package com.example.backendservice.features.waste.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.waste.dto.*;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WasteTypeServiceImpl implements WasteTypeService {

    private final WasteTypeRepository wasteTypeRepository;

    @Override
    @Transactional
    public WasteTypeResponse createWasteType(CreateWasteTypeRequest request) {
        // Check name uniqueness (using name instead of code as per entity)
        if (wasteTypeRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Waste type name already exists: " + request.getName());
        }

        WasteType wasteType = WasteType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(true)
                .isRecyclable(true)
                .build();

        wasteType = wasteTypeRepository.save(wasteType);
        log.info("Created waste type: {}", wasteType.getName());

        return toResponse(wasteType);
    }

    @Override
    public WasteTypeResponse getWasteTypeById(UUID typeId) {
        WasteType wasteType = wasteTypeRepository.findByWasteTypeId(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste type not found: " + typeId));
        return toResponse(wasteType);
    }

    @Override
    public WasteTypeResponse getWasteTypeByCode(String code) {
        // Using name instead of code since entity doesn't have code field
        WasteType wasteType = wasteTypeRepository.findByName(code)
                .orElseThrow(() -> new ResourceNotFoundException("Waste type not found with name: " + code));
        return toResponse(wasteType);
    }

    @Override
    public List<WasteTypeResponse> getAllActiveWasteTypes() {
        return wasteTypeRepository.findAllActive().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<WasteTypeResponse> getAllWasteTypes(Pageable pageable) {
        return wasteTypeRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public WasteTypeResponse updateWasteType(UUID typeId, CreateWasteTypeRequest request) {
        WasteType wasteType = wasteTypeRepository.findByWasteTypeId(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste type not found: " + typeId));

        // Check name uniqueness if changed
        if (!wasteType.getName().equals(request.getName()) &&
                wasteTypeRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Waste type name already exists: " + request.getName());
        }

        wasteType.setName(request.getName());
        wasteType.setDescription(request.getDescription());

        wasteType = wasteTypeRepository.save(wasteType);
        log.info("Updated waste type: {}", wasteType.getName());

        return toResponse(wasteType);
    }

    @Override
    @Transactional
    public void deactivateWasteType(UUID typeId) {
        WasteType wasteType = wasteTypeRepository.findByWasteTypeId(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste type not found: " + typeId));

        wasteType.setIsActive(false);
        wasteTypeRepository.save(wasteType);
        log.info("Deactivated waste type: {}", wasteType.getName());
    }

    @Override
    @Transactional
    public void activateWasteType(UUID typeId) {
        WasteType wasteType = wasteTypeRepository.findByWasteTypeId(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste type not found: " + typeId));

        wasteType.setIsActive(true);
        wasteTypeRepository.save(wasteType);
        log.info("Activated waste type: {}", wasteType.getName());
    }

    private WasteTypeResponse toResponse(WasteType wasteType) {
        return WasteTypeResponse.builder()
                .typeId(wasteType.getWasteTypeId())
                .code(wasteType.getName()) // Using name as code since entity doesn't have code
                .name(wasteType.getName())
                .description(wasteType.getDescription())
                .isActive(wasteType.getIsActive())
                .build();
    }
}
