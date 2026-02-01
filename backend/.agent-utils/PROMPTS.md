# Optimized AI Prompts

> **AI Agent Instruction**: Use these prompts to get the best results from your AI coding assistant.

---

## 1. Feature Development Prompt

**Context**: `00_project_context.md`, `01_architecture.md`, `02_coding_standards.md`

**Prompt**:
```markdown
I need to implement [Feature Name] functionality.

**Requirements**:
[Paste requirements here]

**Context**:
- I have read the project context and coding standards.
- Please follow the `06_development_workflow.md` strictly.

**Task**:
1. Analyze the requirements and existing code.
2. Create/modify the database schema (if needed).
3. Implement the Service layer with proper business logic.
4. Create DTOs and Controller endpoints.
5. Write unit and integration tests.

**Output Constraints**:
- Use Java 21 features where appropriate.
- Follow the error handling pattern defined in `02_coding_standards.md`.
- Ensure 80% test coverage for new code.
```

---

## 2. Bug Fix Prompt

**Context**: `02_coding_standards.md`, `05_testing_standards.md`

**Prompt**:
```markdown
I found a bug in [Component/Feature Name].

**Issue Description**:
[Describe the bug, provide logs or error messages]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]

**Task**:
1. Analyze the root cause.
2. Create a reproduction test case (that checks for the bug).
3. Fix the bug.
4. Verify the fix with the test case.
5. Ensure no regression issues.

**Output**:
- Explanation of the root cause.
- The reproduction test code.
- The fixed code.
```

---

## 3. Refactoring Prompt

**Context**: `02_coding_standards.md`

**Prompt**:
```markdown
I want to refactor [Class/Module Name] to improve [readability/performance/structure].

**Goal**:
- [Specific goal, e.g., Remove code duplication]
- [Specific goal, e.g., Improve query performance]

**Constraints**:
- Do NOT change the public API contract.
- All existing tests MUST pass.
- Follow the design patterns listed in `01_architecture.md`.

**Task**:
1. Analyze the current implementation.
2. Propose the refactoring plan.
3. Apply the changes incrementally.
4. Verify with tests.
```

---

## 4. Code Review Prompt

**Context**: `07_review_checklist.md`

**Prompt**:
```markdown
Please review the following code changes for [Feature/Bug Name].

**Files to Review**:
- [List files]

**Criteria**:
- Check against `07_review_checklist.md`.
- Look for security vulnerabilities.
- Identify potential performance issues (N+1 queries, memory leaks).
- Check standard compliance (naming, logging, error handling).

**Output**:
- Summary of issues found (categorized by severity).
- Suggestions for improvement.
- Pass/Fail recommendation based on the checklist.
```

---

## 5. Documentation Prompt

**Context**: `04_api_conventions.md`

**Prompt**:
```markdown
Please generate/update documentation for [Component/Module].

**Scope**:
- API Documentation (OpenAPI/Swagger annotations).
- JavaDoc for public methods.
- README.md usage examples.

**Style**:
- Concise and clear.
- Include input/output examples.
- Mention potential errors/exceptions.
```
