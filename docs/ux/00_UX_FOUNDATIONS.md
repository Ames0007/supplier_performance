# UM6P SPM — Functional Specifications & UX Blueprint
## Part 0 — UX Foundations (Global Design System & Shared Patterns) · v1.0

> **Part of the Functional Specifications & UX Blueprint.** Read this first. Every per-screen spec (Parts 1–6) **references this document** for anything global and only specifies deviations. Together they are detailed enough for a UI designer and a software engineer to build the platform without further business questions.
>
> **Extends (does not repeat):** [ARCHITECTURE_BLUEPRINT.md](../ARCHITECTURE_BLUEPRINT.md) (tech), [BUSINESS_ANALYSIS.md](../BUSINESS_ANALYSIS.md) (requirements), [FUNCTIONAL_DESIGN.md](../FUNCTIONAL_DESIGN.md) (operating model), [PRODUCT_BACKLOG.md](../PRODUCT_BACKLOG.md).
> **Design north star:** SAP Fiori / Microsoft Dynamics discipline + Linear/Vercel polish. Minimal, fast, dense-where-needed, accessible, bilingual (FR primary / EN), light + dark.

---

## Contents
- [F1. Design Language & Tokens](#f1-design-language--tokens)
- [F2. Information Architecture & Global Navigation](#f2-information-architecture--global-navigation)
- [F3. App Shell (Layout Skeleton)](#f3-app-shell-layout-skeleton)
- [F4. Shared Component Library](#f4-shared-component-library)
- [F5. Data Table Standard](#f5-data-table-standard)
- [F6. Cards, KPIs & Charts Standard](#f6-cards-kpis--charts-standard)
- [F7. Forms Standard](#f7-forms-standard)
- [F8. Filters & Search Standard](#f8-filters--search-standard)
- [F9. Buttons & Actions Standard](#f9-buttons--actions-standard)
- [F10. Global States: Loading / Empty / Error / Success](#f10-global-states-loading--empty--error--success)
- [F11. Validation & Error-Message Standard](#f11-validation--error-message-standard)
- [F12. Permissions Model (UI enforcement)](#f12-permissions-model-ui-enforcement)
- [F13. Notifications Standard](#f13-notifications-standard)
- [F14. Responsive Behavior Standard](#f14-responsive-behavior-standard)
- [F15. Accessibility Standard (WCAG 2.1 AA)](#f15-accessibility-standard-wcag-21-aa)
- [F16. Status, Score & Domain Vocabulary (shared enums)](#f16-status-score--domain-vocabulary-shared-enums)
- [F17. Per-Screen Spec Template](#f17-per-screen-spec-template)

---

## F1. Design Language & Tokens

**Grid & spacing:** 4px base. Spacing scale `4,8,12,16,24,32,48,64`. Page gutters: 24px (desktop), 16px (mobile). Max content width 1440px; tables/dashboards go full-width within the content region.

**Typography** (Inter or system stack; tabular numerals for all figures):
| Token | Size / line | Use |
|---|---|---|
| `text-display` | 30 / 36, 600 | Page hero numbers (rare) |
| `text-h1` | 24 / 32, 600 | Page title |
| `text-h2` | 20 / 28, 600 | Section title |
| `text-h3` | 16 / 24, 600 | Card / group title |
| `text-body` | 14 / 20, 400 | Default |
| `text-sm` | 13 / 18, 400 | Secondary |
| `text-xs` | 12 / 16, 500 | Labels, chips, table meta |

**Color tokens** (defined for light + dark; contrast ≥ 4.5:1 text, ≥ 3:1 UI):
| Semantic token | Purpose |
|---|---|
| `--bg`, `--surface`, `--surface-2` | Page / card / nested backgrounds |
| `--border`, `--border-strong` | Dividers, inputs |
| `--fg`, `--fg-muted`, `--fg-subtle` | Text hierarchy |
| `--primary`, `--primary-fg` | UM6P brand primary (green — **[UM6P VALIDATION REQUIRED: hex]**); primary actions, active nav |
| `--success / --warning / --danger / --info` | Semantic feedback |
| `--focus-ring` | Keyboard focus (2px, 3:1 contrast) |

**Radius:** `sm 6 / md 8 / lg 12 / full`. **Shadow:** `xs, sm, md` elevation only (no heavy shadows). **Motion:** 150–200ms `ease-out`; honor `prefers-reduced-motion` (disable non-essential animation).

**Iconography:** Lucide, 16/20/24px, 1.5px stroke, always paired with text or `aria-label`.

**Density modes:** `comfortable` (default) and `compact` (tables/power users) — user-toggleable; compact reduces row height 40→32px.

---

## F2. Information Architecture & Global Navigation

**Primary navigation** = left sidebar, permission-filtered (F12). Grouped by mental model, not by domain code:

```
● Home                         /                       (all)
▸ SUPPLIERS
   Suppliers                   /suppliers              (suppliers.read)
   Supplier 360°               /suppliers/:id          (suppliers.read)
   Risk                        /risk                   (suppliers.read.all)
   Portfolio                   /portfolio              (dashboards.view.executive)
▸ PERFORMANCE
   Evaluations (Workspace)     /evaluations            (evaluations.read.own)
   Purchase Orders             /purchase-orders        (purchase_orders.read)
   Improvement Plans           /improvement-plans      (evaluations.read.all | own)
▸ GOVERNANCE
   Committee                   /committee              (committee.access) [derived]
   Evaluation Matrix           /matrix                 (matrix.read)
▸ INSIGHTS
   Analytics                   /analytics              (dashboards.view)
   Reports                     /reports                (dashboards.view)
▸ ADMINISTRATION                                       (admin.* — collapsed unless admin)
   Users & Roles               /admin/users            (admin.users.manage)
   SAP Synchronization         /admin/sap-sync         (purchase_orders.sync)
   Audit Logs                  /admin/audit            (audit.read)
   Settings                    /admin/settings         (admin.settings.manage)
```

**Secondary nav:** in-page tabs (e.g., Supplier 360° sections), breadcrumbs, and a right-hand context/detail panel for master–detail screens.

**Global top bar (persistent):** logo/home · **global search** (⌘/Ctrl-K command palette) · **campus switcher** (multi-campus) · **notifications bell** (F13) · **theme toggle** · **language toggle FR/EN** · **user menu** (profile, density, sign out).

**Navigation rules**
- Deep-linkable: every screen, filtered list, and entity has a stable URL (filters serialized to query string).
- Back preserves scroll + filters. Unsaved-changes guard on forms (F7).
- A nav item the user lacks permission for is **hidden**, not disabled (F12).

---

## F3. App Shell (Layout Skeleton)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ TOPBAR  [≡] UM6P SPM   [ ⌘K search......... ]   [Campus▾][🔔3][☾][FR▾][👤] │
├───────────┬──────────────────────────────────────────────────────────────┤
│ SIDEBAR   │ CONTENT REGION                                                 │
│ ● Home    │ ┌ PageHeader: Breadcrumb ───────────────────────────────────┐ │
│ ▸ SUPPL.. │ │ H1 Title            [secondary][secondary][PRIMARY ACTION] │ │
│ ▸ PERF..  │ └────────────────────────────────────────────────────────────┘ │
│ ▸ GOV..   │ [ Filter bar / Tabs ]                                          │
│ ▸ INSI..  │ ┌ Body: cards / table / form / detail ─────────────────────┐  │
│ ▸ ADMIN   │ │                                                            │  │
│ (collapse)│ │                                                            │  │
│           │ └────────────────────────────────────────────────────────────┘ │
├───────────┴──────────────────────────────────────────────────────────────┤
│ TOASTER (bottom-right) · optional status bar                               │
└──────────────────────────────────────────────────────────────────────────┘
```

**Component hierarchy (global):**
```
<AppShell>
├─ <TopBar> (SearchCommand, CampusSwitcher, NotificationBell, ThemeToggle, LangToggle, UserMenu)
├─ <SideNav> (NavGroup > NavItem[], permission-filtered, collapsible)
└─ <Main>
   ├─ <PageHeader> (Breadcrumbs, Title, ActionBar)
   ├─ <FilterBar?> / <Tabs?>
   ├─ <PageBody> (screen content)
   └─ <Toaster> (global)
<RouteGuard> wraps <Main>; <UnsavedChangesGuard> wraps forms.
```

Regions used by all screens: **PageHeader** (breadcrumb + title + primary/secondary actions), optional **FilterBar** / **Tabs**, **PageBody**, global **Toaster**, optional **SidePanel/Drawer** for detail or create/edit.

---

## F4. Shared Component Library

Catalog every screen draws from (shadcn/ui + Radix base). Each is defined once here.

| Component | Purpose / behavior | Key states |
|---|---|---|
| `Button` | Actions (F9). Variants: primary, secondary, ghost, destructive, link. | default/hover/active/focus/disabled/loading |
| `IconButton` | Compact action; must have `aria-label`. | + tooltip |
| `Input / Textarea / NumberInput` | Text entry (F7). | default/focus/error/disabled/readonly |
| `Select / Combobox / MultiSelect` | Choice; Combobox = searchable. | + async loading, no-results |
| `DatePicker / DateRange` | Dates; locale-aware. | + min/max, invalid |
| `Checkbox / RadioGroup / Switch` | Booleans / single choice. | |
| `Slider / WeightInput` | Numeric weight (matrix). | + step, min/max, sum indicator |
| `RatingScale` | 1–5 scored control with labels. | + N/A option |
| `Badge` | Status / band / tier chips (F16 colors). | semantic variants |
| `ScoreBadge` | 0–100 score + band color. | |
| `RiskBadge` | SRI heat level. | |
| `ConfidencePill` | Low/Med/High confidence. | |
| `Avatar / AvatarGroup` | Users/contacts. | + initials fallback |
| `Card` | Content grouping (F6). | + loading skeleton |
| `KpiCard` | Single metric + delta + sparkline (F6). | + loading/empty |
| `DataTable` | Lists (F5). | full state set |
| `Tabs` | In-page sections. | |
| `Dialog / Sheet / Drawer` | Modal create/edit/confirm; Sheet = side panel. | |
| `Popover / Tooltip / DropdownMenu` | Contextual. | |
| `Stepper / StatusStepper` | Multi-step & lifecycle states. | |
| `Timeline` | Chronological events (Screen 11). | |
| `Breadcrumbs` | Location. | |
| `Toast` | Transient feedback. | success/error/info/warning |
| `Skeleton` | Loading placeholders (F10). | |
| `EmptyState` | No-data guidance (F10). | |
| `ErrorState` | Failure + retry (F10). | |
| `Pagination` | Table paging. | |
| `FileUpload / AttachmentList` | Evidence/documents. | + type/size validation |
| `CommentBox` | Justification / notes. | + min-length counter |
| `FilterBar / FilterChip` | Faceted filtering (F8). | + active count, clear |

---

## F5. Data Table Standard

The workhorse. Every list screen uses one `DataTable` with this contract.

**Anatomy:** toolbar (search, filters, column toggle, density, export, bulk-action bar) → header (sortable, sticky) → rows (selectable, row-hover actions) → footer (pagination + total count).

**Capabilities (all server-side):** sort (multi), filter (F8), paginate (25/50/100), column show/hide + reorder (persisted per user), row selection + bulk actions, saved views, CSV/Excel export, sticky header + first column, keyboard navigation, row click → detail (or expand).

**Row density:** comfortable 40px / compact 32px. **Zebra:** off (use hairline dividers). **Numeric columns:** right-aligned, tabular.

**States:** loading = 8 skeleton rows; empty = `EmptyState`; error = inline `ErrorState` with retry; filtered-empty = "No results for these filters" + Clear filters.

**Standard columns pattern:** primary identifier (link) · status/badge · key metrics · owner/assignee (avatar) · date · row-end `⋮` action menu.

**Acceptance:** table renders < 2s for 10k rows via pagination; sort/filter reflected in URL; export respects current filters; fully keyboard-operable; screen-reader announces sort state and row count.

---

## F6. Cards, KPIs & Charts Standard

**Card:** title (`text-h3`) + optional action/menu + body + optional footer. Padding 16–24px, radius `lg`, border + `shadow-xs`. Loading = skeleton; empty = mini `EmptyState`.

**KpiCard:** big value (`text-display`/`text-h1`, tabular) + label + delta vs prior period (▲/▼ with success/danger color + "vs last quarter") + optional sparkline + optional target. Clickable → drill-down. Never show a metric without period context.

**Chart standard (Recharts):** every chart has title, accessible legend, tooltips, tokenized colors (F16 score/risk palette), axis labels, and a **table fallback** (`View as table` toggle) for accessibility. Empty = "No data for selected period." Loading = skeleton block.

| Chart | Used for |
|---|---|
| `TrendLine` | SPI over time, coverage trend |
| `SupplierRadar` | 8-dimension performance profile |
| `ScoreDistribution` (histogram) | Band distribution across portfolio |
| `RankingBar` | Top/bottom suppliers |
| `RiskHeatMap` (matrix) | Likelihood × impact, or supplier × risk-domain |
| `Donut/Stacked` | Tier / risk / status distribution |
| `Gauge` | Coverage %, action-closure % |

**Color rules:** score bands & risk levels use the fixed F16 palette everywhere (a "Poor" red is the same red in every chart, badge, and table). Categorical series follow the `dataviz` guidance — never encode meaning by color alone (also use label/shape).

---

## F7. Forms Standard

**Layout:** single column, logical groups with section headers; labels above inputs; helper text below; required marked with `*` + `aria-required`. Two-column only for short related pairs on ≥ desktop.

**Behavior:** inline validation on blur + on submit; disable primary until dirty & valid (or validate-on-submit with focus-first-error); autosave drafts where specified (evaluations); **unsaved-changes guard** on navigate/close.

**Submit pattern:** primary button shows spinner + "Saving…", disabled during request; success → toast + navigate/refresh; failure → toast + inline field errors (F11), form re-enabled, entered data preserved.

**Field spec format** (used in every screen): `Field · Label (FR/EN) · Type · Source · Required · Default · Validation · Notes`.

**Accessibility:** every input has a programmatic label; errors linked via `aria-describedby`; group with `fieldset/legend`; focus moves to first error on failed submit.

---

## F8. Filters & Search Standard

**Filter bar** above tables/dashboards: quick filters as chips + "More filters" popover for the full set. Active filters show as removable chips with a count; **Clear all** always available. Filters persist in URL and per-user saved views.

**Global filter vocabulary (shared across screens):** Period (presets: This/Last Quarter, YTD, 12M, custom range) · Campus · Department · Commodity/Category · Supplier · Tier · Performance band · Risk level · Status · Owner/Buyer · Evaluator. Screens declare which subset they expose.

**Global search (⌘K):** command palette searching suppliers, POs, evaluations, users (permission-scoped), plus quick actions ("Create improvement plan", "Go to Settings"). Debounced 250ms; keyboard-first; recent + suggested.

---

## F9. Buttons & Actions Standard

| Variant | Use | Rule |
|---|---|---|
| **Primary** | The one main action per screen/section | Max one primary per region |
| **Secondary** | Common alternates | |
| **Ghost/Icon** | Row/inline/toolbar actions | Tooltip + `aria-label` |
| **Destructive** | Delete/block/reject | Always requires confirm dialog |
| **Link** | Navigation-like | |

**Action rules:** destructive & irreversible actions (Block supplier, Finalize/Lock evaluation, Activate matrix, Delete draft) require a **confirmation dialog** stating the consequence and, where governance demands, a **mandatory reason** (persisted to audit). Async actions show progress and a result toast. Bulk actions confirm with the affected count. Permission-gated actions are hidden when not allowed (F12).

---

## F10. Global States: Loading / Empty / Error / Success

**Every data surface implements all four** (this is a review gate, not optional).

- **Loading:** skeletons matching final layout (never spinners for page loads; spinners only inside buttons). Streamed sections load independently. Target: first meaningful paint < 1s, interactive < 2s.
- **Empty (no data yet):** `EmptyState` = icon + one-line reason + short guidance + primary action if the user can create ("No evaluations assigned to you yet. Completed POs will appear here automatically.").
- **Filtered-empty:** distinct copy + **Clear filters** (do not show the create CTA).
- **Error:** `ErrorState` = neutral icon + plain-language message (no stack traces, no SAP jargon) + **Retry** + "If this persists, contact your administrator." Partial failures degrade gracefully (one broken widget ≠ broken page).
- **Success:** toast (auto-dismiss 4s) + optimistic UI where safe; destructive successes are explicit ("Supplier blocked — recorded in audit log").
- **Permission-denied:** friendly 403 within shell ("You don't have access to this. Request access from your administrator.").
- **Offline/session-expired:** banner + re-auth prompt; unsaved form data preserved.

---

## F11. Validation & Error-Message Standard

**Principles:** validate at the boundary (client for UX, server is authoritative); message the *fix*, not the *error*; French-first, plain language; never blame the user.

**Standard message patterns** (FR / EN):
| Case | Message |
|---|---|
| Required | « Ce champ est obligatoire. » / "This field is required." |
| Min length (justification) | « Veuillez saisir au moins {n} caractères de justification. » / "Please enter at least {n} characters of justification." |
| Number range | « La valeur doit être comprise entre {min} et {max}. » |
| Weights ≠ 100 | « La somme des pondérations doit être égale à 100 % (actuellement {x} %). » |
| Duplicate | « Cet élément existe déjà. » |
| Date range invalid | « La date de fin doit être postérieure à la date de début. » |
| File type/size | « Format non pris en charge (PDF, JPG, PNG). Taille max {n} Mo. » |
| Server error | « Une erreur est survenue. Réessayez ou contactez l'administrateur. » |
| Permission | « Vous n'avez pas l'autorisation d'effectuer cette action. » |
| Optimistic-lock/conflict | « Ces données ont été modifiées entre-temps. Rechargez la page. » |

**Presentation:** field-level error below input (red text + icon + `aria-describedby`); form-level summary at top on submit failure listing linked errors; toast only for system/async errors.

---

## F12. Permissions Model (UI enforcement)

UI mirrors the backend permission matrix ([ARCHITECTURE_BLUEPRINT §11](../ARCHITECTURE_BLUEPRINT.md)); **RLS remains the backstop** — UI hiding is convenience, not security.

**Roles (codes ↔ business):** `SUPER_ADMIN`↔Procurement Administrator/IT · `PROCUREMENT_DIRECTOR`↔Director · `PROCUREMENT_MANAGER`↔Category/Procurement Manager · `PURCHASER`↔Acheteur · `EVALUATOR`↔Requester/Chef de Projet · `VIEWER`↔Consultation · `AUDITOR`↔Audit · plus business hats `QUALITY`, `HSE`, `DEPARTMENT_MANAGER` (may map to scoped permission bundles). `committee.access` is derived (Director/Manager/invited).

**Rules:**
- Nav items, buttons, columns, and tabs are **hidden** when the user lacks the permission (never dangling-disabled, except where showing "you could request this" adds value).
- Data scope = role + **department + campus** (RULE-12). Lists/detail auto-scope; out-of-scope IDs 403.
- `.own` vs `.all` vs `scope` govern list breadth (e.g., Evaluator sees own; Manager sees campus).
- Every screen spec declares a **Permissions block**: `View`, `Actions` (per action), and `Scope`.

---

## F13. Notifications Standard

**Channels:** in-app (bell + Notification Center screen) and email (Outlook/M365); future Teams. **Bell** shows unread count; opening lists grouped, most-recent-first, each with entity link, timestamp, read/unread, and quick action.

**Event → recipient → channel matrix** is defined in [BUSINESS_ANALYSIS §25](../BUSINESS_ANALYSIS.md); screens reference it. Every notification: title, one-line body, deep link, timestamp; respects per-user preferences (Settings, Screen 19). Reminders/escalations follow configured cadence.

**In-app toast ≠ notification:** toasts are transient session feedback; notifications persist in the center.

---

## F14. Responsive Behavior Standard

**Breakpoints:** `xs <480 · sm 480–767 · md 768–1023 · lg 1024–1439 · xl ≥1440`.

**Adaptations (global — screens note deviations):**
- **Sidebar:** full (≥lg) → icon-rail (md) → off-canvas sheet via ≡ (≤sm).
- **PageHeader actions:** overflow into `⋮` menu on ≤md; primary action stays visible.
- **DataTable:** ≥lg full columns; md hides low-priority columns (column priority defined per table); ≤sm collapses each row into a **stacked card** (label:value) with the primary action; horizontal scroll only as last resort inside an `overflow-x` container (page never scrolls horizontally).
- **Multi-column dashboards:** 4→2→1 columns down the breakpoints.
- **Forms:** always single-column ≤md.
- **Dialogs:** become full-screen sheets ≤sm.
- **Charts:** maintain aspect ratio, reduce tick density, enable table fallback on small screens.
- **Touch targets:** ≥ 44×44px on touch.

---

## F15. Accessibility Standard (WCAG 2.1 AA)

Baseline for **every** screen (screens note extras):
- **Keyboard:** all functionality operable without a mouse; logical tab order; visible focus ring (`--focus-ring`); no keyboard traps; ⌘K, Esc-to-close, Enter-to-submit.
- **Semantics/ARIA:** landmarks (`header/nav/main`), headings in order, `aria-label` on icon-only controls, `aria-live` for async/toasts/validation summaries, `aria-current` on active nav, proper roles for tabs/dialogs/menus (Radix provides).
- **Forms:** programmatic labels, `aria-required`, errors via `aria-describedby`, focus-to-first-error.
- **Color/contrast:** ≥4.5:1 text, ≥3:1 UI/graphics; never color-only meaning (pair with icon/label/text) — critical for score bands & risk.
- **Motion:** honor `prefers-reduced-motion`.
- **Tables/charts:** row/col headers associated; charts offer table fallback + text summary.
- **Language:** `lang` attribute set per FR/EN toggle; content translatable.
- **Targets/zoom:** 44px touch; usable at 200% zoom without loss.

---

## F16. Status, Score & Domain Vocabulary (shared enums)

Single source of truth for labels + colors used across all screens (consistent with BA & Functional Design).

**Evaluation status:** `PENDING · IN_PROGRESS · SUBMITTED · VALIDATED · REJECTED · OVERDUE · REASSIGNED · REOPENED · CANCELLED`.
**PO status:** `OPEN · IN_PROGRESS · COMPLETED · CLOSED · CANCELLED`.
**Supplier lifecycle:** `PROSPECT · APPROVED · PREFERRED · STRATEGIC · UNDER_OBSERVATION · CRITICAL · BLOCKED · ARCHIVED`.
**Tier (segment):** `STRATEGIC · PREFERRED · APPROVED · TRANSACTIONAL`. **Overlays:** `UNDER_OBSERVATION`, `HIGH_RISK`.

**Performance bands (SPI 0–100):**
| Band | Range | Color token |
|---|---|---|
| Excellent | ≥85 | success (dark) |
| Good | 70–84 | success |
| Acceptable | 55–69 | warning |
| Poor | 40–54 | danger (light) |
| Critical | <40 | danger (dark) |

**Risk levels (SRI 0–100, higher=worse):** `LOW <25 · MEDIUM 25–49 · HIGH 50–74 · CRITICAL ≥75` (info→warning→danger→danger-dark).
**Confidence:** `LOW · MEDIUM · HIGH`.
**Scoring scale (sub-criterion):** `1 Very Poor · 2 Poor · 3 Acceptable · 4 Good · 5 Excellent · N/A`.
**8 Dimensions:** Quality/Conformity · Delivery · Communication & Relationship · Technical · Commercial · Flexibility · Administrative Compliance · HSE.
**Improvement-plan status:** `OPEN · IN_PROGRESS · SUPPLIER_RESPONSE · VERIFICATION · CLOSED_EFFECTIVE · CLOSED_INEFFECTIVE · ESCALATED`.

> All colors from F1 semantic tokens; all thresholds **[UM6P VALIDATION REQUIRED]** per BA/Functional Design defaults.

---

## F17. Per-Screen Spec Template

Every screen in Parts 1–6 follows this exact structure (so nothing is missed):

1. **Purpose** — why it exists (1–2 lines).
2. **Target Users** — roles/personas.
3. **Route & Entry Points** — URL, how users arrive.
4. **Permissions** — View · Actions · Scope (F12).
5. **Wireframe** — ASCII layout (desktop; mobile note).
6. **Component Hierarchy** — tree of components (F4).
7. **Layout & Regions** — what's in each region: tables (F5), cards/charts (F6), forms (F7), filters (F8).
8. **Field Definitions** — table (F7 format) where the screen has inputs/columns.
9. **Actions** — table: Action · Trigger · Permission · Confirm? · Result.
10. **Validation & Error Messages** — screen-specific (F11).
11. **States** — loading/empty/filtered-empty/error specifics (F10).
12. **Business Rules** — screen-specific, referencing `RULE-x`/`FR-x`.
13. **Notifications** — triggered/consumed (F13).
14. **User Flow** — steps or mermaid.
15. **Navigation Flow** — where actions lead.
16. **Responsive** — deviations from F14.
17. **Accessibility** — extras beyond F15.
18. **Acceptance Criteria** — testable, Given/When/Then-style.

**Global acceptance criteria inherited by all screens:** renders the four states; keyboard-operable; AA contrast; permission-scoped; FR/EN; responsive per F14; deep-linkable; no PII/errors leaked in UI.

---
*End of Part 0 — UX Foundations. Continue: [Part 1 — Core Screens](./01_screens_core.md).*
