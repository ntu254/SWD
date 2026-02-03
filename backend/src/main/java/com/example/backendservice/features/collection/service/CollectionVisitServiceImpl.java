package com.example.backendservice.features.collection.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.collection.dto.*;
import com.example.backendservice.features.collection.entity.CollectionVisit;
import com.example.backendservice.features.collection.entity.EvidencePhoto;
import com.example.backendservice.features.collection.entity.VisitWasteItem;
import com.example.backendservice.features.collection.repository.CollectionVisitRepository;
import com.example.backendservice.features.collection.repository.EvidencePhotoRepository;
import com.example.backendservice.features.collection.repository.VisitWasteItemRepository;
import com.example.backendservice.features.task.entity.Task;
import com.example.backendservice.features.task.repository.TaskRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollectionVisitServiceImpl implements CollectionVisitService {

    private final CollectionVisitRepository visitRepository;
    private final VisitWasteItemRepository wasteItemRepository;
    private final EvidencePhotoRepository photoRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WasteTypeRepository wasteTypeRepository;

    @Override
    @Transactional
    public CollectionVisitResponse startVisit(UUID collectorUserId, CreateCollectionVisitRequest request) {
        Task task = taskRepository.findByTaskId(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + request.getTaskId()));

        User collector = userRepository.findByUserId(collectorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Collector not found: " + collectorUserId));

        CollectionVisit visit = CollectionVisit.builder()
                .task(task)
                .collectorUser(collector)
                .visitedAt(LocalDateTime.now())
                .visitStatus("VISITED")
                .collectorNote(request.getCitizenSignature())
                .build();

        visit = visitRepository.save(visit);
        log.info("Started visit {} for task {} by collector {}", visit.getVisitId(), request.getTaskId(),
                collectorUserId);

        // Add waste items if provided
        if (request.getWasteItems() != null && !request.getWasteItems().isEmpty()) {
            for (CreateVisitWasteItemRequest itemRequest : request.getWasteItems()) {
                addWasteItemInternal(visit, itemRequest);
            }
        }

        return toVisitResponse(visit);
    }

    @Override
    @Transactional
    public CollectionVisitResponse completeVisit(UUID visitId) {
        CollectionVisit visit = visitRepository.findByVisitId(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        visit.setVisitStatus("COMPLETED");
        visit = visitRepository.save(visit);

        log.info("Completed visit {}", visitId);
        return toVisitResponse(visit);
    }

    @Override
    public CollectionVisitResponse getVisitById(UUID visitId) {
        CollectionVisit visit = visitRepository.findByVisitId(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));
        return toVisitResponse(visit);
    }

    @Override
    public Page<CollectionVisitResponse> getVisitsByCollector(UUID collectorUserId, Pageable pageable) {
        List<CollectionVisit> visits = visitRepository.findByCollectorUserId(collectorUserId);
        List<CollectionVisitResponse> responses = visits.stream()
                .map(this::toVisitResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    public Page<CollectionVisitResponse> getVisitsByTask(UUID taskId, Pageable pageable) {
        List<CollectionVisit> visits = visitRepository.findByTaskId(taskId);
        List<CollectionVisitResponse> responses = visits.stream()
                .map(this::toVisitResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    public Page<CollectionVisitResponse> getAllVisits(Pageable pageable) {
        return visitRepository.findAll(pageable).map(this::toVisitResponse);
    }

    @Override
    @Transactional
    public VisitWasteItemResponse addWasteItem(UUID visitId, CreateVisitWasteItemRequest request) {
        CollectionVisit visit = visitRepository.findByVisitId(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        VisitWasteItem item = addWasteItemInternal(visit, request);
        return toWasteItemResponse(item);
    }

    private VisitWasteItem addWasteItemInternal(CollectionVisit visit, CreateVisitWasteItemRequest request) {
        WasteType wasteType = wasteTypeRepository.findByWasteTypeId(request.getWasteTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Waste type not found: " + request.getWasteTypeId()));

        VisitWasteItem item = VisitWasteItem.builder()
                .visit(visit)
                .wasteType(wasteType)
                .weightKg(request.getQuantityKg())
                .sortingLevel("GOOD")
                .build();

        item = wasteItemRepository.save(item);
        log.info("Added waste item {} to visit {}", item.getItemId(), visit.getVisitId());

        return item;
    }

    @Override
    @Transactional
    public void removeWasteItem(UUID itemId) {
        VisitWasteItem item = wasteItemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste item not found: " + itemId));
        wasteItemRepository.delete(item);
        log.info("Removed waste item {}", itemId);
    }

    @Override
    @Transactional
    public EvidencePhotoResponse uploadEvidencePhoto(CreateEvidencePhotoRequest request) {
        CollectionVisit visit = visitRepository.findByVisitId(request.getVisitId())
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + request.getVisitId()));

        EvidencePhoto photo = EvidencePhoto.builder()
                .visit(visit)
                .photoUrl(request.getPhotoUrl())
                .takenAt(LocalDateTime.now())
                .note(request.getPhotoType())
                .build();

        photo = photoRepository.save(photo);
        log.info("Uploaded evidence photo {} for visit {}", photo.getPhotoId(), request.getVisitId());

        return toPhotoResponse(photo);
    }

    @Override
    @Transactional
    public void deleteEvidencePhoto(UUID photoId) {
        EvidencePhoto photo = photoRepository.findByPhotoId(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence photo not found: " + photoId));
        photoRepository.delete(photo);
        log.info("Deleted evidence photo {}", photoId);
    }

    @Override
    @Transactional
    public CollectionVisitResponse rateVisit(UUID visitId, RateVisitRequest request) {
        CollectionVisit visit = visitRepository.findByVisitId(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        // Store feedback in collector note
        String feedback = "Rating: " + request.getRating() + " - " + request.getFeedback();
        visit.setCollectorNote(feedback);
        visit = visitRepository.save(visit);

        log.info("Rated visit {} with {} stars", visitId, request.getRating());
        return toVisitResponse(visit);
    }

    // Mapping methods
    private CollectionVisitResponse toVisitResponse(CollectionVisit visit) {
        List<VisitWasteItem> items = wasteItemRepository.findByVisitId(visit.getVisitId());
        List<EvidencePhoto> photos = photoRepository.findByVisitId(visit.getVisitId());

        return CollectionVisitResponse.builder()
                .visitId(visit.getVisitId())
                .taskId(visit.getTaskId())
                .collectorUserId(visit.getCollectorUserId())
                .collectorName(visit.getCollectorUser() != null ? visit.getCollectorUser().getFullName() : null)
                .arrivedAt(visit.getVisitedAt())
                .completedAt(null)
                .citizenSignature(visit.getCollectorNote())
                .rating(null)
                .feedback(visit.getCollectorNote())
                .createdAt(visit.getVisitedAt())
                .wasteItems(items.stream().map(this::toWasteItemResponse).collect(Collectors.toList()))
                .evidencePhotos(photos.stream().map(this::toPhotoResponse).collect(Collectors.toList()))
                .build();
    }

    private VisitWasteItemResponse toWasteItemResponse(VisitWasteItem item) {
        return VisitWasteItemResponse.builder()
                .itemId(item.getItemId())
                .visitId(item.getVisitId())
                .wasteTypeId(item.getWasteTypeId())
                .wasteTypeName(item.getWasteType() != null ? item.getWasteType().getName() : null)
                .quantityKg(item.getWeightKg())
                .pointsAwarded(0)
                .build();
    }

    private EvidencePhotoResponse toPhotoResponse(EvidencePhoto photo) {
        return EvidencePhotoResponse.builder()
                .photoId(photo.getPhotoId())
                .visitId(photo.getVisitId())
                .photoUrl(photo.getPhotoUrl())
                .photoType(photo.getNote())
                .uploadedAt(photo.getTakenAt())
                .build();
    }
}
