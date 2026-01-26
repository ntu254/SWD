package com.example.backendservice.common.config;

import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.complaint.repository.ComplaintRepository;
import com.example.backendservice.features.notification.entity.Notification;
import com.example.backendservice.features.notification.repository.NotificationRepository;
import com.example.backendservice.features.user.entity.Citizen;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.CitizenRepository;
import com.example.backendservice.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
@Profile("dev") // Only run in dev profile
public class DataSeeder {

        private final UserRepository userRepository;
        private final CitizenRepository citizenRepository;
        private final ComplaintRepository complaintRepository;
        private final NotificationRepository notificationRepository;
        private final PasswordEncoder passwordEncoder;

        @Bean
        public CommandLineRunner seedData() {
                return args -> {
                        if (userRepository.count() == 0) {
                                log.info("Seeding sample data...");
                                seedUsers();
                                seedNotifications();
                                seedComplaints();
                                log.info("Sample data seeded successfully!");
                        } else {
                                log.info("Data already exists, skipping seeding.");
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
                userRepository.save(admin);

                // Create Citizens
                User citizen1User = User.builder()
                                .firstName("John")
                                .lastName("Doe")
                                .email("john@example.com")
                                .password(passwordEncoder.encode("citizen123"))
                                .role("CITIZEN")
                                .enabled(true)
                                .build();
                userRepository.save(citizen1User);

                Citizen citizen1 = Citizen.builder()
                                .user(citizen1User)
                                .address("123 Main Street, District 1")
                                .currentPoints(250)
                                .membershipTier("Silver")
                                .build();
                citizenRepository.save(citizen1);

                User citizen2User = User.builder()
                                .firstName("Jane")
                                .lastName("Smith")
                                .email("jane@example.com")
                                .password(passwordEncoder.encode("citizen123"))
                                .role("CITIZEN")
                                .enabled(true)
                                .build();
                userRepository.save(citizen2User);

                Citizen citizen2 = Citizen.builder()
                                .user(citizen2User)
                                .address("456 Oak Avenue, District 2")
                                .currentPoints(500)
                                .membershipTier("Gold")
                                .build();
                citizenRepository.save(citizen2);

                User citizen3User = User.builder()
                                .firstName("Bob")
                                .lastName("Johnson")
                                .email("bob@example.com")
                                .password(passwordEncoder.encode("citizen123"))
                                .role("CITIZEN")
                                .enabled(true)
                                .build();
                userRepository.save(citizen3User);

                Citizen citizen3 = Citizen.builder()
                                .user(citizen3User)
                                .address("789 Pine Road, District 3")
                                .currentPoints(100)
                                .membershipTier("Bronze")
                                .build();
                citizenRepository.save(citizen3);

                log.info("Created 1 admin and 3 citizens");
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
                // Find users first
                User citizen1User = userRepository.findByEmail("john@example.com").orElseThrow();
                User citizen2User = userRepository.findByEmail("jane@example.com").orElseThrow();
                User citizen3User = userRepository.findByEmail("bob@example.com").orElseThrow();
                User admin = userRepository.findByEmail("admin@example.com").orElseThrow();

                // Find citizens by user
                Citizen citizen1 = citizenRepository.findByUser_Id(citizen1User.getId()).orElseThrow();
                Citizen citizen2 = citizenRepository.findByUser_Id(citizen2User.getId()).orElseThrow();
                Citizen citizen3 = citizenRepository.findByUser_Id(citizen3User.getId()).orElseThrow();

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
