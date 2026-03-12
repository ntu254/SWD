package com.wastecollection.service;

import com.wastecollection.dto.admin.DashboardStatsDto;
import com.wastecollection.entity.User;
import com.wastecollection.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final WasteReportRepository reportRepository;
    private final TaskRepository taskRepository;
    private final ComplaintRepository complaintRepository;
    private final RewardTransactionRepository rewardTransactionRepository;
    private final SystemSettingRepository systemSettingRepository;

    public DashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCitizens = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.CITIZEN).count();
        long totalCollectors = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.COLLECTOR).count();
        long totalEnterprises = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ENTERPRISE).count();
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatus("PENDING");
        long activeTasks = taskRepository.countActive();
        long openComplaints = complaintRepository.countByStatus("Pending");
        double totalPoints = rewardTransactionRepository.findAll().stream()
                .mapToDouble(t -> t.getPointsDelta() > 0 ? t.getPointsDelta() : 0)
                .sum();

        return DashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .totalCitizens(totalCitizens)
                .totalCollectors(totalCollectors)
                .totalEnterprises(totalEnterprises)
                .totalReports(totalReports)
                .pendingReports(pendingReports)
                .activeTasks(activeTasks)
                .completedTasksToday(0L)
                .openComplaints(openComplaints)
                .totalRewardPointsIssued((long) totalPoints)
                .build();
    }
}
