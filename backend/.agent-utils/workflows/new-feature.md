---
description: Workflow for developing a new feature (e.g., Enterprise Capability, Task Assignment)
---

# New Feature Development Workflow

This workflow guides the AI agent through the process of implementing a new feature for the SWD system.

## Steps

1. **Context Loading**
   - Read `.agent-utils/00_project_context.md`
   - Read `.agent-utils/01_architecture.md`
   - Read `.agent-utils/03_database_conventions.md`
   - Read `.agent-utils/MEMORY.md`

2. **Requirement Analysis**
   - Create a plan outlining the changes
   - Identify affected components
   - Common feature areas:
     - **Enterprise Module**: EnterpriseCapability, EnterpriseWasteType
     - **Task Module**: Task, TaskAssignment
     - **Reward Module**: CitizenRewardRule, RewardTransaction
     - **Analytics Module**: WasteStats, KPI

3. **Database Design (if applicable)**
   - Create migration script: `V__create_{table_name}_table.sql`
   - Follow naming conventions from `03_database_conventions.md`
   - Key tables for Enterprise features:
     - `enterprise_capability`
     - `citizen_reward_rule`
     - `task`, `task_assignment`
     - `complaint`, `complaint_resolution`
   - Add Entity classes with proper annotations
   - Add Enum types (TaskStatus, ComplaintStatus, etc.)

4. **Implementation**
   - **Service Layer**: 
     - Implement business logic with `@Transactional`
     - Add validation for capacity limits
     - Add status transition validation
   - **DTOs**: Create Request/Response DTOs with validation
   - **Controller**: Implement API endpoints with Swagger docs
   - **Validation**: Add input validation (@Valid, @NotNull, @Min)

5. **Testing**
   - Write Unit Tests for Service layer (>80% coverage)
     - Happy path: create, assign, complete success
     - Error cases: not found, capacity exceeded, invalid status
   - Write Integration Tests for Repository
   - Write API Tests for Controller

6. **Review & Verify**
   - Check against `.agent-utils/07_review_checklist.md`
   - Run all tests to ensure no regression
   - Verify capacity calculations are correct
   - Verify status transitions work correctly

7. **Documentation**
   - Update API documentation (Swagger annotations)
   - Update `MEMORY.md` with key decisions:
     - Capacity management approach
     - Task status flow: PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
