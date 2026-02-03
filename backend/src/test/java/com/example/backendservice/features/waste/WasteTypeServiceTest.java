package com.example.backendservice.features.waste;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.waste.dto.CreateWasteTypeRequest;
import com.example.backendservice.features.waste.dto.WasteTypeResponse;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import com.example.backendservice.features.waste.service.WasteTypeServiceImpl;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WasteTypeServiceTest {

    @Mock
    private WasteTypeRepository wasteTypeRepository;

    @InjectMocks
    private WasteTypeServiceImpl wasteTypeService;

    private WasteType sampleWasteType;
    private UUID wasteTypeId;

    @BeforeEach
    void setUp() {
        wasteTypeId = UUID.randomUUID();

        sampleWasteType = WasteType.builder()
                .wasteTypeId(wasteTypeId)
                .name("Plastic")
                .description("Recyclable plastic materials")
                .isRecyclable(true)
                .isActive(true)
                .build();
    }

    @Nested
    @DisplayName("Create Waste Type Tests")
    class CreateWasteTypeTests {

        @Test
        @DisplayName("Should create waste type successfully")
        void createWasteType_Success() {
            CreateWasteTypeRequest request = CreateWasteTypeRequest.builder()
                    .name("Paper")
                    .description("Recyclable paper")
                    .build();

            when(wasteTypeRepository.existsByName("Paper")).thenReturn(false);
            when(wasteTypeRepository.save(any(WasteType.class))).thenReturn(sampleWasteType);

            WasteTypeResponse response = wasteTypeService.createWasteType(request);

            assertThat(response).isNotNull();
            verify(wasteTypeRepository, times(1)).save(any(WasteType.class));
        }

        @Test
        @DisplayName("Should throw exception when name already exists")
        void createWasteType_DuplicateName() {
            CreateWasteTypeRequest request = CreateWasteTypeRequest.builder()
                    .name("Plastic")
                    .build();

            when(wasteTypeRepository.existsByName("Plastic")).thenReturn(true);

            assertThatThrownBy(() -> wasteTypeService.createWasteType(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("already exists");
        }
    }

    @Nested
    @DisplayName("Get Waste Type Tests")
    class GetWasteTypeTests {

        @Test
        @DisplayName("Should get waste type by id successfully")
        void getWasteTypeById_Success() {
            when(wasteTypeRepository.findByWasteTypeId(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));

            WasteTypeResponse response = wasteTypeService.getWasteTypeById(wasteTypeId);

            assertThat(response).isNotNull();
            assertThat(response.getTypeId()).isEqualTo(wasteTypeId);
            assertThat(response.getName()).isEqualTo("Plastic");
        }

        @Test
        @DisplayName("Should throw exception when waste type not found")
        void getWasteTypeById_NotFound() {
            UUID randomId = UUID.randomUUID();
            when(wasteTypeRepository.findByWasteTypeId(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> wasteTypeService.getWasteTypeById(randomId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should get all active waste types")
        void getAllActiveWasteTypes_Success() {
            when(wasteTypeRepository.findAllActive()).thenReturn(List.of(sampleWasteType));

            List<WasteTypeResponse> result = wasteTypeService.getAllActiveWasteTypes();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Plastic");
        }

        @Test
        @DisplayName("Should get all waste types with pagination")
        void getAllWasteTypes_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<WasteType> page = new PageImpl<>(List.of(sampleWasteType));

            when(wasteTypeRepository.findAll(pageable)).thenReturn(page);

            Page<WasteTypeResponse> result = wasteTypeService.getAllWasteTypes(pageable);

            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Update Waste Type Tests")
    class UpdateWasteTypeTests {

        @Test
        @DisplayName("Should update waste type successfully")
        void updateWasteType_Success() {
            CreateWasteTypeRequest request = CreateWasteTypeRequest.builder()
                    .name("Updated Plastic")
                    .description("Updated description")
                    .build();

            when(wasteTypeRepository.findByWasteTypeId(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));
            when(wasteTypeRepository.existsByName("Updated Plastic")).thenReturn(false);
            when(wasteTypeRepository.save(any(WasteType.class))).thenReturn(sampleWasteType);

            WasteTypeResponse response = wasteTypeService.updateWasteType(wasteTypeId, request);

            assertThat(response).isNotNull();
            verify(wasteTypeRepository, times(1)).save(any(WasteType.class));
        }
    }

    @Nested
    @DisplayName("Activate/Deactivate Waste Type Tests")
    class ActivateDeactivateTests {

        @Test
        @DisplayName("Should deactivate waste type successfully")
        void deactivateWasteType_Success() {
            when(wasteTypeRepository.findByWasteTypeId(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));
            when(wasteTypeRepository.save(any(WasteType.class))).thenReturn(sampleWasteType);

            wasteTypeService.deactivateWasteType(wasteTypeId);

            assertThat(sampleWasteType.getIsActive()).isFalse();
            verify(wasteTypeRepository, times(1)).save(sampleWasteType);
        }

        @Test
        @DisplayName("Should activate waste type successfully")
        void activateWasteType_Success() {
            sampleWasteType.setIsActive(false);
            when(wasteTypeRepository.findByWasteTypeId(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));
            when(wasteTypeRepository.save(any(WasteType.class))).thenReturn(sampleWasteType);

            wasteTypeService.activateWasteType(wasteTypeId);

            assertThat(sampleWasteType.getIsActive()).isTrue();
            verify(wasteTypeRepository, times(1)).save(sampleWasteType);
        }
    }
}
