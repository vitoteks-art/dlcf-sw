# DLCF-SW GCK Reporting Upgrade UI Spec

## Project ID
`DLCF-SW-GCK-REPORTING-UPGRADE`

## Goal
Upgrade the GCK attendance/reporting experience so the existing session concept becomes a clearer **Program** field and the reporting flow can support richer program-based visibility.

## Core Product Correction
The current session naming should be changed in the form/report experience.

### Replace
- `Session`

### With
- `Program`

### Program options
- `Crusade Sessions`
- `Ministers’ Conferences`
- `Impact Academy`
- `Sunday Worship Service / SHS`

## Primary Screens
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/GckPage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/GckReportPage.jsx`

## GCK Submission UI

### Current behavior
The page already allows multiple dated session entries.

### Required UI direction
Each entry should now clearly use **Program** language instead of a vague session label.

### Required fields per entry
At minimum each row/card should support:
- Date
- Program
- Attendance counts already tracked

If richer metrics already exist in the row structure, they should remain aligned under the new Program terminology.

## Language Updates
Update labels and microcopy so users understand they are reporting by program.

Examples:
- `Add Session` → `Add Program Entry`
- `Session date` messaging should become program-entry-friendly where appropriate
- report tables should show `Program`, not ambiguous session naming

## Report UI

### Required outcome
Leadership should be able to review GCK submissions with clear **Program** values.

Expected display direction:
- monthly GCK records remain grouped as they are
- each entry line clearly shows which program it belongs to
- export/report views should prefer `Program` wording

## Follow-up Direction in UI
For this phase, follow-up is intended toward:
- email
- WhatsApp

MVP note:
- no need for a large manual assignment UI first
- if follow-up surfaces appear in this batch, they should align to communication preparation/output rather than worker assignment workflow

## Acceptance Criteria
- GCK form uses **Program** terminology in place of session wording where applicable
- users can select from:
  - Crusade Sessions
  - Ministers’ Conferences
  - Impact Academy
  - Sunday Worship Service / SHS
- report/review screens also reflect Program wording
- the existing GCK reporting flow remains usable and familiar
