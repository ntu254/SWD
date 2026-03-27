package com.wastecollection.repository;

import com.wastecollection.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findByEnterprise_UserId(UUID enterpriseUserId, Pageable pageable);

    Page<Task> findByEnterprise_UserIdAndStatus(UUID enterpriseUserId, String status, Pageable pageable);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.enterprise.userId = :enterpriseId AND t.status = :status")
    long countByEnterpriseAndStatus(UUID enterpriseId, String status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status NOT IN ('COMPLETED','CANCELLED','REJECTED','FAILED')")
    long countActive();

    java.util.List<Task> findByReport_ReportId(UUID reportId);
}
