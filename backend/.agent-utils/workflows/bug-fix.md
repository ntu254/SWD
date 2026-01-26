---
description: Workflow for fixing bugs in Reward Management or other modules
---

# Bug Fix Workflow

This workflow ensures bugs are fixed systematically with reproduction steps and regression testing.

## Steps

1. **Analysis**
   - Understand the reported issue
   - Identify the root cause
   - Read `.agent-utils/MEMORY.md` for known issues
   - Common Reward Module bugs:
     - Stock not decrementing on approval
     - Status transition not validated
     - Duplicate reward item names allowed
     - Points not returned on rejection

2. **Reproduction**
   - Create a failing test case that reproduces the bug
   - Verify the test fails as expected
   - Example for Reward Module:
     ```java
     @Test
     void approveRedemption_WhenStockZero_ShouldThrowException() {
         // Setup
         RewardItem item = createItem();
         item.setStock(0);
         RewardRedemption redemption = createRedemption(item);
         
         // Should throw OutOfStockException
         assertThrows(OutOfStockException.class, 
             () -> service.approveRedemption(redemption.getId(), adminId));
     }
     ```

3. **Implementation**
   - Apply the fix in the code
   - Ensure minimal impact on other components
   - For Reward Module fixes:
     - Add stock validation in approveRedemption
     - Add status check before processing
     - Add unique constraint check for names

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
     ### Bug: Stock not decremented on approval
     - Root cause: Missing stock update in approveRedemption
     - Solution: Added item.setStock(item.getStock() - 1) before save
     - Date: 2026-01-25
     ```
