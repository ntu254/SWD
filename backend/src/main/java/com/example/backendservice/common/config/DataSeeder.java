package com.example.backendservice.common.config;

import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.complaint.entity.ComplaintCategory;
import com.example.backendservice.features.complaint.entity.ComplaintPriority;
import com.example.backendservice.features.complaint.entity.ComplaintStatus;
import com.example.backendservice.features.complaint.repository.ComplaintRepository;
import com.example.backendservice.features.task.entity.Task;
import com.example.backendservice.features.task.entity.TaskAssignment;
import com.example.backendservice.features.task.entity.TaskAssignmentStatus;
import com.example.backendservice.features.task.entity.TaskStatus;
import com.example.backendservice.features.task.repository.TaskAssignmentRepository;
import com.example.backendservice.features.task.repository.TaskRepository;
import com.example.backendservice.features.user.entity.AccountStatus;
import com.example.backendservice.features.user.entity.CitizenProfile;
import com.example.backendservice.features.user.entity.CollectorProfile;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.CitizenProfileRepository;
import com.example.backendservice.features.user.repository.CollectorProfileRepository;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.collection.entity.CollectionVisit;
import com.example.backendservice.features.collection.repository.CollectionVisitRepository;
import com.example.backendservice.features.collector.entity.CollectorKpiDaily;
import com.example.backendservice.features.collector.entity.CollectorKpiStatus;
import com.example.backendservice.features.collector.repository.CollectorKpiDailyRepository;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;

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
    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final ComplaintRepository complaintRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final CollectionVisitRepository collectionVisitRepository;
    private final CollectorKpiDailyRepository collectorKpiDailyRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionTemplate transactionTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @Bean
    public CommandLineRunner seedData() {
        return args -> transactionTemplate.executeWithoutResult(status -> {
            try {
                if (userRepository.count() == 0) {
                    log.info("=== Seeding all sample data ===");
                    seedAdmin();
                    seedCitizens();
                    seedEnterprise();
                    seedCollectors();
                    seedCollectors();
                    seedServiceAreas();
                    seedTasksAndAssignments();
                    seedComplaints();
                    log.info("=== Sample data seeded successfully! ===");
                } else {
                    log.info("Data already exists. Checking for missing data...");
                    ensureCollectorsExist();
                    ensureEnterpriseExists();
                    seedServiceAreas();
                    ensureTasksExist();
                    log.info("Data check complete.");
                }
            } catch (Exception e) {
                log.error("Error during data seeding: {}", e.getMessage(), e);
                status.setRollbackOnly();
            }
        });
    }

    // ========== User Seeding ==========

    private User seedAdmin() {
        User admin = User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(RoleType.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        admin = userRepository.saveAndFlush(admin);
        log.info("Created admin user: {}", admin.getEmail());
        return admin;
    }

    private void seedCitizens() {
        createCitizen("John", "Doe", "john@example.com", "123 Main Street, District 1", 250);
        createCitizen("Jane", "Smith", "jane@example.com", "456 Oak Avenue, District 2", 500);
        createCitizen("Bob", "Johnson", "bob@example.com", "789 Pine Road, District 3", 100);
        log.info("Created 3 citizens");
    }

    private User createCitizen(String firstName, String lastName, String email, String address, int points) {
        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .passwordHash(passwordEncoder.encode("citizen123"))
                .role(RoleType.CITIZEN)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        user = userRepository.saveAndFlush(user);

        CitizenProfile profile = CitizenProfile.builder()
                .user(user)
                .addressText(address)
                .points(points)
                .build();
        citizenProfileRepository.saveAndFlush(profile);
        return user;
    }

    private User seedEnterprise() {
        User enterprise = User.builder()
                .firstName("Green")
                .lastName("Enterprise")
                .displayName("Green Recycling Co.")
                .email("enterprise@example.com")
                .passwordHash(passwordEncoder.encode("enterprise123"))
                .role(RoleType.ENTERPRISE)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        enterprise = userRepository.saveAndFlush(enterprise);
        log.info("Created enterprise user: {}", enterprise.getEmail());
        return enterprise;
    }

    private void seedCollectors() {
        createCollector("Mike", "Collector", "collector1@example.com");
        createCollector("Sarah", "Driver", "collector2@example.com");
        createCollector("Tom", "Hauler", "collector3@example.com");
        log.info("Created 3 collectors");
    }

    private User createCollector(String firstName, String lastName, String email) {
        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .passwordHash(passwordEncoder.encode("collector123"))
                .role(RoleType.COLLECTOR)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        user = userRepository.saveAndFlush(user);

        CollectorProfile profile = CollectorProfile.builder()
                .user(user)
                .status("ACTIVE")
                .build();
        collectorProfileRepository.saveAndFlush(profile);
        return user;
    }

    // ========== Tasks & Assignments Seeding ==========

    // ========== Service Areas Seeding ==========

    private void seedServiceAreas() {
        if (serviceAreaRepository.count() == 0) {
            createServiceArea("District 1");
            createServiceArea("District 2");
            log.info("Created service areas");
        }
    }

    private ServiceArea createServiceArea(String name) {
        return serviceAreaRepository.findByName(name)
                .orElseGet(() -> serviceAreaRepository.saveAndFlush(ServiceArea.builder()
                        .name(name)
                        .isActive(true)
                        .build()));
    }

    // ========== Tasks & Assignments Seeding ==========

    private void seedTasksAndAssignments() {
        User enterprise = userRepository.findByEmail("enterprise@example.com").orElse(null);
        User admin = userRepository.findByEmail("admin@example.com").orElse(null);
        User collector1 = userRepository.findByEmail("collector1@example.com").orElse(null);
        User collector2 = userRepository.findByEmail("collector2@example.com").orElse(null);

        ServiceArea district1 = serviceAreaRepository.findByName("District 1").orElse(null);
        ServiceArea district2 = serviceAreaRepository.findByName("District 2").orElse(null);

        if (enterprise == null || admin == null || collector1 == null || district1 == null) {
            log.warn("Required users or areas not found, skipping task seeding");
            return;
        }

        // Task 1: ASSIGNED
        createTaskWithAssignment(enterprise, admin, collector1, district1,
                LocalDate.now(), "NORMAL", TaskStatus.ASSIGNED,
                TaskAssignmentStatus.ASSIGNED, "Pickup at 123 Main Street - 5kg recyclables");

        // Task 2: ASSIGNED -> High priority
        createTaskWithAssignment(enterprise, admin, collector1, district2,
                LocalDate.now(), "HIGH", TaskStatus.ASSIGNED,
                TaskAssignmentStatus.ASSIGNED, "Pickup at 456 Oak Ave - Electronic waste");

        // Task 3: IN_PROGRESS
        createTaskWithAssignment(enterprise, admin, collector1, district1,
                LocalDate.now().minusDays(1), "NORMAL", TaskStatus.IN_PROGRESS,
                TaskAssignmentStatus.ON_THE_WAY, "Pickup at 789 Pine Road - Plastic bottles");

        // Task 4: COMPLETED with VISIT & KPI
        createTaskWithAssignment(enterprise, admin, collector1, district1,
                LocalDate.now().minusDays(2), "NORMAL", TaskStatus.COLLECTED,
                TaskAssignmentStatus.COLLECTED, "Pickup at 321 Elm Street - Paper waste");

        // Task 5: CANCELLED
        createTaskWithAssignment(enterprise, admin, collector1, district2,
                LocalDate.now().minusDays(3), "LOW", TaskStatus.CANCELLED,
                TaskAssignmentStatus.UNASSIGNED, "Cancelled by citizen request");

        // Tasks for collector 2
        if (collector2 != null) {
            createTaskWithAssignment(enterprise, admin, collector2, district2,
                    LocalDate.now(), "NORMAL", TaskStatus.ASSIGNED,
                    TaskAssignmentStatus.ASSIGNED, "Large pickup - Industrial area");

            createTaskWithAssignment(enterprise, admin, collector2, district2,
                    LocalDate.now().minusDays(1), "NORMAL", TaskStatus.COLLECTED,
                    TaskAssignmentStatus.COLLECTED, "Completed - Restaurant waste");
        }

        log.info("Created tasks, assignments, visits and KPIs for testing");
    }

    private void createTaskWithAssignment(User enterprise, User creator, User collector,
            ServiceArea area,
            LocalDate scheduledDate, String priority, TaskStatus taskStatus,
            TaskAssignmentStatus assignmentStatus, String note) {
        Task task = Task.builder()
                .enterpriseUser(enterprise)
                .createdByUser(creator)
                .area(area) // Set area
                .scheduledDate(scheduledDate)
                .priority(priority)
                .status(taskStatus)
                .build();
        task = taskRepository.saveAndFlush(task);

        TaskAssignment assignment = TaskAssignment.builder()
                .task(task)
                .collectorUser(collector)
                .status(assignmentStatus)
                .collectorNote(note)
                .build();

        if (assignmentStatus == TaskAssignmentStatus.ON_THE_WAY
                || assignmentStatus == TaskAssignmentStatus.COLLECTED) {
            assignment.setAcceptedAt(scheduledDate.atStartOfDay().plusHours(8));
        }

        taskAssignmentRepository.saveAndFlush(assignment);

        // If COMPLETED, create CollectionVisit and update KPI
        if (taskStatus == TaskStatus.COLLECTED) {
            CollectionVisit visit = CollectionVisit.builder()
                    .task(task)
                    .collectorUser(collector)
                    .visitedAt(scheduledDate.atStartOfDay().plusHours(10))
                    .visitStatus("VISITED")
                    .collectorNote("Completed successfully found recyclables")
                    .build();
            collectionVisitRepository.saveAndFlush(visit);

            // Seed KPI
            seedKpi(collector, area, scheduledDate, 10.0);
        }
    }

    private void seedKpi(User collector, ServiceArea area, LocalDate date, Double weight) {
        CollectorKpiDaily kpi = collectorKpiDailyRepository
                .findByCollectorUserIdAndAreaIdAndKpiDate(collector.getUserId(), area.getAreaId(), date)
                .orElse(CollectorKpiDaily.builder()
                        .collectorUser(collector)
                        .area(area)
                        .kpiDate(date)
                        .minWeightKg(50.0)
                        .minVisits(5)
                        .actualWeightKg(0.0)
                        .actualVisits(0)
                        .status(CollectorKpiStatus.PENDING)
                        .build());

        kpi.incrementVisit(weight);
        if (kpi.isKpiMet())
            kpi.setStatus(CollectorKpiStatus.MET);
        collectorKpiDailyRepository.saveAndFlush(kpi);
    }

    // ========== Complaints Seeding ==========

    private void seedComplaints() {
        User citizen1 = userRepository.findByEmail("john@example.com").orElse(null);
        User citizen2 = userRepository.findByEmail("jane@example.com").orElse(null);
        User citizen3 = userRepository.findByEmail("bob@example.com").orElse(null);

        if (citizen1 == null || citizen2 == null || citizen3 == null) {
            log.warn("Citizens not found, skipping complaint seeding");
            return;
        }

        complaintRepository.saveAndFlush(Complaint.builder()
                .createdByUser(citizen1)
                .title("Points not credited correctly")
                .content("I collected 5kg of recyclables on January 15, but only received 2 points instead of 5. "
                        + "Please check and correct my point balance.")
                .category(ComplaintCategory.POINTS_ERROR)
                .priority(ComplaintPriority.High)
                .status(ComplaintStatus.Pending)
                .build());

        complaintRepository.saveAndFlush(Complaint.builder()
                .createdByUser(citizen2)
                .title("App crashes on report submission")
                .content("The mobile app crashes every time I try to submit a new waste collection report. "
                        + "This happens on both Android and iOS. App version 2.3.1.")
                .category(ComplaintCategory.BUG)
                .priority(ComplaintPriority.Urgent)
                .status(ComplaintStatus.Pending)
                .build());

        complaintRepository.saveAndFlush(Complaint.builder()
                .createdByUser(citizen1)
                .title("Wrong collection schedule times")
                .content("The collection schedule shows wrong times for my area. "
                        + "It says 8:00 AM but collectors come at 6:00 AM.")
                .category(ComplaintCategory.OTHER)
                .priority(ComplaintPriority.Normal)
                .status(ComplaintStatus.In_Progress)
                .build());

        complaintRepository.saveAndFlush(Complaint.builder()
                .createdByUser(citizen3)
                .title("Cannot redeem rewards")
                .content("I have 500 points but cannot redeem any rewards. The button doesn't work.")
                .category(ComplaintCategory.BUG)
                .priority(ComplaintPriority.Normal)
                .status(ComplaintStatus.Resolved)
                .adminResponse("Fixed in app version 2.4.0. Please update your app.")
                .build());

        complaintRepository.saveAndFlush(Complaint.builder()
                .createdByUser(citizen2)
                .title("Request for extra points")
                .content("I think I deserve more points for recycling. Please give me extra points.")
                .category(ComplaintCategory.FEATURE)
                .priority(ComplaintPriority.Low)
                .status(ComplaintStatus.Rejected)
                .adminResponse("Points are awarded based on the system rules. Your request does not qualify.")
                .build());

        log.info("Created 5 sample complaints");
    }

    // ========== Ensure Missing Data Exists ==========

    private void ensureCollectorsExist() {
        ensureSingleCollectorExists("collector1@example.com", "Mike", "Collector");
        ensureSingleCollectorExists("collector2@example.com", "Sarah", "Driver");
        ensureSingleCollectorExists("collector3@example.com", "Tom", "Hauler");
    }

    private void ensureSingleCollectorExists(String email, String firstName, String lastName) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .passwordHash(passwordEncoder.encode("collector123"))
                    .role(RoleType.COLLECTOR)
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();
            user = userRepository.saveAndFlush(user);
            log.info("Created missing collector user: {}", email);
        }

        if (!collectorProfileRepository.existsByUserId(user.getUserId())) {
            User managedUser = entityManager.merge(user);
            CollectorProfile profile = CollectorProfile.builder()
                    .user(managedUser)
                    .status("ACTIVE")
                    .build();
            entityManager.persist(profile);
            entityManager.flush();
            log.info("Created missing collector profile for: {}", email);
        }
    }

    private void ensureEnterpriseExists() {
        if (userRepository.findByEmail("enterprise@example.com").isEmpty()) {
            seedEnterprise();
        }
    }

    private void ensureTasksExist() {
        if (taskRepository.count() == 0) {
            log.info("No tasks found, seeding tasks...");
            seedTasksAndAssignments();
        }
    }
}
