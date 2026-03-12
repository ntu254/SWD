package com.wastecollection.repository;

import com.wastecollection.entity.VisitWasteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisitWasteItemRepository extends JpaRepository<VisitWasteItem, UUID> {
    List<VisitWasteItem> findByVisit_VisitId(UUID visitId);
}
