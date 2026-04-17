# DLCF-SW Access Hardening UI Spec

## Project ID
`DLCF-SW-ACCESS-HARDENING`

## Goal
Make all restricted reporting and event-entry surfaces visibly respect leadership hierarchy so unauthorized users never feel entitled to broad access and authorized users operate only inside their assigned scope.

## Core UI Rules
- never show protected navigation to unauthorized users
- never allow unrestricted state/region/centre selection when a role has narrower scope
- disabled/locked fields should clearly communicate why they are locked
- route-level protection must match nav visibility
- backend rejection remains authoritative even if UI already prevents the action

## Surface 1. Main Navigation

### Attendance Reports link
Show only for:
- `administrator`
- `zonal_cord`
- `zonal_admin`
- `state_cord`
- `state_admin`
- `region_cord`
- `region_admin`
- `associate_cord`

Hide for:
- member/worker/ordinary users without report authority

### GCK Attendance link
Show only for:
- leadership roles with direct entry rights
- optionally users holding an active GCK authorization session if GCK code flow exists in this batch

Hide for ordinary users by default.

### GCK Reports link
Show only for authorized report roles.

### State Congress registration/report links
Show only for:
- assigned state registration officials
- approved state report roles

### Zonal Congress registration/report links
Show only for:
- designated zonal registration officials
- `administrator`
- `zonal_cord`
- `zonal_admin`

## Surface 2. Attendance Report Page

### Unauthorized behavior
- direct route visit should redirect home or show forbidden state
- page should not render report controls for unauthorized users

### Authorized behavior
Top scope banner examples:
- `Viewing attendance reports for all allowed states`
- `Viewing attendance reports for Oyo State`
- `Viewing attendance reports for Ibadan Region`
- `Viewing attendance reports for UI Central Fellowship`

### Filters by role
#### administrator / zonal roles
- state selector enabled
- region selector enabled after state
- fellowship selector enabled after region

#### state roles
- state field prefilled and locked
- region selector enabled
- fellowship selector enabled after region

#### region roles
- state field either hidden or prefilled/locked if available
- region field prefilled and locked
- fellowship selector enabled

#### associate coordinator
- state hidden or locked
- region hidden or locked
- fellowship centre prefilled and locked

### Empty/forbidden state
If a user tries to manipulate URL/query params outside scope, UI should load only scoped data and optionally show:
- `Filters were limited to your assigned scope.`

## Surface 3. GCK Attendance Entry Page

### Unauthorized behavior
- ordinary users should not see this page as a free entry form
- if no valid leadership privilege or GCK authorization session exists, show:
  - `You are not authorized to submit GCK attendance directly.`
- optional secondary text:
  - `Please contact your leader for approved access.`

### Authorized leadership behavior
Use the same scope-locking model as attendance entry:
- zonal/admin leadership can choose within broad scope
- state roles locked to own state
- region roles locked to own region
- associate coordinator locked to own centre

### If GCK code flow is added later
- show authorization card similar to attendance access
- only unlock the form after valid authorization
- authorized session must lock state/region/centre to approved scope

## Surface 4. GCK Reports Page

### Unauthorized behavior
- hide nav link
- block direct route access

### Authorized behavior
Show summary/report filters with the same scope rules as attendance reports.

### Visual behavior
- locked filters should appear intentionally disabled, not broken
- report header should state scope clearly
- if broader filters are attempted, show scoped fallback message

## Surface 5. Zonal Congress Registration

### Entry visibility
Show only for designated zonal congress registration officials.

### Form behavior
- if official is zonal-wide, form may allow appropriate zonal state selection
- if official assignment is narrower, lock to assigned scope

### Unauthorized behavior
- ordinary users do not see registration entry route/link
- direct access should show forbidden handling

## Surface 6. Zonal Congress Reports

### Visibility
Show only for:
- `administrator`
- `zonal_cord`
- `zonal_admin`

### Filters
- allow state/region drill-down only within zonal authority
- no visibility for lower roles

## Surface 7. State Congress Registration

### Entry visibility
Show only for registration officials assigned to a particular state.

### Form behavior
- assigned state is prefilled and locked
- region/centre fields can remain editable only within that state

### Unauthorized behavior
- no link
- no route access

## Surface 8. State Congress Reports

### Visibility
Show only for:
- `state_cord`
- `state_admin`
- registration officer for that state

### Behavior
- state fixed to assigned state
- region/institution/cluster breakdowns only inside that state
- attempts to broaden scope should silently clamp or show short scope notice

## Shared Forbidden Pattern
For protected pages, use one of these consistent behaviors:
- redirect to `/`
- or render small in-page card:
  - title: `Access restricted`
  - body: `You do not have permission to view this page.`

Recommendation for this batch:
- use redirect for route protection where app already follows that pattern
- use status message only when redirect would confuse active leaders

## Shared Scope-Lock Pattern
For all scoped forms/reports:
- locked fields remain visible where helpful for context
- locked controls use disabled styling
- scope summary text appears near page header

Examples:
- `Scope: Oyo State`
- `Scope: Ibadan Region`
- `Scope: UI Central Fellowship`

## UI Acceptance Criteria
- unauthorized users no longer see attendance report nav
- unauthorized users no longer see free GCK entry nav
- unauthorized users no longer see GCK report nav
- congress registration/report links are role-specific
- authorized users see only selectors valid for their scope
- lower roles cannot broaden filters beyond assignment in UI
- route-level guards match visible navigation behavior
