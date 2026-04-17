# DLCF-SW Access Hardening Plan

## Project ID
`DLCF-SW-ACCESS-HARDENING`

## Goal
Close the remaining permission gaps around attendance reports, GCK attendance entry, GCK reports, zonal/state congress registrations, and their report surfaces so users only act within their approved leadership scope.

## Problem Summary
Current behavior is too permissive in multiple places:
- attendance report pages can be reached too broadly
- GCK attendance entry can be submitted by ordinary users without authorized code/role restriction
- GCK report scope is not sufficiently locked by leadership hierarchy
- zonal/state congress registration and reporting access is broader than intended

This creates a serious data integrity and governance problem.

## Final Access Rules

### 1. Attendance Reports
Authorized roles only:
- `administrator`
- `zonal_cord`
- `zonal_admin`
- `state_cord`
- `state_admin`
- `region_cord`
- `region_admin`
- `associate_cord`

Scope rules:
- `administrator`, `zonal_cord`, `zonal_admin` → all states in allowed zone context
- `state_cord`, `state_admin` → own state only
- `region_cord`, `region_admin` → own region only
- `associate_cord` → own assigned fellowship centre only

Hard requirements:
- hide report navigation from unauthorized users
- reject direct API/report access for unauthorized users
- ignore or override wider query filters outside role scope

### 2. GCK Attendance Entry
Direct access without passcode only for authorized leadership roles:
- `administrator`
- `zonal_cord`
- `zonal_admin`
- `state_cord`
- `state_admin`
- `region_cord`
- `region_admin`
- `associate_cord`

Scope rules:
- `administrator`, `zonal_cord`, `zonal_admin` → all allowed states in zone context
- `state_cord`, `state_admin` → own state only
- `region_cord`, `region_admin` → own region only
- `associate_cord` → own centre only

All other users:
- must not submit GCK attendance freely
- may only submit through approved passcode/authorization flow if that flow is explicitly enabled for GCK

MVP decision for this hardening batch:
- reuse the existing attendance-style authorization model where practical
- if a reusable GCK passcode flow does not exist yet, block ordinary users entirely until leadership authorization support is added correctly

### 3. GCK Reports
Authorized report access only:
- `administrator`
- `zonal_cord`
- `zonal_admin`
- `state_cord`
- `state_admin`
- `region_cord`
- `region_admin`
- `associate_cord`

Scope rules:
- same as attendance reporting

Hard requirements:
- no cross-state or cross-region report visibility outside assigned scope
- API filters must be clamped to user scope
- route/page access must also be clamped

### 4. Zonal Congress Registration + Reports
Registration entry allowed only for designated zonal congress registration officials.

Reports allowed only for:
- `administrator`
- `zonal_cord`
- `zonal_admin`

Hard requirements:
- ordinary members cannot register participants into zonal congress admin flow
- report endpoints reject all other roles
- UI links/forms hidden for unauthorized users

### 5. State Congress Registration + Reports
Registration entry allowed only for officials assigned to that specific state.

Reports allowed only for:
- `state_cord`
- `state_admin`
- state registration officer for that state

Hard requirements:
- state registration officials cannot act outside assigned state
- no global or cross-state state-congress reporting for lower roles
- UI and API must both enforce this

## Implementation Strategy

### Phase A. Capability helpers
Add or refine centralized helpers in backend for:
- `can_view_attendance_reports(user)`
- `apply_attendance_scope(user, filters)`
- `can_submit_gck_without_code(user)`
- `can_view_gck_reports(user)`
- `apply_gck_scope(user, filters)`
- `can_manage_zonal_congress_registration(user)`
- `can_view_zonal_congress_reports(user)`
- `can_manage_state_congress_registration(user)`
- `can_view_state_congress_reports(user)`

Where role assignment depends on named officials, add helper logic around role or assignment tables already present in the project.

### Phase B. Attendance report hardening
Backend:
- enforce authorized roles on `/attendance/details`
- clamp filters to effective scope
- block wider state/region/centre queries outside scope

Frontend:
- hide attendance report link for unauthorized users
- prefill/lock scope selectors where needed

### Phase C. GCK entry + report hardening
Backend:
- restrict `/gck`, `/gck/details`, `/gck/summary`, `/gck/{id}`
- allow leadership direct access only within scope
- deny ordinary users unless approved authorization path applies

Frontend:
- hide GCK entry/report links for unauthorized users
- lock state/region/centre selection to effective scope
- prevent form submission outside scope even before API rejection

### Phase D. Zonal/State congress hardening
Backend:
- tighten `/state-congress-registrations`
- tighten `/state-congress-reports/*`
- inspect whether zonal congress is represented through retreat/congress pathways and harden the matching endpoints
- apply role/scope checks before reads/writes

Frontend:
- hide registration/report routes for unauthorized users
- lock officials to assigned state where applicable

## Data / Config Notes
Possible need:
- explicit registration-official assignment mapping if not already modeled
- if the project already stores work-unit or state assignment metadata, reuse it instead of introducing a new table in this batch unless necessary

## Acceptance Criteria
- unauthorized users cannot open attendance reports
- authorized users only see attendance data inside role scope
- unauthorized users cannot submit GCK attendance directly
- GCK leadership entry is limited to assigned scope
- GCK reports are visible only to approved leadership roles inside scope
- zonal congress registration is restricted to designated officials
- zonal congress reports are limited to `administrator`, `zonal_cord`, `zonal_admin`
- state congress registration is restricted to officials assigned to that state
- state congress reports are limited to `state_cord`, `state_admin`, and that state's registration officer
- direct URL/API access is blocked even if UI links are hidden

## Recommended Build Order
1. backend capability helpers
2. attendance report restrictions
3. GCK entry restrictions
4. GCK report restrictions
5. state/zonal congress registration restrictions
6. state/zonal congress report restrictions
7. frontend nav + route visibility cleanup
8. verification with role-based test matrix

## Verification Matrix
Test with at least:
- `administrator`
- `zonal_cord`
- `zonal_admin`
- `state_cord`
- `state_admin`
- `region_cord`
- `region_admin`
- `associate_cord`
- normal member/user
- registration official for state congress

For each role verify:
- visible nav links
- direct route access
- API read access
- API write access
- scope clamping behavior
