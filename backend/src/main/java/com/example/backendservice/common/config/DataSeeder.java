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
            // === Rác tái chế (Recyclable) ===
            wasteTypeRepository.save(WasteType.builder()
                .name("Nhựa").description("Chai nhựa PET, can nhựa HDPE, túi nilon, hộp nhựa PP, ống hút nhựa, đồ nhựa gia dụng")
                .isRecyclable(true).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Giấy & Carton").description("Báo cũ, tạp chí, sách vở, bìa carton, hộp giấy, giấy văn phòng, giấy gói hàng")
                .isRecyclable(true).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Kim loại").description("Lon nhôm, lon sắt, vỏ hộp thiếc, dây đồng, sắt thép phế liệu, nắp kim loại")
                .isRecyclable(true).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Thủy tinh").description("Chai lọ thủy tinh, ly thủy tinh, kính vỡ, gương vỡ")
                .isRecyclable(true).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Vải & Quần áo cũ").description("Quần áo cũ, khăn, chăn, ga trải giường, rèm cửa, giày dép vải")
                .isRecyclable(true).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Cao su").description("Lốp xe cũ, dép cao su, găng tay cao su, ống cao su")
                .isRecyclable(true).build());

            // === Rác hữu cơ (Organic) ===
            wasteTypeRepository.save(WasteType.builder()
                .name("Hữu cơ thực phẩm").description("Thức ăn thừa, vỏ trái cây, rau củ hư, bã cà phê, vỏ trứng, xương động vật")
                .isRecyclable(false).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Rác vườn").description("Lá cây rụng, cành cây khô, cỏ cắt, hoa héo, mùn cưa, vỏ dừa")
                .isRecyclable(false).build());

            // === Rác nguy hại (Hazardous) ===
            wasteTypeRepository.save(WasteType.builder()
                .name("Nguy hại").description("Pin, ắc quy, bóng đèn huỳnh quang, hóa chất, thuốc trừ sâu, sơn, dầu nhớt thải")
                .isRecyclable(false).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Rác y tế").description("Kim tiêm, bông băng đã sử dụng, thuốc hết hạn, khẩu trang y tế, test kit")
                .isRecyclable(false).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Rác điện tử (E-waste)").description("Điện thoại cũ, máy tính hỏng, TV cũ, linh kiện điện tử, dây cáp, sạc cũ, bảng mạch")
                .isRecyclable(true).build());

            // === Rác khác ===
            wasteTypeRepository.save(WasteType.builder()
                .name("Rác xây dựng").description("Gạch vỡ, bê tông, vữa, ngói, đá, gỗ xây dựng, ống nước PVC")
                .isRecyclable(false).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Rác cồng kềnh").description("Nệm cũ, sofa cũ, tủ lạnh hỏng, máy giặt cũ, bàn ghế gỗ, xe đạp hỏng")
                .isRecyclable(false).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Rác sinh hoạt tổng hợp").description("Rác sinh hoạt hàng ngày không phân loại được, tã lót, băng vệ sinh, khăn giấy đã sử dụng")
                .isRecyclable(false).build());
            wasteTypeRepository.save(WasteType.builder()
                .name("Khác").description("Các loại rác không thuộc phân loại trên, cần kiểm tra để phân loại chính xác")
                .isRecyclable(false).build());

            wasteTypeRepository.flush();
            log.info("Seeded {} waste types", wasteTypeRepository.count());
        }
    }

    private void seedRewardRules() {
        if (citizenRewardRuleRepository.count() == 0) {
            WasteType nhua = wasteTypeRepository.findByName("Nhựa").orElse(null);
            WasteType giay = wasteTypeRepository.findByName("Giấy & Carton").orElse(null);
            WasteType kimLoai = wasteTypeRepository.findByName("Kim loại").orElse(null);
            WasteType thuyTinh = wasteTypeRepository.findByName("Thủy tinh").orElse(null);
            WasteType vai = wasteTypeRepository.findByName("Vải & Quần áo cũ").orElse(null);
            WasteType huuCo = wasteTypeRepository.findByName("Hữu cơ thực phẩm").orElse(null);
            WasteType eWaste = wasteTypeRepository.findByName("Rác điện tử (E-waste)").orElse(null);
            WasteType racVuon = wasteTypeRepository.findByName("Rác vườn").orElse(null);

            // Rác tái chế được thưởng điểm cao hơn
            saveRewardRule(nhua, "GOOD", 10.0);
            saveRewardRule(nhua, "AVERAGE", 6.0);
            saveRewardRule(giay, "GOOD", 8.0);
            saveRewardRule(giay, "AVERAGE", 5.0);
            saveRewardRule(kimLoai, "GOOD", 15.0);
            saveRewardRule(kimLoai, "AVERAGE", 10.0);
            saveRewardRule(thuyTinh, "GOOD", 7.0);
            saveRewardRule(vai, "GOOD", 5.0);
            saveRewardRule(eWaste, "GOOD", 20.0);

            // Rác hữu cơ, vườn - thưởng thấp hơn
            saveRewardRule(huuCo, "GOOD", 5.0);
            saveRewardRule(huuCo, "AVERAGE", 3.0);
            saveRewardRule(racVuon, "GOOD", 4.0);

            citizenRewardRuleRepository.flush();
            log.info("Seeded reward rules");
        }
    }

    private void saveRewardRule(WasteType wasteType, String sortingLevel, double pointsPerKg) {
        if (wasteType != null) {
            citizenRewardRuleRepository.save(CitizenRewardRule.builder()
                .wasteType(wasteType).sortingLevel(sortingLevel).pointsPerKg(pointsPerKg).isActive(true).build());
        }
    }

    private void seedServiceAreas() {
        if (serviceAreaRepository.count() == 0) {
            // ===== TP. Hồ Chí Minh =====
            createServiceArea("Quận 1, TP.HCM",
                "POLYGON((106.6938 10.7769, 106.7050 10.7769, 106.7050 10.7650, 106.6938 10.7650, 106.6938 10.7769))");
            createServiceArea("Quận 3, TP.HCM",
                "POLYGON((106.6750 10.7850, 106.6900 10.7850, 106.6900 10.7730, 106.6750 10.7730, 106.6750 10.7850))");
            createServiceArea("Quận 4, TP.HCM",
                "POLYGON((106.6950 10.7640, 106.7080 10.7640, 106.7080 10.7520, 106.6950 10.7520, 106.6950 10.7640))");
            createServiceArea("Quận 5, TP.HCM",
                "POLYGON((106.6540 10.7580, 106.6700 10.7580, 106.6700 10.7470, 106.6540 10.7470, 106.6540 10.7580))");
            createServiceArea("Quận 6, TP.HCM",
                "POLYGON((106.6270 10.7530, 106.6480 10.7530, 106.6480 10.7390, 106.6270 10.7390, 106.6270 10.7530))");
            createServiceArea("Quận 7, TP.HCM",
                "POLYGON((106.7000 10.7500, 106.7400 10.7500, 106.7400 10.7200, 106.7000 10.7200, 106.7000 10.7500))");
            createServiceArea("Quận 8, TP.HCM",
                "POLYGON((106.6200 10.7400, 106.6600 10.7400, 106.6600 10.7150, 106.6200 10.7150, 106.6200 10.7400))");
            createServiceArea("Quận 10, TP.HCM",
                "POLYGON((106.6580 10.7800, 106.6730 10.7800, 106.6730 10.7680, 106.6580 10.7680, 106.6580 10.7800))");
            createServiceArea("Quận 11, TP.HCM",
                "POLYGON((106.6340 10.7700, 106.6530 10.7700, 106.6530 10.7560, 106.6340 10.7560, 106.6340 10.7700))");
            createServiceArea("Quận 12, TP.HCM",
                "POLYGON((106.6200 10.8800, 106.6800 10.8800, 106.6800 10.8300, 106.6200 10.8300, 106.6200 10.8800))");
            createServiceArea("Quận Bình Tân, TP.HCM",
                "POLYGON((106.5800 10.7700, 106.6200 10.7700, 106.6200 10.7300, 106.5800 10.7300, 106.5800 10.7700))");
            createServiceArea("Quận Bình Thạnh, TP.HCM",
                "POLYGON((106.6900 10.8100, 106.7200 10.8100, 106.7200 10.7800, 106.6900 10.7800, 106.6900 10.8100))");
            createServiceArea("Quận Gò Vấp, TP.HCM",
                "POLYGON((106.6400 10.8500, 106.6800 10.8500, 106.6800 10.8150, 106.6400 10.8150, 106.6400 10.8500))");
            createServiceArea("Quận Phú Nhuận, TP.HCM",
                "POLYGON((106.6700 10.8050, 106.6900 10.8050, 106.6900 10.7900, 106.6700 10.7900, 106.6700 10.8050))");
            createServiceArea("Quận Tân Bình, TP.HCM",
                "POLYGON((106.6300 10.8100, 106.6650 10.8100, 106.6650 10.7750, 106.6300 10.7750, 106.6300 10.8100))");
            createServiceArea("Quận Tân Phú, TP.HCM",
                "POLYGON((106.6100 10.8000, 106.6400 10.8000, 106.6400 10.7700, 106.6100 10.7700, 106.6100 10.8000))");
            createServiceArea("TP. Thủ Đức, TP.HCM",
                "POLYGON((106.7200 10.8800, 106.8000 10.8800, 106.8000 10.7700, 106.7200 10.7700, 106.7200 10.8800))");
            createServiceArea("Huyện Bình Chánh, TP.HCM",
                "POLYGON((106.4800 10.7300, 106.5900 10.7300, 106.5900 10.6400, 106.4800 10.6400, 106.4800 10.7300))");
            createServiceArea("Huyện Củ Chi, TP.HCM",
                "POLYGON((106.4500 10.9800, 106.6200 10.9800, 106.6200 10.8800, 106.4500 10.8800, 106.4500 10.9800))");
            createServiceArea("Huyện Hóc Môn, TP.HCM",
                "POLYGON((106.5800 10.9000, 106.6500 10.9000, 106.6500 10.8500, 106.5800 10.8500, 106.5800 10.9000))");
            createServiceArea("Huyện Nhà Bè, TP.HCM",
                "POLYGON((106.6800 10.7100, 106.7500 10.7100, 106.7500 10.6500, 106.6800 10.6500, 106.6800 10.7100))");
            createServiceArea("Huyện Cần Giờ, TP.HCM",
                "POLYGON((106.7300 10.5500, 106.9500 10.5500, 106.9500 10.3500, 106.7300 10.3500, 106.7300 10.5500))");

            // ===== Hà Nội =====
            createServiceArea("Quận Hoàn Kiếm, Hà Nội",
                "POLYGON((105.8450 21.0350, 105.8600 21.0350, 105.8600 21.0230, 105.8450 21.0230, 105.8450 21.0350))");
            createServiceArea("Quận Ba Đình, Hà Nội",
                "POLYGON((105.8100 21.0450, 105.8400 21.0450, 105.8400 21.0280, 105.8100 21.0280, 105.8100 21.0450))");
            createServiceArea("Quận Đống Đa, Hà Nội",
                "POLYGON((105.8180 21.0280, 105.8420 21.0280, 105.8420 21.0100, 105.8180 21.0100, 105.8180 21.0280))");
            createServiceArea("Quận Hai Bà Trưng, Hà Nội",
                "POLYGON((105.8480 21.0250, 105.8700 21.0250, 105.8700 21.0030, 105.8480 21.0030, 105.8480 21.0250))");
            createServiceArea("Quận Cầu Giấy, Hà Nội",
                "POLYGON((105.7700 21.0400, 105.8100 21.0400, 105.8100 21.0100, 105.7700 21.0100, 105.7700 21.0400))");
            createServiceArea("Quận Thanh Xuân, Hà Nội",
                "POLYGON((105.8000 21.0100, 105.8250 21.0100, 105.8250 20.9900, 105.8000 20.9900, 105.8000 21.0100))");
            createServiceArea("Quận Hoàng Mai, Hà Nội",
                "POLYGON((105.8400 21.0050, 105.8800 21.0050, 105.8800 20.9700, 105.8400 20.9700, 105.8400 21.0050))");
            createServiceArea("Quận Long Biên, Hà Nội",
                "POLYGON((105.8600 21.0600, 105.9200 21.0600, 105.9200 21.0200, 105.8600 21.0200, 105.8600 21.0600))");
            createServiceArea("Quận Tây Hồ, Hà Nội",
                "POLYGON((105.8050 21.0600, 105.8500 21.0600, 105.8500 21.0400, 105.8050 21.0400, 105.8050 21.0600))");
            createServiceArea("Quận Nam Từ Liêm, Hà Nội",
                "POLYGON((105.7400 21.0350, 105.7800 21.0350, 105.7800 21.0050, 105.7400 21.0050, 105.7400 21.0350))");
            createServiceArea("Quận Bắc Từ Liêm, Hà Nội",
                "POLYGON((105.7300 21.0700, 105.7800 21.0700, 105.7800 21.0350, 105.7300 21.0350, 105.7300 21.0700))");
            createServiceArea("Quận Hà Đông, Hà Nội",
                "POLYGON((105.7400 20.9900, 105.7800 20.9900, 105.7800 20.9500, 105.7400 20.9500, 105.7400 20.9900))");

            // ===== Đà Nẵng =====
            createServiceArea("Quận Hải Châu, Đà Nẵng",
                "POLYGON((108.2050 16.0750, 108.2300 16.0750, 108.2300 16.0500, 108.2050 16.0500, 108.2050 16.0750))");
            createServiceArea("Quận Thanh Khê, Đà Nẵng",
                "POLYGON((108.1750 16.0800, 108.2050 16.0800, 108.2050 16.0600, 108.1750 16.0600, 108.1750 16.0800))");
            createServiceArea("Quận Sơn Trà, Đà Nẵng",
                "POLYGON((108.2200 16.1100, 108.2600 16.1100, 108.2600 16.0700, 108.2200 16.0700, 108.2200 16.1100))");
            createServiceArea("Quận Ngũ Hành Sơn, Đà Nẵng",
                "POLYGON((108.2400 16.0500, 108.2700 16.0500, 108.2700 16.0100, 108.2400 16.0100, 108.2400 16.0500))");
            createServiceArea("Quận Liên Chiểu, Đà Nẵng",
                "POLYGON((108.1200 16.1200, 108.1700 16.1200, 108.1700 16.0700, 108.1200 16.0700, 108.1200 16.1200))");
            createServiceArea("Quận Cẩm Lệ, Đà Nẵng",
                "POLYGON((108.1900 16.0500, 108.2200 16.0500, 108.2200 16.0200, 108.1900 16.0200, 108.1900 16.0500))");

            serviceAreaRepository.flush();
            log.info("Seeded {} service areas (TP.HCM, Hà Nội, Đà Nẵng)", serviceAreaRepository.count());
        }
    }

    private ServiceArea createServiceArea(String name, String geoBoundaryWkt) {
        return serviceAreaRepository.findByName(name)
                .orElseGet(() -> serviceAreaRepository.saveAndFlush(ServiceArea.builder()
                        .name(name)
                        .geoBoundaryWkt(geoBoundaryWkt)
                        .isActive(true)
                        .build()));
    }

    private void seedTasksAndAssignments() {
        User enterprise = userRepository.findByEmail("enterprise@example.com").orElse(null);
        User admin = userRepository.findByEmail("admin@example.com").orElse(null);
        User collector1 = userRepository.findByEmail("collector1@example.com").orElse(null);
        ServiceArea district1 = serviceAreaRepository.findByName("Quận 1, TP.HCM").orElse(null);

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