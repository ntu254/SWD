package com.example.backendservice.features.task;

import com.example.backendservice.features.enterprise.entity.Enterprise;
import com.example.backendservice.features.enterprise.repository.EnterpriseRepository;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.task.dto.*;
import com.example.backendservice.features.task.entity.Task;
import com.example.backendservice.features.task.entity.TaskAssignment;
import com.example.backendservice.features.task.repository.TaskAssignmentRepository;
import com.example.backendservice.features.task.repository.TaskRepository;
import com.example.backendservice.features.task.service.TaskServiceImpl;
import com.example.backendservice.features.user.entity.CollectorProfile;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.CollectorProfileRepository;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
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
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private TaskAssignmentRepository assignmentRepository;
    @Mock
    private EnterpriseRepository enterpriseRepository;
    @Mock
    private ServiceAreaRepository serviceAreaRepository;
    @Mock
    private WasteTypeRepository wasteTypeRepository;
    @Mock
    private CollectorProfileRepository collectorProfileRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private Task sampleTask;
    private Enterprise sampleEnterprise;
    private ServiceArea sampleArea;
    private CollectorProfile sampleCollector;
    private UUID taskId;
    private UUID enterpriseId;
    private UUID areaId;
    private UUID collectorId;

    @BeforeEach
    void setUp() {
        taskId = UUID.randomUUID();
        enterpriseId = UUID.randomUUID();
        areaId = UUID.randomUUID();
        collectorId = UUID.randomUUID();

        sampleEnterprise = Enterprise.builder()
                .id(enterpriseId)
                .name("Green Recycling Co.")
                .status("ACTIVE")
                .build();

        sampleArea = ServiceArea.builder()
                .id(areaId)
                .name("District 1")
                .status("ACTIVE")
                .build();

        User collectorUser = User.builder()
                .id(UUID.randomUUID())
                .firstName("Collector")
                .lastName("One")
                .build();

        sampleCollector = CollectorProfile.builder()
                .id(collectorId)
                .user(collectorUser)
                .availabilityStatus("AVAILABLE")
                .build();

        sampleTask = Task.builder()
                .id(taskId)
                .enterprise(sampleEnterprise)
                .area(sampleArea)
                .estimatedWeightKg(25.0)
                .locationText("123 Main St")
                .lat(10.77)
                .lng(106.70)
                .status("PENDING")
                .priority("NORMAL")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Create Task Tests")
    class CreateTaskTests {

        @Test
        @DisplayName("Should create task successfully")
        void createTask_Success() {
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .enterpriseId(enterpriseId)
                    .areaId(areaId)
                    .estimatedWeightKg(25.0)
                    .locationText("123 Main St")
                    .priority("NORMAL")
                    .build();

            when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(sampleEnterprise));
            when(serviceAreaRepository.findById(areaId)).thenReturn(Optional.of(sampleArea));
            when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

            TaskResponse response = taskService.createTask(request);

            assertThat(response).isNotNull();
            assertThat(response.getEnterpriseName()).isEqualTo("Green Recycling Co.");
            assertThat(response.getStatus()).isEqualTo("PENDING");
            verify(taskRepository, times(1)).save(any(Task.class));
        }

        @Test
        @DisplayName("Should throw exception when enterprise not found")
        void createTask_EnterpriseNotFound() {
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .enterpriseId(UUID.randomUUID())
                    .build();

            when(enterpriseRepository.findById(any())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskService.createTask(request))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Enterprise not found");
        }
    }

    @Nested
    @DisplayName("Task Status Flow Tests")
    class StatusFlowTests {

        @Test
        @DisplayName("Should start task from ASSIGNED status")
        void startTask_Success() {
            sampleTask.setStatus("ASSIGNED");
            when(taskRepository.findById(taskId)).thenReturn(Optional.of(sampleTask));
            when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

            TaskResponse response = taskService.startTask(taskId);

            assertThat(response.getStatus()).isEqualTo("IN_PROGRESS");
            assertThat(sampleTask.getStartedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should fail to start task from PENDING status")
        void startTask_InvalidStatus() {
            sampleTask.setStatus("PENDING");
            when(taskRepository.findById(taskId)).thenReturn(Optional.of(sampleTask));

            assertThatThrownBy(() -> taskService.startTask(taskId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only ASSIGNED tasks can be started");
        }

        @Test
        @DisplayName("Should complete task with actual weight")
        void completeTask_Success() {
            sampleTask.setStatus("IN_PROGRESS");
            when(taskRepository.findById(taskId)).thenReturn(Optional.of(sampleTask));
            when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

            TaskResponse response = taskService.completeTask(taskId, 24.5);

            assertThat(response.getStatus()).isEqualTo("COMPLETED");
            assertThat(sampleTask.getActualWeightKg()).isEqualTo(24.5);
            assertThat(sampleTask.getCompletedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Task Assignment Tests")
    class AssignmentTests {

        @Test
        @DisplayName("Should assign task to collector")
        void assignTask_Success() {
            AssignTaskRequest request = AssignTaskRequest.builder()
                    .taskId(taskId)
                    .collectorId(collectorId)
                    .notes("Priority task")
                    .build();

            TaskAssignment savedAssignment = TaskAssignment.builder()
                    .id(UUID.randomUUID())
                    .task(sampleTask)
                    .collector(sampleCollector)
                    .status("ASSIGNED")
                    .assignedAt(LocalDateTime.now())
                    .build();

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(sampleTask));
            when(collectorProfileRepository.findById(collectorId)).thenReturn(Optional.of(sampleCollector));
            when(assignmentRepository.save(any(TaskAssignment.class))).thenReturn(savedAssignment);
            when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

            TaskAssignmentResponse response = taskService.assignTask(request);

            assertThat(response).isNotNull();
            assertThat(response.getStatus()).isEqualTo("ASSIGNED");
            assertThat(sampleTask.getStatus()).isEqualTo("ASSIGNED");
        }

        @Test
        @DisplayName("Should fail to assign non-PENDING task")
        void assignTask_InvalidStatus() {
            sampleTask.setStatus("COMPLETED");
            AssignTaskRequest request = AssignTaskRequest.builder()
                    .taskId(taskId)
                    .collectorId(collectorId)
                    .build();

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(sampleTask));

            assertThatThrownBy(() -> taskService.assignTask(request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only PENDING tasks can be assigned");
        }
    }

    @Nested
    @DisplayName("Get Tasks Tests")
    class GetTasksTests {

        @Test
        @DisplayName("Should get tasks by enterprise with pagination")
        void getTasksByEnterprise_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Task> taskPage = new PageImpl<>(List.of(sampleTask));

            when(taskRepository.findByEnterpriseId(enterpriseId, pageable)).thenReturn(taskPage);

            Page<TaskResponse> result = taskService.getTasksByEnterprise(enterpriseId, null, pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getEnterpriseName()).isEqualTo("Green Recycling Co.");
        }
    }
}
