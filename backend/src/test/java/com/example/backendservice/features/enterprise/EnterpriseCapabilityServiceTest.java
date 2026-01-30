package com.example.backendservice.features.enterprise;

import com.example.backendservice.features.enterprise.dto.CapabilityResponse;
import com.example.backendservice.features.enterprise.dto.CreateCapabilityRequest;
import com.example.backendservice.features.enterprise.entity.Enterprise;
import com.example.backendservice.features.enterprise.entity.EnterpriseCapability;
import com.example.backendservice.features.enterprise.repository.EnterpriseCapabilityRepository;
import com.example.backendservice.features.enterprise.repository.EnterpriseRepository;
import com.example.backendservice.features.enterprise.service.EnterpriseCapabilityServiceImpl;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnterpriseCapabilityServiceTest {

    @Mock
    private EnterpriseCapabilityRepository capabilityRepository;

    @Mock
    private EnterpriseRepository enterpriseRepository;

    @Mock
    private ServiceAreaRepository serviceAreaRepository;

    @Mock
    private WasteTypeRepository wasteTypeRepository;

    @InjectMocks
    private EnterpriseCapabilityServiceImpl capabilityService;

    private EnterpriseCapability sampleCapability;
    private Enterprise sampleEnterprise;
    private ServiceArea sampleArea;
    private WasteType sampleWasteType;
    private UUID capabilityId;
    private UUID enterpriseId;
    private UUID areaId;
    private UUID wasteTypeId;

    @BeforeEach
    void setUp() {
        capabilityId = UUID.randomUUID();
        enterpriseId = UUID.randomUUID();
        areaId = UUID.randomUUID();
        wasteTypeId = UUID.randomUUID();

        sampleEnterprise = Enterprise.builder()
                .id(enterpriseId)
                .name("Green Recycling Co.")
                .status("ACTIVE")
                .build();

        sampleArea = ServiceArea.builder()
                .id(areaId)
                .name("District 1")
                .status("ACTIVE")
                .build();

        sampleWasteType = WasteType.builder()
                .id(wasteTypeId)
                .name("Plastic")
                .status("ACTIVE")
                .build();

        sampleCapability = EnterpriseCapability.builder()
                .id(capabilityId)
                .enterprise(sampleEnterprise)
                .area(sampleArea)
                .wasteType(sampleWasteType)
                .dailyCapacityKg(1000.0)
                .usedCapacityKg(200.0)
                .pricePerKg(5.0)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Create Capability Tests")
    class CreateCapabilityTests {

        @Test
        @DisplayName("Should create capability successfully")
        void createCapability_Success() {
            CreateCapabilityRequest request = CreateCapabilityRequest.builder()
                    .areaId(areaId)
                    .wasteTypeId(wasteTypeId)
                    .dailyCapacityKg(500.0)
                    .pricePerKg(3.0)
                    .build();

            when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(sampleEnterprise));
            when(serviceAreaRepository.findById(areaId)).thenReturn(Optional.of(sampleArea));
            when(wasteTypeRepository.findById(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));
            when(capabilityRepository.save(any(EnterpriseCapability.class))).thenReturn(sampleCapability);

            CapabilityResponse response = capabilityService.createCapability(enterpriseId, request);

            assertThat(response).isNotNull();
            assertThat(response.getDailyCapacityKg()).isEqualTo(1000.0);
            verify(capabilityRepository, times(1)).save(any(EnterpriseCapability.class));
        }

        @Test
        @DisplayName("Should throw exception when enterprise not found")
        void createCapability_EnterpriseNotFound() {
            CreateCapabilityRequest request = CreateCapabilityRequest.builder()
                    .areaId(areaId)
                    .wasteTypeId(wasteTypeId)
                    .dailyCapacityKg(500.0)
                    .build();

            UUID randomId = UUID.randomUUID();
            when(enterpriseRepository.findById(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> capabilityService.createCapability(randomId, request))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Enterprise not found");
        }
    }

    @Nested
    @DisplayName("Get Capability Tests")
    class GetCapabilityTests {

        @Test
        @DisplayName("Should get capabilities by enterprise")
        void getCapabilitiesByEnterprise_Success() {
            when(capabilityRepository.findByEnterpriseId(enterpriseId))
                    .thenReturn(List.of(sampleCapability));

            List<CapabilityResponse> result = capabilityService.getCapabilitiesByEnterprise(enterpriseId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getAvailableCapacityKg()).isEqualTo(800.0); // 1000 - 200
        }

        @Test
        @DisplayName("Should get capabilities by area")
        void getCapabilitiesByArea_Success() {
            when(capabilityRepository.findByAreaId(areaId))
                    .thenReturn(List.of(sampleCapability));

            List<CapabilityResponse> result = capabilityService.getCapabilitiesByArea(areaId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getAreaName()).isEqualTo("District 1");
        }
    }

    @Nested
    @DisplayName("Capacity Calculation Tests")
    class CapacityCalculationTests {

        @Test
        @DisplayName("Should calculate available capacity correctly")
        void availableCapacity_Calculate() {
            assertThat(sampleCapability.getAvailableCapacity()).isEqualTo(800.0);
            assertThat(sampleCapability.hasCapacity(500.0)).isTrue();
            assertThat(sampleCapability.hasCapacity(900.0)).isFalse();
        }
    }

    @Nested
    @DisplayName("Reset Capacity Tests")
    class ResetCapacityTests {

        @Test
        @DisplayName("Should reset daily used capacity for all capabilities")
        void resetDailyUsedCapacity_Success() {
            when(capabilityRepository.findAll()).thenReturn(List.of(sampleCapability));

            capabilityService.resetDailyUsedCapacity();

            assertThat(sampleCapability.getUsedCapacityKg()).isEqualTo(0.0);
            verify(capabilityRepository, times(1)).saveAll(anyList());
        }
    }
}
