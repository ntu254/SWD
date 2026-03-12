package com.wastecollection.repository;

import com.wastecollection.entity.ServiceArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceAreaRepository extends JpaRepository<ServiceArea, UUID> {
    List<ServiceArea> findByIsActiveTrue();
}
