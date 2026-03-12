package com.wastecollection.repository;

import com.wastecollection.entity.CitizenRewardRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitizenRewardRuleRepository extends JpaRepository<CitizenRewardRule, UUID> {
    List<CitizenRewardRule> findByIsActiveTrue();

    Optional<CitizenRewardRule> findByWasteType_WasteTypeIdAndSortingLevelAndIsActiveTrue(
            UUID wasteTypeId, String sortingLevel);
}
