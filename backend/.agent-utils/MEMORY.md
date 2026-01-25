# Project Memory

> **AI Agent Instruction**: Read this file to understand the project's evolution, key decisions, and critical context that isn't captured in the code. Update this file when you make significant decisions or discover important findings.

---

## 1. Project History & Decisions Log

| Date | Decision | Context | Rationale | Impact |
|------|----------|---------|-----------|--------|
| `2026-01-25` | **Created Project Utils** | New project setup | Standardize AI agent workflow | Consistent development process |
| `[Date]` | `[Decision Title]` | `[Context]` | `[Why we did it]` | `[Consequences]` |

---

## 2. Technical Debt & Workarounds

> **Note**: Temporary fixes that need to be addressed later.

- **[Unresolved]** `[Component]`: `[Description of hack/workaround]`
  - *Reason*: `[Why it was necessary]`
  - *Plan*: `[How to fix properly]`

---

## 3. Performance Baselines

- **API Response Time**: < 200ms (P95)
- **Database Query**: < 50ms (Indexing required)
- **Concurrent Users**: Support up to 1000 active users

---

## 4. Known Issues

- `[Issue ID/Desc]`: `[Description]` (Workaround: `[...Code...]`)

---

## 5. Business Rules & Logic

> **Critical**: Complex business rules that are easy to forget.

1. **Rule 1**: `[Example: Users cannot delete orders after 24 hours]`
2. **Rule 2**: `[Example: Premium features require active subscription]`

---

## 6. Environment Specifics

- **Local**: Uses H2 database / Dockerized Postgres
- **Prod**: Uses AWS RDS (Postgres 16)
- **CI/CD**: GitHub Actions

---

## 7. Lessons Learned

| Topic | Learning | Action Item |
|-------|----------|-------------|
| `[Topic]` | `[What we learned]` | `[What changed]` |
