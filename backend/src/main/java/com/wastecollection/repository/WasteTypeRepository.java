package com.wastecollection.repository;

import com.wastecollection.entity.WasteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WasteTypeRepository extends JpaRepository<WasteType, UUID> {
    List<WasteType> findByIsActiveTrue();
    boolean existsByName(String name);
}
