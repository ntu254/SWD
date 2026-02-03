package com.example.backendservice.features.waste;

import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.user.entity.CitizenProfile;
import com.example.backendservice.features.user.repository.CitizenProfileRepository;
import com.example.backendservice.features.waste.dto.CreateWasteReportRequest;
import com.example.backendservice.features.waste.dto.WasteReportResponse;
import com.example.backendservice.features.waste.entity.WasteReport;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteReportRepository;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import com.example.backendservice.features.waste.service.WasteReportServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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
    private CitizenProfileRepository citizenProfileRepository;
    @Mock
    private ServiceAreaRepository serviceAreaRepository;
    @Mock
    private WasteTypeRepository wasteTypeRepository;

    @InjectMocks
    private WasteReportServiceImpl wasteReportService;

    private WasteReport sampleReport;
    private CitizenProfile sampleCitizen;
    private ServiceArea sampleArea;
    private WasteType sampleWasteType;
    private UUID reportId;
    private UUID citizenId;
    private UUID areaId;
    private UUID wasteTypeId;

    @BeforeEach
    void setUp() {
        reportId = UUID.randomUUID();
        citizenId = UUID.randomUUID();
        areaId = UUID.randomUUID();
        wasteTypeId = UUID.randomUUID();

        // Use composition pattern - create User first, then CitizenProfile with User
        // reference
        com.example.backendservice.features.user.entity.User citizenUser = com.example.backendservice.features.user.entity.User
                .builder()
                .id(citizenId)
                .firstName("Nguyen")
                .lastName("Van A")
                .email("nguyen@example.com")
                .password("password")
                .enabled(true)
                .build();

        sampleCitizen = CitizenProfile.builder()
                .id(UUID.randomUUID())
                .user(citizenUser)
                .currentPoints(100)
                .build();

        sampleArea = ServiceArea.builder()
                .id(areaId)
                .name("District 1")
                .status("ACTIVE")
                .build();

        sampleWasteType = WasteType.builder()
                .id(wasteTypeId)
                .name("Plastic")
                .basePointsPerKg(10.0)
                .status("ACTIVE")
                .build();

        sampleReport = WasteReport.builder()
                .id(reportId)
                .citizen(sampleCitizen)
                .area(sampleArea)
                .primaryWasteType(sampleWasteType)
                .estimatedWeightKg(15.0)
                .locationText("Apartment 502, Building ABC")
                .lat(10.78)
                .lng(106.69)
                .description("Clean plastic bottles")
                .status("PENDING")
                .priority("NORMAL")
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
                    .citizenId(citizenId)
                    .areaId(areaId)
                    .primaryWasteTypeId(wasteTypeId)
                    .estimatedWeightKg(15.0)
                    .locationText("Apartment 502")
                    .description("Clean plastic")
                    .priority("NORMAL")
                    .build();

            when(citizenProfileRepository.findById(citizenId)).thenReturn(Optional.of(sampleCitizen));
            when(serviceAreaRepository.findById(areaId)).thenReturn(Optional.of(sampleArea));
            when(wasteTypeRepository.findById(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));
            when(wasteReportRepository.save(any(WasteReport.class))).thenReturn(sampleReport);

            WasteReportResponse response = wasteReportService.createReport(request);

            assertThat(response).isNotNull();
            assertThat(response.getStatus()).isEqualTo("PENDING");
            assertThat(response.getAreaName()).isEqualTo("District 1");
            verify(wasteReportRepository, times(1)).save(any(WasteReport.class));
        }

        @Test
        @DisplayName("Should throw exception when citizen not found")
        void createReport_CitizenNotFound() {
            CreateWasteReportRequest request = CreateWasteReportRequest.builder()
                    .citizenId(UUID.randomUUID())
                    .build();

            when(citizenProfileRepository.findById(any())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> wasteReportService.createReport(request))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Citizen not found");
        }
    }

    @Nested
    @DisplayName("Status Flow Tests")
    class StatusFlowTests {

        @Test
        @DisplayName("Should accept pending report")
        void acceptReport_Success() {
            when(wasteReportRepository.findById(reportId)).thenReturn(Optional.of(sampleReport));
            when(wasteReportRepository.save(any(WasteReport.class))).thenReturn(sampleReport);

            WasteReportResponse response = wasteReportService.acceptReport(reportId);

            assertThat(response.getStatus()).isEqualTo("ACCEPTED");
        }

        @Test
        @DisplayName("Should fail to accept non-pending report")
        void acceptReport_InvalidStatus() {
            sampleReport.setStatus("ACCEPTED");
            when(wasteReportRepository.findById(reportId)).thenReturn(Optional.of(sampleReport));

            assertThatThrownBy(() -> wasteReportService.acceptReport(reportId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only PENDING reports can be accepted");
        }

        @Test
        @DisplayName("Should reject report with reason")
        void rejectReport_Success() {
            when(wasteReportRepository.findById(reportId)).thenReturn(Optional.of(sampleReport));
            when(wasteReportRepository.save(any(WasteReport.class))).thenReturn(sampleReport);

            WasteReportResponse response = wasteReportService.rejectReport(reportId, "Area not covered");

            assertThat(response.getStatus()).isEqualTo("REJECTED");
            assertThat(sampleReport.getRejectionReason()).isEqualTo("Area not covered");
        }

        @Test
        @DisplayName("Should cancel report by citizen")
        void cancelReport_Success() {
            when(wasteReportRepository.findById(reportId)).thenReturn(Optional.of(sampleReport));
            when(wasteReportRepository.save(any(WasteReport.class))).thenReturn(sampleReport);

            WasteReportResponse response = wasteReportService.cancelReport(reportId);

            assertThat(response.getStatus()).isEqualTo("CANCELLED");
        }
    }

    @Nested
    @DisplayName("Get Reports Tests")
    class GetReportsTests {

        @Test
        @DisplayName("Should get reports by citizen")
        void getReportsByCitizen_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<WasteReport> reportPage = new PageImpl<>(List.of(sampleReport));

            when(wasteReportRepository.findByCitizenId(citizenId, pageable)).thenReturn(reportPage);

            Page<WasteReportResponse> result = wasteReportService.getReportsByCitizen(citizenId, pageable);

            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("Should get pending reports")
        void getPendingReports_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<WasteReport> reportPage = new PageImpl<>(List.of(sampleReport));

            when(wasteReportRepository.findByStatus("PENDING", pageable)).thenReturn(reportPage);

            Page<WasteReportResponse> result = wasteReportService.getPendingReports(pageable);

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
                    .citizenId(citizenId)
                    .estimatedWeightKg(20.0)
                    .locationText("Updated location")
                    .build();

            when(wasteReportRepository.findById(reportId)).thenReturn(Optional.of(sampleReport));
            when(wasteReportRepository.save(any(WasteReport.class))).thenReturn(sampleReport);

            wasteReportService.updateReport(reportId, request);

            assertThat(sampleReport.getEstimatedWeightKg()).isEqualTo(20.0);
            assertThat(sampleReport.getLocationText()).isEqualTo("Updated location");
        }

        @Test
        @DisplayName("Should fail to update non-pending report")
        void updateReport_InvalidStatus() {
            sampleReport.setStatus("ACCEPTED");
            CreateWasteReportRequest request = CreateWasteReportRequest.builder()
                    .estimatedWeightKg(20.0)
                    .build();

            when(wasteReportRepository.findById(reportId)).thenReturn(Optional.of(sampleReport));

            assertThatThrownBy(() -> wasteReportService.updateReport(reportId, request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only PENDING reports can be updated");
        }
    }
}
