package com.example.backendservice.features.enterprise.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.enterprise.dto.CreateEnterpriseRequest;
import com.example.backendservice.features.enterprise.dto.EnterpriseResponse;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
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

/**
 * Implementation of EnterpriseService
 * Manages enterprise users (Users with role ENTERPRISE)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnterpriseServiceImpl implements EnterpriseService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public EnterpriseResponse createEnterprise(CreateEnterpriseRequest request, UUID ownerId) {
        log.info("Creating enterprise for owner: {}", ownerId);

        // Get or validate owner exists
        User owner = userRepository.findByUserId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found: " + ownerId));

        // Update owner's display name and role if needed
        owner.setDisplayName(request.getName());
        if (owner.getRole() != RoleType.ENTERPRISE) {
            owner.setRole(RoleType.ENTERPRISE);
        }
        owner.setPhone(request.getPhone());

        owner = userRepository.save(owner);
        log.info("Enterprise created/updated for user: {}", owner.getUserId());

        return toResponse(owner);
    }

    @Override
    public EnterpriseResponse getEnterpriseById(UUID id) {
        User enterprise = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found: " + id));

        if (enterprise.getRole() != RoleType.ENTERPRISE) {
            throw new IllegalArgumentException("User is not an enterprise: " + id);
        }

        return toResponse(enterprise);
    }

    @Override
    public Page<EnterpriseResponse> getAllEnterprises(String status, Pageable pageable) {
        log.debug("Getting all enterprises with status: {}", status);

        List<User> enterprises = userRepository.findAllActiveEnterprises();

        List<EnterpriseResponse> responses = enterprises.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());

        if (start > responses.size()) {
            return new PageImpl<>(List.of(), pageable, responses.size());
        }

        return new PageImpl<>(
                responses.subList(start, end),
                pageable,
                responses.size());
    }

    @Override
    @Transactional
    public EnterpriseResponse updateEnterprise(UUID id, CreateEnterpriseRequest request) {
        log.info("Updating enterprise: {}", id);

        User enterprise = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found: " + id));

        if (request.getName() != null) {
            enterprise.setDisplayName(request.getName());
        }
        if (request.getPhone() != null) {
            enterprise.setPhone(request.getPhone());
        }

        enterprise = userRepository.save(enterprise);
        log.info("Enterprise updated: {}", enterprise.getUserId());

        return toResponse(enterprise);
    }

    @Override
    @Transactional
    public void deleteEnterprise(UUID id) {
        log.info("Deleting enterprise: {}", id);

        User enterprise = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found: " + id));

        // Soft delete
        enterprise.setAccountStatus(com.example.backendservice.features.user.entity.AccountStatus.PENDING_DELETE);
        userRepository.save(enterprise);
        log.info("Enterprise deleted: {}", id);
    }

    @Override
    @Transactional
    public void activateEnterprise(UUID id) {
        log.info("Activating enterprise: {}", id);

        User enterprise = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found: " + id));

        enterprise.setAccountStatus(com.example.backendservice.features.user.entity.AccountStatus.ACTIVE);
        userRepository.save(enterprise);
        log.info("Enterprise activated: {}", id);
    }

    @Override
    @Transactional
    public void suspendEnterprise(UUID id) {
        log.info("Suspending enterprise: {}", id);

        User enterprise = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found: " + id));

        enterprise.setAccountStatus(com.example.backendservice.features.user.entity.AccountStatus.DISABLED);
        userRepository.save(enterprise);
        log.info("Enterprise suspended: {}", id);
    }

    @Override
    public EnterpriseResponse getMyEnterprise(UUID ownerId) {
        User enterprise = userRepository.findByUserId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found: " + ownerId));

        return toResponse(enterprise);
    }

    private EnterpriseResponse toResponse(User enterprise) {
        return EnterpriseResponse.builder()
                .id(enterprise.getUserId())
                .name(enterprise.getDisplayName())
                .description(null) // Not stored in User entity
                .logoUrl(enterprise.getAvatarUrl())
                .address(null) // Not stored in User entity
                .phone(enterprise.getPhone())
                .email(enterprise.getEmail())
                .taxCode(null) // Not stored in User entity
                .ownerId(enterprise.getUserId())
                .ownerName(enterprise.getFirstName() + " " + enterprise.getLastName())
                .primaryAreaId(null) // Not stored in User entity
                .primaryAreaName(null)
                .status(enterprise.getAccountStatus().name())
                .createdAt(enterprise.getCreatedAt())
                .build();
    }
}
