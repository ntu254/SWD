package com.example.backendservice.features.notification.repository;

import com.example.backendservice.features.notification.entity.Notification;
import com.example.backendservice.features.notification.entity.NotificationTargetAudience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, UUID>, JpaSpecificationExecutor<Notification> {

    Optional<Notification> findByNotificationId(UUID notificationId);

    @Query("""
            SELECT n FROM Notification n
            WHERE n.isActive = true
              AND (n.targetAudience = :allAudience OR n.targetAudience = :role)
              AND (n.startDate IS NULL OR n.startDate <= :now)
              AND (n.endDate IS NULL OR n.endDate >= :now)
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> findActiveForRole(@Param("role") NotificationTargetAudience role,
            @Param("allAudience") NotificationTargetAudience allAudience,
            @Param("now") LocalDateTime now,
            Pageable pageable);

    @Query("""
            SELECT COUNT(n) FROM Notification n
            WHERE n.isActive = true
              AND (n.startDate IS NULL OR n.startDate <= :now)
              AND (n.endDate IS NULL OR n.endDate >= :now)
            """)
    long countActive(@Param("now") LocalDateTime now);
}
