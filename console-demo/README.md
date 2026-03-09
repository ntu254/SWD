# Console Demo — UC-05 | UC-12 | UC-29 | UC-17

## Mô tả

Console Application Java mô phỏng 4 Use Cases của hệ thống Waste Management:

| UC | Tên | Actor |
|---|---|---|
| UC-05 | View Reward Points | Citizen |
| UC-12 | Assign Task to Collector | Enterprise |
| UC-29 | Manage Reward Items | Administrator |
| UC-17 | Configure Collector KPI | Enterprise |

## Cấu trúc thư mục

```
console-demo/
├── pom.xml
└── src/main/java/demo/
    ├── Main.java                          ← Entry point
    ├── common/
    │   ├── Colors.java                    ← ANSI color helpers
    │   └── ConsoleUtils.java              ← Print utilities
    ├── uc05/                              ← UC-05: View Reward Points
    │   ├── entity/RewardTransaction.java
    │   ├── repository/RewardTransactionRepository.java
    │   ├── service/RewardService.java     ← Interface (Strategy Pattern)
    │   ├── service/RewardServiceImpl.java
    │   └── UC05_ViewRewardPoints.java
    ├── uc12/                              ← UC-12: Assign Task to Collector
    │   ├── entity/Task.java
    │   ├── entity/TaskAssignment.java
    │   ├── entity/TaskStatus.java         ← State Pattern
    │   ├── entity/TaskAssignmentStatus.java
    │   ├── service/TaskService.java       ← Interface (Strategy Pattern)
    │   ├── service/TaskServiceImpl.java
    │   └── UC12_AssignTask.java
    ├── uc29/                              ← UC-29: Manage Reward Items
    │   ├── entity/RewardItem.java
    │   ├── service/RewardItemService.java ← Interface (Strategy Pattern)
    │   ├── service/RewardItemServiceImpl.java  ← Facade Pattern (redeemItem)
    │   └── UC29_ManageRewardItems.java
    └── uc17/                              ← UC-17: Configure Collector KPI
        ├── entity/CollectorKpiDaily.java  ← Template Method (isKpiMet)
        ├── entity/CollectorKpiStatus.java ← State Pattern
        ├── service/CollectorKpiService.java ← Observer Pattern (updateKpiAfterVisit)
        └── UC17_ConfigureCollectorKPI.java
```

## Yêu cầu

- Java 17+
- Maven 3.6+

## Build & Run

```powershell
# Vào thư mục
cd d:\SU26\SWD392_PROJECT\SWD\console-demo

# Build
mvn package -DskipTests

# Chạy
java -jar target/console-demo-1.0.0.jar
```

## Design Patterns được minh hoạ

| Pattern | Class minh hoạ | UC |
|---|---|---|
| **Strategy** | `RewardService`, `TaskService`, `RewardItemService` | UC-05, UC-12, UC-29 |
| **Repository** | `RewardTransactionRepository`, `TaskServiceImpl` (in-memory) | UC-05, UC-12 |
| **State** | `TaskStatus`, `TaskAssignmentStatus`, `CollectorKpiStatus` | UC-12, UC-17 |
| **Builder** | `RewardTransaction`, `TaskAssignment` (constructor) | UC-05, UC-12 |
| **Facade** | `RewardItemServiceImpl.redeemItem()` | UC-29 |
| **Delegation** | `RewardItemServiceImpl` → `RewardService` | UC-29 |
| **Template Method** | `CollectorKpiDaily.isKpiMet()` | UC-17 |
| **Observer (partial)** | `CollectorKpiService.updateKpiAfterVisit()` | UC-17 |
