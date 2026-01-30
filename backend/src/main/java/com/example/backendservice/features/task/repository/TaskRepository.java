package com.example.backendservice.features.task.repository;

import com.example.backendservice.features.task.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    Page<Task> findByEnterpriseId(UUID enterpriseId, Pageable pageable);

    Page<Task> findByAreaId(UUID areaId, Pageable pageable);

    Page<Task> findByStatus(String status, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.enterprise.id = :enterpriseId AND t.status = :status")
    Page<Task> findByEnterpriseIdAndStatus(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("status") String status,
            Pageable pageable);

    List<Task> findByStatusIn(List<String> statuses);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.enterprise.id = :enterpriseId AND t.status = :status")
    long countByEnterpriseIdAndStatus(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("status") String status);
}
