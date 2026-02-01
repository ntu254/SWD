package com.example.backendservice.features.enterprise.service;

import com.example.backendservice.features.enterprise.dto.CreateEnterpriseRequest;
import com.example.backendservice.features.enterprise.dto.EnterpriseResponse;
import com.example.backendservice.features.enterprise.entity.Enterprise;
import com.example.backendservice.features.enterprise.repository.EnterpriseRepository;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
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
public class EnterpriseServiceImpl implements EnterpriseService {

    private final EnterpriseRepository enterpriseRepository;
    private final UserRepository userRepository;
    private final ServiceAreaRepository serviceAreaRepository;

    @Override
    @Transactional
    public EnterpriseResponse createEnterprise(CreateEnterpriseRequest request, UUID ownerId) {
        log.info("Creating enterprise: {} for owner: {}", request.getName(), ownerId);

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + ownerId));

        ServiceArea primaryArea = null;
        if (request.getPrimaryAreaId() != null) {
            primaryArea = serviceAreaRepository.findById(request.getPrimaryAreaId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "ServiceArea not found with id: " + request.getPrimaryAreaId()));
        }

        Enterprise enterprise = Enterprise.builder()
                .name(request.getName())
                .description(request.getDescription())
                .logoUrl(request.getLogoUrl())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .taxCode(request.getTaxCode())
                .owner(owner)
                .primaryArea(primaryArea)
                .status("ACTIVE")
                .build();

        enterprise = enterpriseRepository.save(enterprise);
        log.info("Created enterprise with id: {}", enterprise.getId());

        return mapToResponse(enterprise);
    }

    @Override
    @Transactional(readOnly = true)
    public EnterpriseResponse getEnterpriseById(UUID id) {
        Enterprise enterprise = findById(id);
        return mapToResponse(enterprise);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EnterpriseResponse> getAllEnterprises(String status, Pageable pageable) {
        Page<Enterprise> enterprises;
        if (status != null && !status.isEmpty()) {
            enterprises = enterpriseRepository.findAll(pageable); // TODO: Add status filter
        } else {
            enterprises = enterpriseRepository.findAll(pageable);
        }
        return enterprises.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public EnterpriseResponse updateEnterprise(UUID id, CreateEnterpriseRequest request) {
        log.info("Updating enterprise: {}", id);

        Enterprise enterprise = findById(id);
        enterprise.setName(request.getName());
        enterprise.setDescription(request.getDescription());
        enterprise.setLogoUrl(request.getLogoUrl());
        enterprise.setAddress(request.getAddress());
        enterprise.setPhone(request.getPhone());
        enterprise.setEmail(request.getEmail());
        enterprise.setTaxCode(request.getTaxCode());

        if (request.getPrimaryAreaId() != null) {
            ServiceArea area = serviceAreaRepository.findById(request.getPrimaryAreaId())
                    .orElseThrow(() -> new EntityNotFoundException("ServiceArea not found"));
            enterprise.setPrimaryArea(area);
        }

        enterprise = enterpriseRepository.save(enterprise);
        return mapToResponse(enterprise);
    }

    @Override
    @Transactional
    public void deleteEnterprise(UUID id) {
        log.info("Soft deleting enterprise: {}", id);
        Enterprise enterprise = findById(id);
        enterprise.setStatus("INACTIVE");
        enterprise.setDeletedAt(java.time.LocalDateTime.now());
        enterpriseRepository.save(enterprise);
    }

    @Override
    @Transactional
    public void activateEnterprise(UUID id) {
        Enterprise enterprise = findById(id);
        enterprise.setStatus("ACTIVE");
        enterpriseRepository.save(enterprise);
    }

    @Override
    @Transactional
    public void suspendEnterprise(UUID id) {
        Enterprise enterprise = findById(id);
        enterprise.setStatus("SUSPENDED");
        enterpriseRepository.save(enterprise);
    }

    @Override
    @Transactional(readOnly = true)
    public EnterpriseResponse getMyEnterprise(UUID ownerId) {
        Enterprise enterprise = enterpriseRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Enterprise not found for owner: " + ownerId));
        return mapToResponse(enterprise);
    }

    private Enterprise findById(UUID id) {
        return enterpriseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Enterprise not found with id: " + id));
    }

    private EnterpriseResponse mapToResponse(Enterprise enterprise) {
        return EnterpriseResponse.builder()
                .id(enterprise.getId())
                .name(enterprise.getName())
                .description(enterprise.getDescription())
                .logoUrl(enterprise.getLogoUrl())
                .address(enterprise.getAddress())
                .phone(enterprise.getPhone())
                .email(enterprise.getEmail())
                .taxCode(enterprise.getTaxCode())
                .ownerId(enterprise.getOwner() != null ? enterprise.getOwner().getId() : null)
                .ownerName(enterprise.getOwner() != null ? enterprise.getOwner().getFullName() : null)
                .primaryAreaId(enterprise.getPrimaryArea() != null ? enterprise.getPrimaryArea().getId() : null)
                .primaryAreaName(enterprise.getPrimaryArea() != null ? enterprise.getPrimaryArea().getName() : null)
                .status(enterprise.getStatus())
                .createdAt(enterprise.getCreatedAt())
                .build();
    }
}
