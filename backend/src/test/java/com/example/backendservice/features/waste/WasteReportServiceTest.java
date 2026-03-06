package com.example.backendservice.features.waste;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.AccountStatus;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.waste.dto.CreateWasteReportRequest;
import com.example.backendservice.features.waste.dto.WasteReportResponse;
import com.example.backendservice.features.waste.entity.WasteReport;
import com.example.backendservice.features.waste.repository.WasteReportRepository;
import com.example.backendservice.features.waste.service.WasteReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WasteReportServiceTest {

    @Mock
    private WasteReportRepository wasteReportRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ServiceAreaRepository serviceAreaRepository;

    @InjectMocks
    private WasteReportServiceImpl wasteReportService;

    private WasteReport sampleReport;
    private User sampleUser;
    private ServiceArea sampleArea;
    private UUID reportId;
    private UUID userId;
    private UUID areaId;

    @BeforeEach
    void setUp() {
        reportId = UUID.randomUUID();
        userId = UUID.randomUUID();
        areaId = UUID.randomUUID();

        sampleUser = User.builder()
                .userId(userId)
                .firstName("Nguyen")
                .lastName("Van A")
                .email("nguyen@example.com")
                .passwordHash("hashedpassword")
                .role(RoleType.CITIZEN)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        sampleArea = ServiceArea.builder()
                .areaId(areaId)
                .name("District 1")
                .isActive(true)
                .build();

        sampleReport = WasteReport.builder()
                .reportId(reportId)
                .reporterUser(sampleUser)
                .area(sampleArea)
                .latitude(10.78)
                .longitude(106.69)
                .description("Clean plastic bottles")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Create Report Tests")
    class CreateReportTests {

        @Test
        @DisplayName("Should create waste report successfully")
        void createReport_Success() {
            CreateWasteReportRequest request = CreateWasteReportRequest.builder()
                    .areaId(areaId)
                    .latitude(10.78)
                    .longitude(106.69)
                    .noteText("Clean plastic")
                    .build();

            when(userRepository.findByUserId(userId)).thenReturn(Optional.of(sampleUser));
            when(serviceAreaRepository.findByAreaId(areaId)).thenReturn(Optional.of(sampleArea));
            when(wasteReportRepository.save(any(WasteReport.class))).thenReturn(sampleReport);

            WasteReportResponse response = wasteReportService.createReport(userId, request);

            assertThat(response).isNotNull();
            assertThat(response.getStatus()).isEqualTo("PENDING");
            assertThat(response.getAreaName()).isEqualTo("District 1");
            verify(wasteReportRepository, times(1)).save(any(WasteReport.class));
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void createReport_UserNotFound() {
            CreateWasteReportRequest request = CreateWasteReportRequest.builder()
                    .areaId(areaId)
                    .latitude(10.78)
                    .longitude(106.69)
                    .build();

            UUID randomUserId = UUID.randomUUID();
            when(userRepository.findByUserId(randomUserId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> wasteReportService.createReport(randomUserId, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("Status Flow Tests")
    class StatusFlowTests {

        @Test
        @DisplayName("Should approve pending report")
        void approveReport_Success() {
            UUID adminId = UUID.randomUUID();
            when(wasteReportRepository.findByReportId(reportId)).thenReturn(Optional.of(sampleReport));
            when(wasteReportRepository.save(any(WasteReport.class))).thenAnswer(invocation -> {
                WasteReport report = invocation.getArgument(0);
                return report;
            });

            WasteReportResponse response = wasteReportService.approveReport(reportId, adminId);

            assertThat(response.getStatus()).isEqualTo("APPROVED");
        }

        @Test
        @DisplayName("Should fail to approve non-pending report")
        void approveReport_InvalidStatus() {
            UUID adminId = UUID.randomUUID();
            sampleReport.setStatus("APPROVED");
            when(wasteReportRepository.findByReportId(reportId)).thenReturn(Optional.of(sampleReport));

            assertThatThrownBy(() -> wasteReportService.approveReport(reportId, adminId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("not in PENDING status");
        }

        @Test
        @DisplayName("Should reject report with reason")
        void rejectReport_Success() {
            UUID adminId = UUID.randomUUID();
            when(wasteReportRepository.findByReportId(reportId)).thenReturn(Optional.of(sampleReport));
            when(wasteReportRepository.save(any(WasteReport.class))).thenAnswer(invocation -> {
                WasteReport report = invocation.getArgument(0);
                return report;
            });

            WasteReportResponse response = wasteReportService.rejectReport(reportId, adminId, "Area not covered");

            assertThat(response.getStatus()).isEqualTo("REJECTED");
        }

        @Test
        @DisplayName("Should mark report as completed")
        void markCompleted_Success() {
            when(wasteReportRepository.findByReportId(reportId)).thenReturn(Optional.of(sampleReport));
            when(wasteReportRepository.save(any(WasteReport.class))).thenAnswer(invocation -> {
                WasteReport report = invocation.getArgument(0);
                return report;
            });

            WasteReportResponse response = wasteReportService.markCompleted(reportId);

            assertThat(response.getStatus()).isEqualTo("COMPLETED");
        }
    }

    @Nested
    @DisplayName("Get Reports Tests")
    class GetReportsTests {

        @Test
        @DisplayName("Should get reports by citizen")
        void getReportsByCitizen_Success() {
            Pageable pageable = PageRequest.of(0, 10);

            when(wasteReportRepository.findByReporterUserId(userId)).thenReturn(List.of(sampleReport));

            Page<WasteReportResponse> result = wasteReportService.getReportsByCitizen(userId, pageable);

            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("Should get reports by status")
        void getReportsByStatus_Success() {
            Pageable pageable = PageRequest.of(0, 10);

            when(wasteReportRepository.findByStatus("PENDING")).thenReturn(List.of(sampleReport));

            Page<WasteReportResponse> result = wasteReportService.getReportsByStatus("PENDING", pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getStatus()).isEqualTo("PENDING");
        }
    }

    @Nested
    @DisplayName("Update Report Tests")
    class UpdateReportTests {

        @Test
        @DisplayName("Should update pending report")
        void updateReport_Success() {
            CreateWasteReportRequest request = CreateWasteReportRequest.builder()
                    .areaId(areaId)
                    .latitude(10.79)
                    .longitude(106.70)
                    .noteText("Updated description")
                    .build();

            when(wasteReportRepository.findByReportId(reportId)).thenReturn(Optional.of(sampleReport));
            when(serviceAreaRepository.findByAreaId(areaId)).thenReturn(Optional.of(sampleArea));
            when(wasteReportRepository.save(any(WasteReport.class))).thenAnswer(invocation -> {
                WasteReport report = invocation.getArgument(0);
                return report;
            });

            WasteReportResponse response = wasteReportService.updateReport(reportId, request);

            assertThat(response).isNotNull();
            verify(wasteReportRepository, times(1)).save(any(WasteReport.class));
        }

        @Test
        @DisplayName("Should fail to update non-pending report")
        void updateReport_InvalidStatus() {
            sampleReport.setStatus("APPROVED");
            CreateWasteReportRequest request = CreateWasteReportRequest.builder()
                    .latitude(10.79)
                    .longitude(106.70)
                    .build();

            when(wasteReportRepository.findByReportId(reportId)).thenReturn(Optional.of(sampleReport));

            assertThatThrownBy(() -> wasteReportService.updateReport(reportId, request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("PENDING status");
        }
    }
}
