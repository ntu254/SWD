package com.example.backendservice.features.enterprise;

import com.example.backendservice.features.enterprise.dto.CreateEnterpriseRequest;
import com.example.backendservice.features.enterprise.dto.EnterpriseResponse;
import com.example.backendservice.features.enterprise.entity.Enterprise;
import com.example.backendservice.features.enterprise.repository.EnterpriseRepository;
import com.example.backendservice.features.enterprise.service.EnterpriseServiceImpl;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
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
class EnterpriseServiceTest {

    @Mock
    private EnterpriseRepository enterpriseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ServiceAreaRepository serviceAreaRepository;

    @InjectMocks
    private EnterpriseServiceImpl enterpriseService;

    private Enterprise sampleEnterprise;
    private User sampleUser;
    private ServiceArea sampleArea;
    private UUID enterpriseId;
    private UUID userId;
    private UUID areaId;

    @BeforeEach
    void setUp() {
        enterpriseId = UUID.randomUUID();
        userId = UUID.randomUUID();
        areaId = UUID.randomUUID();

        sampleUser = User.builder()
                .id(userId)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .build();

        sampleArea = ServiceArea.builder()
                .id(areaId)
                .name("District 1")
                .status("ACTIVE")
                .build();

        sampleEnterprise = Enterprise.builder()
                .id(enterpriseId)
                .name("Green Recycling Co.")
                .description("Leading recycling enterprise")
                .address("123 Green Street")
                .phone("0901234567")
                .email("contact@green.com")
                .owner(sampleUser)
                .primaryArea(sampleArea)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Create Enterprise Tests")
    class CreateEnterpriseTests {

        @Test
        @DisplayName("Should create enterprise successfully")
        void createEnterprise_Success() {
            CreateEnterpriseRequest request = CreateEnterpriseRequest.builder()
                    .name("New Enterprise")
                    .description("A new enterprise")
                    .address("456 New Street")
                    .primaryAreaId(areaId)
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(sampleUser));
            when(serviceAreaRepository.findById(areaId)).thenReturn(Optional.of(sampleArea));
            when(enterpriseRepository.save(any(Enterprise.class))).thenReturn(sampleEnterprise);

            EnterpriseResponse response = enterpriseService.createEnterprise(request, userId);

            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo(sampleEnterprise.getName());
            verify(enterpriseRepository, times(1)).save(any(Enterprise.class));
        }

        @Test
        @DisplayName("Should throw exception when owner not found")
        void createEnterprise_OwnerNotFound() {
            CreateEnterpriseRequest request = CreateEnterpriseRequest.builder()
                    .name("New Enterprise")
                    .build();

            UUID randomUserId = UUID.randomUUID();
            when(userRepository.findById(randomUserId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> enterpriseService.createEnterprise(request, randomUserId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Get Enterprise Tests")
    class GetEnterpriseTests {

        @Test
        @DisplayName("Should get enterprise by id successfully")
        void getEnterpriseById_Success() {
            when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(sampleEnterprise));

            EnterpriseResponse response = enterpriseService.getEnterpriseById(enterpriseId);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(enterpriseId);
            assertThat(response.getName()).isEqualTo("Green Recycling Co.");
        }

        @Test
        @DisplayName("Should get enterprise by owner successfully")
        void getMyEnterprise_Success() {
            when(enterpriseRepository.findByOwnerId(userId)).thenReturn(Optional.of(sampleEnterprise));

            EnterpriseResponse response = enterpriseService.getMyEnterprise(userId);

            assertThat(response).isNotNull();
            assertThat(response.getOwnerId()).isEqualTo(userId);
        }

        @Test
        @DisplayName("Should get all enterprises with pagination")
        void getAllEnterprises_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Enterprise> page = new PageImpl<>(List.of(sampleEnterprise));

            when(enterpriseRepository.findAll(pageable)).thenReturn(page);

            Page<EnterpriseResponse> result = enterpriseService.getAllEnterprises(null, pageable);

            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Status Change Tests")
    class StatusChangeTests {

        @Test
        @DisplayName("Should activate enterprise")
        void activateEnterprise_Success() {
            sampleEnterprise.setStatus("SUSPENDED");
            when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(sampleEnterprise));
            when(enterpriseRepository.save(any(Enterprise.class))).thenReturn(sampleEnterprise);

            enterpriseService.activateEnterprise(enterpriseId);

            assertThat(sampleEnterprise.getStatus()).isEqualTo("ACTIVE");
        }

        @Test
        @DisplayName("Should suspend enterprise")
        void suspendEnterprise_Success() {
            when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(sampleEnterprise));
            when(enterpriseRepository.save(any(Enterprise.class))).thenReturn(sampleEnterprise);

            enterpriseService.suspendEnterprise(enterpriseId);

            assertThat(sampleEnterprise.getStatus()).isEqualTo("SUSPENDED");
        }

        @Test
        @DisplayName("Should soft delete enterprise")
        void deleteEnterprise_Success() {
            when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(sampleEnterprise));
            when(enterpriseRepository.save(any(Enterprise.class))).thenReturn(sampleEnterprise);

            enterpriseService.deleteEnterprise(enterpriseId);

            assertThat(sampleEnterprise.getStatus()).isEqualTo("INACTIVE");
            assertThat(sampleEnterprise.getDeletedAt()).isNotNull();
        }
    }
}
