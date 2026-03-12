package com.wastecollection.repository;

import com.wastecollection.entity.ComplaintResolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintResolutionRepository extends JpaRepository<ComplaintResolution, UUID> {
    List<ComplaintResolution> findByComplaint_ComplaintId(UUID complaintId);
}
