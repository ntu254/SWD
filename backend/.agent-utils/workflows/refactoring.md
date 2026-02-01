---
description: Workflow for code refactoring in Enterprise, Task, or Reward modules
---

# Refactoring Workflow

This workflow guides safe refactoring to improve code quality without breaking functionality.

## Steps

1. **Planning**
   - Identify the scope of refactoring
   - Define success criteria (e.g., specific metric improvement)
   - Ensure existing tests pass 100%
   
   ### Common Refactoring Scenarios
   - Extract validation logic to separate class (TaskValidator, CapacityValidator)
   - Move DTO mapping to dedicated mapper (TaskMapper, ReportMapper)
   - Consolidate duplicate code across services
   - Improve exception handling hierarchy
   - Extract analytics logic to AnalyticsService

2. **Strategy**
   - Choose refactoring technique:
     - Extract Method: Break large methods into smaller ones
     - Extract Class: Move validation to TaskValidator
     - Rename: Improve naming for clarity
     - Move: Reorganize package structure
   - Plan incremental steps (baby steps)

3. **Execution**
   - Apply changes incrementally
   - Run tests after EVERY small change
   - DO NOT change public API contracts (unless planned)
   
   ### Example: Extract Capacity Validation Logic
   ```java
   // BEFORE: Validation in service
   public Task createTaskFromReport(Long reportId) {
       WasteReport report = reportRepository.findById(reportId)
           .orElseThrow(() -> new ResourceNotFoundException("Report", reportId));
       
       EnterpriseCapability capability = capabilityRepository
           .findByAreaIdAndWasteTypeId(report.getAreaId(), report.getWasteTypeId())
           .orElseThrow(() -> new NoCapabilityException(report.getAreaId()));
       
       if (capability.getDailyCapacityKg() - capability.getUsedCapacityKg() < report.getEstimatedWeightKg()) {
           throw new CapacityExceededException(capability.getId());
       }
       // ... rest of logic
   }
   
   // AFTER: Validation in separate class
   public Task createTaskFromReport(Long reportId) {
       WasteReport report = reportRepository.findById(reportId)
           .orElseThrow(() -> new ResourceNotFoundException("Report", reportId));
       
       capacityValidator.validateCapacityForReport(report);
       // ... rest of logic
   }
   ```

4. **Verification**
   - Run full test suite: `./mvnw test`
   - Check performance metrics if applicable
   - Verify all endpoints still work via Swagger

5. **Review**
   - Ensure code follows `.agent-utils/02_coding_standards.md`
   - Verify code is cleaner/better than before:
     - [ ] Methods are shorter (under 30 lines)
     - [ ] Single responsibility maintained
     - [ ] Code is more testable
     - [ ] Naming is clearer
   - Update tests if internal structure changed
