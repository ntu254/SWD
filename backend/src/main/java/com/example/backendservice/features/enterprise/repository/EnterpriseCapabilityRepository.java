package com.example.backendservice.features.enterprise.repository;

import com.example.backendservice.features.enterprise.entity.EnterpriseCapability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnterpriseCapabilityRepository extends JpaRepository<EnterpriseCapability, UUID> {

        List<EnterpriseCapability> findByEnterpriseId(UUID enterpriseId);

        List<EnterpriseCapability> findByAreaId(UUID areaId);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.area.id = :areaId AND ec.wasteType.id = :wasteTypeId AND ec.status = 'ACTIVE'")
        Optional<EnterpriseCapability> findActiveByAreaAndWasteType(
                        @Param("areaId") UUID areaId,
                        @Param("wasteTypeId") UUID wasteTypeId);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.enterprise.id = :enterpriseId AND ec.status = 'ACTIVE'")
        List<EnterpriseCapability> findActiveByEnterprise(@Param("enterpriseId") UUID enterpriseId);

        @Query("SELECT ec FROM EnterpriseCapability ec WHERE ec.area.id = :areaId AND ec.status = 'ACTIVE' AND (ec.dailyCapacityKg - ec.usedCapacityKg) >= :requiredKg")
        List<EnterpriseCapability> findAvailableCapabilities(
                        @Param("areaId") UUID areaId,
                        @Param("requiredKg") Double requiredKg);

        /**
         * Reset usedCapacityKg to 0 for all active capabilities
         * Used by daily scheduled job
         * 
         * @return number of updated records
         */
        @Modifying
        @Query("UPDATE EnterpriseCapability ec SET ec.usedCapacityKg = 0.0 WHERE ec.status = 'ACTIVE'")
        int resetAllUsedCapacity();
}
