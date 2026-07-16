# UM6P SPM — Product Backlog
## Section 33 of the Business Analysis package · v1.0

> **Structure:** Epics → Features → User Stories. Every user story includes **Description**, **Business Value**, **Priority**, and **Acceptance Criteria**.
> **Priority scale (MoSCoW):** **M** = Must have (MVP) · **S** = Should have · **C** = Could have · **W** = Won't have now (future phase).
> **Story format:** *As a [role], I want [capability], so that [outcome].*
> **Traceability:** IDs link to requirements (FR/BR/RULE) in [BUSINESS_ANALYSIS.md](./BUSINESS_ANALYSIS.md).
> Flags **[UM6P VALIDATION REQUIRED]** mark stories whose acceptance depends on an unconfirmed UM6P policy.

---

## Backlog Overview

| Epic | Title | Priority | Traces to |
|---|---|---|---|
| **E1** | SAP Data Synchronization & Master Data | M | BO-1, FR-1..7 |
| **E2** | Automatic Evaluation Generation & Assignment | M | BO-2, BO-3, FR-8..15 |
| **E3** | Evaluation Matrix Configuration | M | BO-5, FR-16..22 |
| **E4** | Supplier Evaluation Execution | M | BO-4, BO-6, FR-23..29 |
| **E5** | Validation & Governance Workflow | S | BR-7, FR-30..33 |
| **E6** | Scoring & Supplier Performance History | M | BO-7, BO-8, FR-34..38 |
| **E7** | Supplier Improvement Plans | S | BO-10, FR-39..42 |
| **E8** | Notifications & Reminders | M | FR-43..48 |
| **E9** | Dashboards & Analytics | M | BO-9, FR-49..52 |
| **E10** | Reporting & Export | S | FR-50, FR-53 |
| **E11** | Administration, Roles & Access | M | BR-9, FR-54..55 |
| **E12** | Audit & Traceability | M | BO-11, FR-56..57 |
| **E13** | Supplier Self-Service Portal | W | Future phase |

---

## EPIC E1 — SAP Data Synchronization & Master Data
*Goal: bring authoritative procurement data into SPM reliably and traceably.*

### Feature E1-F1 — Master data sync
**US-1.1 — Synchronize suppliers**
- **Description:** As a Procurement Administrator, I want suppliers to be synchronized from SAP, so that evaluations reference accurate supplier records.
- **Business Value:** Trustworthy supplier identity is the foundation of all performance data.
- **Priority:** M
- **Acceptance Criteria:** New/changed suppliers appear in SPM after a sync; unchanged records are not duplicated; each supplier carries its SAP identifier, name, commodity/category and status.

**US-1.2 — Synchronize purchase orders**
- **Description:** As an Administrator, I want POs synchronized with supplier, purchaser, requester, department, commodity, amount, status and dates, so that evaluations can be linked to real transactions.
- **Business Value:** The PO is the trigger and justification for every evaluation.
- **Priority:** M
- **Acceptance Criteria:** POs appear with all listed fields; a PO maps to exactly one supplier; re-sync updates status changes without creating duplicates.

**US-1.3 — Synchronize requesters and purchasers**
- **Description:** As an Administrator, I want requesters and purchasers synchronized and matchable to UM6P identities, so that evaluations can be auto-assigned to the right person.
- **Business Value:** Correct assignment is essential to coverage and accountability.
- **Priority:** M
- **Acceptance Criteria:** Each PO's requester and purchaser resolve to an identifiable user (by email/identity); unresolved persons are flagged for later resolution. **[UM6P VALIDATION REQUIRED: matching key]**

**US-1.4 — Synchronize departments & commodities**
- **Description:** As an Administrator, I want departments and commodities as reference data, so that matrices and reporting can be organized by them.
- **Business Value:** Enables commodity-specific matrices and departmental reporting.
- **Priority:** M
- **Acceptance Criteria:** Departments and commodities are available for configuration and filtering.

### Feature E1-F2 — Sync operations & trust
**US-1.5 — Monitor synchronization runs**
- **Description:** As an Administrator, I want each sync run recorded with counts, outcome and errors, so that I can trust and troubleshoot the data.
- **Business Value:** Operational confidence and rapid issue detection.
- **Priority:** M
- **Acceptance Criteria:** Every run shows start/end, records processed/created/updated/failed, and any errors; failed runs are highlighted.

**US-1.6 — Trigger manual synchronization**
- **Description:** As an Administrator, I want to run a sync on demand, so that I can refresh data without waiting for the schedule.
- **Business Value:** Responsiveness during onboarding and incident recovery.
- **Priority:** S
- **Acceptance Criteria:** A manual run executes and reports its outcome like a scheduled run.

**US-1.7 — Reconcile SPM vs SAP**
- **Description:** As an Administrator, I want a reconciliation report of SPM vs SAP counts, so that I can prove data completeness.
- **Business Value:** Auditable data integrity (KPI: discrepancy < 2%).
- **Priority:** S
- **Acceptance Criteria:** Report shows per-entity counts and flags discrepancies above tolerance.

---

## EPIC E2 — Automatic Evaluation Generation & Assignment
*Goal: turn completed POs into assigned evaluations with zero manual effort.*

### Feature E2-F1 — Completion detection & eligibility
**US-2.1 — Detect completed POs**
- **Description:** As the system, I want to detect when a PO becomes completed, so that an evaluation can be triggered.
- **Business Value:** Drives coverage; removes reliance on people remembering.
- **Priority:** M
- **Acceptance Criteria:** POs meeting the configured completion indicator are detected once and flagged. **[UM6P VALIDATION REQUIRED: completion definition]**

**US-2.2 — Apply eligibility rules**
- **Description:** As an Administrator, I want eligibility rules (min amount, commodity inclusion/exclusion) applied, so that only relevant POs generate evaluations.
- **Business Value:** Focuses effort on purchases that matter; avoids noise.
- **Priority:** M
- **Acceptance Criteria:** Ineligible completed POs generate no evaluation and log the reason; rules are configurable without a release. **[UM6P VALIDATION REQUIRED: thresholds]**

### Feature E2-F2 — Generation & assignment
**US-2.3 — Auto-create evaluation**
- **Description:** As the system, I want to create one evaluation per eligible completed PO using the applicable matrix version, so that evaluation is standardized and immutable to later matrix changes.
- **Business Value:** Standardization + historical integrity.
- **Priority:** M
- **Acceptance Criteria:** Exactly one evaluation per PO (RULE-2); it snapshots the active matrix version; if no active matrix exists, the admin is alerted and no evaluation is created.

**US-2.4 — Auto-assign to requester**
- **Description:** As the system, I want to assign the evaluation to the PO's internal requester with a due date, so that the right person is accountable on time.
- **Business Value:** Accountability + timeliness.
- **Priority:** M
- **Acceptance Criteria:** Evaluation is assigned to the resolved requester; due date set per configured window; assignment audited.

**US-2.5 — Resolve deferred assignment**
- **Description:** As the system, I want to hold assignment when the requester isn't yet a user and resolve it on first login, so that no evaluation is lost.
- **Business Value:** Coverage resilience against identity gaps.
- **Priority:** S
- **Acceptance Criteria:** Held evaluations auto-assign and notify once the requester's identity resolves.

**US-2.6 — Reassign an evaluation**
- **Description:** As a Manager/Administrator, I want to reassign an evaluation with a reason, so that changes in responsibility are handled.
- **Business Value:** Operational flexibility with accountability.
- **Priority:** S
- **Acceptance Criteria:** Reassignment requires a reason, notifies the new (and prior) assignee, and is audited (RULE-11).

**US-2.7 — Manually create an evaluation**
- **Description:** As an Administrator, I want to manually create an evaluation for an eligible PO if auto-creation failed, so that coverage is complete.
- **Business Value:** Safety net for edge cases.
- **Priority:** C
- **Acceptance Criteria:** Manual creation respects one-per-PO and matrix rules; action is audited.

---

## EPIC E3 — Evaluation Matrix Configuration
*Goal: let Procurement own a configurable, weighted, versioned evaluation model.*

### Feature E3-F1 — Define the matrix
**US-3.1 — Define dimensions & sub-criteria**
- **Description:** As an Administrator, I want to define the 8 dimensions and their sub-criteria, so that evaluations reflect UM6P's expectations.
- **Business Value:** Fit-for-purpose, standardized evaluation content.
- **Priority:** M
- **Acceptance Criteria:** Dimensions and sub-criteria can be created/edited/ordered; text supports FR/EN.

**US-3.2 — Configure weights**
- **Description:** As an Administrator, I want to set weights at dimension and sub-criterion level, so that scores reflect UM6P priorities.
- **Business Value:** Priorities become measurable and consistent.
- **Priority:** M
- **Acceptance Criteria:** Weights editable; the system prevents activation unless weights total 100% at each level (RULE-6).

**US-3.3 — Configure scoring scale & N/A**
- **Description:** As an Administrator, I want to set the scale (1–5) and allow "Not Applicable", so that criteria irrelevant to a PO don't distort the score.
- **Business Value:** Fairness and accuracy of scoring.
- **Priority:** S
- **Acceptance Criteria:** N/A excludes a criterion and re-normalizes remaining weights (RULE-9). **[UM6P VALIDATION REQUIRED: scale]**

### Feature E3-F2 — Variants & versioning
**US-3.4 — Commodity-specific matrices**
- **Description:** As an Administrator, I want matrices per commodity/category, so that IT, works and services are judged appropriately.
- **Business Value:** Relevance across diverse spend.
- **Priority:** S
- **Acceptance Criteria:** A commodity can have its own matrix; otherwise the default applies.

**US-3.5 — Version and activate matrices**
- **Description:** As an Administrator, I want matrices versioned with activation, so that historical evaluations remain valid while the model evolves.
- **Business Value:** Historical integrity + continuous improvement.
- **Priority:** M
- **Acceptance Criteria:** Activating a version archives the prior one; existing evaluations keep their version (RULE-7).

**US-3.6 — Route specialist dimensions (optional)**
- **Description:** As an Administrator, I want to optionally route Quality/HSE dimensions to those functions, so that specialist judgement is authoritative.
- **Business Value:** Accuracy of compliance-critical dimensions.
- **Priority:** C — **[UM6P VALIDATION REQUIRED]**
- **Acceptance Criteria:** When enabled, the specialist must complete their dimension before consolidation; when disabled, the requester scores all dimensions.

---

## EPIC E4 — Supplier Evaluation Execution
*Goal: a fast, fair, evidence-based evaluation experience.*

### Feature E4-F1 — Complete an evaluation
**US-4.1 — View evaluation with PO context**
- **Description:** As a Requester, I want to see the PO context (supplier, amount, commodity, dates) with the matrix, so that I can evaluate accurately.
- **Business Value:** Informed, grounded scoring.
- **Priority:** M
- **Acceptance Criteria:** PO context is visible; the correct matrix version is presented.

**US-4.2 — Score each sub-criterion**
- **Description:** As a Requester, I want to score each applicable sub-criterion, so that performance is captured across all dimensions.
- **Business Value:** Multi-dimensional, comparable results.
- **Priority:** M
- **Acceptance Criteria:** Every applicable sub-criterion accepts a score on the configured scale; N/A available where allowed.

**US-4.3 — Justify every score (mandatory)**
- **Description:** As a Requester, I want (and am required) to justify each score, so that evaluations are evidence-based and defensible.
- **Business Value:** Objectivity, fairness, defensibility (BR-3).
- **Priority:** M
- **Acceptance Criteria:** Submission is blocked until every score has a non-empty justification (RULE-4, RULE-5). **[UM6P VALIDATION REQUIRED: minimum length]**

**US-4.4 — Save draft**
- **Description:** As a Requester, I want to save a draft, so that I can complete the evaluation in more than one session.
- **Business Value:** Convenience → higher completion.
- **Priority:** M
- **Acceptance Criteria:** Draft persists all entered scores/comments; status = In Progress.

**US-4.5 — Attach supporting evidence**
- **Description:** As a Requester, I want to attach documents/images, so that my scores are backed by evidence.
- **Business Value:** Stronger audit and dispute defense.
- **Priority:** S
- **Acceptance Criteria:** Files can be attached within allowed types/sizes and are retained with the evaluation.

**US-4.6 — Submit evaluation**
- **Description:** As a Requester, I want to submit a complete evaluation, so that it enters validation/finalization.
- **Business Value:** Completes the accountability loop.
- **Priority:** M
- **Acceptance Criteria:** Submission succeeds only when complete; a confirmation with score summary is shown; action audited.

---

## EPIC E5 — Validation & Governance Workflow
*Goal: optional oversight before results become official.*

**US-5.1 — Validate or return an evaluation**
- **Description:** As a Validator (Manager/Procurement), I want to approve or return a submitted evaluation with comments, so that quality and fairness are governed.
- **Business Value:** Oversight, consistency, dispute reduction.
- **Priority:** S — **[UM6P VALIDATION REQUIRED: validation on/off & validator]**
- **Acceptance Criteria:** Approve finalizes; return sends it back to In Progress with comments; both outcomes notified and audited.

**US-5.2 — Lock finalized evaluations (immutable)**
- **Description:** As Procurement, I want finalized evaluations locked, so that history cannot be altered.
- **Business Value:** Trust, compliance, auditability (RULE-8).
- **Priority:** M
- **Acceptance Criteria:** A finalized evaluation cannot be edited or deleted; the score is committed to supplier history.

**US-5.3 — Exceptional reopen with audit**
- **Description:** As an Administrator, I want to reopen a finalized evaluation only exceptionally and with a recorded reason, so that genuine errors can be corrected transparently.
- **Business Value:** Controlled correction without eroding trust.
- **Priority:** C
- **Acceptance Criteria:** Reopen requires authorization + reason; every reopen is audited and visible in history (RULE-11).

---

## EPIC E6 — Scoring & Supplier Performance History
*Goal: consistent scores and a permanent, immutable performance record.*

**US-6.1 — Compute weighted score**
- **Description:** As Procurement, I want the system to compute the weighted score from sub-criteria/criteria weights, so that scoring is consistent and transparent.
- **Business Value:** Comparable, defensible scores (BO-7).
- **Priority:** M
- **Acceptance Criteria:** Score matches the approved formula; reproducible from stored inputs; N/A handled by re-normalization.

**US-6.2 — Classify into performance band**
- **Description:** As Procurement, I want each evaluation mapped to a band, so that results are instantly interpretable.
- **Business Value:** Fast decision-making.
- **Priority:** M
- **Acceptance Criteria:** Bands assigned per configured thresholds (§21). **[UM6P VALIDATION REQUIRED: bands]**

**US-6.3 — Maintain immutable supplier history**
- **Description:** As Procurement, I want every finalized evaluation appended to the supplier's permanent history, so that we build institutional memory.
- **Business Value:** Trend-based supplier management (BO-8).
- **Priority:** M
- **Acceptance Criteria:** History includes all finalized evaluations, unaltered over time (FR-38).

**US-6.4 — Aggregate supplier performance**
- **Description:** As a Purchaser/Director, I want aggregate performance over time and by dimension, so that I understand a supplier holistically.
- **Business Value:** Portfolio insight and negotiation leverage.
- **Priority:** M
- **Acceptance Criteria:** Aggregate score, per-dimension breakdown and trend are available and reconcile to underlying evaluations.

---

## EPIC E7 — Supplier Improvement Plans
*Goal: close the loop on weak performance.*

**US-7.1 — Auto-flag suppliers below threshold**
- **Description:** As Procurement, I want suppliers scoring below the threshold flagged, so that weak performance is not ignored.
- **Business Value:** Proactive risk management (BO-10).
- **Priority:** S
- **Acceptance Criteria:** Suppliers below the configured threshold are flagged and an improvement plan is proposed. **[UM6P VALIDATION REQUIRED: threshold]**

**US-7.2 — Define improvement actions**
- **Description:** As a Purchaser, I want to define actions, owners and due dates, so that improvement is concrete and accountable.
- **Business Value:** Actionable supplier development.
- **Priority:** S
- **Acceptance Criteria:** A plan holds multiple actions with owner and due date, linked to the triggering evaluation.

**US-7.3 — Track improvement outcomes**
- **Description:** As Procurement, I want to track plan status and outcomes (incl. re-evaluation), so that we know if suppliers improved.
- **Business Value:** Measurable supplier development (KPI: closure ≥ 70%).
- **Priority:** S
- **Acceptance Criteria:** Plan status is trackable to closure; outcomes link to subsequent evaluations and supplier history.

---

## EPIC E8 — Notifications & Reminders
*Goal: drive timely completion and keep stakeholders informed.*

**US-8.1 — Notify on assignment**
- **Description:** As a Requester, I want to be notified when an evaluation is assigned, so that I act promptly.
- **Business Value:** Timeliness; coverage.
- **Priority:** M
- **Acceptance Criteria:** Outlook + in-app notification sent on creation with a direct link.

**US-8.2 — Send reminders**
- **Description:** As a Requester, I want reminders before the due date, so that I don't forget.
- **Business Value:** On-time completion (KPI ≥ 80%).
- **Priority:** M
- **Acceptance Criteria:** Reminders fire per configured cadence; stop once completed. **[UM6P VALIDATION REQUIRED: cadence]**

**US-8.3 — Escalate overdue**
- **Description:** As a Manager, I want overdue evaluations escalated to me, so that I can intervene.
- **Business Value:** Accountability and coverage.
- **Priority:** M
- **Acceptance Criteria:** Overdue items notify evaluator and manager per configuration; visible on dashboards.

**US-8.4 — Validation notifications**
- **Description:** As a Validator/Requester, I want to be notified of validation requests and results, so that the workflow keeps moving.
- **Business Value:** Reduced cycle time.
- **Priority:** S
- **Acceptance Criteria:** Validator notified on submission; evaluator notified of approve/return.

**US-8.5 — Improvement-plan notifications**
- **Description:** As Procurement, I want notifications when improvement plans are created/updated, so that owners act.
- **Business Value:** Follow-through.
- **Priority:** S
- **Acceptance Criteria:** Relevant roles notified on plan events.

**US-8.6 — Periodic digest**
- **Description:** As a Director/Manager, I want a periodic performance digest, so that I stay informed without logging in daily.
- **Business Value:** Lightweight governance.
- **Priority:** C
- **Acceptance Criteria:** Configurable weekly/monthly digest delivered by email.

---

## EPIC E9 — Dashboards & Analytics
*Goal: turn data into decisions, per role.*

**US-9.1 — Requester work queue**
- **Description:** As a Requester, I want a dashboard of my pending/overdue/completed evaluations, so that I manage my workload.
- **Business Value:** Adoption and completion.
- **Priority:** M
- **Acceptance Criteria:** Shows my items by status with quick open; scoped to me.

**US-9.2 — Executive dashboard**
- **Description:** As a Director, I want portfolio KPIs (coverage, avg score, bands, top/bottom suppliers, overdue, trends), so that I govern supplier performance.
- **Business Value:** Data-driven leadership (BO-9).
- **Priority:** M
- **Acceptance Criteria:** KPIs render with filters (period/department/campus/commodity) and drill-down to scorecards.

**US-9.3 — Buyer dashboard**
- **Description:** As a Purchaser, I want performance of my suppliers and coverage of my POs, so that I manage relationships and negotiations.
- **Business Value:** Leverage and risk management.
- **Priority:** S
- **Acceptance Criteria:** Scoped to the purchaser's suppliers/POs; scorecards and open plans visible.

**US-9.4 — Operations dashboard**
- **Description:** As an Administrator, I want sync health and the evaluation pipeline, so that I keep the platform healthy.
- **Business Value:** Operational reliability.
- **Priority:** S
- **Acceptance Criteria:** Shows sync status, pipeline by status, reassignments, config state.

**US-9.5 — Quality/HSE dashboard**
- **Description:** As a Quality/HSE officer, I want dimension-specific trends across suppliers/commodities, so that I spot compliance hotspots.
- **Business Value:** Targeted compliance oversight.
- **Priority:** C
- **Acceptance Criteria:** Filters to the relevant dimension; shows scores and trends.

---

## EPIC E10 — Reporting & Export
*Goal: shareable, defensible outputs.*

**US-10.1 — Supplier scorecard report**
- **Description:** As a Purchaser/Director, I want an exportable supplier scorecard, so that I can share it in reviews and negotiations.
- **Business Value:** Evidence in decisions.
- **Priority:** S
- **Acceptance Criteria:** Scorecard exports to PDF/Excel with overall/dimension scores, trend and evaluation list.

**US-10.2 — Coverage & completion report**
- **Description:** As a Director/Admin, I want coverage and completion reporting, so that I can monitor process health.
- **Business Value:** Process governance (KPIs).
- **Priority:** S
- **Acceptance Criteria:** Report shows eligible vs evaluated vs overdue by period/department/commodity; exportable.

**US-10.3 — Low-performer & improvement report**
- **Description:** As a Director, I want a low-performer and improvement-plan report, so that I can focus attention and follow up.
- **Business Value:** Risk mitigation.
- **Priority:** S
- **Acceptance Criteria:** Lists suppliers below thresholds with bands and plan status; exportable.

**US-10.4 — Audit/traceability report**
- **Description:** As an Auditor, I want an exportable audit report, so that I can evidence controls.
- **Business Value:** Compliance and defensibility (BO-11).
- **Priority:** S
- **Acceptance Criteria:** Immutable action records filterable and exportable.

---

## EPIC E11 — Administration, Roles & Access
*Goal: govern who can do and see what.*

**US-11.1 — Manage users & roles**
- **Description:** As an Administrator, I want to manage users, roles and scope (department/campus), so that access matches responsibility.
- **Business Value:** Security and least privilege (BR-9).
- **Priority:** M
- **Acceptance Criteria:** Roles assignable with department/campus scope; changes audited.

**US-11.2 — Scoped visibility**
- **Description:** As a user, I want to see only evaluations/POs/suppliers in my scope, so that confidentiality is respected.
- **Business Value:** Data protection.
- **Priority:** M
- **Acceptance Criteria:** Access enforced by role + department + campus (RULE-12); out-of-scope data is not visible.

**US-11.3 — Manage configurable rules**
- **Description:** As an Administrator, I want to change matrix, weights, thresholds, windows and rules without a release, so that the platform adapts to policy.
- **Business Value:** Agility (NFR-10).
- **Priority:** M
- **Acceptance Criteria:** Configuration changes take effect without redeployment and are audited; changes to matrices are versioned.

**US-11.4 — Single sign-on**
- **Description:** As a user, I want to sign in with my UM6P Microsoft account, so that access is seamless and secure.
- **Business Value:** Security + adoption.
- **Priority:** M
- **Acceptance Criteria:** Entra ID SSO login works; no separate credentials. **[UM6P VALIDATION REQUIRED: tenant policy]**

---

## EPIC E12 — Audit & Traceability
*Goal: prove what happened, when, by whom, and why.*

**US-12.1 — Record all significant actions**
- **Description:** As Procurement/Audit, I want every create/assign/score/validate/reassign/reopen/config-change recorded immutably, so that the process is fully traceable.
- **Business Value:** Compliance, dispute resolution, trust (BO-11).
- **Priority:** M
- **Acceptance Criteria:** Each action logs actor, timestamp, entity and reason where applicable; records cannot be altered/deleted.

**US-12.2 — Explore the audit trail**
- **Description:** As an Auditor/Director, I want to search and filter the audit trail, so that I can investigate and evidence controls.
- **Business Value:** Efficient assurance.
- **Priority:** M
- **Acceptance Criteria:** Filter by actor/entity/action/date; export; access itself is controlled and (optionally) logged.

---

## EPIC E13 — Supplier Self-Service Portal *(Future / W)*
*Goal (future): give suppliers visibility and a voice.*

**US-13.1 — Supplier views own performance** — **W**
- **Description:** As a Supplier, I want to see my scores and feedback, so that I understand how UM6P perceives my performance.
- **Business Value:** Transparency and supplier development.
- **Acceptance Criteria (future):** Suppliers securely view finalized scores relevant to them, with appropriate confidentiality controls. **[UM6P VALIDATION REQUIRED: disclosure policy]**

**US-13.2 — Supplier acknowledges & responds to improvement plans** — **W**
- **Description:** As a Supplier, I want to acknowledge and respond to improvement plans, so that improvement is collaborative.
- **Business Value:** Faster, jointly-owned improvement.
- **Acceptance Criteria (future):** Suppliers can acknowledge plans and submit responses/evidence, routed to the owning purchaser.

---

## MVP Definition (release 1)

**MVP = all Must-have (M) stories across E1, E2, E3, E4, E6, E8, E9 (core), E11, E12.**
This delivers: SAP-synced data → auto-generated & assigned evaluations → standardized weighted evaluation with mandatory justification → weighted scoring & immutable history → notifications & reminders → requester and executive dashboards → governed access → full audit.

**Should-have (S)** — validation workflow (E5), improvement plans (E7), reporting (E10), buyer/ops dashboards — follow in the next increment.
**Could-have (C)** — specialist routing, digests, Quality/HSE dashboards, manual creation — as capacity allows.
**Won't-have-now (W)** — supplier portal (E13) — future phase.

---

## Backlog Governance
- Groomed each sprint; priorities revisited with the Product Owner (Procurement) and Director's guidance.
- Every story must resolve its **[UM6P VALIDATION REQUIRED]** flags before entering a sprint.
- Stories trace to requirements in [BUSINESS_ANALYSIS.md](./BUSINESS_ANALYSIS.md); delivery sequencing aligns with [ROADMAP.md](./ROADMAP.md).

---
*End of Product Backlog v1.0.*
