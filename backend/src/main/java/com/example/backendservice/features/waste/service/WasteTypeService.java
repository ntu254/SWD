package com.example.backendservice.features.waste.service;

import com.example.backendservice.features.waste.dto.CreateWasteTypeRequest;
import com.example.backendservice.features.waste.dto.WasteTypeResponse;

import java.util.List;
import java.util.UUID;

public interface WasteTypeService {

    WasteTypeResponse createWasteType(CreateWasteTypeRequest request);

    WasteTypeResponse getWasteTypeById(UUID id);

    List<WasteTypeResponse> getAllWasteTypes(String status);

    WasteTypeResponse updateWasteType(UUID id, CreateWasteTypeRequest request);

    void deleteWasteType(UUID id);
}
