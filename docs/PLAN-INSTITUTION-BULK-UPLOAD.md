# PLAN — DLCF-SW-INSTITUTION-BULK-UPLOAD

## Goal
Allow admins to add many institutions at once using an Excel upload instead of typing each institution manually on the platform.

## Problem
Current institution creation is one-by-one and becomes stressful and slow when adding many schools.

## MVP outcome
An authorized user should be able to:
1. download or follow a simple Excel template format
2. upload an Excel file from the platform
3. preview validation results
4. import valid institution rows into the database in bulk
5. receive a success/error summary after upload

## Scope

### In scope
- add a bulk upload area to the institution management/admin flow
- accept `.xlsx` upload for institution bulk import
- parse rows from Excel
- validate required columns before insert
- skip or clearly report invalid rows
- prevent duplicate institution entries where practical
- return import summary: total rows, imported rows, skipped rows, errors

### Out of scope for MVP
- csv + xls + xlsx all at once, unless already easy from existing library support
- background queue processing
- partial rollback transaction viewer/history page
- advanced deduplication matching by fuzzy names
- undo import

## Expected Excel format
Initial simple format:
- `state` (required)
- `institution_name` (required)

Victor can prepare a sheet with one institution per row under the headers.

## Users and permissions
- admin/authorized management users only
- ordinary users should not see or use institution bulk upload

## Codebase integration notes
Current institution management already exists in these places:
- backend list/create/update/delete endpoint: `/root/.openclaw/workspace-atlas/dlcf-sw/api/index.php` under `/admin/institutions`
- admin UI panel: `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/components/admin/AdminOrganization.jsx`
- frontend state/actions wiring: `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/App.jsx`
- institution lookup for other modules already reads from `institutions.state_name` + `institutions.name` through `/meta/institutions`

Best integration path is to extend the existing **Institutions** admin panel with a bulk upload section, then add a companion backend bulk import endpoint alongside `/admin/institutions` so the feature fits the current organization-management flow instead of creating a separate disconnected screen.

## Backend plan
- add a new endpoint for institution bulk import near the existing `/admin/institutions` handlers
- accept structured rows with `state` and `institution_name`
- validate both columns per row
- trim values before insert
- for `state_cord`, force row state to the user's own state or reject mismatched rows
- ignore blank rows
- skip duplicates already existing in `institutions` for the same `state_name + name`
- return structured import result payload

## Frontend plan
- add a bulk upload area inside the existing `Institutions` admin tab in `AdminOrganization.jsx`
- include file picker and short template instructions for `state` + `institution_name`
- parse Excel on the frontend into rows, then send rows to backend for validation/import
- show upload status and validation/import summary
- optionally add a downloadable template later if needed

## Validation rules
- file must be an Excel file
- header must include `state` and `institution_name`
- blank state or institution name should be skipped with reason
- duplicate `state + institution_name` pairs in file or database should be skipped with reason
- if the uploader is scope-limited, rows outside allowed state scope must be rejected

## Technical notes
- current schema already fits this well because `institutions` stores `state_name` and `name`
- if no Excel parser exists yet in the current frontend stack, add one suitable browser-side library and keep insert validation on the backend
- prefer server-side insert validation so the database remains the source of truth

## Acceptance criteria
- authorized user can upload an Excel file with `state` and `institution_name`
- valid institutions are inserted into the database
- duplicates are not duplicated
- invalid rows are reported clearly
- user sees summary after import
- feature fits naturally into the existing Institution admin workflow

## Files likely to change
- `/root/.openclaw/workspace-atlas/dlcf-sw/api/index.php`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/App.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/components/admin/AdminOrganization.jsx`
- package/dependency files only if required for Excel parsing

## Risks
- Excel parsing library choice may affect implementation path
- duplicate handling must be clear to avoid confusion
- upload size should stay modest for MVP

## Recommendation
Start with `.xlsx` support and the two required columns already aligned to the current schema, `state` and `institution_name`, and integrate it directly into the existing Institutions admin panel.
