# DLCF-SW Biodata Tracking Phase 2 Plan

## Project ID
`DLCF-SW-BIODATA-TRACKING-PHASE-2`

## Goal
Extend the existing biodata tracking module with the next missing layer of member profile depth and controlled lifecycle visibility, without overcomplicating the system.

## Why this phase exists
The codebase already supports a strong first layer of biodata tracking:
- academic/lifecycle fields
- NYSC fields
- spiritual milestone fields
- lifecycle summary reporting

What is still missing is a second layer that improves basic member identity completeness and prepares the platform for better lifecycle analytics.

## Phase 2 Scope
This phase focuses on a lean, useful upgrade.

### In scope
1. Add `date_of_birth`
2. Add `marital_status`
3. Expose these fields in biodata form, profile, list/detail views, and relevant reports
4. Add lightweight lifecycle change tracking for key biodata status changes
5. Keep the implementation backward-compatible with current biodata records

### Out of scope
- full student-to-alumni automation job
- normalized spiritual milestone history tables
- full alumni workflow engine
- cross-module automation tied to attendance, follow-up, or communication
- major redesign of the biodata UI

## Functional Changes

### 1. Biodata fields
Add new fields to biodata:
- `date_of_birth` (DATE, nullable)
- `marital_status` (controlled text/enum, nullable)

Recommended marital status options for MVP:
- `Single`
- `Married`
- `Engaged`
- `Widowed`
- `Separated`

These should be optional for backward compatibility unless Victor later wants them required.

### 2. Biodata form behavior
Update biodata entry/edit form to support:
- date picker for `date_of_birth`
- select dropdown for `marital_status`

Validation:
- `date_of_birth` must be a valid date when provided
- `marital_status` should only accept allowed values

### 3. Read surfaces
Expose the new fields in:
- biodata profile view
- biodata admin list/detail view
- any current self-profile summary where biodata fields are already shown

### 4. Lightweight lifecycle history
Add a simple audit/history table for biodata lifecycle-relevant changes.

Recommended initial tracked changes:
- `student_status`
- `nysc_status`
- `membership_status`
- `category`
- optionally `marital_status`

Recommended table:
- `biodata_status_history`

Suggested columns:
- `id`
- `biodata_id`
- `field_name`
- `old_value`
- `new_value`
- `changed_by_user_id` (nullable)
- `changed_at`

MVP behavior:
- when tracked fields change through biodata update, append history row
- do not attempt historical backfill for old records in this phase

## Reporting Changes

### Near-term reporting
At minimum, phase 2 should make the new fields visible where biodata is already reviewed.

Optional lightweight report enhancement if easy during implementation:
- marital status summary counts

Not required for this phase:
- age-band analytics
- DOB-based anniversary logic
- trend/history dashboards

## Backend Changes
Primary target:
- `/root/.openclaw/workspace-atlas/dlcf-sw/api/index.php`

Expected backend tasks:
- accept and validate new fields
- persist them in biodata create/update flows
- return them in biodata fetch/list/profile responses
- write lifecycle history rows when tracked fields change

Database work expected:
- alter `biodata` table to add `date_of_birth`, `marital_status`
- create `biodata_status_history` table

## Frontend Changes
Primary targets:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/BiodataPage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/BiodataListPage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/ProfilePage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/App.jsx`

Expected frontend tasks:
- include new form fields in biodata state
- send them to API
- display them in detail/profile surfaces
- keep UI consistent with the current biodata tracking section

## Acceptance Criteria
- biodata form supports `date_of_birth` and `marital_status`
- existing records still load safely when those fields are empty
- saved biodata returns and displays the new fields correctly
- tracked lifecycle field changes create history rows
- no regression in existing biodata tracking fields or reports

## Recommended Build Order
1. inspect current biodata schema and update points
2. add database fields and history table
3. update backend create/update/read flows
4. update frontend biodata state and form
5. update biodata display surfaces
6. verify history rows are written on tracked field changes
7. run build/test pass and package for deployment
