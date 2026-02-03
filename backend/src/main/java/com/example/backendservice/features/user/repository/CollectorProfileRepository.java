package com.example.backendservice.features.user.repository;

import com.example.backendservice.features.user.entity.CollectorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectorProfileRepository extends JpaRepository<CollectorProfile, UUID> {

    /**
     * Tìm CollectorProfile theo User ID (sử dụng nested property syntax)
     */
    Optional<CollectorProfile> findByUser_Id(UUID userId);

    /**
     * Kiểm tra CollectorProfile tồn tại theo User ID
     */
    boolean existsByUser_Id(UUID userId);

    /**
     * Tìm CollectorProfile theo User email
     */
    Optional<CollectorProfile> findByUser_Email(String email);

    /**
     * Tìm các Collector thuộc Enterprise
     */
    List<CollectorProfile> findByEnterpriseId(UUID enterpriseId);

    /**
     * Tìm các Collector theo trạng thái
     */
    List<CollectorProfile> findByAvailabilityStatus(String status);

    /**
     * Tìm các Collector thuộc Enterprise với trạng thái cụ thể
     */
    List<CollectorProfile> findByEnterpriseIdAndAvailabilityStatus(UUID enterpriseId, String status);
}
