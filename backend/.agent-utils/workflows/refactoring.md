---
description: Workflow for code refactoring in Reward Management or other modules
---

# Refactoring Workflow

This workflow guides safe refactoring to improve code quality without breaking functionality.

## Steps

1. **Planning**
   - Identify the scope of refactoring
   - Define success criteria (e.g., specific metric improvement)
   - Ensure existing tests pass 100%
   
   ### Common Refactoring Scenarios for Reward Module
   - Extract validation logic to separate class (RewardValidator)
   - Move DTO mapping to dedicated mapper (RewardMapper)
   - Consolidate duplicate code across services
   - Improve exception handling hierarchy

2. **Strategy**
   - Choose refactoring technique:
     - Extract Method: Break large methods into smaller ones
     - Extract Class: Move validation to RewardValidator
     - Rename: Improve naming for clarity
     - Move: Reorganize package structure
   - Plan incremental steps (baby steps)

3. **Execution**
   - Apply changes incrementally
   - Run tests after EVERY small change
   - DO NOT change public API contracts (unless planned)
   
   ### Example: Extract Validation Logic
   ```java
   // BEFORE: Validation in service
   public RedemptionResponse approveRedemption(Long id, Long adminId) {
       RewardRedemption redemption = repository.findById(id)
           .orElseThrow(() -> new ResourceNotFoundException("Redemption", id));
       
       if (redemption.getStatus() != RedemptionStatus.PENDING) {
           throw new BusinessException("Already processed");
       }
       
       if (redemption.getRewardItem().getStock() < 1) {
           throw new OutOfStockException(redemption.getRewardItem().getId());
       }
       // ... rest of logic
   }
   
   // AFTER: Validation in separate class
   public RedemptionResponse approveRedemption(Long id, Long adminId) {
       RewardRedemption redemption = repository.findById(id)
           .orElseThrow(() -> new ResourceNotFoundException("Redemption", id));
       
       validator.validateForApproval(redemption);
       // ... rest of logic
   }
   ```

4. **Verification**
   - Run full test suite: `./gradlew test`
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
