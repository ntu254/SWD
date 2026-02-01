package com.example.backendservice.features.user.repository;

import com.example.backendservice.features.user.entity.CollectorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CollectorProfileRepository extends JpaRepository<CollectorProfile, UUID> {

    List<CollectorProfile> findByEnterpriseId(UUID enterpriseId);

    List<CollectorProfile> findByAvailabilityStatus(String status);

    List<CollectorProfile> findByEnterpriseIdAndAvailabilityStatus(UUID enterpriseId, String status);
}
