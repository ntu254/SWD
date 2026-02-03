package com.example.backendservice.features.location.repository;

import com.example.backendservice.features.location.entity.ServiceArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceAreaRepository extends JpaRepository<ServiceArea, UUID> {

    Optional<ServiceArea> findByAreaId(UUID areaId);

    Optional<ServiceArea> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT sa FROM ServiceArea sa WHERE sa.isActive = true")
    List<ServiceArea> findAllActive();

    @Query("SELECT sa FROM ServiceArea sa WHERE sa.isActive = :isActive")
    List<ServiceArea> findByIsActive(@Param("isActive") Boolean isActive);

    List<ServiceArea> findByNameContainingIgnoreCase(String name);
}
