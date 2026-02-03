package com.example.backendservice.features.user.repository;

import com.example.backendservice.features.user.entity.CollectorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectorProfileRepository extends JpaRepository<CollectorProfile, UUID> {

    Optional<CollectorProfile> findByUserId(UUID userId);

    @Query("SELECT cp FROM CollectorProfile cp WHERE cp.user.email = :email")
    Optional<CollectorProfile> findByUserEmail(@Param("email") String email);

    @Query("SELECT cp FROM CollectorProfile cp JOIN FETCH cp.user WHERE cp.userId = :userId")
    Optional<CollectorProfile> findByUserIdWithUser(@Param("userId") UUID userId);

    @Query("SELECT cp FROM CollectorProfile cp WHERE cp.enterpriseUser.userId = :enterpriseUserId")
    List<CollectorProfile> findByEnterpriseUserId(@Param("enterpriseUserId") UUID enterpriseUserId);

    @Query("SELECT cp FROM CollectorProfile cp WHERE cp.defaultArea.areaId = :areaId")
    List<CollectorProfile> findByDefaultAreaId(@Param("areaId") UUID areaId);

    @Query("SELECT cp FROM CollectorProfile cp WHERE cp.status = :status")
    List<CollectorProfile> findByStatus(@Param("status") String status);

    @Query("SELECT cp FROM CollectorProfile cp WHERE cp.enterpriseUser.userId = :enterpriseUserId AND cp.status = 'ACTIVE'")
    List<CollectorProfile> findActiveByEnterpriseUserId(@Param("enterpriseUserId") UUID enterpriseUserId);

    boolean existsByUserId(UUID userId);
}
