package com.example.backendservice.features.reward.repository;

import com.example.backendservice.features.reward.entity.CitizenRewardRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitizenRewardRuleRepository extends JpaRepository<CitizenRewardRule, UUID> {

    Optional<CitizenRewardRule> findByWasteTypeId(UUID wasteTypeId);

    List<CitizenRewardRule> findByStatus(String status);

    @Query("SELECT r FROM CitizenRewardRule r WHERE r.wasteType.id = :wasteTypeId " +
            "AND r.status = 'ACTIVE' " +
            "AND (r.validFrom IS NULL OR r.validFrom <= :now) " +
            "AND (r.validUntil IS NULL OR r.validUntil >= :now)")
    Optional<CitizenRewardRule> findActiveRuleByWasteType(
            @Param("wasteTypeId") UUID wasteTypeId,
            @Param("now") LocalDateTime now);

    @Query("SELECT r FROM CitizenRewardRule r WHERE r.status = 'ACTIVE' " +
            "AND (r.validFrom IS NULL OR r.validFrom <= :now) " +
            "AND (r.validUntil IS NULL OR r.validUntil >= :now)")
    List<CitizenRewardRule> findAllActiveRules(@Param("now") LocalDateTime now);
}
