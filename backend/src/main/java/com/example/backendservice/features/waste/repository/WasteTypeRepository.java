package com.example.backendservice.features.waste.repository;

import com.example.backendservice.features.waste.entity.WasteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WasteTypeRepository extends JpaRepository<WasteType, UUID> {

    Optional<WasteType> findByWasteTypeId(UUID wasteTypeId);

    Optional<WasteType> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT wt FROM WasteType wt WHERE wt.isActive = true")
    List<WasteType> findAllActive();

    @Query("SELECT wt FROM WasteType wt WHERE wt.isRecyclable = true AND wt.isActive = true")
    List<WasteType> findAllRecyclableActive();

    @Query("SELECT wt FROM WasteType wt WHERE wt.isRecyclable = :isRecyclable AND wt.isActive = true")
    List<WasteType> findActiveByRecyclable(@Param("isRecyclable") Boolean isRecyclable);

    List<WasteType> findByNameContainingIgnoreCase(String name);
}
