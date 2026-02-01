package com.example.backendservice.features.complaint;

import com.example.backendservice.common.sse.SseService;
import com.example.backendservice.features.complaint.dto.ComplaintResponse;
import com.example.backendservice.features.complaint.dto.CreateComplaintRequest;
import com.example.backendservice.features.complaint.dto.UpdateComplaintStatusRequest;
import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.complaint.repository.ComplaintRepository;
import com.example.backendservice.features.complaint.service.ComplaintServiceImpl;
import com.example.backendservice.features.user.entity.CitizenProfile;
import com.example.backendservice.features.user.repository.CitizenProfileRepository;
import com.example.backendservice.features.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private CitizenProfileRepository citizenProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SseService sseService;

    @InjectMocks
    private ComplaintServiceImpl complaintService;

    private CitizenProfile testCitizen;
    private Complaint testComplaint;
    private UUID citizenId;
    private UUID complaintId;

    @BeforeEach
    void setUp() {
        citizenId = UUID.randomUUID();
        complaintId = UUID.randomUUID();

        testCitizen = CitizenProfile.builder()
                .id(citizenId)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("password")
                .role("CITIZEN")
                .address("123 Main St")
                .currentPoints(100)
                .membershipTier("Bronze")
                .build();

        testComplaint = Complaint.builder()
                .id(complaintId)
                .citizen(testCitizen)
                .title("Test Complaint")
                .description("This is a test complaint")
                .category("POINTS_ERROR")
                .status("Pending")
                .priority("Normal")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should create complaint successfully")
    void createComplaint_Success() {
        // Given
        CreateComplaintRequest request = CreateComplaintRequest.builder()
                .title("New Complaint")
                .description("Test description")
                .category("BUG")
                .priority("High")
                .build();

        when(citizenProfileRepository.findById(citizenId)).thenReturn(Optional.of(testCitizen));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(testComplaint);

        // When
        ComplaintResponse response = complaintService.createComplaint(citizenId, request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Test Complaint");
        verify(complaintRepository, times(1)).save(any(Complaint.class));
        verify(sseService, times(1)).sendEvent(any());
    }

    @Test
    @DisplayName("Should throw exception when citizen not found")
    void createComplaint_CitizenNotFound() {
        // Given
        CreateComplaintRequest request = CreateComplaintRequest.builder()
                .title("New Complaint")
                .description("Test description")
                .build();

        UUID randomId = UUID.randomUUID();
        when(citizenProfileRepository.findById(randomId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> complaintService.createComplaint(randomId, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("CitizenProfile not found");
    }

    @Test
    @DisplayName("Should get complaint by ID")
    void getComplaintById_Success() {
        // Given
        when(complaintRepository.findById(complaintId)).thenReturn(Optional.of(testComplaint));

        // When
        ComplaintResponse response = complaintService.getComplaintById(complaintId);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(complaintId);
    }

    @Test
    @DisplayName("Should get complaints by citizen with pagination")
    void getComplaintsByCitizen_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Complaint> page = new PageImpl<>(List.of(testComplaint));

        when(complaintRepository.findByCitizen_Id(citizenId, pageable)).thenReturn(page);

        // When
        Page<ComplaintResponse> result = complaintService.getComplaintsByCitizen(citizenId, pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Test Complaint");
    }

    @Test
    @DisplayName("Should update complaint status")
    void updateComplaintStatus_Success() {
        // Given
        UpdateComplaintStatusRequest request = UpdateComplaintStatusRequest.builder()
                .status("Resolved")
                .adminResponse("Issue has been fixed")
                .build();

        when(complaintRepository.findById(complaintId)).thenReturn(Optional.of(testComplaint));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(testComplaint);

        // When
        ComplaintResponse response = complaintService.updateComplaintStatus(complaintId, request);

        // Then
        assertThat(response).isNotNull();
        verify(complaintRepository, times(1)).save(any(Complaint.class));
    }

    @Test
    @DisplayName("Should delete complaint")
    void deleteComplaint_Success() {
        // Given
        when(complaintRepository.existsById(complaintId)).thenReturn(true);
        doNothing().when(complaintRepository).deleteById(complaintId);

        // When
        complaintService.deleteComplaint(complaintId);

        // Then
        verify(complaintRepository, times(1)).deleteById(complaintId);
    }

    @Test
    @DisplayName("Should get complaint statistics")
    void getComplaintStatistics_Success() {
        // Given
        List<Object[]> stats = List.of(
                new Object[] { "Pending", 5L },
                new Object[] { "Resolved", 10L });

        when(complaintRepository.getComplaintStatsByStatus()).thenReturn(stats);
        when(complaintRepository.count()).thenReturn(15L);

        // When
        Map<String, Long> result = complaintService.getComplaintStatistics();

        // Then
        assertThat(result).containsEntry("Pending", 5L);
        assertThat(result).containsEntry("Resolved", 10L);
        assertThat(result).containsEntry("total", 15L);
    }
}
