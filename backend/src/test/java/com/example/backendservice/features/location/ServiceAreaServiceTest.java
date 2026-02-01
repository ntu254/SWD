package com.example.backendservice.features.location;

import com.example.backendservice.features.location.dto.CreateServiceAreaRequest;
import com.example.backendservice.features.location.dto.ServiceAreaResponse;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.location.service.ServiceAreaServiceImpl;
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
                .id(areaId)
                .name("District 1")
                .description("Central district")
                .centerLat(10.7769)
                .centerLng(106.7009)
                .radiusKm(5.0)
                .status("ACTIVE")
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
                    .description("A new service area")
                    .centerLat(10.8)
                    .centerLng(106.7)
                    .radiusKm(3.0)
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
            when(serviceAreaRepository.findById(areaId)).thenReturn(Optional.of(sampleArea));

            ServiceAreaResponse response = serviceAreaService.getServiceAreaById(areaId);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(areaId);
            assertThat(response.getName()).isEqualTo("District 1");
        }

        @Test
        @DisplayName("Should throw exception when area not found")
        void getServiceAreaById_NotFound() {
            UUID randomId = UUID.randomUUID();
            when(serviceAreaRepository.findById(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> serviceAreaService.getServiceAreaById(randomId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should get all service areas with pagination")
        void getAllServiceAreas_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<ServiceArea> page = new PageImpl<>(List.of(sampleArea));

            when(serviceAreaRepository.findAll(pageable)).thenReturn(page);

            Page<ServiceAreaResponse> result = serviceAreaService.getAllServiceAreas(null, pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("District 1");
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
                    .description("Updated description")
                    .centerLat(10.9)
                    .centerLng(106.8)
                    .radiusKm(4.0)
                    .build();

            when(serviceAreaRepository.findById(areaId)).thenReturn(Optional.of(sampleArea));
            when(serviceAreaRepository.save(any(ServiceArea.class))).thenReturn(sampleArea);

            ServiceAreaResponse response = serviceAreaService.updateServiceArea(areaId, request);

            assertThat(response).isNotNull();
            verify(serviceAreaRepository, times(1)).save(any(ServiceArea.class));
        }
    }

    @Nested
    @DisplayName("Delete Service Area Tests")
    class DeleteServiceAreaTests {

        @Test
        @DisplayName("Should delete service area successfully")
        void deleteServiceArea_Success() {
            when(serviceAreaRepository.findById(areaId)).thenReturn(Optional.of(sampleArea));
            doNothing().when(serviceAreaRepository).delete(any(ServiceArea.class));

            serviceAreaService.deleteServiceArea(areaId);

            verify(serviceAreaRepository, times(1)).delete(sampleArea);
        }
    }

    @Nested
    @DisplayName("Status Change Tests")
    class StatusChangeTests {

        @Test
        @DisplayName("Should activate service area")
        void activateServiceArea_Success() {
            sampleArea.setStatus("INACTIVE");
            when(serviceAreaRepository.findById(areaId)).thenReturn(Optional.of(sampleArea));
            when(serviceAreaRepository.save(any(ServiceArea.class))).thenReturn(sampleArea);

            serviceAreaService.activateServiceArea(areaId);

            assertThat(sampleArea.getStatus()).isEqualTo("ACTIVE");
            verify(serviceAreaRepository, times(1)).save(sampleArea);
        }

        @Test
        @DisplayName("Should deactivate service area")
        void deactivateServiceArea_Success() {
            when(serviceAreaRepository.findById(areaId)).thenReturn(Optional.of(sampleArea));
            when(serviceAreaRepository.save(any(ServiceArea.class))).thenReturn(sampleArea);

            serviceAreaService.deactivateServiceArea(areaId);

            assertThat(sampleArea.getStatus()).isEqualTo("INACTIVE");
            verify(serviceAreaRepository, times(1)).save(sampleArea);
        }
    }
}
