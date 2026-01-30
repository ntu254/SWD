# Database Conventions

> **AI Agent Instruction**: Follow these database conventions when creating migrations, entities, and queries.

---

## 1. Naming Conventions

### Tables

| Element | Convention | Example |
|---------|------------|---------|
| **Table Name** | snake_case, singular | `waste_report`, `task_assignment` |
| **Junction Table** | `{table1}_{table2}` or meaningful name | `task_assignment` (Task-Collector) |
| **Column Name** | snake_case | `estimated_weight_kg`, `area_id` |
| **Primary Key** | `{table}_id` (or `id`) | `report_id`, `task_id` (User request specifies `*_id`) |
| **Foreign Key** | `{referenced_table}_id` | `user_id`, `area_id` |
| **Index** | `idx_{table}_{column}` | `idx_waste_report_status` |
| **Unique Constraint** | `uk_{table}_{column}` | `uk_users_email` |

---

## 2. Migration Strategy

### Tool: `Flyway`

### File Naming
```
V{version}__{description}.sql
```

### Migration Rules

> [!CAUTION]
> **NEVER** modify existing migration files after they've been applied.

```sql
-- ✅ DO: Create new migration for changes
-- V18__add_lat_lng_to_service_area.sql
ALTER TABLE service_area ADD COLUMN lat DOUBLE PRECISION;

-- ❌ DON'T: Modify existing files
```

---

## 3. Data Types Standards

### Recommended Types

| Purpose | PostgreSQL | Example |
|---------|------------|---------|
| **PK** | `BIGSERIAL` / `BIGINT` | `task_id BIGSERIAL PRIMARY KEY` |
| **Short Text** | `VARCHAR(n)` | `full_name VARCHAR(100)` |
| **Long Text** | `TEXT` | `description TEXT` |
| **Geo** | `DOUBLE` / `GEOMETRY` | `lat DOUBLE PRECISION` |
| **Timestamp** | `TIMESTAMPTZ` | `created_at TIMESTAMPTZ DEFAULT NOW()` |
| **Status** | `VARCHAR(50)` | `status VARCHAR(50)` |
| **JSON** | `JSONB` | `geo_boundary_wkt TEXT` (or PostGIS) |

---

## 4. Domain Table Templates

### WASTE_REPORT Table (Core)
```sql
CREATE TABLE waste_report (
    report_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    area_id BIGINT REFERENCES service_area(area_id),
    estimated_weight_kg DOUBLE PRECISION,
    location_text TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waste_report_status ON waste_report(status);
CREATE INDEX idx_waste_report_area ON waste_report(area_id);
```

### REWARD_ITEM Table (Reward Feature)
```sql
CREATE TABLE reward_item (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE UNIQUE INDEX uk_reward_item_name ON reward_item(name) WHERE deleted_at IS NULL;
```

### REWARD_REDEMPTION Table (Reward Feature)
```sql
CREATE TABLE reward_redemption (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL REFERENCES users(user_id),
    reward_item_id BIGINT NOT NULL REFERENCES reward_item(id),
    points_used INTEGER NOT NULL CHECK (points_used > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    note TEXT,
    rejection_reason TEXT,
    processed_by BIGINT REFERENCES users(user_id),
    processed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reward_redemption_citizen ON reward_redemption(citizen_id);
CREATE INDEX idx_reward_redemption_status ON reward_redemption(status);
```

## 5. Enterprise & Rules Templates

### ENTERPRISE_CAPABILITY Table
```sql
CREATE TABLE enterprise_capability (
    capability_id BIGSERIAL PRIMARY KEY,
    area_id BIGINT NOT NULL REFERENCES service_area(area_id),
    waste_type_id BIGINT NOT NULL REFERENCES waste_type(waste_type_id),
    daily_capacity_kg DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### CITIZEN_REWARD_RULE Table
```sql
CREATE TABLE citizen_reward_rule (
    rule_id BIGSERIAL PRIMARY KEY,
    waste_type_id BIGINT REFERENCES waste_type(waste_type_id),
    points_per_kg DOUBLE PRECISION NOT NULL,
    bonus_fixed INTEGER DEFAULT 0,
    effective_from TIMESTAMPTZ,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### COMPLAINT Table
```sql
CREATE TABLE complaint (
    complaint_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    report_id BIGINT REFERENCES waste_report(report_id),
    task_id BIGINT REFERENCES task(task_id),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
```

---

## 5. Entity Template

### WasteReport Entity
```java
@Entity
@Table(name = "waste_report")
@Getter
@Setter
@NoArgsConstructor
public class WasteReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Citizen

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private ServiceArea area;

    @Column(name = "estimated_weight_kg")
    private Double estimatedWeightKg;

    @Column(name = "location_text", columnDefinition = "TEXT")
    private String locationText;

    private Double lat;
    private Double lng;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private ReportStatus status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
```

---

## 6. Status Enums

### ReportStatus
```java
public enum ReportStatus {
    PENDING,
    ACCEPTED,
    ASSIGNED,
    COLLECTED,
    REJECTED
}
```

### TaskStatus
```java
public enum TaskStatus {
    ASSIGNED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}
```

