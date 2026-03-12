package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaint_resolutions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResolution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "resolution_id")
    private UUID resolutionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_user_id", nullable = false)
    private User admin;

    @Column(name = "decision")
    private String decision;

    @Column(name = "note", columnDefinition = "text")
    private String note;

    @Column(name = "is_accepted")
    private Boolean isAccepted;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
