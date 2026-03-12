package com.wastecollection.repository;

import com.wastecollection.entity.CollectionVisit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CollectionVisitRepository extends JpaRepository<CollectionVisit, UUID> {
    List<CollectionVisit> findByTask_TaskId(UUID taskId);
    Page<CollectionVisit> findByCollector_UserId(UUID collectorId, Pageable pageable);
    long countByCollector_UserId(UUID collectorId);
}
