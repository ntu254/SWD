package com.example.backendservice.features.notification;

import com.example.backendservice.common.sse.SseService;
import com.example.backendservice.features.notification.dto.CreateNotificationRequest;
import com.example.backendservice.features.notification.dto.NotificationResponse;
import com.example.backendservice.features.notification.dto.UpdateNotificationRequest;
import com.example.backendservice.features.notification.entity.Notification;
import com.example.backendservice.features.notification.repository.NotificationRepository;
import com.example.backendservice.features.notification.service.NotificationServiceImpl;
import com.example.backendservice.features.user.entity.User;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SseService sseService;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User adminUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .password("password")
                .role("ADMIN")
                .build();

        testNotification = Notification.builder()
                .id(1L)
                .title("Test Notification")
                .content("This is a test notification content")
                .type("General")
                .targetAudience("All")
                .priority("Normal")
                .isActive(true)
                .createdBy(adminUser)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should create notification successfully")
    void createNotification_Success() {
        // Given
        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .title("New Notification")
                .content("Notification content")
                .type("Maintenance")
                .targetAudience("All")
                .priority("High")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When
        NotificationResponse response = notificationService.createNotification(1L, request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Test Notification");
        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(sseService, times(1)).sendEvent(any());
    }

    @Test
    @DisplayName("Should throw exception when admin not found")
    void createNotification_AdminNotFound() {
        // Given
        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .title("New Notification")
                .content("Content")
                .build();

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> notificationService.createNotification(999L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Admin not found");
    }

    @Test
    @DisplayName("Should get notification by ID")
    void getNotificationById_Success() {
        // Given
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        // When
        NotificationResponse response = notificationService.getNotificationById(1L);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Test Notification");
    }

    @Test
    @DisplayName("Should update notification")
    void updateNotification_Success() {
        // Given
        UpdateNotificationRequest request = UpdateNotificationRequest.builder()
                .title("Updated Title")
                .content("Updated Content")
                .isActive(true)
                .build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When
        NotificationResponse response = notificationService.updateNotification(1L, request);

        // Then
        assertThat(response).isNotNull();
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should toggle notification status")
    void toggleNotificationStatus_Success() {
        // Given
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When
        NotificationResponse response = notificationService.toggleNotificationStatus(1L);

        // Then
        assertThat(response).isNotNull();
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should delete notification")
    void deleteNotification_Success() {
        // Given
        when(notificationRepository.existsById(1L)).thenReturn(true);
        doNothing().when(notificationRepository).deleteById(1L);

        // When
        notificationService.deleteNotification(1L);

        // Then
        verify(notificationRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should get active notifications for user")
    void getActiveNotificationsForUser_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> page = new PageImpl<>(List.of(testNotification));

        when(notificationRepository.findActiveNotificationsForAudience(eq("Citizen"), any(LocalDateTime.class),
                eq(pageable)))
                .thenReturn(page);

        // When
        Page<NotificationResponse> result = notificationService.getActiveNotificationsForUser("Citizen", pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Test Notification");
    }

    @Test
    @DisplayName("Should count active notifications")
    void countActiveNotifications_Success() {
        // Given
        when(notificationRepository.countByIsActiveTrue()).thenReturn(5L);

        // When
        long count = notificationService.countActiveNotifications();

        // Then
        assertThat(count).isEqualTo(5L);
    }

    @Test
    @DisplayName("Should get all notifications with filters")
    void getAllNotifications_WithFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> page = new PageImpl<>(List.of(testNotification));

        when(notificationRepository.findAllWithFilters("General", "All", true, pageable))
                .thenReturn(page);

        // When
        Page<NotificationResponse> result = notificationService.getAllNotifications("General", "All", true, pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
    }
}
