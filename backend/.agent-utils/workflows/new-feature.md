---
description: Workflow for developing a new feature (e.g., Reward Management)
---

# New Feature Development Workflow

This workflow guides the AI agent through the process of implementing a new feature, ensuring all standards are met.

## Steps

1. **Context Loading**
   - Read `.agent-utils/00_project_context.md`
   - Read `.agent-utils/01_architecture.md`
   - Read `.agent-utils/06_development_workflow.md`
   - Read `.agent-utils/MEMORY.md`

2. **Requirement Analysis**
   - Create a plan outlining the changes
   - Identify affected components
   - For Reward Management:
     - Entities: RewardItem, RewardRedemption
     - DTOs: Request/Response classes
     - Service: RewardService, RewardServiceImpl
     - Controller: AdminRewardController

3. **Database Design (if applicable)**
   - Create migration script: `V__create_reward_item_table.sql`
   - Create migration script: `V__create_reward_redemption_table.sql`
   - Add Entity classes with proper annotations
   - Add Enum types (RewardItemStatus, RedemptionStatus)
   - Verify with `.agent-utils/03_database_conventions.md`

4. **Implementation**
   - **Service Layer**: 
     - Implement business logic with `@Transactional`
     - Add stock validation for approval
     - Add status transition validation
   - **DTOs**: Create Request/Response DTOs with validation
   - **Controller**: Implement API endpoints with Swagger docs
   - **Validation**: Add input validation (@Valid, @NotNull, @Min)

5. **Testing**
   - Write Unit Tests for Service layer (>80% coverage)
     - Happy path: create, approve, reject success
     - Error cases: not found, out of stock, already processed
   - Write Integration Tests for Repository
   - Write API Tests for Controller

6. **Review & Verify**
   - Check against `.agent-utils/07_review_checklist.md`
   - Run all tests to ensure no regression
   - Verify stock decrements on approval
   - Verify status transitions work correctly

7. **Documentation**
   - Update API documentation (Swagger annotations)
   - Update `MEMORY.md` with key decisions:
     - Stock management approach
     - Status flow: PENDING → APPROVED/REJECTED → DELIVERED
