package com.example.backendservice.features.enterprise.repository;

import com.example.backendservice.features.enterprise.entity.Enterprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnterpriseRepository extends JpaRepository<Enterprise, UUID> {

    Optional<Enterprise> findByOwnerId(UUID ownerId);

    List<Enterprise> findByStatus(String status);

    List<Enterprise> findByPrimaryAreaId(UUID areaId);

    boolean existsByTaxCode(String taxCode);
}
