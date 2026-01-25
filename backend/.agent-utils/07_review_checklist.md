# Review Checklist

> **AI Agent Instruction**: Use this checklist to self-review your code BEFORE submitting. Every item must pass.

---

## 1. Code Quality Checklist

### Naming & Style
- [ ] Class names follow PascalCase (RewardItem, RewardRedemption)
- [ ] Method names follow camelCase (createRewardItem, approveRedemption)
- [ ] Variable names are descriptive (pointsCost, rewardItemId)
- [ ] Constants are UPPER_SNAKE_CASE (MAX_STOCK, DEFAULT_STATUS)
- [ ] No abbreviations unless widely known (URL, ID)
- [ ] Consistent terminology (RewardItem everywhere, not Gift/Prize)

### Structure
- [ ] Methods are under 30 lines
- [ ] Classes have single responsibility
- [ ] No duplicate code (DRY principle)
- [ ] Proper use of design patterns (Repository, Service)
- [ ] Clear separation of concerns (Controller → Service → Repository)

### Error Handling
- [ ] Specific exceptions thrown (ResourceNotFoundException, OutOfStockException)
- [ ] Error messages are informative ("RewardItem with id 123 not found")
- [ ] All exceptions are properly handled
- [ ] No silent failures (catch without action)
- [ ] Business exceptions for domain rules (InsufficientPointsException)

### Logging
- [ ] Appropriate log levels used (INFO for state changes, ERROR for failures)
- [ ] No sensitive data in logs (no passwords, tokens)
- [ ] Parameterized logging (log.info("[ACTION] id={}", id))
- [ ] Entry/exit logs for critical methods
- [ ] Structured format: [REWARD_ITEM_CREATED], [REDEMPTION_APPROVED]

---

## 2. Security Checklist

### Authentication & Authorization
- [ ] Admin endpoints require @PreAuthorize("hasRole('ADMIN')")
- [ ] Role-based access control applied correctly
- [ ] No hard-coded credentials
- [ ] Sensitive data not exposed in responses (no password fields)

### Input Validation
- [ ] All user inputs validated (@Valid, @NotNull, @Min, @Max)
- [ ] SQL injection prevention (parameterized queries via JPA)
- [ ] XSS prevention (output encoding)
- [ ] Request size limits applied
- [ ] Points cost > 0 validation
- [ ] Stock >= 0 validation

### Data Protection
- [ ] Audit trail for sensitive operations (createdBy, updatedBy)
- [ ] Soft delete preserves data for audit
- [ ] PII handled according to policy (citizen info in redemption)

---

## 3. Performance Checklist

### Database
- [ ] N+1 queries eliminated (use @EntityGraph for redemption.rewardItem)
- [ ] Proper indexes exist for queries (status, citizen_id)
- [ ] Pagination used for list endpoints (Pageable)
- [ ] Projections used for list responses

### API
- [ ] Response size is reasonable (not returning entire entity tree)
- [ ] No unnecessary data in responses (DTOs, not entities)
- [ ] Caching headers set appropriately
- [ ] Async operations where beneficial

### Memory
- [ ] No memory leaks (streams closed, resources released)
- [ ] Large objects not held in memory
- [ ] Collections sized appropriately

---

## 4. Documentation Checklist

### Code Documentation
- [ ] Public APIs have JavaDoc/comments
- [ ] Complex logic explained (stock validation, status transitions)
- [ ] No outdated/stale comments
- [ ] README updated if setup changed

### API Documentation
- [ ] @Tag annotation on controller ("Admin Reward Management")
- [ ] @Operation annotation on endpoints with summary
- [ ] @ApiResponse for all possible responses (200, 201, 400, 404, 422)
- [ ] Request/Response schemas documented via DTOs

---

## 5. Testing Checklist

### Coverage
- [ ] Unit tests for RewardServiceImpl methods
- [ ] Happy path tested (create, approve, reject success)
- [ ] Error scenarios tested (not found, already processed, out of stock)
- [ ] Edge cases covered (stock = 0, duplicate name)

### Quality
- [ ] Tests are independent (no shared state)
- [ ] No flaky tests
- [ ] Descriptive test names (approveRedemption_WhenOutOfStock_ThrowsException)
- [ ] Fast execution (< 1 second each)

---

## 6. Database Checklist

### Migrations
- [ ] Migration file named correctly (V{n}__create_reward_item_table.sql)
- [ ] Backward compatible (if needed)
- [ ] No data loss
- [ ] Indexes created for foreign keys (citizen_id, reward_item_id)
- [ ] Unique constraints where needed (reward_item.name)
- [ ] Check constraints (points_cost > 0, stock >= 0)

### Entity
- [ ] Audit fields present (createdAt, updatedAt, createdBy)
- [ ] Relationships mapped correctly (ManyToOne for redemption.rewardItem)
- [ ] Cascade settings appropriate
- [ ] Lazy loading used by default (FetchType.LAZY)
- [ ] Soft delete implemented (deletedAt field)
- [ ] @SQLRestriction for auto-filtering deleted records

---

## 7. Integration Checklist

### API Contracts
- [ ] Request format matches specification (JSON body)
- [ ] Response format matches specification (wrapped in data field)
- [ ] Status codes are correct (201 for create, 204 for delete)
- [ ] Error responses are standardized

### Compatibility
- [ ] No breaking changes to existing APIs
- [ ] Deprecated endpoints marked (not removed)
- [ ] Version incremented if breaking change

---

## 8. Reward Module Specific Checklist

### Business Logic
- [ ] Stock validated before approval (stock > 0)
- [ ] Status transition validated (only PENDING can be approved/rejected)
- [ ] Stock decremented atomically on approval
- [ ] Points deducted from citizen on redemption creation (if applicable)
- [ ] Points returned on rejection (if applicable)
- [ ] Duplicate reward item name prevented

### State Management
- [ ] RewardItemStatus: ACTIVE, INACTIVE, OUT_OF_STOCK
- [ ] RedemptionStatus: PENDING → APPROVED/REJECTED → DELIVERED
- [ ] Status changes logged for audit

### Admin Operations
- [ ] Only ADMIN can CRUD reward items
- [ ] Only ADMIN can approve/reject redemptions
- [ ] Rejection requires reason
- [ ] Process info recorded (processedBy, processedAt)

---

## Quick Pass/Fail Summary

```
MUST PASS ALL:

□ Code compiles without errors
□ All existing tests pass
□ New tests added and passing
□ No security vulnerabilities
□ Follows coding standards
□ Documentation updated
□ Stock validation implemented
□ Status transitions validated
□ Admin-only access enforced
□ Audit trail complete
```

---

## Review Outcome

| Status | Criteria |
|--------|----------|
| ✅ **Approved** | All checklists pass |
| ⚠️ **Minor Issues** | 1-2 non-critical items need fix |
| ❌ **Needs Work** | Critical items failing or many issues |
