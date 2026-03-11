package com.example.backendservice.features.reward.repository;

import com.example.backendservice.features.reward.entity.CitizenRewardRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitizenRewardRuleRepository extends JpaRepository<CitizenRewardRule, UUID> {

        Optional<CitizenRewardRule> findByRuleId(UUID ruleId);

        @Query("SELECT crr FROM CitizenRewardRule crr WHERE crr.wasteType.wasteTypeId = :wasteTypeId AND crr.isActive = true")
        List<CitizenRewardRule> findActiveByWasteTypeId(@Param("wasteTypeId") UUID wasteTypeId);

        @Query("SELECT crr FROM CitizenRewardRule crr WHERE crr.wasteType.wasteTypeId = :wasteTypeId AND crr.sortingLevel = :sortingLevel AND crr.isActive = true")
        Optional<CitizenRewardRule> findActiveByWasteTypeIdAndSortingLevel(
                        @Param("wasteTypeId") UUID wasteTypeId,
                        @Param("sortingLevel") String sortingLevel);

        @Query("SELECT crr FROM CitizenRewardRule crr WHERE crr.isActive = true")
        List<CitizenRewardRule> findAllActive();

        @Query("SELECT crr FROM CitizenRewardRule crr WHERE crr.isActive = true " +
                        "AND (crr.effectiveFrom IS NULL OR crr.effectiveFrom <= :date) " +
                        "AND (crr.effectiveTo IS NULL OR crr.effectiveTo >= :date)")
        List<CitizenRewardRule> findEffectiveRules(@Param("date") LocalDate date);

        @Query("SELECT crr FROM CitizenRewardRule crr WHERE crr.wasteType.wasteTypeId = :wasteTypeId " +
                        "AND crr.sortingLevel = :sortingLevel AND crr.isActive = true " +
                        "AND (crr.effectiveFrom IS NULL OR crr.effectiveFrom <= :date) " +
                        "AND (crr.effectiveTo IS NULL OR crr.effectiveTo >= :date)")
        Optional<CitizenRewardRule> findEffectiveRule(
                        @Param("wasteTypeId") UUID wasteTypeId,
                        @Param("sortingLevel") String sortingLevel,
                        @Param("date") LocalDate date);
}
