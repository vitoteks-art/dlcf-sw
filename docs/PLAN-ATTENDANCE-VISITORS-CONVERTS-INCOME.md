# PLAN — DLCF-SW-ATTENDANCE-VISITORS-CONVERTS-INCOME

## Goal
Extend attendance entry and reporting so centres can capture visitors, converts, and tithe and offering for each service.

## Final MVP fields
Add these service-level fields to each attendance entry:
- `visitors`
- `converts`
- `tithe_and_offering`

## Why this structure
These are not part of the current adult/youth/children male-female attendance matrix.
They are service-level summary metrics and should be stored separately from attendance count rows.

## Scope

### In scope
- add visitors, converts, and tithe and offering to attendance entry
- save/load/edit these values with each attendance record
- include them in attendance report output
- include them in Excel export
- maintain current attendance workflow and access rules

### Out of scope for MVP
- splitting tithe and offering into separate amounts
- individual visitor biodata capture from attendance form
- individual convert follow-up workflow
- dashboard analytics beyond current report/export flow

## Data model recommendation
Extend `attendance_entries` with columns such as:
- `visitors` INT NOT NULL DEFAULT 0
- `converts` INT NOT NULL DEFAULT 0
- `tithe_and_offering` DECIMAL(12,2) NOT NULL DEFAULT 0.00

This is cleaner than trying to store them in `attendance_counts`, because they are not category/gender attendance buckets.

## Backend plan
- add DB migration for the new attendance entry columns
- update create attendance endpoint to accept/save these fields
- update attendance detail endpoint to return these fields
- update attendance update endpoint to save these fields during edits
- update attendance summary/report endpoint to include these fields in report output
- preserve current scope enforcement for associate/state/region roles

## Frontend plan
- add 3 new inputs to attendance entry UI:
  - visitors
  - converts
  - tithe and offering
- ensure existing load/edit flow hydrates these values
- update attendance report rendering to show the new metrics clearly
- update Excel export so the new metrics are included

## Reporting recommendation
Keep visitors and converts separate from attendance demographic counts.

For each service block, report:
- adult male
- adult female
- youth male
- youth female
- children male
- children female
- attendance total
- visitors
- converts
- tithe and offering

This keeps headcount, outreach outcome, and finance clearly separated.

## Validation rules
- visitors must be numeric and >= 0
- converts must be numeric and >= 0
- tithe and offering must be numeric and >= 0
- blank values should behave as 0 in storage

## Acceptance criteria
- user can enter visitors, converts, and tithe and offering on attendance form
- existing attendance entry can be loaded and edited with the new fields
- report displays the new fields correctly
- Excel export includes the new fields
- DB migration is provided and documented

## Files likely to change
- `/root/.openclaw/workspace-atlas/dlcf-sw/api/index.php`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/App.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/PortalHome.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/AttendanceReportPage.jsx`
- new DB migration file under `/root/.openclaw/workspace-atlas/dlcf-sw/docs/`

## Recommendation
Implement this as one coordinated attendance upgrade so entry, edit, summary report, export, and schema all stay in sync.
