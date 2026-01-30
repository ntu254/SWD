package com.example.backendservice.features.waste;

import com.example.backendservice.features.waste.dto.CreateWasteTypeRequest;
import com.example.backendservice.features.waste.dto.WasteTypeResponse;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import com.example.backendservice.features.waste.service.WasteTypeServiceImpl;
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
                .id(wasteTypeId)
                .name("Plastic")
                .nameVi("Nhựa")
                .description("Recyclable plastic materials")
                .colorCode("#4CAF50")
                .basePointsPerKg(15.0)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
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
                    .nameVi("Giấy")
                    .description("Recyclable paper")
                    .basePointsPerKg(10.0)
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
            when(wasteTypeRepository.findById(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));

            WasteTypeResponse response = wasteTypeService.getWasteTypeById(wasteTypeId);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(wasteTypeId);
            assertThat(response.getName()).isEqualTo("Plastic");
        }

        @Test
        @DisplayName("Should throw exception when waste type not found")
        void getWasteTypeById_NotFound() {
            UUID randomId = UUID.randomUUID();
            when(wasteTypeRepository.findById(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> wasteTypeService.getWasteTypeById(randomId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should get all waste types")
        void getAllWasteTypes_Success() {
            when(wasteTypeRepository.findAll()).thenReturn(List.of(sampleWasteType));

            List<WasteTypeResponse> result = wasteTypeService.getAllWasteTypes(null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Plastic");
        }

        @Test
        @DisplayName("Should filter waste types by status")
        void getAllWasteTypes_FilterByStatus() {
            when(wasteTypeRepository.findByStatus("ACTIVE")).thenReturn(List.of(sampleWasteType));

            List<WasteTypeResponse> result = wasteTypeService.getAllWasteTypes("ACTIVE");

            assertThat(result).hasSize(1);
            verify(wasteTypeRepository, times(1)).findByStatus("ACTIVE");
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
                    .nameVi("Nhựa cập nhật")
                    .description("Updated description")
                    .basePointsPerKg(20.0)
                    .build();

            when(wasteTypeRepository.findById(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));
            when(wasteTypeRepository.save(any(WasteType.class))).thenReturn(sampleWasteType);

            WasteTypeResponse response = wasteTypeService.updateWasteType(wasteTypeId, request);

            assertThat(response).isNotNull();
            verify(wasteTypeRepository, times(1)).save(any(WasteType.class));
        }
    }

    @Nested
    @DisplayName("Delete Waste Type Tests")
    class DeleteWasteTypeTests {

        @Test
        @DisplayName("Should delete waste type successfully")
        void deleteWasteType_Success() {
            when(wasteTypeRepository.findById(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));
            doNothing().when(wasteTypeRepository).delete(any(WasteType.class));

            wasteTypeService.deleteWasteType(wasteTypeId);

            verify(wasteTypeRepository, times(1)).delete(sampleWasteType);
        }
    }
}
