package com.example.backendservice.features.enterprise.repository;

import com.example.backendservice.features.enterprise.entity.EnterpriseCapability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnterpriseCapabilityRepository extends JpaRepository<EnterpriseCapability, UUID> {

        Optional<EnterpriseCapability> findByCapabilityId(UUID capabilityId);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.enterpriseUser.userId = :enterpriseUserId")
        List<EnterpriseCapability> findByEnterpriseUserId(@Param("enterpriseUserId") UUID enterpriseUserId);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.serviceArea.areaId = :serviceAreaId")
        List<EnterpriseCapability> findByServiceAreaId(@Param("serviceAreaId") UUID serviceAreaId);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.wasteType.wasteTypeId = :wasteTypeId")
        List<EnterpriseCapability> findByWasteTypeId(@Param("wasteTypeId") UUID wasteTypeId);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.enterpriseUser.userId = :enterpriseUserId AND ec.serviceArea.areaId = :serviceAreaId")
        List<EnterpriseCapability> findByEnterpriseUserIdAndServiceAreaId(
                        @Param("enterpriseUserId") UUID enterpriseUserId,
                        @Param("serviceAreaId") UUID serviceAreaId);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.enterpriseUser.userId = :enterpriseUserId " +
                        "AND ec.wasteType.wasteTypeId = :wasteTypeId AND ec.serviceArea.areaId = :serviceAreaId")
        Optional<EnterpriseCapability> findByEnterpriseUserIdAndWasteTypeIdAndServiceAreaId(
                        @Param("enterpriseUserId") UUID enterpriseUserId,
                        @Param("wasteTypeId") UUID wasteTypeId,
                        @Param("serviceAreaId") UUID serviceAreaId);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.enterpriseUser.userId = :enterpriseUserId " +
                        "AND (ec.effectiveFrom IS NULL OR ec.effectiveFrom <= :date) " +
                        "AND (ec.effectiveTo IS NULL OR ec.effectiveTo >= :date)")
        List<EnterpriseCapability> findEffectiveByEnterpriseUserId(
                        @Param("enterpriseUserId") UUID enterpriseUserId,
                        @Param("date") LocalDate date);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.serviceArea.areaId = :serviceAreaId " +
                        "AND ec.wasteType.wasteTypeId = :wasteTypeId " +
                        "AND (ec.effectiveFrom IS NULL OR ec.effectiveFrom <= :date) " +
                        "AND (ec.effectiveTo IS NULL OR ec.effectiveTo >= :date)")
        List<EnterpriseCapability> findEffectiveByAreaAndWasteType(
                        @Param("serviceAreaId") UUID serviceAreaId,
                        @Param("wasteTypeId") UUID wasteTypeId,
                        @Param("date") LocalDate date);

        @Query("SELECT SUM(ec.dailyCapacityKg) FROM EnterpriseCapability ec WHERE ec.enterpriseUser.userId = :enterpriseUserId")
        Double sumDailyCapacityByEnterpriseUserId(@Param("enterpriseUserId") UUID enterpriseUserId);
}
