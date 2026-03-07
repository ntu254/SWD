package com.example.backendservice.common.config;

import com.example.backendservice.features.settings.entity.SystemSetting;
import com.example.backendservice.features.settings.repository.SystemSettingRepository;
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
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.collection.entity.CollectionVisit;
import com.example.backendservice.features.collection.repository.CollectionVisitRepository;
import com.example.backendservice.features.collector.entity.CollectorKpiDaily;
import com.example.backendservice.features.collector.entity.CollectorKpiStatus;
import com.example.backendservice.features.collector.repository.CollectorKpiDailyRepository;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import com.example.backendservice.features.reward.entity.CitizenRewardRule;
import com.example.backendservice.features.reward.repository.CitizenRewardRuleRepository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Configuration
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.seeder.enabled", havingValue = "true", matchIfMissing = false)
public class DataSeeder {

    private final UserRepository userRepository;
    private final com.example.backendservice.features.user.repository.CitizenProfileRepository citizenProfileRepository;
    private final com.example.backendservice.features.user.repository.CollectorProfileRepository collectorProfileRepository;
    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final ComplaintRepository complaintRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final CollectionVisitRepository collectionVisitRepository;
    private final CollectorKpiDailyRepository collectorKpiDailyRepository;
    private final WasteTypeRepository wasteTypeRepository;
    private final CitizenRewardRuleRepository citizenRewardRuleRepository;
    private final SystemSettingRepository systemSettingRepository;
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
                    seedRoles();
                    seedAdmin();
                    seedCitizens();
                    seedEnterprise();
                    seedCollectors();
                    seedWasteTypes();
                    seedRewardRules();
                    seedServiceAreas();
                    seedTasksAndAssignments();
                    seedComplaints();
                    seedSystemSettings();
                    log.info("=== Sample data seeded successfully! ===");
                } else {
                    log.info("Data already exists. Checking for missing data...");
                    ensureCollectorsExist();
                    ensureEnterpriseExists();
                    seedServiceAreas();
                    ensureTasksExist();
                    seedSystemSettings();
                    log.info("Data check complete.");
                }
            } catch (Exception e) {
                log.error("Error during data seeding: {}", e.getMessage(), e);
                status.setRollbackOnly();
            }
        });
    }

    private void seedRoles() {
        // Roles are enums in current implementation
    }

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

    private void seedWasteTypes() {
        if (wasteTypeRepository.count() == 0) {
            wasteTypeRepository.save(WasteType.builder().name("Nhựa").description("Chai lọ nhựa, túi nilon").isRecyclable(true).build());
            wasteTypeRepository.save(WasteType.builder().name("Giấy").description("Báo chí, bìa carton").isRecyclable(true).build());
            wasteTypeRepository.save(WasteType.builder().name("Kim loại").description("Lon nước, sắt thép").isRecyclable(true).build());
            wasteTypeRepository.save(WasteType.builder().name("Thủy tinh").description("Chai lọ thủy tinh").isRecyclable(true).build());
            wasteTypeRepository.save(WasteType.builder().name("Hữu cơ").description("Thức ăn thừa, lá cây").isRecyclable(false).build());
            wasteTypeRepository.save(WasteType.builder().name("Nguy hại").description("Pin, bóng đèn, hóa chất").isRecyclable(false).isActive(true).build());
            wasteTypeRepository.flush();
            log.info("Seeded waste types");
        }
    }

    private void seedRewardRules() {
        if (citizenRewardRuleRepository.count() == 0) {
            WasteType nhua = wasteTypeRepository.findByName("Nhựa").orElse(null);
            WasteType huuCo = wasteTypeRepository.findByName("Hữu cơ").orElse(null);
            
            if (nhua != null) {
                citizenRewardRuleRepository.save(CitizenRewardRule.builder()
                    .wasteType(nhua).sortingLevel("GOOD").pointsPerKg(10.0).isActive(true).build());
            }
            if (huuCo != null) {
                citizenRewardRuleRepository.save(CitizenRewardRule.builder()
                    .wasteType(huuCo).sortingLevel("GOOD").pointsPerKg(5.0).isActive(true).build());
            }
            citizenRewardRuleRepository.flush();
            log.info("Seeded reward rules");
        }
    }

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

    private void seedTasksAndAssignments() {
        User enterprise = userRepository.findByEmail("enterprise@example.com").orElse(null);
        User admin = userRepository.findByEmail("admin@example.com").orElse(null);
        User collector1 = userRepository.findByEmail("collector1@example.com").orElse(null);
        ServiceArea district1 = serviceAreaRepository.findByName("District 1").orElse(null);

        if (enterprise != null && admin != null && collector1 != null && district1 != null) {
            createTaskWithAssignment(enterprise, admin, collector1, district1,
                    LocalDate.now(), "NORMAL", TaskStatus.ASSIGNED,
                    TaskAssignmentStatus.ASSIGNED, "Pickup at 123 Main Street");
        }
    }

    private void createTaskWithAssignment(User enterprise, User creator, User collector,
            ServiceArea area, LocalDate scheduledDate, String priority, TaskStatus taskStatus,
            TaskAssignmentStatus assignmentStatus, String note) {
        Task task = Task.builder()
                .enterpriseUser(enterprise)
                .createdByUser(creator)
                .area(area)
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
        taskAssignmentRepository.saveAndFlush(assignment);
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

    private void seedComplaints() {
        User citizen1 = userRepository.findByEmail("john@example.com").orElse(null);
        if (citizen1 != null) {
            complaintRepository.saveAndFlush(Complaint.builder()
                    .createdByUser(citizen1)
                    .title("Points not credited")
                    .content("I collected 5kg but no points.")
                    .category(ComplaintCategory.POINTS_ERROR)
                    .priority(ComplaintPriority.High)
                    .status(ComplaintStatus.Pending)
                    .build());
        }
    }

    private void ensureCollectorsExist() {
        ensureSingleCollectorExists("collector1@example.com", "Mike", "Collector");
        ensureSingleCollectorExists("collector2@example.com", "Sarah", "Driver");
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
        }
        if (!collectorProfileRepository.existsByUserId(user.getUserId())) {
            CollectorProfile profile = CollectorProfile.builder()
                    .user(user)
                    .status("ACTIVE")
                    .build();
            collectorProfileRepository.saveAndFlush(profile);
        }
    }

    private void ensureEnterpriseExists() {
        if (userRepository.findByEmail("enterprise@example.com").isEmpty()) {
            seedEnterprise();
        }
    }

    private void ensureTasksExist() {
        if (taskRepository.count() == 0) {
            seedTasksAndAssignments();
        }
    }

    private void seedSystemSettings() {
        if (systemSettingRepository.count() == 0) {
            log.info("Seeding default system settings...");
            List<SystemSetting> settings = List.of(
                SystemSetting.builder().key("COLLECTOR_BONUS_POINTS").value("100").description("Bonus points for collectors meeting daily KPI").dataType("NUMBER").build(),
                SystemSetting.builder().key("MIN_WEIGHT_FOR_POINTS").value("1.0").description("Minimum weight in KG to award points to citizen").dataType("NUMBER").build(),
                SystemSetting.builder().key("AI_CLASSIFICATION_ENABLED").value("true").description("Enable/Disable AI waste classification").dataType("BOOLEAN").build(),
                SystemSetting.builder().key("GEMINI_MODEL_NAME").value("gemini-3-flash-preview").description("Gemini model to use for AI features").dataType("STRING").build()
            );
            systemSettingRepository.saveAllAndFlush(settings);
        }
    }
}