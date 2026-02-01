package com.example.backendservice.features.waste.service;

import com.example.backendservice.features.waste.dto.CreateWasteTypeRequest;
import com.example.backendservice.features.waste.dto.WasteTypeResponse;
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
public class WasteTypeServiceImpl implements WasteTypeService {

    private final WasteTypeRepository wasteTypeRepository;

    @Override
    @Transactional
    public WasteTypeResponse createWasteType(CreateWasteTypeRequest request) {
        log.info("Creating waste type: {}", request.getName());

        if (wasteTypeRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Waste type with name '" + request.getName() + "' already exists");
        }

        WasteType wasteType = WasteType.builder()
                .name(request.getName())
                .nameVi(request.getNameVi())
                .description(request.getDescription())
                .iconUrl(request.getIconUrl())
                .colorCode(request.getColorCode())
                .basePointsPerKg(request.getBasePointsPerKg() != null ? request.getBasePointsPerKg() : 10.0)
                .status("ACTIVE")
                .build();

        wasteType = wasteTypeRepository.save(wasteType);
        return mapToResponse(wasteType);
    }

    @Override
    @Transactional(readOnly = true)
    public WasteTypeResponse getWasteTypeById(UUID id) {
        WasteType wasteType = findById(id);
        return mapToResponse(wasteType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WasteTypeResponse> getAllWasteTypes(String status) {
        List<WasteType> types;
        if (status != null && !status.isEmpty()) {
            types = wasteTypeRepository.findByStatus(status);
        } else {
            types = wasteTypeRepository.findAll();
        }
        return types.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WasteTypeResponse updateWasteType(UUID id, CreateWasteTypeRequest request) {
        log.info("Updating waste type: {}", id);

        WasteType wasteType = findById(id);
        wasteType.setName(request.getName());
        wasteType.setNameVi(request.getNameVi());
        wasteType.setDescription(request.getDescription());
        wasteType.setIconUrl(request.getIconUrl());
        wasteType.setColorCode(request.getColorCode());
        if (request.getBasePointsPerKg() != null) {
            wasteType.setBasePointsPerKg(request.getBasePointsPerKg());
        }

        wasteType = wasteTypeRepository.save(wasteType);
        return mapToResponse(wasteType);
    }

    @Override
    @Transactional
    public void deleteWasteType(UUID id) {
        log.info("Deleting waste type: {}", id);
        WasteType wasteType = findById(id);
        wasteTypeRepository.delete(wasteType);
    }

    private WasteType findById(UUID id) {
        return wasteTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("WasteType not found with id: " + id));
    }

    private WasteTypeResponse mapToResponse(WasteType wasteType) {
        return WasteTypeResponse.builder()
                .id(wasteType.getId())
                .name(wasteType.getName())
                .nameVi(wasteType.getNameVi())
                .description(wasteType.getDescription())
                .iconUrl(wasteType.getIconUrl())
                .colorCode(wasteType.getColorCode())
                .basePointsPerKg(wasteType.getBasePointsPerKg())
                .status(wasteType.getStatus())
                .createdAt(wasteType.getCreatedAt())
                .build();
    }
}
