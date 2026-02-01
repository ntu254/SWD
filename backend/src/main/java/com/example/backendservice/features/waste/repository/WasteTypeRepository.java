package com.example.backendservice.features.waste.repository;

import com.example.backendservice.features.waste.entity.WasteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WasteTypeRepository extends JpaRepository<WasteType, UUID> {

    Optional<WasteType> findByName(String name);

    List<WasteType> findByStatus(String status);

    boolean existsByName(String name);
}
