# Design Patterns — Waste Collection Console App

> **Project:** `demo` — Spring Boot Console App  
> **Patterns used:** Abstract Factory · Decorator  
> **Use Cases:** UC-04, UC-07, UC-09, UC-13

---

## Pattern Overview

| Use Case | Actor | Pattern |
|---|---|---|
| UC-04: Track Report Status | Citizen | **Abstract Factory** |
| UC-09: View Pending Reports | Enterprise | **Abstract Factory** |
| UC-07: Submit Complaint | Citizen | **Decorator** |
| UC-13: Track Collection Progress | Enterprise | **Decorator** |

---

## 🏭 Abstract Factory Pattern

### What problem does it solve?

> Different roles (Citizen vs Enterprise) need to **see the same data in completely different ways**.  
> We want to create the correct view **without hardcoding which class to use**.

### Structure

```
ViewFactory              ← Abstract Factory (interface)
├── CitizenViewFactory       ← Concrete Factory
└── EnterpriseViewFactory    ← Concrete Factory

ReportView               ← Abstract Product (interface)
├── CitizenReportView        ← Concrete Product (UC-04)
└── EnterpriseReportView     ← Concrete Product (UC-09)
```

### Step 1 — Abstract Factory interface

```java
// ViewFactory.java
public interface ViewFactory {
    ReportView createReportView();   // doesn't know which view it creates
}
```

### Step 2 — Abstract Product interface

```java
// ReportView.java
public interface ReportView {
    void display(List<Report> reports);
    String getViewName();
}
```

### Step 3 — Concrete Factories decide what to build

```java
// CitizenViewFactory.java
public class CitizenViewFactory implements ViewFactory {
    @Override
    public ReportView createReportView() {
        return new CitizenReportView();    // always returns Citizen version
    }
}

// EnterpriseViewFactory.java
public class EnterpriseViewFactory implements ViewFactory {
    @Override
    public ReportView createReportView() {
        return new EnterpriseReportView(); // always returns Enterprise version
    }
}
```

### Step 4 — Concrete Products contain the actual display logic

| Class | What it shows |
|---|---|
| `CitizenReportView` | Progress bar `[████░░] 60%` + status timeline `✓ PENDING → ➤ [IN_PROGRESS]` |
| `EnterpriseReportView` | Table of PENDING reports grouped by area + waste-type statistics |

```java
// CitizenReportView.java — shows progress bar + timeline per report
public void display(List<Report> reports) {
    for (Report report : reports) {
        System.out.println("└─ Progress : " + buildProgressBar(report.getStatus()));
        System.out.println("   " + buildStatusTimeline(report.getStatus()));
    }
}

// EnterpriseReportView.java — groups by location, shows a table
Map<String, List<Report>> groupedByArea = pendingReports.stream()
        .collect(Collectors.groupingBy(Report::getLocation));
```

### Step 5 — Client only talks to interfaces

```java
// ConsoleAppRunner.java — UC-04
ViewFactory factory = new CitizenViewFactory();     // swap this 1 line to change everything
ReportView  view    = factory.createReportView();   // doesn't know it's CitizenReportView
view.display(sampleData.getCitizenReports());       // calls the interface method

// ConsoleAppRunner.java — UC-09
ViewFactory factory = new EnterpriseViewFactory();  // different factory, completely different output
ReportView  view    = factory.createReportView();
view.display(sampleData.getAllReports());
```

> ✅ **Key insight:** To add an `AdminViewFactory`, create 2 new classes — **zero changes** to `ConsoleAppRunner`.

---

## 🎨 Decorator Pattern

### What problem does it solve?

> We want to **add cross-cutting features** (logging, timestamp, validation) to an action  
> **without modifying the core action class** and **in any combination we choose**.

### Structure

```
BaseAction                  ← Component interface
├── SubmitComplaintAction       ← Concrete Component (UC-07 core logic)
└── TrackProgressAction         ← Concrete Component (UC-13 core logic)

ActionDecorator             ← Abstract Decorator
├── LoggingDecorator            ← adds log before/after
├── TimestampDecorator          ← adds timestamp
└── ValidationDecorator         ← adds auth checks
```

### Step 1 — Component interface

```java
// BaseAction.java
public interface BaseAction {
    String execute();
    String getDescription();
}
```

### Step 2 — Concrete Component: the real business logic

```java
// SubmitComplaintAction.java — does the actual work, knows nothing about logging
public String execute() {
    // reads title, content, category from scanner
    // creates Complaint object
    // calls sampleData.addComplaint(complaint)
    return "Complaint submitted successfully...";
}
```

### Step 3 — Abstract Decorator: the structural key

```java
// ActionDecorator.java
public abstract class ActionDecorator implements BaseAction {

    protected final BaseAction wrappedAction;  // holds ANY BaseAction (core or another decorator)

    @Override
    public String execute() {
        return wrappedAction.execute();         // delegates by default
    }
}
```

> It **also implements `BaseAction`** — this allows decorators to wrap other decorators.

### Step 4 — Concrete Decorators add behaviour before/after

```java
// LoggingDecorator.java
public String execute() {
    System.out.println("[LOG] Starting: " + wrappedAction.getDescription()); // BEFORE
    String result = super.execute();   // calls the wrapped action
    System.out.println("[LOG] Done: "  + wrappedAction.getDescription());    // AFTER
    return result;
}

// ValidationDecorator.java
public String execute() {
    System.out.println("[VALIDATION] Checking permissions... OK");  // BEFORE only
    System.out.println("[VALIDATION] Checking session... OK");
    return super.execute();   // then calls the wrapped action
}
```

### Step 5 — Stacking decorators at runtime

```java
// ConsoleAppRunner.java — UC-07 (building the chain layer by layer)
BaseAction action = new SubmitComplaintAction(sampleData, scanner); // innermost (core)
action = new ValidationDecorator(action);   // wrap layer 1
action = new TimestampDecorator(action);    // wrap layer 2
action = new LoggingDecorator(action);      // wrap layer 3 (outermost)

action.execute();  // triggers the entire chain
```

### Execution flow (inside → outside call, outside → inside return)

```
LoggingDecorator.execute()
  → prints "[LOG] Starting..."
  → calls TimestampDecorator.execute()
      → prints "[TIMESTAMP] Start time..."
      → calls ValidationDecorator.execute()
          → prints "[VALIDATION] Checking..."
          → calls SubmitComplaintAction.execute()   ← REAL LOGIC runs here
          ← returns result
      ← prints "[TIMESTAMP] End time..."
      ← returns result
  ← prints "[LOG] Done..."
  ← returns result
```

### Audit trail via `getDescription()`

Each decorator appends its name:

```
"Submit Complaint Action (UC-07) + Validation + Timestamp + Logging"
```

> ✅ **Key insight:** Add or remove a decorator by **adding/removing one line** in `ConsoleAppRunner`. The core action and other decorators are untouched.

---

## 📖 When to Use Each Pattern

### 🏭 Abstract Factory — Use when...

| Situation | Real-world example |
|---|---|
| System has multiple **roles/user types** needing different UI/logic | Admin sees a dashboard, Citizen sees a personal feed |
| Need to support multiple **themes or platforms** | `MobileFactory`, `WebFactory`, `DarkModeFactory` |
| Need to ensure created objects are **compatible with each other** | Button + TextField + Dialog all share the same style |
| Want to **extend easily** without touching existing code | Add `AdminViewFactory` → zero changes to runner |

> 💡 **Remember:** Use it when the question is *"What group of objects should I create for **this context**?"*

---

### 🎨 Decorator — Use when...

| Situation | Real-world example |
|---|---|
| Need to **add behaviour to an object** without modifying its class | Add logging to a third-party library class |
| Need to **mix and match** extra features flexibly | Enable/disable caching, auth, logging per use case |
| Extra features are **reusable across multiple actions** | `LoggingDecorator` works for both UC-07 and UC-13 |
| Want to avoid creating too many subclasses | Instead of `LoggedComplaint`, `TimestampedComplaint`... use decorators |

> 💡 **Remember:** Use it when the question is *"How do I **add behaviour** without breaking the existing class?"*

---

## Comparison

| | Abstract Factory | Decorator |
|---|---|---|
| **Controls** | *Which object gets created* | *What an object does* |
| **Composition** | Factory → Product (creation time) | Wrapper → Wrapper → Core (runtime) |
| **Extend via** | New Factory + Product pair | New Decorator class |
| **In this app** | `CitizenViewFactory` → `CitizenReportView` | `LoggingDecorator` wraps `SubmitComplaintAction` |
| **Client sees** | Only interfaces (`ViewFactory`, `ReportView`) | Only `BaseAction` interface |

---

## How to run

```bash
chcp 65001
cd demo
.\mvnw.cmd spring-boot:run
```

```
+=======================================================================+
|          WASTE COLLECTION & RECYCLING CONSOLE APP                     |
+=======================================================================+
|  1. [Citizen]     UC-04: Track Report Status      [Abstract Factory]  |
|  2. [Citizen]     UC-07: Submit Complaint          [Decorator]        |
|  3. [Enterprise]  UC-09: View Pending Reports      [Abstract Factory]  |
|  4. [Enterprise]  UC-13: Track Collection Progress [Decorator]        |
|  5. [Citizen]     CRUD Report                                         |
|  6. [Citizen]     CRUD Complaint                                      |
|  7. [Enterprise]  CRUD Task                                           |
|  0. Exit                                                              |
+=======================================================================+
```
