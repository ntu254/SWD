package com.example.backendservice.features.collection.repository;

import com.example.backendservice.features.collection.entity.VisitWasteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VisitWasteItemRepository extends JpaRepository<VisitWasteItem, UUID> {

    Optional<VisitWasteItem> findByItemId(UUID itemId);

    @Query("SELECT vwi FROM VisitWasteItem vwi WHERE vwi.visit.visitId = :visitId")
    List<VisitWasteItem> findByVisitId(@Param("visitId") UUID visitId);

    @Query("SELECT vwi FROM VisitWasteItem vwi WHERE vwi.wasteType.wasteTypeId = :wasteTypeId")
    List<VisitWasteItem> findByWasteTypeId(@Param("wasteTypeId") UUID wasteTypeId);

    @Query("SELECT SUM(vwi.weightKg) FROM VisitWasteItem vwi WHERE vwi.visit.visitId = :visitId")
    Double sumWeightByVisitId(@Param("visitId") UUID visitId);

    @Query("SELECT SUM(vwi.weightKg) FROM VisitWasteItem vwi WHERE vwi.visit.collectorUser.userId = :collectorUserId")
    Double sumWeightByCollectorUserId(@Param("collectorUserId") UUID collectorUserId);

    @Query("SELECT vwi FROM VisitWasteItem vwi WHERE vwi.visit.visitId = :visitId AND vwi.sortingLevel = :sortingLevel")
    List<VisitWasteItem> findByVisitIdAndSortingLevel(
            @Param("visitId") UUID visitId,
            @Param("sortingLevel") String sortingLevel);
}
