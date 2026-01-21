package com.example.backendservice.features.complaint;

import com.example.backendservice.common.sse.SseService;
import com.example.backendservice.features.complaint.dto.ComplaintResponse;
import com.example.backendservice.features.complaint.dto.CreateComplaintRequest;
import com.example.backendservice.features.complaint.dto.UpdateComplaintStatusRequest;
import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.complaint.repository.ComplaintRepository;
import com.example.backendservice.features.complaint.service.ComplaintServiceImpl;
import com.example.backendservice.features.user.entity.Citizen;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.CitizenRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private CitizenRepository citizenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SseService sseService;

    @InjectMocks
    private ComplaintServiceImpl complaintService;

    private User testUser;
    private Citizen testCitizen;
    private Complaint testComplaint;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("password")
                .role("CITIZEN")
                .build();

        testCitizen = Citizen.builder()
                .id(1L)
                .user(testUser)
                .address("123 Main St")
                .currentPoints(100)
                .membershipTier("Bronze")
                .build();

        testComplaint = Complaint.builder()
                .id(1L)
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

        when(citizenRepository.findById(1L)).thenReturn(Optional.of(testCitizen));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(testComplaint);

        // When
        ComplaintResponse response = complaintService.createComplaint(1L, request);

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

        when(citizenRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> complaintService.createComplaint(999L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Citizen not found");
    }

    @Test
    @DisplayName("Should get complaint by ID")
    void getComplaintById_Success() {
        // Given
        when(complaintRepository.findById(1L)).thenReturn(Optional.of(testComplaint));

        // When
        ComplaintResponse response = complaintService.getComplaintById(1L);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should get complaints by citizen with pagination")
    void getComplaintsByCitizen_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Complaint> page = new PageImpl<>(List.of(testComplaint));

        when(complaintRepository.findByCitizen_Id(1L, pageable)).thenReturn(page);

        // When
        Page<ComplaintResponse> result = complaintService.getComplaintsByCitizen(1L, pageable);

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

        when(complaintRepository.findById(1L)).thenReturn(Optional.of(testComplaint));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(testComplaint);

        // When
        ComplaintResponse response = complaintService.updateComplaintStatus(1L, request);

        // Then
        assertThat(response).isNotNull();
        verify(complaintRepository, times(1)).save(any(Complaint.class));
    }

    @Test
    @DisplayName("Should delete complaint")
    void deleteComplaint_Success() {
        // Given
        when(complaintRepository.existsById(1L)).thenReturn(true);
        doNothing().when(complaintRepository).deleteById(1L);

        // When
        complaintService.deleteComplaint(1L);

        // Then
        verify(complaintRepository, times(1)).deleteById(1L);
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
