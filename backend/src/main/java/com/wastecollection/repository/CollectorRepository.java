package com.wastecollection.repository;

import com.wastecollection.entity.Collector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectorRepository extends JpaRepository<Collector, UUID> {
    Optional<Collector> findByUser_UserId(UUID userId);
    List<Collector> findByEnterprise_UserId(UUID enterpriseUserId);
}
