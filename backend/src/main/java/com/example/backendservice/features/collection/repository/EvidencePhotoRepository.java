package com.example.backendservice.features.collection.repository;

import com.example.backendservice.features.collection.entity.EvidencePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EvidencePhotoRepository extends JpaRepository<EvidencePhoto, UUID> {

    Optional<EvidencePhoto> findByPhotoId(UUID photoId);

    @Query("SELECT ep FROM EvidencePhoto ep WHERE ep.visit.visitId = :visitId ORDER BY ep.takenAt ASC")
    List<EvidencePhoto> findByVisitId(@Param("visitId") UUID visitId);

    @Query("SELECT COUNT(ep) FROM EvidencePhoto ep WHERE ep.visit.visitId = :visitId")
    Long countByVisitId(@Param("visitId") UUID visitId);
}
