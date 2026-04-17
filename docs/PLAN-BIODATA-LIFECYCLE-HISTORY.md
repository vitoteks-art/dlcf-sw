# DLCF-SW Biodata Lifecycle History Plan

## Project ID
`DLCF-SW-BIODATA-LIFECYCLE-HISTORY`

## Goal
Add lightweight historical tracking for important biodata lifecycle changes so the system no longer stores only the latest state for key membership fields.

## Problem Summary
The biodata module currently stores the current value of lifecycle-related fields, but it does not preserve how those values changed over time.

That means leadership can see what a member is now, but not:
- what changed
- when it changed
- who changed it

This limits auditability and future lifecycle reporting.

## Scope

### In scope
Track changes for these fields when biodata is created or updated:
- `student_status`
- `nysc_status`
- `membership_status`
- `category`
- `marital_status`

Optional if easy in same batch:
- `worker_status`

### Out of scope
- full historical dashboard UI
- student-to-alumni automation
- milestone history for `new_birth_status`, `sanctification_status`, `holy_ghost_baptism_status`
- retroactive backfill of old historical changes before this feature exists

## New Data Model
Create a table such as:
- `biodata_status_history`

Recommended columns:
- `id`
- `biodata_id`
- `field_name`
- `old_value`
- `new_value`
- `changed_by_user_id` nullable
- `changed_at`

## Behavior Rules

### On biodata create
When a biodata record is first created:
- create history rows for tracked fields that have non-empty initial values
- treat old value as `NULL`

### On biodata update
When a tracked field changes:
- append a new history row
- store previous value and new value
- do nothing if the value did not change

### Audit actor
If the change is made by an authenticated user:
- store `changed_by_user_id`

### Backward compatibility
- existing biodata records remain valid
- no backfill required for old changes
- history starts from the moment this feature is deployed

## Backend Changes
Primary target:
- `/root/.openclaw/workspace-atlas/dlcf-sw/api/index.php`

Expected backend work:
- create helper for tracked-field history writes
- detect changed values during biodata create/update flows
- insert rows into history table

Expected DB work:
- SQL file to create `biodata_status_history`

## Frontend Changes
MVP frontend can stay minimal.

### Minimum requirement
No major new page is required if the backend reliably records the history.

### Optional lightweight UI
If easy, a small admin-only history panel may be added later, but it is not required in this phase.

## Acceptance Criteria
- creating biodata with tracked fields writes initial history rows
- updating tracked fields writes only the actual changes
- unchanged tracked fields do not create duplicate rows
- history rows capture biodata id, field name, old value, new value, and changed timestamp
- no regression in existing biodata create/update behavior

## Recommended Build Order
1. identify all biodata create/update entry points
2. add history table SQL
3. implement backend helper for tracked field comparison and insert
4. wire helper into biodata create flow
5. wire helper into biodata update flow
6. verify no duplicate writes on unchanged updates
7. run validation/build pass and package for deploy
