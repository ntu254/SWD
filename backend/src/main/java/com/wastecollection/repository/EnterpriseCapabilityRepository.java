package com.wastecollection.repository;

import com.wastecollection.entity.EnterpriseCapability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EnterpriseCapabilityRepository extends JpaRepository<EnterpriseCapability, UUID> {
    List<EnterpriseCapability> findByEnterprise_UserId(UUID enterpriseUserId);
    List<UUID> findAreaIdsByEnterprise_UserId(UUID enterpriseUserId);

    default List<UUID> getServiceAreaIds(UUID enterpriseUserId) {
        return findByEnterprise_UserId(enterpriseUserId)
                .stream()
                .map(ec -> ec.getServiceArea().getAreaId())
                .distinct()
                .toList();
    }
}
