# UM6P SPM — Functional Specifications & UX Blueprint

The build-ready specification set. Goal: **eliminate ambiguity before development** — detailed enough that a UI designer and a software engineer can build every screen without asking further business questions. Enterprise UX standard (SAP Fiori / Microsoft Dynamics / Oracle Fusion / ServiceNow class).

> **Read [Part 0 — UX Foundations](./00_UX_FOUNDATIONS.md) first.** It defines everything global (design tokens, navigation shell, shared component/table/card/chart/form library, and the global standards for states, validation, permissions, notifications, responsive and accessibility). Every screen spec references it and details only what is unique — this is why the screens stay focused instead of repeating boilerplate.

## Structure

| Part | File | Covers |
|---|---|---|
| **0 — Foundations** | [00_UX_FOUNDATIONS.md](./00_UX_FOUNDATIONS.md) | Design system, IA & navigation, app shell, shared components, DataTable/KPI/Chart/Form standards, filters, buttons/actions, global states, validation & error messages, permissions model, notifications, responsive, accessibility, shared enums (status/score/risk vocab), per-screen template |
| **1 — Core** | [01_screens_core.md](./01_screens_core.md) | 1 Login · 2 Home Dashboard · 3 Supplier Dashboard · 4 Supplier 360° · 5 Purchase Orders |
| **2 — Evaluation** | [02_screens_evaluation.md](./02_screens_evaluation.md) | 6 Evaluation Workspace · 7 Evaluation Form · 8 Evaluation Matrix Builder |
| **3 — Supplier Mgmt & Governance** | [03_screens_supplier_mgmt.md](./03_screens_supplier_mgmt.md) | 9 Improvement Plans · 10 Supplier Risk · 11 Supplier Timeline · 12 Committee Workspace |
| **4 — Analytics & Reporting** | [04_screens_analytics.md](./04_screens_analytics.md) | 13 Reports · 14 Analytics |
| **5 — Administration & System** | [05_screens_admin.md](./05_screens_admin.md) | 15 Administration · 16 Users & Roles · 17 SAP Synchronization · 18 Audit Logs · 19 Settings · 20 Notifications |

## Per-screen template (every screen, Part 0 §F17)
Purpose · Target Users · Route & Entry Points · Permissions · Wireframe · Component Hierarchy · Layout & Regions · Field Definitions · Actions · Validation & Error Messages · States (loading/empty/error) · Business Rules · Notifications · User Flow · Navigation Flow · Responsive · Accessibility · Acceptance Criteria.

## Relationship to the other documents
- **What & why (business):** [../BUSINESS_ANALYSIS.md](../BUSINESS_ANALYSIS.md), [../FUNCTIONAL_DESIGN.md](../FUNCTIONAL_DESIGN.md), [../PRODUCT_BACKLOG.md](../PRODUCT_BACKLOG.md)
- **How & when (technical):** [../ARCHITECTURE_BLUEPRINT.md](../ARCHITECTURE_BLUEPRINT.md), [../ROADMAP.md](../ROADMAP.md)
- **This set (build spec):** turns the above into screen-by-screen buildable detail.

All specs stay consistent with the shared vocabulary (statuses, score bands, SPI/SRI/confidence, roles/permissions) defined once in Part 0 §F16 and traced back to the business and architecture documents. Open **[UM6P VALIDATION REQUIRED]** items (brand palette, thresholds, SoD policy, matrix scoping) are flagged inline.
