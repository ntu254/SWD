package com.example.backendservice.features.user.repository;

import com.example.backendservice.features.user.entity.CitizenProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitizenProfileRepository extends JpaRepository<CitizenProfile, UUID> {

    Optional<CitizenProfile> findByUserId(UUID userId);

    @Query("SELECT cp FROM CitizenProfile cp WHERE cp.user.email = :email")
    Optional<CitizenProfile> findByUserEmail(@Param("email") String email);

    @Query("SELECT cp FROM CitizenProfile cp JOIN FETCH cp.user WHERE cp.userId = :userId")
    Optional<CitizenProfile> findByUserIdWithUser(@Param("userId") UUID userId);

    @Query("SELECT cp FROM CitizenProfile cp WHERE cp.defaultArea.areaId = :areaId")
    List<CitizenProfile> findByDefaultAreaId(@Param("areaId") UUID areaId);

    @Query("SELECT cp FROM CitizenProfile cp WHERE cp.points >= :minPoints ORDER BY cp.points DESC")
    List<CitizenProfile> findByMinPoints(@Param("minPoints") Integer minPoints);

    boolean existsByUserId(UUID userId);
}
