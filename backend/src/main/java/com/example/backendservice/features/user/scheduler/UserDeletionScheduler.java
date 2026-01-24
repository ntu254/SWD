package com.example.backendservice.features.user.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.backendservice.features.user.entity.AccountStatus;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Scheduler for hard deleting users after 14-day grace period
 * Runs daily at 2:00 AM to permanently remove PENDING_DELETE users
 */
@Component
@RequiredArgsConstructor
public class UserDeletionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(UserDeletionScheduler.class);
    private final UserRepository userRepository;

    /**
     * Hard delete users that have exceeded their 14-day deletion grace period
     * Runs daily at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void hardDeleteExpiredUsers() {
        logger.info("Starting scheduled hard deletion of expired users");

        try {
            LocalDateTime now = LocalDateTime.now();
            List<User> expiredUsers = userRepository.findByAccountStatusAndDeleteScheduledAtBefore(
                    AccountStatus.PENDING_DELETE,
                    now);

            if (expiredUsers.isEmpty()) {
                logger.info("No expired users found for deletion");
                return;
            }

            logger.info("Found {} expired users to hard delete", expiredUsers.size());

            int successCount = 0;
            int failureCount = 0;

            for (User user : expiredUsers) {
                try {
                    String userEmail = user.getEmail();
                    String userCode = user.getUserCode();

                    userRepository.delete(user);

                    logger.info("Hard deleted user - Email: {}, UserCode: {}, DeleteScheduledAt: {}",
                            userEmail, userCode, user.getDeleteScheduledAt());
                    successCount++;

                } catch (Exception e) {
                    logger.error("Failed to hard delete user id: {}, email: {}",
                            user.getId(), user.getEmail(), e);
                    failureCount++;
                }
            }

            logger.info("Hard deletion completed - Success: {}, Failures: {}", successCount, failureCount);

        } catch (Exception e) {
            logger.error("Fatal error during scheduled hard deletion", e);
        }
    }
}
