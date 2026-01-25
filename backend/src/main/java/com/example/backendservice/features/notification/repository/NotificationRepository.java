package com.example.backendservice.features.notification.repository;

import com.example.backendservice.features.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

        // Find active notifications
        Page<Notification> findByIsActiveTrue(Pageable pageable);

        // Find notifications by type
        Page<Notification> findByType(String type, Pageable pageable);

        // Find notifications by target audience
        Page<Notification> findByTargetAudience(String targetAudience, Pageable pageable);

        // Find active notifications for specific audience (All or specific role)
        @Query("SELECT n FROM Notification n WHERE n.isActive = true AND " +
                        "(n.targetAudience = 'All' OR n.targetAudience = :audience) AND " +
                        "(n.startDate IS NULL OR n.startDate <= :now) AND " +
                        "(n.endDate IS NULL OR n.endDate >= :now) " +
                        "ORDER BY n.createdAt DESC")
        Page<Notification> findActiveNotificationsForAudience(
                        @Param("audience") String audience,
                        @Param("now") LocalDateTime now,
                        Pageable pageable);

        // Find all with filters for admin
        @Query("SELECT n FROM Notification n WHERE " +
                        "(:type IS NULL OR n.type = :type) AND " +
                        "(:targetAudience IS NULL OR n.targetAudience = :targetAudience) AND " +
                        "(:isActive IS NULL OR n.isActive = :isActive)")
        Page<Notification> findAllWithFilters(
                        @Param("type") String type,
                        @Param("targetAudience") String targetAudience,
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);

        // Count active notifications
        long countByIsActiveTrue();

        // Find notifications created by admin
        Page<Notification> findByCreatedById(Long adminId, Pageable pageable);
}
