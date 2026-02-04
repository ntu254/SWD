package com.example.backendservice.features.enterprise.scheduler;

import com.example.backendservice.features.enterprise.service.EnterpriseCapabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled job để reset công suất đã sử dụng hàng ngày
 * Chạy lúc 00:00 mỗi ngày
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CapacityResetScheduler {

    private final EnterpriseCapabilityService capabilityService;

    /**
     * Reset công suất đã sử dụng lúc 00:00 mỗi ngày
     * Cron: Second Minute Hour DayOfMonth Month DayOfWeek
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void resetDailyCapacity() {
        log.info("Starting daily capacity reset job");
        try {
            capabilityService.resetDailyUsedCapacity();
            log.info("Daily capacity reset completed successfully");
        } catch (Exception e) {
            log.error("Failed to reset daily capacity", e);
        }
    }
}
