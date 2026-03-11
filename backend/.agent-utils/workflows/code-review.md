---
description: Workflow for code review of Enterprise, Task, or Reward modules
---

# Code Review Workflow

This workflow acts as an automated quality gate for code changes.

## Steps

1. **Preparation**
   - Read `.agent-utils/07_review_checklist.md`
   - Identify the scope of changes (files modified)
   - Common review areas:
     - **Enterprise Module**: EnterpriseCapability.java, EnterpriseController.java
     - **Task Module**: Task.java, TaskAssignment.java, TaskService.java
     - **Reward Module**: CitizenRewardRule.java, RewardService.java
     - **Analytics Module**: AnalyticsController.java
     - All DTO classes
     - Migration files

2. **Automated Checks**
   - Verify compilation: `./mvnw compile`
   - Verify all tests pass: `./mvnw test`
   - Check test coverage (>80% for Service layer)

3. **Manual Review (AI Simulation)**
   
   ### Naming Review
   - [ ] Class names: PascalCase (EnterpriseCapability, not enterprise_capability)
   - [ ] Method names: camelCase (createTask, assignCollector)
   - [ ] Variable names: descriptive (dailyCapacityKg, not cap)
   
   ### Logic Review
   - [ ] Capacity validated before task assignment (capacity > usedCapacity)
   - [ ] Status transition validated (only PENDING can be assigned)
   - [ ] Edge cases handled (null, empty, boundary values)
   - [ ] Points calculation logic correct (based on CitizenRewardRule)
   
   ### Security Review
   - [ ] @PreAuthorize on admin/enterprise endpoints
   - [ ] Input validation with @Valid
   - [ ] No sensitive data in logs
   
   ### Performance Review
   - [ ] No N+1 queries (use @EntityGraph)
   - [ ] Pagination for list endpoints
   - [ ] Proper indexes on database (status, area_id, created_at)
   
   ### Style Review
   - [ ] Code formatting consistent
   - [ ] Imports organized
   - [ ] No commented-out code

4. **Feedback**
   
   ### Critical Issues (Must Fix)
   - Missing capacity validation
   - Missing @Transactional on write operations
   - Security vulnerabilities (missing auth check)
   
   ### Suggestions (Nice to Have)
   - Add more descriptive log messages
   - Consider caching for frequently accessed capabilities
   - Add metrics for monitoring
   
   ### Status
   - ✅ **Approved**: All critical items pass
   - ⚠️ **Minor Changes**: 1-2 suggestions to consider
   - ❌ **Request Changes**: Critical issues found
