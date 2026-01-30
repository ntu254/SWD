# Project Memory

> **AI Agent Instruction**: Read this file to understand the project's evolution, key decisions, and critical context that isn't captured in the code. Update this file when you make significant decisions or discover important findings.

---

## 1. Project History & Decisions Log

| Date | Decision | Context | Rationale | Impact |
|------|----------|---------|-----------|--------|
| `2026-01-25` | **Created Project Utils** | New project setup | Standardize AI agent workflow | Consistent development process |
| `2026-01-30` | **Implemented Enterprise Module** | Phase 1 Core Entities | Enable recycling enterprise features | Created ServiceArea, WasteType, Enterprise, WasteReport, EnterpriseCapability entities |
| `2026-01-30` | **JPA Auto-Update Strategy** | Development database | Faster iteration in dev environment | No SQL migrations needed in development |
| `2026-01-30` | **Nested REST API for Capabilities** | `/api/enterprises/{id}/capabilities` | Follows REST best practices | Clear ownership of capabilities |

---

## 2. Technical Debt & Workarounds

> **Note**: Temporary fixes that need to be addressed later.

- **[Unresolved]** `EnterpriseServiceImpl`: Missing status filter query in `getAllEnterprises()`
  - *Reason*: Quick implementation, filter logic TODO
  - *Plan*: Add `findByStatus(String status, Pageable pageable)` to repository
- **[Unresolved]** `ServiceAreaServiceImpl`: Same status filter issue
  - *Reason*: Consistent with other services
  - *Plan*: Add paginated status filter query

---

## 3. Performance Baselines

- **API Response Time**: < 200ms (P95)
- **Database Query**: < 50ms (Indexing required)
- **Concurrent Users**: Support up to 1000 active users
- **Capability Reset**: Daily scheduled job to reset `usedCapacityKg`

---

## 4. Known Issues

- `Capacity Tracking`: Daily reset must run at midnight - not yet scheduled
- `GeoJSON Validation`: ServiceArea boundaryGeoJson not validated on input

---

## 5. Business Rules & Logic

> **Critical**: Complex business rules that are easy to forget.

1. **Enterprise Status Flow**: PENDING → ACTIVE → SUSPENDED → INACTIVE (soft delete)
2. **Capability Uniqueness**: Only one capability per (Enterprise, Area, WasteType) combination
3. **Available Capacity**: dailyCapacityKg - usedCapacityKg >= 0
4. **Waste Report Status Flow**: PENDING → ACCEPTED/REJECTED → ASSIGNED → COMPLETED/CANCELLED
5. **Points Calculation**: Based on WasteType.basePointsPerKg × collected weight

---

## 6. Environment Specifics

- **Local**: Uses H2 database (`spring.jpa.hibernate.ddl-auto=update`)
- **Prod**: Uses PostgreSQL 15 (Supabase / AWS RDS)
- **CI/CD**: GitHub Actions (to be configured)

---

## 7. Lessons Learned

| Topic | Learning | Action Item |
|-------|----------|-------------|
| Entity Design | Use UUID for all IDs (consistent with existing codebase) | Applied to all new entities |
| Soft Delete | Use status + deletedAt instead of hard delete | Applied to Enterprise entity |
| Nested Routes | Use nested REST routes for child resources | `/enterprises/{id}/capabilities` pattern |

