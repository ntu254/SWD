package com.example.backendservice.features.location;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.location.dto.CreateServiceAreaRequest;
import com.example.backendservice.features.location.dto.ServiceAreaResponse;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.location.service.ServiceAreaServiceImpl;
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
class ServiceAreaServiceTest {

    @Mock
    private ServiceAreaRepository serviceAreaRepository;

    @InjectMocks
    private ServiceAreaServiceImpl serviceAreaService;

    private ServiceArea sampleArea;
    private UUID areaId;

    @BeforeEach
    void setUp() {
        areaId = UUID.randomUUID();

        sampleArea = ServiceArea.builder()
                .areaId(areaId)
                .name("District 1")
                .geoBoundaryWkt("POLYGON((10.77 106.70, 10.77 106.71, 10.78 106.71, 10.78 106.70, 10.77 106.70))")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Create Service Area Tests")
    class CreateServiceAreaTests {

        @Test
        @DisplayName("Should create service area successfully")
        void createServiceArea_Success() {
            CreateServiceAreaRequest request = CreateServiceAreaRequest.builder()
                    .name("New Area")
                    .wardCode("W001")
                    .districtCode("D001")
                    .city("Ho Chi Minh")
                    .geoPolygon("POLYGON((...))")
                    .build();

            when(serviceAreaRepository.save(any(ServiceArea.class))).thenReturn(sampleArea);

            ServiceAreaResponse response = serviceAreaService.createServiceArea(request);

            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo(sampleArea.getName());
            verify(serviceAreaRepository, times(1)).save(any(ServiceArea.class));
        }
    }

    @Nested
    @DisplayName("Get Service Area Tests")
    class GetServiceAreaTests {

        @Test
        @DisplayName("Should get service area by id successfully")
        void getServiceAreaById_Success() {
            when(serviceAreaRepository.findByAreaId(areaId)).thenReturn(Optional.of(sampleArea));

            ServiceAreaResponse response = serviceAreaService.getServiceAreaById(areaId);

            assertThat(response).isNotNull();
            assertThat(response.getAreaId()).isEqualTo(areaId);
            assertThat(response.getName()).isEqualTo("District 1");
        }

        @Test
        @DisplayName("Should throw exception when area not found")
        void getServiceAreaById_NotFound() {
            UUID randomId = UUID.randomUUID();
            when(serviceAreaRepository.findByAreaId(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> serviceAreaService.getServiceAreaById(randomId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should get all service areas with pagination")
        void getAllServiceAreas_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<ServiceArea> page = new PageImpl<>(List.of(sampleArea));

            when(serviceAreaRepository.findAll(pageable)).thenReturn(page);

            Page<ServiceAreaResponse> result = serviceAreaService.getAllServiceAreas(pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("District 1");
        }

        @Test
        @DisplayName("Should get all active service areas")
        void getAllActiveServiceAreas_Success() {
            when(serviceAreaRepository.findAllActive()).thenReturn(List.of(sampleArea));

            List<ServiceAreaResponse> result = serviceAreaService.getAllActiveServiceAreas();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("District 1");
        }
    }

    @Nested
    @DisplayName("Update Service Area Tests")
    class UpdateServiceAreaTests {

        @Test
        @DisplayName("Should update service area successfully")
        void updateServiceArea_Success() {
            CreateServiceAreaRequest request = CreateServiceAreaRequest.builder()
                    .name("Updated Name")
                    .wardCode("W002")
                    .districtCode("D002")
                    .city("Hanoi")
                    .geoPolygon("POLYGON((new...))")
                    .build();

            when(serviceAreaRepository.findByAreaId(areaId)).thenReturn(Optional.of(sampleArea));
            when(serviceAreaRepository.save(any(ServiceArea.class))).thenReturn(sampleArea);

            ServiceAreaResponse response = serviceAreaService.updateServiceArea(areaId, request);

            assertThat(response).isNotNull();
            verify(serviceAreaRepository, times(1)).save(any(ServiceArea.class));
        }
    }

    @Nested
    @DisplayName("Status Change Tests")
    class StatusChangeTests {

        @Test
        @DisplayName("Should activate service area")
        void activateServiceArea_Success() {
            sampleArea.setIsActive(false);
            when(serviceAreaRepository.findByAreaId(areaId)).thenReturn(Optional.of(sampleArea));
            when(serviceAreaRepository.save(any(ServiceArea.class))).thenReturn(sampleArea);

            serviceAreaService.activateServiceArea(areaId);

            assertThat(sampleArea.getIsActive()).isTrue();
            verify(serviceAreaRepository, times(1)).save(sampleArea);
        }

        @Test
        @DisplayName("Should deactivate service area")
        void deactivateServiceArea_Success() {
            when(serviceAreaRepository.findByAreaId(areaId)).thenReturn(Optional.of(sampleArea));
            when(serviceAreaRepository.save(any(ServiceArea.class))).thenReturn(sampleArea);

            serviceAreaService.deactivateServiceArea(areaId);

            assertThat(sampleArea.getIsActive()).isFalse();
            verify(serviceAreaRepository, times(1)).save(sampleArea);
        }
    }
}
