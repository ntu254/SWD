---
description: Workflow for fixing bugs in Enterprise, Task, or Reward modules
---

# Bug Fix Workflow

This workflow ensures bugs are fixed systematically with reproduction steps and regression testing.

## Steps

1. **Analysis**
   - Understand the reported issue
   - Identify the root cause
   - Read `.agent-utils/MEMORY.md` for known issues
   - Common module bugs:
     - **Enterprise**: Capacity not decremented on task assignment
     - **Task**: Status transition not validated
     - **Reward**: Points not calculated correctly
     - **Complaint**: Resolution not linked to complaint

2. **Reproduction**
   - Create a failing test case that reproduces the bug
   - Verify the test fails as expected
   - Example for Task Module:
     ```java
     @Test
     void assignTask_WhenCapacityExceeded_ShouldThrowException() {
         // Setup
         ServiceArea area = createArea();
         EnterpriseCapability capability = createCapability(area, 100.0);
         WasteReport report = createReport(area, 150.0); // exceeds capacity
         
         // Should throw CapacityExceededException
         assertThrows(CapacityExceededException.class, 
             () -> taskService.createTaskFromReport(report.getId()));
     }
     ```

3. **Implementation**
   - Apply the fix in the code
   - Ensure minimal impact on other components
   - Common fixes:
     - Add capacity validation in TaskService
     - Add status check before processing
     - Add constraint checks for foreign keys

4. **Verification**
   - Run the reproduction test (MUST PASS)
   - Run all related tests to check for regressions
   - Manually test the fix via Swagger/Postman

5. **Review**
   - Check if the fix introduces any technical debt
   - Update documentation if behavior changed
   - Check `.agent-utils/07_review_checklist.md`

6. **Closure**
   - Document the root cause and solution in `MEMORY.md`
   - Example entry:
     ```
     ### Bug: Capacity not decremented on task assignment
     - Root cause: Missing capacity update in TaskAssignmentService
     - Solution: Added capability.setUsedCapacity(used + reportWeight)
     - Date: 2026-01-30
     ```
