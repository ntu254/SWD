package com.wastecollection.repository;

import com.wastecollection.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @Query("""
            SELECT n FROM Notification n
            WHERE n.isActive = true
              AND (n.startDate IS NULL OR n.startDate <= :now)
              AND (n.endDate IS NULL OR n.endDate >= :now)
              AND (n.targetAudience = 'All' OR n.targetAudience = :audience)
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> findActiveForAudience(String audience, LocalDateTime now, Pageable pageable);

    Page<Notification> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
}
