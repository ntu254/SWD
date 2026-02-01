package com.example.backendservice.features.enterprise.entity;

import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Doanh nghiệp tái chế (Recycling Enterprise)
 * Quản lý năng lực xử lý rác, Collector, và khu vực phục vụ
 */
@Entity
@Table(name = "enterprises")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Enterprise {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    // Owner/Admin của Enterprise
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    // Khu vực chính
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_area_id")
    private ServiceArea primaryArea;

    @Column(length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // PENDING, ACTIVE, SUSPENDED, INACTIVE

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;
}
