# Database Conventions

> **AI Agent Instruction**: Follow these database conventions when creating migrations, entities, and queries.

---

## 1. Naming Conventions

### Tables

| Element | Convention | Example |
|---------|------------|---------|
| **Table Name** | snake_case, singular | `reward_item`, `reward_redemption` |
| **Junction Table** | `{table1}_{table2}` | `user_roles`, `enterprise_waste_type` |
| **Column Name** | snake_case | `points_cost`, `citizen_id` |
| **Primary Key** | `id` | `id BIGSERIAL PRIMARY KEY` |
| **Foreign Key** | `{referenced_table}_id` | `citizen_id`, `reward_item_id` |
| **Index** | `idx_{table}_{column}` | `idx_reward_item_status` |
| **Unique Constraint** | `uk_{table}_{column}` | `uk_reward_item_name` |

---

## 2. Migration Strategy

### Tool: `Flyway`

### File Naming
```
V{version}__{description}.sql

Examples:
V1__create_users_table.sql
V15__create_reward_item_table.sql
V16__create_reward_redemption_table.sql
V17__add_stock_to_reward_item.sql
```

### Migration Rules

> [!CAUTION]
> **NEVER** modify existing migration files after they've been applied.

```sql
-- ✅ DO: Create new migration for changes
-- V18__add_image_url_to_reward_item.sql
ALTER TABLE reward_item ADD COLUMN image_url VARCHAR(500);

-- ❌ DON'T: Modify V15__create_reward_item_table.sql
```

---

## 3. Data Types Standards

### Recommended Types

| Purpose | PostgreSQL | Example |
|---------|------------|---------|
| **ID** | `BIGSERIAL` | `id BIGSERIAL PRIMARY KEY` |
| **UUID** | `UUID` | `uuid UUID DEFAULT gen_random_uuid()` |
| **Short Text** | `VARCHAR(n)` | `name VARCHAR(200)` |
| **Long Text** | `TEXT` | `description TEXT` |
| **Boolean** | `BOOLEAN` | `is_active BOOLEAN DEFAULT true` |
| **Timestamp** | `TIMESTAMPTZ` | `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` |
| **Money/Points** | `INTEGER` | `points_cost INTEGER NOT NULL` |
| **Stock** | `INTEGER` | `stock INTEGER NOT NULL DEFAULT 0` |
| **Status** | `VARCHAR(50)` | `status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'` |
| **JSON** | `JSONB` | `metadata JSONB` |

---

## 4. Reward Module Table Templates

### REWARD_ITEM Table
```sql
-- V15__create_reward_item_table.sql
CREATE TABLE reward_item (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Business Columns
    name VARCHAR(200) NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    
    -- Audit Columns (REQUIRED)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT,
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- Indexes
CREATE INDEX idx_reward_item_status ON reward_item(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_reward_item_points_cost ON reward_item(points_cost) WHERE deleted_at IS NULL;

-- Unique constraint
CREATE UNIQUE INDEX uk_reward_item_name ON reward_item(name) WHERE deleted_at IS NULL;
```

### REWARD_REDEMPTION Table
```sql
-- V16__create_reward_redemption_table.sql
CREATE TABLE reward_redemption (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Foreign Keys
    citizen_id BIGINT NOT NULL REFERENCES app_user(id),
    reward_item_id BIGINT NOT NULL REFERENCES reward_item(id),
    
    -- Business Columns
    points_used INTEGER NOT NULL CHECK (points_used > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    note TEXT,
    rejection_reason TEXT,
    
    -- Processing Info
    processed_by BIGINT REFERENCES app_user(id),
    processed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Audit Columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reward_redemption_citizen ON reward_redemption(citizen_id);
CREATE INDEX idx_reward_redemption_status ON reward_redemption(status);
CREATE INDEX idx_reward_redemption_created ON reward_redemption(created_at DESC);

-- Composite index for admin queries
CREATE INDEX idx_reward_redemption_status_created ON reward_redemption(status, created_at DESC);
```

---

## 5. Indexing Strategy

### When to Create Indexes

| Scenario | Create Index? |
|----------|---------------|
| Primary Key | ✅ Automatic |
| Foreign Key (citizen_id, reward_item_id) | ✅ Yes |
| Status column (frequent filtering) | ✅ Yes |
| Created_at (ordering) | ✅ Yes |
| Points_cost (range queries) | ⚠️ Consider |
| Description (text search) | ❌ No |

### Index Types for Reward Module
```sql
-- Partial Index - Only active items
CREATE INDEX idx_reward_item_active ON reward_item(name) WHERE deleted_at IS NULL AND status = 'ACTIVE';

-- Composite Index - Admin dashboard queries
CREATE INDEX idx_redemption_dashboard ON reward_redemption(status, created_at DESC);

-- Covering Index - List queries
CREATE INDEX idx_reward_item_list ON reward_item(id, name, points_cost, stock, status) WHERE deleted_at IS NULL;
```

---

## 6. Soft Delete vs Hard Delete

### Policy: `Soft Delete` for Reward Module

### Soft Delete Implementation
```sql
-- Table structure
deleted_at TIMESTAMPTZ,
deleted_by BIGINT

-- Query pattern (ALWAYS filter)
SELECT * FROM reward_item WHERE deleted_at IS NULL;

-- Soft delete operation
UPDATE reward_item SET deleted_at = NOW(), deleted_by = :adminId WHERE id = :itemId;
```

### When to Use Hard Delete
```
[ ] Temporary data (sessions, tokens)
[ ] Test data cleanup
[ ] GDPR/compliance requests (with audit log)
```

---

## 7. Entity Template for Reward Module

### RewardItem Entity
```java
@Entity
@Table(name = "reward_item")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("deleted_at IS NULL")
public class RewardItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "points_cost", nullable = false)
    private Integer pointsCost;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private RewardItemStatus status = RewardItemStatus.ACTIVE;

    // Audit fields
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by")
    private Long createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private Long updatedBy;

    // Soft delete
    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;
}
```

### RewardRedemption Entity
```java
@Entity
@Table(name = "reward_redemption")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class RewardRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private AppUser citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_item_id", nullable = false)
    private RewardItem rewardItem;

    @Column(name = "points_used", nullable = false)
    private Integer pointsUsed;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private RedemptionStatus status = RedemptionStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "processed_by")
    private Long processedBy;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
```

---

## 8. Query Optimization Rules

### ✅ DO

```java
// Use Projection for list queries
@Query("SELECT new com.example.dto.RewardItemSummary(r.id, r.name, r.pointsCost, r.stock) FROM RewardItem r WHERE r.deletedAt IS NULL")
List<RewardItemSummary> findAllSummaries();

// Paginate large results
Page<RewardRedemption> findByStatus(RedemptionStatus status, Pageable pageable);

// Use @EntityGraph for eager loading when needed
@EntityGraph(attributePaths = {"rewardItem", "citizen"})
Optional<RewardRedemption> findWithDetailsById(Long id);
```

### ❌ DON'T

```java
// N+1 Query - loading rewardItem in loop
redemptions.forEach(r -> r.getRewardItem().getName());

// Select * when only need few columns
repository.findAll(); // when only need id and name

// Load entire table
repository.findAll(); // without pagination
```

---

## 9. Status Enums

### RewardItemStatus
```java
public enum RewardItemStatus {
    ACTIVE,      // Có thể đổi thưởng
    INACTIVE,    // Tạm ngưng
    OUT_OF_STOCK // Hết hàng (auto-set when stock = 0)
}
```

### RedemptionStatus
```java
public enum RedemptionStatus {
    PENDING,    // Chờ duyệt
    APPROVED,   // Đã duyệt, chờ giao
    REJECTED,   // Từ chối
    DELIVERED,  // Đã giao
    CANCELLED   // Citizen hủy
}
```
