package com.example.backendservice.features.enterprise.scheduler;

import com.example.backendservice.features.enterprise.repository.EnterpriseCapabilityRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Scheduler for resetting daily capacity usage of EnterpriseCapability
 * Runs daily at midnight (00:00) to reset usedCapacityKg to 0
 */
@Component
@RequiredArgsConstructor
public class CapacityResetScheduler {

    private static final Logger logger = LoggerFactory.getLogger(CapacityResetScheduler.class);
    private final EnterpriseCapabilityRepository capabilityRepository;

    /**
     * Reset daily used capacity for all active EnterpriseCapabilities
     * Runs daily at midnight (00:00 AM) Vietnam timezone
     */
    @Scheduled(cron = "0 0 0 * * ?", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void resetDailyCapacity() {
        logger.info("Starting scheduled daily capacity reset");

        try {
            int updatedCount = capabilityRepository.resetAllUsedCapacity();
            logger.info("Successfully reset usedCapacityKg for {} enterprise capabilities", updatedCount);

        } catch (Exception e) {
            logger.error("Error during daily capacity reset", e);
        }
    }
}
