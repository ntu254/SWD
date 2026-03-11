package com.example.backendservice.features.collection.repository;

import com.example.backendservice.features.collection.entity.CollectionVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectionVisitRepository extends JpaRepository<CollectionVisit, UUID> {

    Optional<CollectionVisit> findByVisitId(UUID visitId);

    @Query("SELECT cv FROM CollectionVisit cv WHERE cv.task.taskId = :taskId ORDER BY cv.visitedAt DESC")
    List<CollectionVisit> findByTaskId(@Param("taskId") UUID taskId);

    @Query("SELECT cv FROM CollectionVisit cv WHERE cv.collectorUser.userId = :collectorUserId ORDER BY cv.visitedAt DESC")
    List<CollectionVisit> findByCollectorUserId(@Param("collectorUserId") UUID collectorUserId);

    @Query("SELECT cv FROM CollectionVisit cv WHERE cv.visitStatus = :visitStatus ORDER BY cv.visitedAt DESC")
    List<CollectionVisit> findByVisitStatus(@Param("visitStatus") String visitStatus);

    @Query("SELECT cv FROM CollectionVisit cv WHERE cv.collectorUser.userId = :collectorUserId AND cv.visitedAt >= :since")
    List<CollectionVisit> findByCollectorUserIdSince(
            @Param("collectorUserId") UUID collectorUserId,
            @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(cv) FROM CollectionVisit cv WHERE cv.collectorUser.userId = :collectorUserId AND cv.visitedAt >= :since")
    Long countByCollectorUserIdSince(
            @Param("collectorUserId") UUID collectorUserId,
            @Param("since") LocalDateTime since);

    @Query("SELECT cv FROM CollectionVisit cv WHERE cv.task.taskId = :taskId AND cv.visitStatus = 'VISITED'")
    List<CollectionVisit> findSuccessfulVisitsByTaskId(@Param("taskId") UUID taskId);
}
