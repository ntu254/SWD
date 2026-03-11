package com.example.demo.data;

import com.example.demo.model.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class SampleData {

    private final List<Report> citizenReports;
    private final List<Report> allReports;
    private final List<CollectionTask> collectionTasks;
    private final List<Complaint> complaints;

    public SampleData() {
        this.citizenReports = initCitizenReports();
        this.allReports = initAllReports();
        this.collectionTasks = initCollectionTasks();
        this.complaints = initComplaints();
    }

    // ─── INIT DATA ─────────────────────────────────────────────────────────────

    private List<Report> initCitizenReports() {
        List<Report> reports = new ArrayList<>();
        reports.add(new Report("RPT-001", "Rac thai sinh hoat tai ngo 12", "Rac sinh hoat",
                ReportStatus.COMPLETED, LocalDateTime.of(2026, 3, 1, 8, 30), "Quan 1, TP.HCM", "Nguyen Van A"));
        reports.add(new Report("RPT-002", "Rac tai che (nhua, giay) can thu gom", "Rac tai che",
                ReportStatus.IN_PROGRESS, LocalDateTime.of(2026, 3, 5, 10, 0), "Quan 3, TP.HCM", "Nguyen Van A"));
        reports.add(new Report("RPT-003", "Rac thai nguy hai (pin, ac quy)", "Rac nguy hai",
                ReportStatus.ASSIGNED, LocalDateTime.of(2026, 3, 7, 14, 15), "Quan 7, TP.HCM", "Nguyen Van A"));
        reports.add(new Report("RPT-004", "Rac huu co tu cho", "Rac huu co",
                ReportStatus.PENDING, LocalDateTime.of(2026, 3, 8, 9, 45), "Quan Binh Thanh, TP.HCM", "Nguyen Van A"));
        return reports;
    }

    private List<Report> initAllReports() {
        List<Report> reports = new ArrayList<>(citizenReports);
        reports.add(new Report("RPT-005", "Rac xay dung tai cong truong", "Rac xay dung",
                ReportStatus.PENDING, LocalDateTime.of(2026, 3, 6, 7, 0), "Quan 2, TP.HCM", "Tran Thi B"));
        reports.add(new Report("RPT-006", "Rac thai dien tu (may tinh cu)", "Rac dien tu",
                ReportStatus.PENDING, LocalDateTime.of(2026, 3, 7, 11, 30), "Quan 1, TP.HCM", "Le Van C"));
        reports.add(new Report("RPT-007", "Nhua va chai lo tai che", "Rac tai che",
                ReportStatus.ACCEPTED, LocalDateTime.of(2026, 3, 8, 8, 0), "Quan 3, TP.HCM", "Pham Thi D"));
        reports.add(new Report("RPT-008", "Rac thai y te tu phong kham", "Rac nguy hai",
                ReportStatus.PENDING, LocalDateTime.of(2026, 3, 8, 16, 0), "Quan 7, TP.HCM", "Hoang Van E"));
        return reports;
    }

    private List<CollectionTask> initCollectionTasks() {
        List<CollectionTask> tasks = new ArrayList<>();
        tasks.add(new CollectionTask("TASK-001", "RPT-001", "Collector Minh", "COMPLETED",
                LocalDate.of(2026, 3, 2), 100, "Quan 1"));
        tasks.add(new CollectionTask("TASK-002", "RPT-002", "Collector Hung", "IN_PROGRESS",
                LocalDate.of(2026, 3, 6), 65, "Quan 3"));
        tasks.add(new CollectionTask("TASK-003", "RPT-003", "Collector Lan", "ASSIGNED",
                LocalDate.of(2026, 3, 8), 10, "Quan 7"));
        tasks.add(new CollectionTask("TASK-004", "RPT-005", "Collector Minh", "IN_PROGRESS",
                LocalDate.of(2026, 3, 7), 40, "Quan 2"));
        tasks.add(new CollectionTask("TASK-005", "RPT-006", "Collector Hung", "PENDING",
                LocalDate.of(2026, 3, 9), 0, "Quan 1"));
        return tasks;
    }

    private List<Complaint> initComplaints() {
        List<Complaint> list = new ArrayList<>();
        list.add(new Complaint("CMP-001", "RPT-002", "Thu gom cham 3 ngay",
                "Bao cao RPT-002 da 3 ngay chua duoc thu gom theo cam ket.",
                ComplaintCategory.COLLECTION_ISSUE, "High", LocalDateTime.of(2026, 3, 8, 10, 0)));
        return list;
    }

    // ─── REPORT CRUD ───────────────────────────────────────────────────────────

    public List<Report> getCitizenReports() { return citizenReports; }
    public List<Report> getAllReports() { return allReports; }

    public List<Report> getPendingReports() {
        return allReports.stream()
                .filter(r -> r.getStatus() == ReportStatus.PENDING || r.getStatus() == ReportStatus.ACCEPTED)
                .toList();
    }

    public Optional<Report> findReportById(String id) {
        return allReports.stream().filter(r -> r.getId().equalsIgnoreCase(id)).findFirst();
    }

    public void addReport(Report report) {
        allReports.add(report);
        citizenReports.add(report);
    }

    public boolean updateReport(String id, String description, String wasteType, String location) {
        Optional<Report> opt = findReportById(id);
        if (opt.isPresent()) {
            Report r = opt.get();
            if (!description.isBlank()) r.setDescription(description);
            if (!wasteType.isBlank()) r.setWasteType(wasteType);
            if (!location.isBlank()) r.setLocation(location);
            return true;
        }
        return false;
    }

    public boolean deleteReport(String id) {
        boolean removed = allReports.removeIf(r -> r.getId().equalsIgnoreCase(id));
        citizenReports.removeIf(r -> r.getId().equalsIgnoreCase(id));
        return removed;
    }

    public String nextReportId() {
        return "RPT-" + String.format("%03d", allReports.size() + 1);
    }

    // ─── COMPLAINT CRUD ────────────────────────────────────────────────────────

    public List<Complaint> getComplaints() { return complaints; }

    public Optional<Complaint> findComplaintById(String id) {
        return complaints.stream().filter(c -> c.getId().equalsIgnoreCase(id)).findFirst();
    }

    public void addComplaint(Complaint complaint) { complaints.add(complaint); }

    public boolean updateComplaint(String id, String title, String content) {
        Optional<Complaint> opt = findComplaintById(id);
        if (opt.isPresent()) {
            Complaint c = opt.get();
            if (!title.isBlank()) c.setTitle(title);
            if (!content.isBlank()) c.setContent(content);
            return true;
        }
        return false;
    }

    public boolean deleteComplaint(String id) {
        return complaints.removeIf(c -> c.getId().equalsIgnoreCase(id));
    }

    public String nextComplaintId() {
        return "CMP-" + String.format("%03d", complaints.size() + 1);
    }

    // ─── TASK CRUD ─────────────────────────────────────────────────────────────

    public List<CollectionTask> getCollectionTasks() { return collectionTasks; }

    public Optional<CollectionTask> findTaskById(String id) {
        return collectionTasks.stream().filter(t -> t.getId().equalsIgnoreCase(id)).findFirst();
    }

    public void addTask(CollectionTask task) { collectionTasks.add(task); }

    public boolean updateTask(String id, String collectorName, String status, int progress) {
        Optional<CollectionTask> opt = findTaskById(id);
        if (opt.isPresent()) {
            CollectionTask t = opt.get();
            if (!collectorName.isBlank()) t.setCollectorName(collectorName);
            if (!status.isBlank()) t.setStatus(status);
            if (progress >= 0) t.setProgressPercent(progress);
            return true;
        }
        return false;
    }

    public boolean deleteTask(String id) {
        return collectionTasks.removeIf(t -> t.getId().equalsIgnoreCase(id));
    }

    public String nextTaskId() {
        return "TASK-" + String.format("%03d", collectionTasks.size() + 1);
    }
}
