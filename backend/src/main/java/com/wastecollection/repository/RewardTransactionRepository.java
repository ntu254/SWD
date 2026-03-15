package com.wastecollection.repository;

import com.wastecollection.entity.RewardTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, UUID> {
    Page<RewardTransaction> findByCitizen_UserIdOrderByCreatedAtDesc(UUID citizenId, Pageable pageable);

    boolean existsByVisit_VisitIdAndReasonCode(UUID visitId, String reasonCode);

    @Query("SELECT COALESCE(SUM(rt.pointsDelta), 0) FROM RewardTransaction rt WHERE rt.citizen.userId = :citizenId")
    double sumPointsByCitizen(UUID citizenId);
}
