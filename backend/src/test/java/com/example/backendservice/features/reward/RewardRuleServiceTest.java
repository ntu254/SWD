package com.example.backendservice.features.reward;

import com.example.backendservice.features.reward.dto.CreateRewardRuleRequest;
import com.example.backendservice.features.reward.dto.RewardRuleResponse;
import com.example.backendservice.features.reward.entity.CitizenRewardRule;
import com.example.backendservice.features.reward.repository.CitizenRewardRuleRepository;
import com.example.backendservice.features.reward.service.RewardRuleServiceImpl;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
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
class RewardRuleServiceTest {

    @Mock
    private CitizenRewardRuleRepository ruleRepository;
    @Mock
    private WasteTypeRepository wasteTypeRepository;

    @InjectMocks
    private RewardRuleServiceImpl rewardRuleService;

    private CitizenRewardRule sampleRule;
    private WasteType sampleWasteType;
    private UUID ruleId;
    private UUID wasteTypeId;

    @BeforeEach
    void setUp() {
        ruleId = UUID.randomUUID();
        wasteTypeId = UUID.randomUUID();

        sampleWasteType = WasteType.builder()
                .id(wasteTypeId)
                .name("Plastic")
                .basePointsPerKg(10.0)
                .status("ACTIVE")
                .build();

        sampleRule = CitizenRewardRule.builder()
                .id(ruleId)
                .wasteType(sampleWasteType)
                .pointsPerKg(12.0)
                .bonusPercentage(10.0)
                .minWeightKg(1.0)
                .maxPointsPerDay(500)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Create Rule Tests")
    class CreateRuleTests {

        @Test
        @DisplayName("Should create reward rule successfully")
        void createRule_Success() {
            CreateRewardRuleRequest request = CreateRewardRuleRequest.builder()
                    .wasteTypeId(wasteTypeId)
                    .pointsPerKg(12.0)
                    .bonusPercentage(10.0)
                    .minWeightKg(1.0)
                    .build();

            when(wasteTypeRepository.findById(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));
            when(ruleRepository.findByWasteTypeId(wasteTypeId)).thenReturn(Optional.empty());
            when(ruleRepository.save(any(CitizenRewardRule.class))).thenReturn(sampleRule);

            RewardRuleResponse response = rewardRuleService.createRule(request);

            assertThat(response).isNotNull();
            assertThat(response.getPointsPerKg()).isEqualTo(12.0);
            assertThat(response.getWasteTypeName()).isEqualTo("Plastic");
        }

        @Test
        @DisplayName("Should fail if rule already exists for waste type")
        void createRule_DuplicateWasteType() {
            CreateRewardRuleRequest request = CreateRewardRuleRequest.builder()
                    .wasteTypeId(wasteTypeId)
                    .pointsPerKg(12.0)
                    .build();

            when(wasteTypeRepository.findById(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));
            when(ruleRepository.findByWasteTypeId(wasteTypeId)).thenReturn(Optional.of(sampleRule));

            assertThatThrownBy(() -> rewardRuleService.createRule(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Rule already exists");
        }
    }

    @Nested
    @DisplayName("Points Calculation Tests")
    class PointsCalculationTests {

        @Test
        @DisplayName("Should calculate points with bonus")
        void calculatePoints_WithBonus() {
            when(ruleRepository.findActiveRuleByWasteType(eq(wasteTypeId), any(LocalDateTime.class)))
                    .thenReturn(Optional.of(sampleRule));

            Integer points = rewardRuleService.calculatePoints(wasteTypeId, 10.0);

            // (10kg * 12 points/kg) * (1 + 10%) = 132 points
            assertThat(points).isEqualTo(132);
        }

        @Test
        @DisplayName("Should return 0 for weight below minimum")
        void calculatePoints_BelowMinWeight() {
            when(ruleRepository.findActiveRuleByWasteType(eq(wasteTypeId), any(LocalDateTime.class)))
                    .thenReturn(Optional.of(sampleRule));

            Integer points = rewardRuleService.calculatePoints(wasteTypeId, 0.5);

            assertThat(points).isEqualTo(0);
        }

        @Test
        @DisplayName("Should fallback to waste type base points when no rule")
        void calculatePoints_FallbackToWasteType() {
            when(ruleRepository.findActiveRuleByWasteType(eq(wasteTypeId), any(LocalDateTime.class)))
                    .thenReturn(Optional.empty());
            when(wasteTypeRepository.findById(wasteTypeId)).thenReturn(Optional.of(sampleWasteType));

            Integer points = rewardRuleService.calculatePoints(wasteTypeId, 10.0);

            // 10kg * 10 base points = 100
            assertThat(points).isEqualTo(100);
        }
    }

    @Nested
    @DisplayName("Status Change Tests")
    class StatusChangeTests {

        @Test
        @DisplayName("Should activate rule")
        void activateRule_Success() {
            sampleRule.setStatus("INACTIVE");
            when(ruleRepository.findById(ruleId)).thenReturn(Optional.of(sampleRule));

            rewardRuleService.activateRule(ruleId);

            assertThat(sampleRule.getStatus()).isEqualTo("ACTIVE");
            verify(ruleRepository, times(1)).save(sampleRule);
        }

        @Test
        @DisplayName("Should deactivate rule")
        void deactivateRule_Success() {
            when(ruleRepository.findById(ruleId)).thenReturn(Optional.of(sampleRule));

            rewardRuleService.deactivateRule(ruleId);

            assertThat(sampleRule.getStatus()).isEqualTo("INACTIVE");
        }
    }

    @Nested
    @DisplayName("Get Rules Tests")
    class GetRulesTests {

        @Test
        @DisplayName("Should get all active rules")
        void getActiveRules_Success() {
            when(ruleRepository.findAllActiveRules(any(LocalDateTime.class)))
                    .thenReturn(List.of(sampleRule));

            List<RewardRuleResponse> result = rewardRuleService.getActiveRules();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getStatus()).isEqualTo("ACTIVE");
        }
    }
}
