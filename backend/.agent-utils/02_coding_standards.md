# Coding Standards

> **AI Agent Instruction**: Follow these coding conventions EXACTLY when writing code. Any deviation from these standards is considered a bug.

---

## 1. Naming Conventions

### General Rules

| Element | Convention | Example |
|---------|------------|---------|
| **Class** | PascalCase | `RewardService`, `RewardItemController` |
| **Method** | camelCase | `getRewardById()`, `createRewardItem()` |
| **Variable** | camelCase | `rewardId`, `pointsCost` |
| **Constant** | UPPER_SNAKE_CASE | `MAX_REDEMPTION_PER_DAY`, `DEFAULT_PAGE_SIZE` |
| **Package/Module** | lowercase | `com.example.features.reward` |
| **Database Table** | snake_case | `reward_item`, `reward_redemption` |
| **Database Column** | snake_case | `points_cost`, `citizen_id` |

### Specific Patterns for Reward Module

```
Controller:     AdminRewardController, CitizenRewardController
Service:        RewardService
ServiceImpl:    RewardServiceImpl
Repository:     RewardItemRepository, RewardRedemptionRepository
Entity:         RewardItem, RewardRedemption
DTO Request:    RewardItemCreateRequest, RewardItemUpdateRequest
DTO Response:   RewardItemResponse, RewardRedemptionResponse
```

---

## 2. File Structure Template

### Controller (Admin Reward Management)
```java
@RestController
@RequestMapping("/api/v1/admin/rewards")
@RequiredArgsConstructor
@Tag(name = "Admin Reward Management", description = "APIs for managing reward items and redemptions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRewardController {
    
    private final RewardService rewardService;
    
    // GET endpoints first
    @GetMapping("/items")
    @Operation(summary = "Get all reward items")
    public Page<RewardItemResponse> getAllRewardItems(Pageable pageable) { ... }
    
    @GetMapping("/items/{id}")
    @Operation(summary = "Get reward item by ID")
    public RewardItemResponse getRewardItemById(@PathVariable Long id) { ... }
    
    @GetMapping("/redemptions")
    @Operation(summary = "Get all redemption requests")
    public Page<RewardRedemptionResponse> getRedemptions(Pageable pageable) { ... }
    
    // POST endpoints second
    @PostMapping("/items")
    @Operation(summary = "Create new reward item")
    @ResponseStatus(HttpStatus.CREATED)
    public RewardItemResponse createRewardItem(@Valid @RequestBody RewardItemCreateRequest request) { ... }
    
    // PUT/PATCH endpoints third
    @PutMapping("/items/{id}")
    @Operation(summary = "Update reward item")
    public RewardItemResponse updateRewardItem(@PathVariable Long id, @Valid @RequestBody RewardItemUpdateRequest request) { ... }
    
    @PatchMapping("/redemptions/{id}/approve")
    @Operation(summary = "Approve redemption request")
    public RewardRedemptionResponse approveRedemption(@PathVariable Long id) { ... }
    
    @PatchMapping("/redemptions/{id}/reject")
    @Operation(summary = "Reject redemption request")
    public RewardRedemptionResponse rejectRedemption(@PathVariable Long id, @RequestBody String reason) { ... }
    
    // DELETE endpoints last
    @DeleteMapping("/items/{id}")
    @Operation(summary = "Delete reward item (soft delete)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRewardItem(@PathVariable Long id) { ... }
}
```

### Service Interface
```java
public interface RewardService {
    // Query methods first (find, get, list)
    Page<RewardItemResponse> findAllRewardItems(Pageable pageable);
    RewardItemResponse findRewardItemById(Long id);
    Page<RewardRedemptionResponse> findAllRedemptions(Pageable pageable);
    Page<RewardRedemptionResponse> findRedemptionsByStatus(String status, Pageable pageable);
    
    // Command methods second (create, update, delete)
    RewardItemResponse createRewardItem(RewardItemCreateRequest request);
    RewardItemResponse updateRewardItem(Long id, RewardItemUpdateRequest request);
    void deleteRewardItem(Long id);
    RewardRedemptionResponse approveRedemption(Long id, Long adminId);
    RewardRedemptionResponse rejectRedemption(Long id, Long adminId, String reason);
}
```

### Service Implementation
```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RewardServiceImpl implements RewardService {
    
    private final RewardItemRepository rewardItemRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final CitizenProfileRepository citizenProfileRepository;
    
    @Override
    public RewardItemResponse findRewardItemById(Long id) {
        return rewardItemRepository.findByIdAndDeletedAtIsNull(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("RewardItem", id));
    }
    
    @Override
    @Transactional
    public RewardItemResponse createRewardItem(RewardItemCreateRequest request) {
        log.info("[REWARD_ITEM_CREATE] name={}, pointsCost={}", request.getName(), request.getPointsCost());
        
        RewardItem item = new RewardItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPointsCost(request.getPointsCost());
        item.setStock(request.getStock());
        item.setImageUrl(request.getImageUrl());
        item.setStatus(RewardItemStatus.ACTIVE);
        
        RewardItem saved = rewardItemRepository.save(item);
        log.info("[REWARD_ITEM_CREATED] id={}", saved.getId());
        
        return toResponse(saved);
    }
    
    @Override
    @Transactional
    public RewardRedemptionResponse approveRedemption(Long id, Long adminId) {
        log.info("[REDEMPTION_APPROVE] id={}, adminId={}", id, adminId);
        
        RewardRedemption redemption = redemptionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("RewardRedemption", id));
        
        if (redemption.getStatus() != RedemptionStatus.PENDING) {
            throw new BusinessException("Redemption already processed");
        }
        
        redemption.setStatus(RedemptionStatus.APPROVED);
        redemption.setProcessedBy(adminId);
        redemption.setProcessedAt(Instant.now());
        
        // Deduct stock
        RewardItem item = redemption.getRewardItem();
        if (item.getStock() < 1) {
            throw new BusinessException("Reward item out of stock");
        }
        item.setStock(item.getStock() - 1);
        
        redemptionRepository.save(redemption);
        log.info("[REDEMPTION_APPROVED] id={}", id);
        
        return toResponse(redemption);
    }
}
```

---

## 3. Error Handling Pattern

### Exception Hierarchy
```
BusinessException (abstract)
├── ResourceNotFoundException      → 404: Reward item/redemption not found
├── ValidationException           → 400: Invalid points cost, stock < 0
├── ConflictException            → 409: Duplicate reward name
├── InsufficientPointsException  → 422: Citizen không đủ điểm đổi thưởng
├── OutOfStockException          → 422: Reward item hết hàng
└── InvalidStatusTransitionException → 422: Không thể approve redemption đã rejected
```

### Error Response Format
```json
{
    "timestamp": "2026-01-25T20:40:00Z",
    "status": 404,
    "error": "Not Found",
    "message": "RewardItem with id 123 not found",
    "path": "/api/v1/admin/rewards/items/123"
}
```

### Exception Handling
```java
// ❌ DON'T: Generic exception
throw new RuntimeException("Reward not found");

// ✅ DO: Specific exception with context
throw new ResourceNotFoundException("RewardItem", rewardId);

// ✅ DO: Business-specific exception
throw new InsufficientPointsException(citizenId, requiredPoints, currentBalance);
```

---

## 4. Logging Standards

### Log Levels

| Level | Usage |
|-------|-------|
| `ERROR` | Redemption failed, Database error |
| `WARN` | Low stock warning, Invalid redemption attempt |
| `INFO` | Reward created, Redemption approved/rejected |
| `DEBUG` | Detailed flow for debugging |

### Logging Pattern for Reward Module
```java
// ✅ DO: Structured logging for reward events
log.info("[REWARD_ITEM_CREATED] id={}, name={}, pointsCost={}", item.getId(), item.getName(), item.getPointsCost());
log.info("[REDEMPTION_APPROVED] redemptionId={}, citizenId={}, rewardItemId={}", id, citizenId, itemId);
log.info("[REDEMPTION_REJECTED] redemptionId={}, reason={}", id, reason);
log.warn("[LOW_STOCK_WARNING] rewardItemId={}, currentStock={}", itemId, stock);
```

---

## 5. Design Patterns Used

```
[x] Repository Pattern      - Data access abstraction
[x] Service Layer          - Business logic encapsulation  
[x] DTO Pattern            - Data transfer between layers
[x] Builder Pattern        - Complex DTO construction
[ ] Factory Pattern        - Object creation
[ ] Strategy Pattern       - Algorithm encapsulation
[ ] Observer Pattern       - Event handling
```

---

## 6. Do's and Don'ts

### ✅ DO

- Use constructor injection (`@RequiredArgsConstructor`)
- Keep methods under 30 lines
- Write descriptive variable names (`rewardItemId`, not `id`)
- Add JavaDoc for public APIs
- Use `Optional` instead of null checks
- Validate input at controller level (`@Valid`)
- Check stock before approving redemption
- Log all state transitions (create, approve, reject)

### ❌ DON'T

- Use field injection (`@Autowired` on fields)
- Use magic numbers (use `MAX_STOCK = 1000`)
- Catch `Exception` - catch specific exceptions
- Mix business logic in controllers
- Return entities directly from controllers
- Use `@Transactional` without specifying `readOnly`
- Allow negative stock or points cost
- Approve redemption without checking stock

---

## 7. Code Quality Checklist for Reward Module

Before committing, verify:

- [ ] No hardcoded values (use constants or config)
- [ ] All public methods have proper documentation
- [ ] Error messages are user-friendly
- [ ] Logging is appropriate for audit trail
- [ ] No commented-out code
- [ ] Stock validation before redemption approval
- [ ] Points deduction handled atomically
- [ ] Status transitions are validated
