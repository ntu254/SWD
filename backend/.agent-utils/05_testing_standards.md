# Testing Standards

> **AI Agent Instruction**: Follow these testing conventions when writing tests. All new code MUST have corresponding tests.

---

## 1. Test Pyramid

```
        /\
       /  \        E2E Tests (5%)
      /----\       - Critical user flows only
     /      \
    /--------\     Integration Tests (25%)
   /          \    - API endpoints, DB queries
  /------------\
 /              \  Unit Tests (70%)
/----------------\ - Business logic, utilities
```

### Coverage Requirements

| Layer | Min Coverage | Target Coverage |
|-------|--------------|-----------------|
| **Service** | 80% | 90% |
| **Repository** | 60% | 80% |
| **Controller** | 50% | 70% |
| **Utility** | 90% | 100% |

---

## 2. Test Naming Convention

### Pattern
```
{MethodName}_{Scenario}_{ExpectedResult}

Examples for Reward Module:
- createRewardItem_WhenValidData_ReturnsCreatedItem
- createRewardItem_WhenDuplicateName_ThrowsConflictException
- approveRedemption_WhenPending_ReturnsApprovedRedemption
- approveRedemption_WhenAlreadyProcessed_ThrowsBusinessException
- approveRedemption_WhenOutOfStock_ThrowsOutOfStockException
```

### Given-When-Then Comment Structure
```java
@Test
void approveRedemption_WhenPendingAndInStock_ReturnsApprovedRedemption() {
    // Given: Initial state
    Long redemptionId = 1L;
    Long adminId = 100L;
    RewardRedemption pendingRedemption = createPendingRedemption(redemptionId);
    when(redemptionRepository.findById(redemptionId)).thenReturn(Optional.of(pendingRedemption));
    
    // When: Action performed
    RedemptionResponse result = rewardService.approveRedemption(redemptionId, adminId);
    
    // Then: Verify expectations
    assertThat(result.getStatus()).isEqualTo(RedemptionStatus.APPROVED);
    assertThat(result.getProcessedBy()).isEqualTo(adminId);
    verify(redemptionRepository).save(any());
}
```

---

## 3. Test File Organization

### Folder Structure
```
src/test/
├── java/com/example/features/reward/
│   ├── service/
│   │   └── RewardServiceTest.java         # Unit tests
│   ├── repository/
│   │   ├── RewardItemRepositoryTest.java  # Integration tests
│   │   └── RewardRedemptionRepositoryTest.java
│   ├── controller/
│   │   └── AdminRewardControllerTest.java # API tests
│   └── integration/
│       └── RewardFlowIntegrationTest.java # E2E tests
└── resources/
    ├── application-test.yml
    └── test-data/
        ├── reward-items.json
        └── redemptions.json
```

---

## 4. Unit Test Template for Reward Service

```java
@ExtendWith(MockitoExtension.class)
class RewardServiceTest {

    @Mock
    private RewardItemRepository rewardItemRepository;
    
    @Mock
    private RewardRedemptionRepository redemptionRepository;
    
    @Mock
    private CitizenProfileRepository citizenProfileRepository;
    
    @InjectMocks
    private RewardServiceImpl rewardService;
    
    @Nested
    @DisplayName("createRewardItem")
    class CreateRewardItem {
        
        @Test
        @DisplayName("should create reward item when valid data")
        void whenValidData_ReturnsCreatedItem() {
            // Given
            RewardItemCreateRequest request = new RewardItemCreateRequest();
            request.setName("Gift Card 100K");
            request.setPointsCost(5000);
            request.setStock(50);
            
            RewardItem savedItem = createTestRewardItem(1L, "Gift Card 100K", 5000);
            when(rewardItemRepository.existsByNameAndDeletedAtIsNull("Gift Card 100K")).thenReturn(false);
            when(rewardItemRepository.save(any())).thenReturn(savedItem);
            
            // When
            RewardItemResponse result = rewardService.createRewardItem(request);
            
            // Then
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getName()).isEqualTo("Gift Card 100K");
            assertThat(result.getPointsCost()).isEqualTo(5000);
            verify(rewardItemRepository).save(any());
        }
        
        @Test
        @DisplayName("should throw ConflictException when duplicate name")
        void whenDuplicateName_ThrowsConflictException() {
            // Given
            RewardItemCreateRequest request = new RewardItemCreateRequest();
            request.setName("Existing Item");
            when(rewardItemRepository.existsByNameAndDeletedAtIsNull("Existing Item")).thenReturn(true);
            
            // When/Then
            assertThrows(ConflictException.class, 
                () -> rewardService.createRewardItem(request));
            verify(rewardItemRepository, never()).save(any());
        }
    }
    
    @Nested
    @DisplayName("approveRedemption")
    class ApproveRedemption {
        
        @Test
        @DisplayName("should approve when pending and in stock")
        void whenPendingAndInStock_ReturnsApproved() {
            // Given
            Long redemptionId = 1L;
            Long adminId = 100L;
            
            RewardItem item = createTestRewardItem(1L, "Gift", 1000);
            item.setStock(10);
            
            RewardRedemption redemption = new RewardRedemption();
            redemption.setId(redemptionId);
            redemption.setStatus(RedemptionStatus.PENDING);
            redemption.setRewardItem(item);
            redemption.setPointsUsed(1000);
            
            when(redemptionRepository.findById(redemptionId)).thenReturn(Optional.of(redemption));
            when(redemptionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            
            // When
            RedemptionResponse result = rewardService.approveRedemption(redemptionId, adminId);
            
            // Then
            assertThat(result.getStatus()).isEqualTo(RedemptionStatus.APPROVED);
            assertThat(item.getStock()).isEqualTo(9); // Stock decremented
            verify(redemptionRepository).save(any());
        }
        
        @Test
        @DisplayName("should throw when already processed")
        void whenAlreadyProcessed_ThrowsBusinessException() {
            // Given
            RewardRedemption redemption = new RewardRedemption();
            redemption.setId(1L);
            redemption.setStatus(RedemptionStatus.APPROVED); // Already processed
            when(redemptionRepository.findById(1L)).thenReturn(Optional.of(redemption));
            
            // When/Then
            assertThrows(BusinessException.class, 
                () -> rewardService.approveRedemption(1L, 100L));
        }
        
        @Test
        @DisplayName("should throw when out of stock")
        void whenOutOfStock_ThrowsOutOfStockException() {
            // Given
            RewardItem item = createTestRewardItem(1L, "Gift", 1000);
            item.setStock(0); // Out of stock
            
            RewardRedemption redemption = new RewardRedemption();
            redemption.setId(1L);
            redemption.setStatus(RedemptionStatus.PENDING);
            redemption.setRewardItem(item);
            
            when(redemptionRepository.findById(1L)).thenReturn(Optional.of(redemption));
            
            // When/Then
            assertThrows(OutOfStockException.class, 
                () -> rewardService.approveRedemption(1L, 100L));
        }
    }
    
    // Helper methods
    private RewardItem createTestRewardItem(Long id, String name, Integer pointsCost) {
        RewardItem item = new RewardItem();
        item.setId(id);
        item.setName(name);
        item.setPointsCost(pointsCost);
        item.setStock(10);
        item.setStatus(RewardItemStatus.ACTIVE);
        return item;
    }
}
```

---

## 5. Integration Test Template

### Repository Test
```java
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class RewardItemRepositoryTest {

    @Autowired
    private RewardItemRepository repository;
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Test
    void findByIdAndDeletedAtIsNull_WhenExists_ReturnsItem() {
        // Given
        RewardItem item = new RewardItem();
        item.setName("Test Gift Card");
        item.setPointsCost(1000);
        item.setStock(10);
        item.setStatus(RewardItemStatus.ACTIVE);
        entityManager.persist(item);
        entityManager.flush();
        
        // When
        Optional<RewardItem> result = repository.findByIdAndDeletedAtIsNull(item.getId());
        
        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Test Gift Card");
    }
    
    @Test
    void findByIdAndDeletedAtIsNull_WhenDeleted_ReturnsEmpty() {
        // Given
        RewardItem item = new RewardItem();
        item.setName("Deleted Item");
        item.setPointsCost(1000);
        item.setStock(10);
        item.setDeletedAt(Instant.now()); // Soft deleted
        entityManager.persist(item);
        entityManager.flush();
        
        // When
        Optional<RewardItem> result = repository.findByIdAndDeletedAtIsNull(item.getId());
        
        // Then
        assertThat(result).isEmpty();
    }
    
    @Test
    void findActiveItemsWithStock_ReturnsOnlyActiveWithStock() {
        // Given
        RewardItem active = createItem("Active", 10, RewardItemStatus.ACTIVE);
        RewardItem noStock = createItem("NoStock", 0, RewardItemStatus.ACTIVE);
        RewardItem inactive = createItem("Inactive", 10, RewardItemStatus.INACTIVE);
        entityManager.persist(active);
        entityManager.persist(noStock);
        entityManager.persist(inactive);
        entityManager.flush();
        
        // When
        List<RewardItem> result = repository.findByStatusAndStockGreaterThanAndDeletedAtIsNull(
            RewardItemStatus.ACTIVE, 0);
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Active");
    }
    
    private RewardItem createItem(String name, int stock, RewardItemStatus status) {
        RewardItem item = new RewardItem();
        item.setName(name);
        item.setPointsCost(1000);
        item.setStock(stock);
        item.setStatus(status);
        return item;
    }
}
```

### Controller Test
```java
@WebMvcTest(AdminRewardController.class)
@WithMockUser(roles = "ADMIN")
class AdminRewardControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private RewardService rewardService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    void createRewardItem_WhenValidData_Returns201() throws Exception {
        // Given
        RewardItemCreateRequest request = new RewardItemCreateRequest();
        request.setName("Gift Card");
        request.setPointsCost(5000);
        request.setStock(50);
        
        RewardItemResponse response = new RewardItemResponse();
        response.setId(1L);
        response.setName("Gift Card");
        response.setPointsCost(5000);
        
        when(rewardService.createRewardItem(any())).thenReturn(response);
        
        // When/Then
        mockMvc.perform(post("/api/v1/admin/rewards/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.id").value(1))
            .andExpect(jsonPath("$.data.name").value("Gift Card"));
    }
    
    @Test
    void approveRedemption_WhenFound_Returns200() throws Exception {
        // Given
        RedemptionResponse response = new RedemptionResponse();
        response.setId(1L);
        response.setStatus(RedemptionStatus.APPROVED);
        
        when(rewardService.approveRedemption(eq(1L), any())).thenReturn(response);
        
        // When/Then
        mockMvc.perform(patch("/api/v1/admin/rewards/redemptions/1/approve"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }
    
    @Test
    void getRewardItem_WhenNotFound_Returns404() throws Exception {
        // Given
        when(rewardService.findRewardItemById(999L))
            .thenThrow(new ResourceNotFoundException("RewardItem", 999L));
        
        // When/Then
        mockMvc.perform(get("/api/v1/admin/rewards/items/999"))
            .andExpect(status().isNotFound());
    }
}
```

---

## 6. Mocking Strategy

### When to Mock

| Dependency | Mock? | Reason |
|------------|-------|--------|
| RewardItemRepository | ⚠️ Unit: Mock, Integration: Real | Test service logic in isolation |
| CitizenProfileRepository | ✅ Yes | External dependency |
| Time/Date | ✅ Yes | Deterministic tests |
| External APIs (Firebase) | ✅ Yes | Unreliable, slow |

---

## 7. Test Data Management

### Test Fixtures for Reward Module
```java
public class RewardTestFixtures {
    
    public static RewardItem createActiveRewardItem() {
        return createRewardItem(1L, "Test Gift", 1000, 10, RewardItemStatus.ACTIVE);
    }
    
    public static RewardItem createRewardItem(Long id, String name, Integer pointsCost, Integer stock, RewardItemStatus status) {
        RewardItem item = new RewardItem();
        item.setId(id);
        item.setName(name);
        item.setPointsCost(pointsCost);
        item.setStock(stock);
        item.setStatus(status);
        item.setCreatedAt(Instant.now());
        return item;
    }
    
    public static RewardRedemption createPendingRedemption(RewardItem item, AppUser citizen) {
        RewardRedemption redemption = new RewardRedemption();
        redemption.setId(1L);
        redemption.setRewardItem(item);
        redemption.setCitizen(citizen);
        redemption.setPointsUsed(item.getPointsCost());
        redemption.setStatus(RedemptionStatus.PENDING);
        redemption.setCreatedAt(Instant.now());
        return redemption;
    }
}
```

---

## 8. Test Checklist for Reward Module

Before marking test complete:

- [ ] Happy path tested (create, approve, reject)
- [ ] Edge cases covered:
  - [ ] Duplicate reward item name
  - [ ] Zero/negative points cost
  - [ ] Out of stock
  - [ ] Already processed redemption
  - [ ] Non-existent item/redemption
- [ ] Exception scenarios tested
- [ ] No hardcoded values (use constants)
- [ ] Tests are independent (no shared state)
- [ ] Tests are fast (< 1 second each)
- [ ] Descriptive test names
- [ ] No flaky tests
