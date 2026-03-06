package com.example.backendservice.features.waste.service;

import com.example.backendservice.features.waste.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface WasteTypeService {

    WasteTypeResponse createWasteType(CreateWasteTypeRequest request);

    WasteTypeResponse getWasteTypeById(UUID typeId);

    WasteTypeResponse getWasteTypeByCode(String code);

    List<WasteTypeResponse> getAllActiveWasteTypes();

    Page<WasteTypeResponse> getAllWasteTypes(Pageable pageable);

    WasteTypeResponse updateWasteType(UUID typeId, CreateWasteTypeRequest request);

    void deactivateWasteType(UUID typeId);

    void activateWasteType(UUID typeId);
}
