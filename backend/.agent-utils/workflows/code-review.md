---
description: Workflow for code review of Reward Management or other modules
---

# Code Review Workflow

This workflow acts as an automated quality gate for code changes.

## Steps

1. **Preparation**
   - Read `.agent-utils/07_review_checklist.md`
   - Identify the scope of changes (files modified)
   - For Reward Module, check:
     - RewardItem.java, RewardRedemption.java
     - RewardService.java, RewardServiceImpl.java
     - AdminRewardController.java
     - All DTO classes
     - Migration files

2. **Automated Checks**
   - Verify compilation: `./gradlew build`
   - Verify all tests pass: `./gradlew test`
   - Check test coverage (>80% for Service layer)

3. **Manual Review (AI Simulation)**
   
   ### Naming Review
   - [ ] Class names: PascalCase (RewardItem, not reward_item)
   - [ ] Method names: camelCase (createRewardItem)
   - [ ] Variable names: descriptive (pointsCost, not pc)
   
   ### Logic Review
   - [ ] Stock validated before approval (stock > 0)
   - [ ] Status transition validated (only PENDING can be processed)
   - [ ] Edge cases handled (null, empty, boundary values)
   - [ ] Points deduction/return logic correct
   
   ### Security Review
   - [ ] @PreAuthorize on admin endpoints
   - [ ] Input validation with @Valid
   - [ ] No sensitive data in logs
   
   ### Performance Review
   - [ ] No N+1 queries (use @EntityGraph)
   - [ ] Pagination for list endpoints
   - [ ] Proper indexes on database
   
   ### Style Review
   - [ ] Code formatting consistent
   - [ ] Imports organized
   - [ ] No commented-out code

4. **Feedback**
   
   ### Critical Issues (Must Fix)
   - Missing stock validation
   - Missing @Transactional on write operations
   - Security vulnerabilities (missing auth check)
   
   ### Suggestions (Nice to Have)
   - Add more descriptive log messages
   - Consider caching for frequently accessed items
   - Add metrics for monitoring
   
   ### Status
   - ✅ **Approved**: All critical items pass
   - ⚠️ **Minor Changes**: 1-2 suggestions to consider
   - ❌ **Request Changes**: Critical issues found
