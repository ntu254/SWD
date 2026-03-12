package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "collection_visits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectionVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "visit_id")
    private UUID visitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_user_id", nullable = false)
    private User collector;

    @Column(name = "visit_status")
    private String visitStatus;

    @Column(name = "collector_note", columnDefinition = "text")
    private String collectorNote;

    @Column(name = "visited_at")
    private LocalDateTime visitedAt;
}
