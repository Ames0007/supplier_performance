# Functional Specs & UX Blueprint — Part 5 · Administration & System Screens

> Screens **15–20**: Administration (hub) · Users & Roles · SAP Synchronization · Audit Logs · Settings · Notifications.
> Inherits [Part 0 — UX Foundations](./00_UX_FOUNDATIONS.md). Only deviations stated.

---

# Screen 15 — Administration (Hub)

**1. Purpose.** The entry hub for platform operators: a single landing that surfaces system health and links to every administrative area (Users & Roles, SAP Sync, Audit, Settings), with at-a-glance operational status.

**2. Target Users.** Procurement Administrator / IT (`SUPER_ADMIN`), Director (selected areas).

**3. Route & Entry Points.** `/admin`. From: Administration nav group (collapsed for non-admins), user menu.

**4. Permissions.** View hub: any `admin.*` permission. Each tile is permission-gated to its area (`admin.users.manage`, `purchase_orders.sync`, `audit.read`, `admin.settings.manage`).

**5. Wireframe.**
```
Breadcrumb: Home › Administration
H1: Administration
┌ System health row ─────────────────────────────────────────────────────────┐
│ [SAP sync: OK · 10:15] [Users 214] [Open audit alerts 0] [Config: valid ✓]   │
└──────────────────────────────────────────────────────────────────────────────┘
┌ Admin tiles (cards) ────────────────────────────────────────────────────────┐
│ [Users & Roles →]  [SAP Synchronization →]  [Audit Logs →]  [Settings →]     │
│  manage access      sync & reconcile          traceability     configuration  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**6. Component Hierarchy.**
```
<Page AdminHub>
├─ PageHeader
├─ <SystemHealthRow> (StatusCard[]: SAP sync, Users, Audit alerts, Config validity)
└─ <AdminTileGrid> (AdminTile[]: title, desc, status, link — permission-gated)
```

**7. Layout & Regions.** Health status row (KPI-style status cards) + navigational tile grid. Each tile shows a live status glyph (e.g., sync OK/failed, config valid/invalid).

**8. Field Definitions.** None (navigational + read-only status).

**9. Actions.**
| Action | Trigger | Permission | Result |
|---|---|---|---|
| Open admin area | Tile click | area perm | → S16/S17/S18/S19 |
| Quick "Run sync" | Health card | purchase_orders.sync | → S17 with sync started |

**10. Validation & Error Messages.** None. Health cards show error state if a subsystem is failing (e.g., "SAP sync failed — view details").

**11. States.** Loading = status skeletons. Error = per-card. Tiles the user can't access are hidden.

**12. Business Rules.** Purely a hub; all real controls live in sub-screens. Health reflects real subsystem status (sync runs, config validity, audit alerts).

**13. Notifications.** Consumes admin alerts (sync failure, config invalid) as status; deep links to detail.

**14. User Flow.** Admin opens hub → sees sync failed → clicks → S17 to diagnose.

**15. Navigation Flow.** Tiles → respective admin screens.

**16. Responsive.** Tiles 4→2→1; health row wraps.

**17. Accessibility.** Status glyphs paired with text ("SAP sync: OK"); tiles are labeled links.

**18. Acceptance Criteria.**
- **AC1.** Only admin areas the user is permitted to access appear as tiles.
- **AC2.** The health row reflects real subsystem status and links to details on failure.
- **AC3.** A failing subsystem is visibly flagged with a route to diagnose it.

---

# Screen 16 — Users & Roles

**1. Purpose.** Manage who can use the platform and what they can do: view users (JIT-provisioned from Entra), assign roles with department/campus scope, and manage the role→permission model.

**2. Target Users.** Administrator (`admin.users.manage`), role model by `admin.roles.manage` (typically Super Admin).

**3. Route & Entry Points.** `/admin/users` (users), `/admin/roles` (roles/permissions tab). From: Admin hub, audit follow-ups.

**4. Permissions.** Manage users/assignments: `admin.users.manage`. Manage roles/permissions: `admin.roles.manage`. Read-only for auditors (`audit.read` may view assignments). Identity is sourced from Entra — users are not created manually (JIT).

**5. Wireframe.**
```
Breadcrumb: Home › Administration › Users & Roles
H1: Users & Roles                         [ Tabs: Users | Roles & Permissions ]
Users tab:
┌ FilterBar: [Search name/email] [Role▾][Department▾][Campus▾][Status▾] ┐
└────────────────────────────────────────────────────────────────────────┘
┌ DataTable: User | Email | Roles | Dept | Campus | Last login | Status | ⋮ ┐
│ Y. Bennani | y.b@um6p.ma | Evaluator | Chem | Benguerir | 2d | Active | ⋮ │
└────────────────────────────────────────────────────────────────────────────┘
Roles tab:
┌ Role list ─────────┐ ┌ Permissions for "Procurement Manager" ─────────────┐
│ Super Admin        │ │ ☑ evaluations.read.all  ☑ evaluations.validate     │
│ Director           │ │ ☑ evaluations.reassign  ☐ matrix.manage            │
│ Procurement Mgr ●  │ │ ☑ dashboards.view       ☑ committee.access ...      │
│ Purchaser          │ └──────────────────────────────────────────────────────┘
│ Evaluator …        │
└────────────────────┘
```

**6. Component Hierarchy.**
```
<Page UsersRoles>
├─ PageHeader
├─ <Tabs>
│  ├─ UsersPanel
│  │  ├─ FilterBar
│  │  └─ DataTable (users) → RowMenu (Assign roles, Deactivate, View audit)
│  │     └─ <AssignRolesDialog> (role multi-select + department + campus scope)
│  └─ RolesPanel
│     ├─ <RoleList>
│     └─ <PermissionMatrixEditor> (grouped permission checkboxes)
```

**7. Layout & Regions.** Two tabs: Users (filterable table + assign dialog) and Roles & Permissions (role list + permission matrix editor). Scope (department/campus) is a first-class part of each assignment.

**8. Field Definitions.**
| Field | Label (FR/EN) | Type | Required | Validation | Notes |
|---|---|---|---|---|---|
| User | Utilisateur | read (from Entra) | — | — | JIT-provisioned |
| Email | Email | read | — | — | unique, from Entra |
| Roles | Rôles | MultiSelect | Yes (≥1) | valid roles | from role catalog |
| Department scope | Département | MultiSelect | No (=all) | existing | limits visibility |
| Campus scope | Campus | MultiSelect | No (=all) | existing | multi-campus |
| Status | Statut | Switch Active/Inactive | — | — | deactivate blocks access |
| Role name (roles tab) | Nom du rôle | Input | Yes | unique; system roles locked | |
| Permissions | Permissions | Checkbox grid | — | valid codes | grouped by resource |

**9. Actions.**
| Action | Trigger | Permission | Confirm? | Result |
|---|---|---|---|---|
| Assign/change roles | Row menu / dialog | admin.users.manage | No | Update assignment + scope, audit, notify user |
| Set scope | Dialog | admin.users.manage | No | Department/campus scoping |
| Deactivate/reactivate user | Row menu | admin.users.manage | Yes | Toggle access, audit |
| Create/edit role | Roles tab | admin.roles.manage | No | Update role catalog |
| Edit permissions | Matrix | admin.roles.manage | Save=explicit | Change role→permission mapping, audit |
| View user's audit trail | Row menu | audit.read | No | → Audit Logs filtered (S18) |

**10. Validation & Error Messages.** ≥1 role per active user. System roles cannot be deleted/renamed (« Ce rôle système ne peut pas être modifié. »). Removing the last admin blocked (« Au moins un administrateur doit être conservé. »). Permission changes require explicit Save with confirmation of impact.

**11. States.** Loading = skeleton. Empty (no users yet) = "Users appear here after their first sign-in." Filtered-empty distinct. Error = retry.

**12. Business Rules.** Identity from Entra (JIT); no manual user creation. Access = role + department + campus (RULE-12, mirrored by RLS backstop). Default role on first login = `EVALUATOR`. All assignment/permission changes audited (FR-56). Segregation-of-duties options configurable (Settings).

**13. Notifications.** Role/scope change → notify affected user (F13). Deactivation → user + admin log.

**14. User Flow.** Filter to a new user → Assign "Purchaser" + campus scope → user notified → access takes effect.

**15. Navigation Flow.** Users↔Roles tabs; user audit → S18; scope references Settings reference data (S19).

**16. Responsive.** Table→stacked cards; permission matrix→grouped accordions ≤md; assign dialog full-screen sheet ≤sm.

**17. Accessibility.** Permission matrix is a labeled grid (row/col headers); toggles have names; dialogs are focus-trapped; consequence text read before destructive confirm.

**18. Acceptance Criteria.**
- **AC1.** Users are provisioned from Entra on first login and appear here; no manual user creation is possible.
- **AC2.** An admin can assign one or more roles with department/campus scope; the change is audited and the user is notified.
- **AC3.** System roles cannot be deleted/renamed, and the last admin cannot be removed.
- **AC4.** Editing a role's permissions requires explicit save, is audited, and immediately affects UI visibility and (via RLS) data access.
- **AC5.** Deactivating a user blocks their access and is audited; each user links to their audit trail.

---

# Screen 17 — SAP Synchronization

**1. Purpose.** Operate and monitor the read-only SAP data pipeline: view sync run history & health, trigger a manual run, review reconciliation vs SAP, and diagnose failures (BA §28; Architecture §9). No business data is edited here.

**2. Target Users.** Administrator / IT (`purchase_orders.sync`), Director (read).

**3. Route & Entry Points.** `/admin/sap-sync`. From: Admin hub, Home ops widget, sync-failure notifications, empty-state links on Suppliers/POs.

**4. Permissions.** View: `purchase_orders.sync` (or `admin.*`). Trigger run: `purchase_orders.sync`. Configure cadence/eligibility → Settings (S19). Read-only for Director/Auditor.

**5. Wireframe.**
```
Breadcrumb: Home › Administration › SAP Synchronization
H1: SAP Synchronization        Last run: 10:15 · SUCCESS      [ Run sync now ]
┌ Health cards: [Suppliers 312 ✓][POs 1,204 ✓][Users 214 ✓][Last delta 10:15] ┐
└──────────────────────────────────────────────────────────────────────────────┘
[ Tabs: Run History | Reconciliation | Diagnostics ]
Run History:
┌ DataTable: Run | Started | Duration | Trigger | Status | Created/Updated/Failed | ⋮ ┐
│ #482 | 10:15 | 42s | CRON | SUCCESS | 5 / 18 / 0                      | view  │
│ #481 | 09:15 | 51s | CRON | PARTIAL | 3 / 12 / 2 ⚠                    | view  │
└────────────────────────────────────────────────────────────────────────────────────┘
Reconciliation: SAP vs SPM counts per entity + discrepancies (<2% target)
```

**6. Component Hierarchy.**
```
<Page SapSync>
├─ PageHeader (LastRunStatus, RunNowButton)
├─ <SyncHealthCards> (per entity counts + last delta)
├─ <Tabs>
│  ├─ RunHistoryPanel (DataTable runs → RunDetailDrawer with per-item log)
│  ├─ ReconciliationPanel (SAP vs SPM counts, discrepancy list)
│  └─ DiagnosticsPanel (failed items, error messages, replay)
<RunNowDialog> · <RunDetailDrawer>
```

**7. Layout & Regions.** Header with last-run status + Run-now + health cards + tabs (history, reconciliation, diagnostics). Run detail drawer shows per-entity/per-item outcomes and errors.

**8. Field Definitions (run record — read-only).**
| Field | Source | Notes |
|---|---|---|
| Run # | sync run | |
| Started / Duration | run | |
| Trigger | CRON/MANUAL/WEBHOOK | |
| Status | SUCCESS/PARTIAL/FAILED/RUNNING | color-coded + text |
| Processed / Created / Updated / Failed | run counts | |
| Watermark | delta timestamp | |
| Error | text | plain-language, no secrets |
| Per-item outcome (drawer) | sync items | sap_ref, entity, outcome, message |

**9. Actions.**
| Action | Trigger | Permission | Confirm? | Result |
|---|---|---|---|---|
| Run sync now | Button | purchase_orders.sync | Yes | Starts run, live status, toast on completion |
| View run detail | Row | View | No | Drawer with per-item log |
| Replay failed items | Diagnostics | purchase_orders.sync | Yes | Re-processes failed sap_refs |
| Export reconciliation | Button | View | No | CSV of discrepancies |
| Open config | Link | admin.settings.manage | No | → Settings (cadence/eligibility) |

**10. Validation & Error Messages.** Run-now disabled while a run is in progress (« Une synchronisation est déjà en cours. »). SAP-unavailable surfaced as a clear, non-technical error with retry and "last good data retained" reassurance. No secrets/connection strings ever shown.

**11. States.** Loading = skeleton. Running = live progress + disabled Run-now. Empty (never synced) = "No sync runs yet — run the first synchronization." Failed = prominent error + diagnostics link. Error = retry.

**12. Business Rules.** Read-only toward SAP (RULE-14, SAP-7). Idempotent, delta-based with watermark; no duplicate evaluations (NFR-9). Ordering suppliers→personnel→POs. Completed-PO detection here feeds auto-generation (S6/S7). Business continuity on SAP outage (SAP-9). Reconciliation target <2% (KPI). Cadence/eligibility configured in Settings.

**13. Notifications.** FAILED/PARTIAL run → admins (email + in-app). Reconciliation drift beyond tolerance → admins. Per F13.

**14. User Flow.** Notified of PARTIAL run → open → Diagnostics → see 2 failed POs (missing requester email) → replay after fix, or note for reconciliation.

**15. Navigation Flow.** Run detail drawer; config link → Settings (S19); failed entity → the affected Supplier/PO; empty-state links from Suppliers/POs land here.

**16. Responsive.** Health cards wrap; run table→stacked cards; drawer full-screen ≤sm.

**17. Accessibility.** Status conveyed by text + icon; live run progress announced (`aria-live`); errors are plain-language and screen-reader friendly.

**18. Acceptance Criteria.**
- **AC1.** Sync run history shows counts, status, trigger, watermark, and per-item diagnostics; SAP-origin errors are plain-language with no secrets leaked.
- **AC2.** An admin can trigger a manual run; concurrent runs are prevented; completion is reported.
- **AC3.** Reconciliation compares SAP vs SPM counts per entity and flags discrepancies against tolerance.
- **AC4.** Failed items can be replayed after upstream fixes; partial runs commit good records and log failures.
- **AC5.** On SAP unavailability, the last good data is retained and the failure is clearly communicated; admins are notified.
- **AC6.** Nothing on this screen writes to SAP.

---

# Screen 18 — Audit Logs

**1. Purpose.** Provide the immutable, searchable record of every significant action (create/assign/score/validate/reassign/reopen/block/config-change/decision) for compliance, dispute resolution and traceability (BO-11; FR-56/57).

**2. Target Users.** Auditor (`audit.read`), Director, Administrator. Read-only for all — the log cannot be edited.

**3. Route & Entry Points.** `/admin/audit`. From: Admin hub, "View audit trail" links across screens (user, supplier, evaluation, committee), audit report (S13).

**4. Permissions.** View: `audit.read`. No write/delete for anyone (append-only, DB-enforced). Scope: authorized roles see the full trail; access to the audit view is itself logged.

**5. Wireframe.**
```
Breadcrumb: Home › Administration › Audit Logs
H1: Audit Logs                                                   [Export]
┌ FilterBar: [Search] [Actor▾][Action▾][Entity type▾][Entity id][Date range] ┐
└──────────────────────────────────────────────────────────────────────────────┘
┌ DataTable: Time ▼ | Actor | Action | Entity | Summary | ⋮(view diff) ─────────┐
│ 10:22 | Director | evaluation.validated | Eval #A1 (ACME/PO4500) | score 84  │
│ 10:05 | S.Amine  | supplier.blocked     | BuildCo | reason: repeated failure  │
│ 09:40 | System   | sync.run.completed    | Run #482 | SUCCESS 5/18/0          │
└────────────────────────────────────────────────────────────────────────────────┘
(row expand → before/after diff)
```

**6. Component Hierarchy.**
```
<Page AuditLogs>
├─ PageHeader (Export)
├─ FilterBar (Actor, Action, EntityType, EntityId, DateRange, Search)
└─ DataTable (audit entries)
   └─ RowExpand → <AuditDiffView> (before/after JSON rendered readable) + metadata (IP, UA)
```

**7. Layout & Regions.** FilterBar + append-only DataTable, newest first. Row expand reveals the change diff (before/after) and metadata (actor, timestamp, IP, user agent, reason where applicable).

**8. Field Definitions (read-only).**
| Field | Source | Notes |
|---|---|---|
| Time | audit | precise timestamp, newest first |
| Actor | user or "System" | |
| Action | action code | e.g., evaluation.validated, supplier.blocked, role.changed, matrix.activated, committee.decision |
| Entity | type + id + label | deep link if permitted |
| Summary | derived | human-readable |
| Reason | audit | for reassign/reopen/block/decision |
| Diff (expand) | before/after | readable rendering |
| IP / User agent | audit | forensic metadata |

**9. Actions.**
| Action | Trigger | Permission | Result |
|---|---|---|---|
| Filter/search | FilterBar | audit.read | Narrow log (URL-persist) |
| Expand row | Click | audit.read | Show diff + metadata |
| Open entity | Link | entity perm | → source record |
| Export | Button | audit.read | CSV/PDF (respects filters); export itself logged |

**10. Validation & Error Messages.** None (read-only). No edit/delete affordances exist. Export of empty set disabled.

**11. States.** Loading = skeleton rows. Empty (no activity) = "No audit records yet." Filtered-empty distinct. Error = retry.

**12. Business Rules.** Append-only, immutable, DB-enforced (no UPDATE/DELETE grants; Architecture §6). Every significant action across all domains writes here (single sink). Records include actor, action, entity, before/after, IP/UA, reason. Retention per UM6P policy (**[UM6P VALIDATION REQUIRED]**). Viewing audit is itself auditable.

**13. Notifications.** Optional: suspicious-pattern/critical-action alerts to admins (future). None by default.

**14. User Flow.** Auditor filters Actor=Director, Action=evaluation.validated, last quarter → reviews decisions → expands a diff → exports evidence.

**15. Navigation Flow.** Entity links → source records (S4/S5/S7/S12/S16); export → evidence file.

**16. Responsive.** Table→stacked cards; diff view scrolls within container ≤sm.

**17. Accessibility.** Diff view has semantic before/after labeling; timestamps machine + human readable; row expansion announced; export accessible.

**18. Acceptance Criteria.**
- **AC1.** Every significant action across the platform produces an immutable audit record with actor, action, entity, before/after, reason (where applicable), IP and timestamp.
- **AC2.** No user can edit or delete audit records; there are no such affordances and the backend enforces append-only.
- **AC3.** The log is filterable by actor, action, entity type/id and date range, with URL persistence.
- **AC4.** Records deep-link to their source entities (permission-scoped) and export respects filters.
- **AC5.** Viewing/exporting the audit log is itself logged.

---

# Screen 19 — Settings

**1. Purpose.** Central configuration of the platform's business rules and system parameters **without a software release** (NFR-10): eligibility, thresholds, due windows, reminder cadence, validation policy, improvement threshold, matrix defaults, sync cadence, notification/language defaults, campus/reference data.

**2. Target Users.** Administrator (`admin.settings.manage`), Director (approves policy-level settings).

**3. Route & Entry Points.** `/admin/settings` (grouped tabs). From: Admin hub, SAP sync (cadence/eligibility), matrix builder (defaults).

**4. Permissions.** View/edit: `admin.settings.manage`. Some policy settings (thresholds, bands, validation on/off) require Director approval (governance). Changes audited.

**5. Wireframe.**
```
Breadcrumb: Home › Administration › Settings
H1: Settings
[ Tabs: Evaluation | Eligibility | Notifications | SAP Sync | Reference Data | Localization | Policy ]
Evaluation tab:
┌ Due window ............ [10] business days                                   ┐
│ Justification min length [20] chars                                          │
│ Validation step ........ ( On ● Off )   Validator: [Department Manager ▾]     │
│ Improvement threshold .. SPI < [55] /100                                     │
│ Performance bands ...... Excellent ≥[85] Good ≥[70] Accept ≥[55] Poor ≥[40]  │
│ Segregation of duties .. [☑] evaluator cannot validate own                    │
│                                            [ Save ]  (Director approval req.) │
└──────────────────────────────────────────────────────────────────────────────┘
```

**6. Component Hierarchy.**
```
<Page Settings>
├─ PageHeader
└─ <Tabs>
   ├─ EvaluationSettings (due window, min length, validation, threshold, bands, SoD)
   ├─ EligibilitySettings (min amount, commodity include/exclude)
   ├─ NotificationSettings (reminder cadence, escalation targets, channels, digest)
   ├─ SapSyncSettings (cadence, watermark policy, completion indicator mapping)
   ├─ ReferenceData (campuses, categories mapping)
   ├─ Localization (default language, currency, formats)
   └─ PolicySettings (retention, approvals) [Director]
<SaveWithApprovalDialog>
```

**7. Layout & Regions.** Grouped tabs of forms (F7). Each setting shows current value, help text, default, and effective scope. Policy-level settings flagged as requiring approval.

**8. Field Definitions (representative — all configurable per BA §24).**
| Setting | Label (FR/EN) | Type | Validation | Default | Approval |
|---|---|---|---|---|---|
| Due window | Délai d'évaluation | Number (days) | 1–60 | 10 | Admin |
| Justification min length | Longueur min. justification | Number | 0–500 | 20 | Admin |
| Validation step | Étape de validation | Switch + validator select | — | On / Dept Manager | Director |
| Improvement threshold | Seuil plan d'amélioration | Number (0–100) | <100 | 55 | Director |
| Performance bands | Bandes de performance | Number set | monotonic, 0–100 | 85/70/55/40 | Director |
| SoD | Séparation des tâches | Switch | — | On | Director |
| Min PO amount | Montant minimum | Number (MAD) | ≥0 | 10,000 | Director |
| Commodity include/exclude | Commodités | MultiSelect | valid categories | all except low-value | Admin |
| Reminder cadence | Cadence de rappel | Chips (−3d,−1d,due) | valid offsets | −3,−1,0 | Admin |
| Escalation target | Cible d'escalade | Select | valid role | Manager | Admin |
| Sync cadence | Cadence de sync | Select | presets | intra-day | Admin |
| Completion indicator | Indicateur "terminé" | mapping | required | [UM6P] | Admin |
| Default language | Langue par défaut | Select FR/EN | — | FR | Admin |
| Currency/format | Devise/format | Select | — | MAD | Admin |
| Retention | Rétention | Number/policy | per policy | [UM6P] | Director |

**9. Actions.**
| Action | Trigger | Permission | Confirm? | Result |
|---|---|---|---|---|
| Edit setting | Field | admin.settings.manage | — | Stage change |
| Save | Button | admin.settings.manage | Policy=approval | Persist, take effect (no release), audit |
| Reset to default | Menu | admin.settings.manage | Yes | Revert |
| Manage reference data | Reference tab | admin.settings.manage | — | Map campuses/categories |

**10. Validation & Error Messages.** Bands must be monotonic (Excellent > Good > … ) else « Les seuils de bandes doivent être décroissants. ». Numeric ranges enforced. Turning validation off warns of governance impact. Policy settings require approval before effect. Completion-indicator mapping required for sync to function.

**11. States.** Loading = form skeleton. Unsaved-changes guard. Save success toast; approval-pending state for policy settings. Error = retry, values preserved.

**12. Business Rules.** All values are the **configurable business rules** of BA §24 — changeable without deployment (NFR-10) and immediately effective (or on approval). Matrix content lives in the Matrix Builder (S8), not here; Settings holds *defaults & policy*. Every change audited (FR-56). Thresholds/bands feed SPI banding, improvement triggers, eligibility, cadence app-wide.

**13. Notifications.** Policy change (validation toggle, thresholds) → notify Director/managers; setting change → audit. Per F13.

**14. User Flow.** Admin adjusts reminder cadence → Save → effective immediately. Director changes improvement threshold → Save → approval → effective.

**15. Navigation Flow.** Sync settings ↔ S17; matrix defaults → S8; reference data used by scoping (S16) and filters everywhere.

**16. Responsive.** Tabs→select; forms single-column; approval dialog full-screen sheet ≤sm.

**17. Accessibility.** Every setting labeled with help text; switches announce state; approval requirement announced; band inputs validated with `aria-live` guidance.

**18. Acceptance Criteria.**
- **AC1.** All business rules from BA §24 (eligibility, due window, thresholds, bands, cadence, validation policy, localization) are configurable here and take effect without a software release.
- **AC2.** Policy-level settings (validation on/off, thresholds, bands, retention) require Director approval before taking effect.
- **AC3.** Performance-band thresholds are validated to be monotonic and consistent with SPI banding used across the app.
- **AC4.** Every setting change is audited with actor, before/after and timestamp.
- **AC5.** The completion-indicator mapping is required and, once set, drives completed-PO detection in sync.

---

# Screen 20 — Notifications

**1. Purpose.** The user's Notification Center: a persistent, filterable list of all in-app notifications, plus per-user notification preferences (channels, opt-ins). Complements the top-bar bell (F13).

**2. Target Users.** All authenticated users (personal to each user).

**3. Route & Entry Points.** `/notifications`. From: top-bar bell ("See all"), deep links, user menu.

**4. Permissions.** View own notifications: any authenticated user (strictly own — no cross-user visibility). Preferences: own. No special role needed; content reflects the user's role-driven events.

**5. Wireframe.**
```
Breadcrumb: Home › Notifications
H1: Notifications                         [Mark all read] [ Preferences ]
[ Filter: All | Unread | Evaluations | Reminders | Committee | Risk | System ]
┌ List ─────────────────────────────────────────────────────────────────────┐
│ ● Evaluation assigned — ACME/PO4500 · due in 10d · 2h ago      [Open]       │
│ ● Reminder — 2 evaluations due tomorrow · 1d ago               [Open]       │
│ ○ Validation approved — NovaTech eval · 3d ago                              │
│ ○ Committee: BuildCo escalated to Critical · 5d ago            [View]       │
│ … load more …                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
Preferences (sheet):
  Channels: In-app ☑  Email ☑  (Teams — future)
  Types: Assignments ☑  Reminders ☑  Overdue ☑  Validation ☑  Committee ☑  Digest ▾ weekly
```

**6. Component Hierarchy.**
```
<Page Notifications>
├─ PageHeader (MarkAllRead, PreferencesButton)
├─ <NotificationFilters> (All/Unread + type chips)
├─ <NotificationList>
│  └─ <NotificationItem> (icon by type, title, body, timestamp, read dot, DeepLink/QuickAction)
├─ <LoadMore>
└─ <PreferencesSheet> (channel toggles, per-type opt-in, digest cadence)
```

**7. Layout & Regions.** Filter row + notification list (newest first, unread emphasized) + preferences sheet. Each item: type icon, title, one-line body, timestamp, read state, deep link/quick action.

**8. Field Definitions.**
| Field | Source | Notes |
|---|---|---|
| Type | notification | Assignment/Reminder/Overdue/Validation/Committee/Risk/ImprovementPlan/System |
| Title / Body | notification | concise |
| Timestamp | notification | relative + absolute on hover |
| Read state | per-user | dot + bold when unread |
| Deep link | entity | → source screen |
| Preferences (edit) | user prefs | channel + per-type toggles + digest cadence |

**9. Actions.**
| Action | Trigger | Permission | Result |
|---|---|---|---|
| Open notification | Item / Open | own | Mark read + → source |
| Mark read/unread | Item / menu | own | Toggle state |
| Mark all read | Button | own | Clear unread count (bell updates) |
| Filter | Chips | own | Narrow list |
| Edit preferences | Sheet | own | Persist channel/type/digest prefs |

**10. Validation & Error Messages.** Preferences: at least one channel recommended (warn if all off: « Vous ne recevrez plus de notifications. »). No hard validation errors otherwise.

**11. States.** Loading = skeleton items. Empty = "You have no notifications." Filtered-empty distinct ("No unread notifications"). Error = retry.

**12. Business Rules.** Strictly per-user (privacy — no cross-user access). Notifications generated by domain events per BA §25 / F13. Preferences respected by both in-app and email delivery. In-app toasts are transient and not stored here (only persistent notifications). Bell unread count == unread here.

**13. Notifications.** This *is* the notification surface; it consumes the notification stream and manages preferences. It does not generate new notifications.

**14. User Flow.** Bell shows 3 → user opens Center → filters Unread → opens "Evaluation assigned" → lands on the evaluation → item marked read → bell decrements.

**15. Navigation Flow.** Items → source screens (S4/S5/S7/S9/S10/S12/S17). Preferences → persisted user settings. Bell ↔ this screen consistent.

**16. Responsive.** Single column always; filter chips scroll; preferences full-screen sheet ≤sm; large tap targets.

**17. Accessibility.** Unread conveyed by text/badge not color-only; list is an accessible feed (`aria-live` for new items optional); mark-read actions labeled; timestamps machine-readable; preferences form fully labeled.

**18. Acceptance Criteria.**
- **AC1.** A user sees only their own notifications; the list matches the bell's unread count.
- **AC2.** Opening a notification marks it read, decrements the bell, and deep-links to the source entity.
- **AC3.** Users can filter (all/unread/type), mark individually or all read, and load older notifications.
- **AC4.** Preferences control channels (in-app/email; Teams future), per-type opt-ins, and digest cadence, and are honored by delivery.
- **AC5.** Turning off all channels warns the user; notifications remain generated per governance events regardless of read state.

---

## Coverage Confirmation — all 20 screens specified

| # | Screen | Part |
|---|---|---|
| 1 | Login | [Part 1](./01_screens_core.md) |
| 2 | Home Dashboard | [Part 1](./01_screens_core.md) |
| 3 | Supplier Dashboard | [Part 1](./01_screens_core.md) |
| 4 | Supplier 360° | [Part 1](./01_screens_core.md) |
| 5 | Purchase Orders | [Part 1](./01_screens_core.md) |
| 6 | Evaluation Workspace | [Part 2](./02_screens_evaluation.md) |
| 7 | Evaluation Form | [Part 2](./02_screens_evaluation.md) |
| 8 | Evaluation Matrix Builder | [Part 2](./02_screens_evaluation.md) |
| 9 | Improvement Plans | [Part 3](./03_screens_supplier_mgmt.md) |
| 10 | Supplier Risk | [Part 3](./03_screens_supplier_mgmt.md) |
| 11 | Supplier Timeline | [Part 3](./03_screens_supplier_mgmt.md) |
| 12 | Committee Workspace | [Part 3](./03_screens_supplier_mgmt.md) |
| 13 | Reports | [Part 4](./04_screens_analytics.md) |
| 14 | Analytics | [Part 4](./04_screens_analytics.md) |
| 15 | Administration | Part 5 (this doc) |
| 16 | Users & Roles | Part 5 (this doc) |
| 17 | SAP Synchronization | Part 5 (this doc) |
| 18 | Audit Logs | Part 5 (this doc) |
| 19 | Settings | Part 5 (this doc) |
| 20 | Notifications | Part 5 (this doc) |

*End of Part 5 — and of the Functional Specifications & UX Blueprint screen set. Foundations: [Part 0](./00_UX_FOUNDATIONS.md).*
