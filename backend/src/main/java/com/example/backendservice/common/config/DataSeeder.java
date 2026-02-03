package com.example.backendservice.common.config;

import com.example.backendservice.features.collector.entity.CollectionRequest;
import com.example.backendservice.features.collector.repository.CollectionRequestRepository;
import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.complaint.repository.ComplaintRepository;
import com.example.backendservice.features.notification.entity.Notification;
import com.example.backendservice.features.notification.repository.NotificationRepository;
import com.example.backendservice.features.user.entity.CitizenProfile;
import com.example.backendservice.features.user.entity.CollectorProfile;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.CitizenProfileRepository;
import com.example.backendservice.features.user.repository.CollectorProfileRepository;
import com.example.backendservice.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Configuration
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.seeder.enabled", havingValue = "true", matchIfMissing = false)
public class DataSeeder {

        private final UserRepository userRepository;
        private final CitizenProfileRepository citizenProfileRepository;
        private final CollectorProfileRepository collectorProfileRepository;
        private final CollectionRequestRepository collectionRequestRepository;
        private final ComplaintRepository complaintRepository;
        private final NotificationRepository notificationRepository;
        private final PasswordEncoder passwordEncoder;
        private final TransactionTemplate transactionTemplate;

        @PersistenceContext
        private EntityManager entityManager;

        @Bean
        public CommandLineRunner seedData() {
                return args -> {
                        if (userRepository.count() == 0) {
                                log.info("Seeding sample data...");
                                seedUsers();
                                seedCollectors();
                                seedNotifications();
                                seedComplaints();
                                seedCollectionRequests();
                                log.info("Sample data seeded successfully!");
                        } else {
                                log.info("Data already exists, checking for collector data...");

                                // Check and seed missing collectors
                                boolean needsSeedCollectors = userRepository.findByEmail("collector1@example.com")
                                                .isEmpty()
                                                || userRepository.findByEmail("collector2@example.com").isEmpty()
                                                || userRepository.findByEmail("collector3@example.com").isEmpty();

                                // Check if collector profiles exist
                                boolean needsSeedProfiles = collectorProfileRepository.count() == 0;

                                if (needsSeedCollectors || needsSeedProfiles) {
                                        log.info("Seeding missing collector data...");
                                        transactionTemplate.executeWithoutResult(status -> seedCollectorsIfMissing());
                                        log.info("Collector data seeded successfully!");
                                }

                                if (collectionRequestRepository.count() == 0) {
                                        log.info("Seeding collection requests...");
                                        seedCollectionRequests();
                                        log.info("Collection requests seeded successfully!");
                                } else {
                                        log.info("All collector data already exists.");
                                }
                        }
                };
        }

        private void seedUsers() {
                // Create Admin
                User admin = User.builder()
                                .firstName("Admin")
                                .lastName("User")
                                .email("admin@example.com")
                                .password(passwordEncoder.encode("admin123"))
                                .role("ADMIN")
                                .enabled(true)
                                .build();
                admin.addRole(RoleType.ADMIN);
                userRepository.save(admin);

                // Create Citizens với Composition pattern
                // Citizen 1
                User citizenUser1 = User.builder()
                                .firstName("John")
                                .lastName("Doe")
                                .email("john@example.com")
                                .password(passwordEncoder.encode("citizen123"))
                                .role("CITIZEN")
                                .enabled(true)
                                .build();
                citizenUser1.addRole(RoleType.CITIZEN);
                User savedCitizenUser1 = userRepository.save(citizenUser1);

                CitizenProfile citizen1 = CitizenProfile.builder()
                                .user(savedCitizenUser1)
                                .address("123 Main Street, District 1")
                                .currentPoints(250)
                                .membershipTier("Silver")
                                .build();
                citizenProfileRepository.save(citizen1);

                // Citizen 2
                User citizenUser2 = User.builder()
                                .firstName("Jane")
                                .lastName("Smith")
                                .email("jane@example.com")
                                .password(passwordEncoder.encode("citizen123"))
                                .role("CITIZEN")
                                .enabled(true)
                                .build();
                citizenUser2.addRole(RoleType.CITIZEN);
                User savedCitizenUser2 = userRepository.save(citizenUser2);

                CitizenProfile citizen2 = CitizenProfile.builder()
                                .user(savedCitizenUser2)
                                .address("456 Oak Avenue, District 2")
                                .currentPoints(500)
                                .membershipTier("Gold")
                                .build();
                citizenProfileRepository.save(citizen2);

                // Citizen 3
                User citizenUser3 = User.builder()
                                .firstName("Bob")
                                .lastName("Johnson")
                                .email("bob@example.com")
                                .password(passwordEncoder.encode("citizen123"))
                                .role("CITIZEN")
                                .enabled(true)
                                .build();
                citizenUser3.addRole(RoleType.CITIZEN);
                User savedCitizenUser3 = userRepository.save(citizenUser3);

                CitizenProfile citizen3 = CitizenProfile.builder()
                                .user(savedCitizenUser3)
                                .address("789 Pine Road, District 3")
                                .currentPoints(100)
                                .membershipTier("Bronze")
                                .build();
                citizenProfileRepository.save(citizen3);

                log.info("Created 1 admin and 3 citizens");
        }

        private void seedCollectors() {
                // Create Collector 1 với Composition pattern
                User collectorUser1 = User.builder()
                                .firstName("Mike")
                                .lastName("Collector")
                                .email("collector1@example.com")
                                .password(passwordEncoder.encode("collector123"))
                                .role("COLLECTOR")
                                .enabled(true)
                                .build();
                collectorUser1.addRole(RoleType.COLLECTOR);
                User savedCollectorUser1 = userRepository.save(collectorUser1);

                CollectorProfile collector1 = CollectorProfile.builder()
                                .user(savedCollectorUser1)
                                .availabilityStatus("AVAILABLE")
                                .vehicleType("MOTORCYCLE")
                                .maxLoadKg(50.0)
                                .build();
                collectorProfileRepository.save(collector1);

                // Create Collector 2
                User collectorUser2 = User.builder()
                                .firstName("Sarah")
                                .lastName("Driver")
                                .email("collector2@example.com")
                                .password(passwordEncoder.encode("collector123"))
                                .role("COLLECTOR")
                                .enabled(true)
                                .build();
                collectorUser2.addRole(RoleType.COLLECTOR);
                User savedCollectorUser2 = userRepository.save(collectorUser2);

                CollectorProfile collector2 = CollectorProfile.builder()
                                .user(savedCollectorUser2)
                                .availabilityStatus("AVAILABLE")
                                .vehicleType("TRUCK")
                                .maxLoadKg(500.0)
                                .build();
                collectorProfileRepository.save(collector2);

                // Create Collector 3 (Busy)
                User collectorUser3 = User.builder()
                                .firstName("Tom")
                                .lastName("Hauler")
                                .email("collector3@example.com")
                                .password(passwordEncoder.encode("collector123"))
                                .role("COLLECTOR")
                                .enabled(true)
                                .build();
                collectorUser3.addRole(RoleType.COLLECTOR);
                User savedCollectorUser3 = userRepository.save(collectorUser3);

                CollectorProfile collector3 = CollectorProfile.builder()
                                .user(savedCollectorUser3)
                                .availabilityStatus("BUSY")
                                .vehicleType("VAN")
                                .maxLoadKg(200.0)
                                .build();
                collectorProfileRepository.save(collector3);

                log.info("Created 3 collectors");
        }

        /**
         * Seeds missing collectors and their profiles.
         * This handles the case where some collectors exist but profiles are missing.
         */
        private void seedCollectorsIfMissing() {
                // Collector 1
                if (userRepository.findByEmail("collector1@example.com").isEmpty()) {
                        User collectorUser1 = User.builder()
                                        .firstName("Mike")
                                        .lastName("Collector")
                                        .email("collector1@example.com")
                                        .password(passwordEncoder.encode("collector123"))
                                        .role("COLLECTOR")
                                        .enabled(true)
                                        .build();
                        collectorUser1.addRole(RoleType.COLLECTOR);
                        User savedUser = userRepository.save(collectorUser1);

                        CollectorProfile collector1 = CollectorProfile.builder()
                                        .user(savedUser)
                                        .availabilityStatus("AVAILABLE")
                                        .vehicleType("MOTORCYCLE")
                                        .maxLoadKg(50.0)
                                        .build();
                        collectorProfileRepository.save(collector1);
                        log.info("Created collector1");
                }

                // Collector 2
                if (userRepository.findByEmail("collector2@example.com").isEmpty()) {
                        User collectorUser2 = User.builder()
                                        .firstName("Sarah")
                                        .lastName("Driver")
                                        .email("collector2@example.com")
                                        .password(passwordEncoder.encode("collector123"))
                                        .role("COLLECTOR")
                                        .enabled(true)
                                        .build();
                        collectorUser2.addRole(RoleType.COLLECTOR);
                        User savedUser = userRepository.save(collectorUser2);

                        CollectorProfile collector2 = CollectorProfile.builder()
                                        .user(savedUser)
                                        .availabilityStatus("AVAILABLE")
                                        .vehicleType("TRUCK")
                                        .maxLoadKg(500.0)
                                        .build();
                        collectorProfileRepository.save(collector2);
                        log.info("Created collector2");
                }

                // Collector 3
                if (userRepository.findByEmail("collector3@example.com").isEmpty()) {
                        User collectorUser3 = User.builder()
                                        .firstName("Tom")
                                        .lastName("Hauler")
                                        .email("collector3@example.com")
                                        .password(passwordEncoder.encode("collector123"))
                                        .role("COLLECTOR")
                                        .enabled(true)
                                        .build();
                        collectorUser3.addRole(RoleType.COLLECTOR);
                        User savedUser = userRepository.save(collectorUser3);

                        CollectorProfile collector3 = CollectorProfile.builder()
                                        .user(savedUser)
                                        .availabilityStatus("BUSY")
                                        .vehicleType("VAN")
                                        .maxLoadKg(200.0)
                                        .build();
                        collectorProfileRepository.save(collector3);
                        log.info("Created collector3");
                }

                log.info("Verified all 3 collectors exist");
        }

        private void seedCollectionRequests() {
                User collector1User = userRepository.findByEmail("collector1@example.com").orElseThrow();
                // Fallback to collector1 if collector2 doesn't exist
                User collector2User = userRepository.findByEmail("collector2@example.com")
                                .orElse(collector1User);

                Instant now = Instant.now();

                // ========== Tasks for Collector 1 (collector1@example.com) ==========

                // Task 1: ASSIGNED - Ready to be accepted
                CollectionRequest task1 = CollectionRequest.builder()
                                .collectorId(collector1User.getId())
                                .reportId(UUID.randomUUID()) // Simulated report
                                .status("ASSIGNED")
                                .note("Pickup at 123 Main Street - 5kg recyclables")
                                .assignedAt(now.minus(2, ChronoUnit.HOURS))
                                .createdAt(now.minus(2, ChronoUnit.HOURS))
                                .build();
                collectionRequestRepository.save(task1);

                // Task 2: ASSIGNED - Another task to accept
                CollectionRequest task2 = CollectionRequest.builder()
                                .collectorId(collector1User.getId())
                                .reportId(UUID.randomUUID())
                                .status("ASSIGNED")
                                .note("Pickup at 456 Oak Ave - Electronic waste")
                                .assignedAt(now.minus(1, ChronoUnit.HOURS))
                                .createdAt(now.minus(1, ChronoUnit.HOURS))
                                .build();
                collectionRequestRepository.save(task2);

                // Task 3: ON_THE_WAY - Already accepted, in progress
                CollectionRequest task3 = CollectionRequest.builder()
                                .collectorId(collector1User.getId())
                                .reportId(UUID.randomUUID())
                                .status("ON_THE_WAY")
                                .note("Pickup at 789 Pine Road - Plastic bottles")
                                .assignedAt(now.minus(3, ChronoUnit.HOURS))
                                .acceptedAt(now.minus(2, ChronoUnit.HOURS))
                                .onWayAt(now.minus(2, ChronoUnit.HOURS))
                                .createdAt(now.minus(3, ChronoUnit.HOURS))
                                .build();
                collectionRequestRepository.save(task3);

                // Task 4: COLLECTED - Completed, needs proof upload
                CollectionRequest task4 = CollectionRequest.builder()
                                .collectorId(collector1User.getId())
                                .reportId(UUID.randomUUID())
                                .status("COLLECTED")
                                .note("Pickup at 321 Elm Street - Paper waste")
                                .assignedAt(now.minus(1, ChronoUnit.DAYS))
                                .acceptedAt(now.minus(1, ChronoUnit.DAYS).plus(30, ChronoUnit.MINUTES))
                                .onWayAt(now.minus(1, ChronoUnit.DAYS).plus(30, ChronoUnit.MINUTES))
                                .collectedAt(now.minus(1, ChronoUnit.DAYS).plus(90, ChronoUnit.MINUTES))
                                .createdAt(now.minus(1, ChronoUnit.DAYS))
                                .build();
                collectionRequestRepository.save(task4);

                // Task 5: COLLECTED with proof - Complete history
                CollectionRequest task5 = CollectionRequest.builder()
                                .collectorId(collector1User.getId())
                                .reportId(UUID.randomUUID())
                                .status("COLLECTED")
                                .note("Pickup at 555 Cedar Lane - Mixed recyclables")
                                .collectorProofImageUrl("https://storage.example.com/proof/task5.jpg")
                                .assignedAt(now.minus(2, ChronoUnit.DAYS))
                                .acceptedAt(now.minus(2, ChronoUnit.DAYS).plus(15, ChronoUnit.MINUTES))
                                .onWayAt(now.minus(2, ChronoUnit.DAYS).plus(15, ChronoUnit.MINUTES))
                                .collectedAt(now.minus(2, ChronoUnit.DAYS).plus(45, ChronoUnit.MINUTES))
                                .createdAt(now.minus(2, ChronoUnit.DAYS))
                                .build();
                collectionRequestRepository.save(task5);

                // Task 6: FAILED - Historical failed task
                CollectionRequest task6 = CollectionRequest.builder()
                                .collectorId(collector1User.getId())
                                .reportId(UUID.randomUUID())
                                .status("FAILED")
                                .note("Address not found - no one answered")
                                .assignedAt(now.minus(3, ChronoUnit.DAYS))
                                .acceptedAt(now.minus(3, ChronoUnit.DAYS).plus(20, ChronoUnit.MINUTES))
                                .onWayAt(now.minus(3, ChronoUnit.DAYS).plus(20, ChronoUnit.MINUTES))
                                .createdAt(now.minus(3, ChronoUnit.DAYS))
                                .build();
                collectionRequestRepository.save(task6);

                // Task 7: CANCELLED - Cancelled by system
                CollectionRequest task7 = CollectionRequest.builder()
                                .collectorId(collector1User.getId())
                                .reportId(UUID.randomUUID())
                                .status("CANCELLED")
                                .note("Cancelled by citizen request")
                                .assignedAt(now.minus(4, ChronoUnit.DAYS))
                                .acceptedAt(now.minus(4, ChronoUnit.DAYS).plus(10, ChronoUnit.MINUTES))
                                .onWayAt(now.minus(4, ChronoUnit.DAYS).plus(10, ChronoUnit.MINUTES))
                                .createdAt(now.minus(4, ChronoUnit.DAYS))
                                .build();
                collectionRequestRepository.save(task7);

                // ========== Tasks for Collector 2 (collector2@example.com) ==========

                // Task 8: ASSIGNED for collector 2
                CollectionRequest task8 = CollectionRequest.builder()
                                .collectorId(collector2User.getId())
                                .reportId(UUID.randomUUID())
                                .status("ASSIGNED")
                                .note("Large pickup - Industrial area")
                                .assignedAt(now.minus(30, ChronoUnit.MINUTES))
                                .createdAt(now.minus(30, ChronoUnit.MINUTES))
                                .build();
                collectionRequestRepository.save(task8);

                // Task 9: COLLECTED for collector 2
                CollectionRequest task9 = CollectionRequest.builder()
                                .collectorId(collector2User.getId())
                                .reportId(UUID.randomUUID())
                                .status("COLLECTED")
                                .note("Completed - Restaurant waste")
                                .collectorProofImageUrl("https://storage.example.com/proof/task9.jpg")
                                .assignedAt(now.minus(1, ChronoUnit.DAYS))
                                .acceptedAt(now.minus(1, ChronoUnit.DAYS).plus(5, ChronoUnit.MINUTES))
                                .onWayAt(now.minus(1, ChronoUnit.DAYS).plus(5, ChronoUnit.MINUTES))
                                .collectedAt(now.minus(1, ChronoUnit.DAYS).plus(60, ChronoUnit.MINUTES))
                                .createdAt(now.minus(1, ChronoUnit.DAYS))
                                .build();
                collectionRequestRepository.save(task9);

                log.info("Created 9 collection requests for testing");
        }

        private void seedNotifications() {
                User admin = userRepository.findByEmail("admin@example.com").orElseThrow();

                // Maintenance notification
                Notification maintenance = Notification.builder()
                                .title("System Maintenance Scheduled")
                                .content("Our system will undergo scheduled maintenance on January 25, 2026 from 00:00 to 06:00. "
                                                +
                                                "During this time, some services may be temporarily unavailable. We apologize for any inconvenience.")
                                .type("Maintenance")
                                .targetAudience("All")
                                .priority("High")
                                .isActive(true)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(7))
                                .createdBy(admin)
                                .build();
                notificationRepository.save(maintenance);

                // Update notification
                Notification update = Notification.builder()
                                .title("New Features Released!")
                                .content(
                                                "We're excited to announce new features: 1. Improved point tracking, 2. Faster complaint resolution, "
                                                                +
                                                                "3. New rewards program. Check out the app for more details!")
                                .type("Update")
                                .targetAudience("All")
                                .priority("Normal")
                                .isActive(true)
                                .createdBy(admin)
                                .build();
                notificationRepository.save(update);

                // Promotion notification
                Notification promotion = Notification.builder()
                                .title("Double Points Weekend!")
                                .content("This weekend only! Earn double points on all recyclable waste collections. " +
                                                "Valid from Saturday 00:00 to Sunday 23:59.")
                                .type("Promotion")
                                .targetAudience("Citizen")
                                .priority("High")
                                .isActive(true)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .createdBy(admin)
                                .build();
                notificationRepository.save(promotion);

                // Alert notification
                Notification alert = Notification.builder()
                                .title("Important Security Update")
                                .content("Please update your password if you haven't done so in the last 6 months. " +
                                                "This helps keep your account secure.")
                                .type("Alert")
                                .targetAudience("All")
                                .priority("Urgent")
                                .isActive(true)
                                .createdBy(admin)
                                .build();
                notificationRepository.save(alert);

                // Inactive notification
                Notification inactive = Notification.builder()
                                .title("Old Promotion - Expired")
                                .content("This is an expired promotion notification for testing.")
                                .type("Promotion")
                                .targetAudience("All")
                                .priority("Low")
                                .isActive(false)
                                .createdBy(admin)
                                .build();
                notificationRepository.save(inactive);

                log.info("Created 5 sample notifications");
        }

        private void seedComplaints() {
                // Find citizens using new composition pattern - find by user email
                CitizenProfile citizen1 = citizenProfileRepository.findByUser_Email("john@example.com")
                                .orElseThrow(() -> new RuntimeException("Citizen john@example.com not found"));
                CitizenProfile citizen2 = citizenProfileRepository.findByUser_Email("jane@example.com")
                                .orElseThrow(() -> new RuntimeException("Citizen jane@example.com not found"));
                CitizenProfile citizen3 = citizenProfileRepository.findByUser_Email("bob@example.com")
                                .orElseThrow(() -> new RuntimeException("Citizen bob@example.com not found"));
                User admin = userRepository.findByEmail("admin@example.com").orElseThrow();

                // Pending complaints
                Complaint complaint1 = Complaint.builder()
                                .citizen(citizen1)
                                .title("Points not credited correctly")
                                .description(
                                                "I collected 5kg of recyclables on January 15, but only received 2 points instead of 5 points. "
                                                                +
                                                                "Please check and correct my point balance.")
                                .category("POINTS_ERROR")
                                .status("Pending")
                                .priority("High")
                                .build();
                complaintRepository.save(complaint1);

                Complaint complaint2 = Complaint.builder()
                                .citizen(citizen2)
                                .title("App crashes on submission")
                                .description("The mobile app crashes every time I try to submit a new waste collection report. "
                                                +
                                                "This happens on both Android and iOS. App version 2.3.1.")
                                .category("BUG")
                                .status("Pending")
                                .priority("Urgent")
                                .build();
                complaintRepository.save(complaint2);

                // In Progress complaint
                Complaint complaint3 = Complaint.builder()
                                .citizen(citizen1)
                                .title("Collection schedule not updated")
                                .description(
                                                "The collection schedule shows wrong times for my area. It says 8:00 AM but collectors come at 6:00 AM.")
                                .category("SERVICE_ISSUE")
                                .status("In_Progress")
                                .priority("Normal")
                                .adminResponse("We are investigating this issue with the scheduling team.")
                                .build();
                complaintRepository.save(complaint3);

                // Resolved complaint
                Complaint complaint4 = Complaint.builder()
                                .citizen(citizen3)
                                .title("Cannot redeem rewards")
                                .description("I have 500 points but cannot redeem any rewards. The button doesn't work.")
                                .category("BUG")
                                .status("Resolved")
                                .priority("Normal")
                                .adminResponse("Issue was fixed in the latest app update. Please update your app to version 2.3.2. "
                                                +
                                                "Your points have been verified and are correct.")
                                .resolvedBy(admin)
                                .resolvedAt(LocalDateTime.now().minusDays(2))
                                .build();
                complaintRepository.save(complaint4);

                // Rejected complaint
                Complaint complaint5 = Complaint.builder()
                                .citizen(citizen2)
                                .title("Want more points")
                                .description("I think I deserve more points for recycling. Please give me extra points.")
                                .category("OTHER")
                                .status("Rejected")
                                .priority("Low")
                                .adminResponse("Points are calculated based on the weight and type of recyclables collected. "
                                                +
                                                "Your point balance is accurate according to our records.")
                                .resolvedBy(admin)
                                .resolvedAt(LocalDateTime.now().minusDays(5))
                                .build();
                complaintRepository.save(complaint5);

                log.info("Created 5 sample complaints");
        }
}
