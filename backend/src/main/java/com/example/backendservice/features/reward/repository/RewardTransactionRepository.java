package com.example.backendservice.features.reward.repository;

import com.example.backendservice.features.reward.entity.RewardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

@Repository
public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, UUID> {

    Optional<RewardTransaction> findByTransactionId(UUID transactionId);

    @Query("SELECT rt FROM RewardTransaction rt WHERE rt.citizenUser.userId = :citizenUserId ORDER BY rt.createdAt DESC")
    List<RewardTransaction> findByCitizenUserId(@Param("citizenUserId") UUID citizenUserId);

    @Query("SELECT rt FROM RewardTransaction rt WHERE rt.visit.visitId = :visitId")
    List<RewardTransaction> findByVisitId(@Param("visitId") UUID visitId);

    @Query("SELECT rt FROM RewardTransaction rt WHERE rt.complaint.complaintId = :complaintId")
    Optional<RewardTransaction> findByComplaintId(@Param("complaintId") UUID complaintId);

    @Query("SELECT rt FROM RewardTransaction rt WHERE rt.reasonCode = :reasonCode ORDER BY rt.createdAt DESC")
    List<RewardTransaction> findByReasonCode(@Param("reasonCode") String reasonCode);

    @Query("SELECT rt FROM RewardTransaction rt WHERE rt.citizenUser.userId = :citizenUserId AND rt.createdAt >= :since ORDER BY rt.createdAt DESC")
    List<RewardTransaction> findByCitizenUserIdSince(
            @Param("citizenUserId") UUID citizenUserId,
            @Param("since") LocalDateTime since);

    @Query("SELECT SUM(rt.pointsDelta) FROM RewardTransaction rt WHERE rt.citizenUser.userId = :citizenUserId")
    Double sumPointsByCitizenUserId(@Param("citizenUserId") UUID citizenUserId);

    @Query("SELECT SUM(rt.pointsDelta) FROM RewardTransaction rt WHERE rt.citizenUser.userId = :citizenUserId AND rt.createdAt >= :since")
    Double sumPointsByCitizenUserIdSince(
            @Param("citizenUserId") UUID citizenUserId,
            @Param("since") LocalDateTime since);

    @Query("SELECT rt FROM RewardTransaction rt WHERE rt.createdByAdmin.userId = :adminUserId ORDER BY rt.createdAt DESC")
    List<RewardTransaction> findByCreatedByAdminId(@Param("adminUserId") UUID adminUserId);

    @Query("""
            SELECT u.userId AS userId,
                   u.firstName AS firstName,
                   u.lastName AS lastName,
                   COALESCE(SUM(rt.pointsDelta), 0) AS totalPoints
            FROM RewardTransaction rt
            JOIN rt.citizenUser u
            WHERE (:areaId IS NULL OR EXISTS (
                SELECT cp.userId
                FROM CitizenProfile cp
                WHERE cp.user = u
                AND cp.defaultArea.areaId = :areaId
            ))
            GROUP BY u.userId, u.firstName, u.lastName
            ORDER BY COALESCE(SUM(rt.pointsDelta), 0) DESC
            """)
    List<LeaderboardProjection> findLeaderboard(@Param("areaId") UUID areaId, Pageable pageable);
}
