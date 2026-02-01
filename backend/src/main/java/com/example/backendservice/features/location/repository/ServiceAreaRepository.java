package com.example.backendservice.features.location.repository;

import com.example.backendservice.features.location.entity.ServiceArea;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceAreaRepository extends JpaRepository<ServiceArea, UUID> {

    List<ServiceArea> findByStatus(String status);

    Page<ServiceArea> findByStatus(String status, Pageable pageable);

    List<ServiceArea> findByNameContainingIgnoreCase(String name);
}
