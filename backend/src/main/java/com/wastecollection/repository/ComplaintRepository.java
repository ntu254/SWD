package com.wastecollection.repository;

import com.wastecollection.entity.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    Page<Complaint> findByCreatedBy_UserId(UUID userId, Pageable pageable);
    Page<Complaint> findByStatus(String status, Pageable pageable);
    Page<Complaint> findByCategoryIn(java.util.List<String> categories, Pageable pageable);
    long countByStatus(String status);
}
