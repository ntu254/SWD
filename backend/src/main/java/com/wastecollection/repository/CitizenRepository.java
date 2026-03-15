package com.wastecollection.repository;

import com.wastecollection.entity.Citizen;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, UUID> {
    Optional<Citizen> findByUser_UserId(UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Citizen c JOIN FETCH c.user WHERE c.userId = :userId")
    Optional<Citizen> findByUserIdForUpdate(UUID userId);

    @Modifying
    @Query("UPDATE Citizen c SET c.points = c.points + :delta WHERE c.userId = :citizenId")
    int incrementPoints(UUID citizenId, int delta);

    @Query("SELECT c FROM Citizen c JOIN c.user u WHERE u.accountStatus = 'ACTIVE' ORDER BY c.points DESC")
    java.util.List<Citizen> findLeaderboard(org.springframework.data.domain.Pageable pageable);
}
