package com.example.backendservice.features.reward;

import com.example.backendservice.features.reward.dto.*;
import com.example.backendservice.features.reward.entity.RewardItem;
import com.example.backendservice.features.reward.entity.RewardRedemption;
import com.example.backendservice.features.reward.repository.RewardItemRepository;
import com.example.backendservice.features.reward.repository.RewardRedemptionRepository;
import com.example.backendservice.features.reward.service.RewardServiceImpl;
import com.example.backendservice.features.user.entity.CitizenProfile;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RewardServiceTest {

    @Mock
    private RewardItemRepository rewardItemRepository;

    @Mock
    private RewardRedemptionRepository redemptionRepository;

    @InjectMocks
    private RewardServiceImpl rewardService;

    private RewardItem sampleItem;
    private RewardRedemption sampleRedemption;
    private CitizenProfile sampleCitizen;
    private UUID citizenId;
    private UUID itemId;
    private UUID redemptionId;

    @BeforeEach
    void setUp() {
        citizenId = UUID.randomUUID();
        itemId = UUID.randomUUID();
        redemptionId = UUID.randomUUID();

        sampleCitizen = CitizenProfile.builder()
                .id(citizenId)
                .firstName("John")
                .lastName("Doe")
                .currentPoints(5000)
                .build();

        sampleItem = RewardItem.builder()
                .id(itemId)
                .name("Gift Card 100K")
                .pointsCost(1000)
                .stock(10)
                .status("ACTIVE")
                .build();

        sampleRedemption = RewardRedemption.builder()
                .id(redemptionId)
                .citizen(sampleCitizen)
                .rewardItem(sampleItem)
                .pointsUsed(1000)
                .status("PENDING")
                .build();
    }

    // ===================== REWARD ITEM TESTS =====================

    @Nested
    @DisplayName("Create Reward Item Tests")
    class CreateRewardItemTests {

        @Test
        @DisplayName("Should create reward item successfully")
        void createRewardItem_Success() {
            CreateRewardItemRequest request = CreateRewardItemRequest.builder()
                    .name("New Gift")
                    .pointsCost(500)
                    .stock(20)
                    .build();

            when(rewardItemRepository.save(any(RewardItem.class))).thenReturn(sampleItem);

            RewardItemResponse response = rewardService.createRewardItem(request);

            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo(sampleItem.getName());
            verify(rewardItemRepository, times(1)).save(any(RewardItem.class));
        }
    }

    @Nested
    @DisplayName("Get Reward Item Tests")
    class GetRewardItemTests {

        @Test
        @DisplayName("Should get reward item by id successfully")
        void getRewardItemById_Success() {
            when(rewardItemRepository.findById(itemId)).thenReturn(Optional.of(sampleItem));

            RewardItemResponse response = rewardService.getRewardItemById(itemId);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(itemId);
        }

        @Test
        @DisplayName("Should throw exception when item not found")
        void getRewardItemById_NotFound() {
            UUID randomId = UUID.randomUUID();
            when(rewardItemRepository.findById(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> rewardService.getRewardItemById(randomId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should get all reward items with pagination")
        void getAllRewardItems_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<RewardItem> page = new PageImpl<>(List.of(sampleItem));

            when(rewardItemRepository.findAll(pageable)).thenReturn(page);

            Page<RewardItemResponse> result = rewardService.getAllRewardItems(null, null, pageable);

            assertThat(result.getContent()).hasSize(1);
        }
    }

    // ===================== REDEMPTION TESTS =====================

    @Nested
    @DisplayName("Approve Redemption Tests")
    class ApproveRedemptionTests {

        @Test
        @DisplayName("Should approve redemption successfully")
        void approveRedemption_Success() {
            when(redemptionRepository.findById(redemptionId)).thenReturn(Optional.of(sampleRedemption));
            when(rewardItemRepository.save(any(RewardItem.class))).thenReturn(sampleItem);
            when(redemptionRepository.save(any(RewardRedemption.class))).thenReturn(sampleRedemption);

            RedemptionResponse response = rewardService.approveRedemption(redemptionId);

            assertThat(response).isNotNull();
            verify(rewardItemRepository, times(1)).save(any(RewardItem.class));
        }

        @Test
        @DisplayName("Should throw exception when redemption not found")
        void approveRedemption_NotFound() {
            UUID randomId = UUID.randomUUID();
            when(redemptionRepository.findById(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> rewardService.approveRedemption(randomId))
                    .isInstanceOf(EntityNotFoundException.class);
        }

        @Test
        @DisplayName("Should throw exception when out of stock")
        void approveRedemption_OutOfStock() {
            sampleItem.setStock(0);
            when(redemptionRepository.findById(redemptionId)).thenReturn(Optional.of(sampleRedemption));

            assertThatThrownBy(() -> rewardService.approveRedemption(redemptionId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("out of stock");
        }

        @Test
        @DisplayName("Should throw exception when not pending")
        void approveRedemption_NotPending() {
            sampleRedemption.setStatus("APPROVED");
            when(redemptionRepository.findById(redemptionId)).thenReturn(Optional.of(sampleRedemption));

            assertThatThrownBy(() -> rewardService.approveRedemption(redemptionId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("PENDING");
        }
    }

    @Nested
    @DisplayName("Reject Redemption Tests")
    class RejectRedemptionTests {

        @Test
        @DisplayName("Should reject redemption successfully and refund points")
        void rejectRedemption_Success() {
            int pointsBefore = sampleCitizen.getCurrentPoints();

            when(redemptionRepository.findById(redemptionId)).thenReturn(Optional.of(sampleRedemption));
            when(redemptionRepository.save(any(RewardRedemption.class))).thenReturn(sampleRedemption);

            RejectRedemptionRequest request = new RejectRedemptionRequest("Out of stock");
            RedemptionResponse response = rewardService.rejectRedemption(redemptionId, request);

            assertThat(response).isNotNull();
            assertThat(sampleCitizen.getCurrentPoints()).isEqualTo(pointsBefore + sampleRedemption.getPointsUsed());
        }
    }
}
