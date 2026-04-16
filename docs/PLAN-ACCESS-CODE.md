# DLCF-SW Access Code Plan

## Scope
Implement persistent attendance access codes so attendance entry cannot happen until a valid code is provided and accepted.

### In scope
- Generate attendance access codes from admin-side tools
- Allow only selected roles to generate and revoke codes
- Require valid code activation before attendance entry for non-admin attendance users
- Keep codes valid until manually revoked
- Restrict each code to attendance submission scope only
- Audit creation, activation, usage, and revocation
- Support normal account login first, then code prompt before attendance access for restricted users

### Out of scope
- MFA
- GCK code-gating in this batch
- Biodata code-gating in this batch
- Expiring or rotating codes by time, unless added later
- One-time-use codes

## Requirement Summary
Victor confirmed these rules:
- A generated code remains valid until revoked
- The person using the code must still log into their own account
- After login, clicking attendance should prompt for the code if the user is not in an admin-level attendance role
- The code should function as a limited attendance-access grant, not a replacement for login
- Code generation should be available to:
  - State Coordinator
  - State Admin
  - Associate Cord
- The following roles should access attendance without code, within their normal scope:
  - `associate_cord` for own centre
  - `region_cord`
  - `region_admin`
  - `state_cord`
  - `state_admin`
  - `zonal_cord`
  - `zonal_admin`
  - `administrator`

## Product Decision
This feature should **not** allow anonymous attendance access.
Every attendance user must first authenticate with a normal account.

The attendance code then acts as a **second access gate for attendance only** when the user's role does not already have direct attendance-entry authority.

This means the feature is closer to **attendance authorization by code after login**, not passwordless delegated access.

## User Flows

### 1. Coordinator generates code
1. Eligible leader opens admin/access-code area
2. Leader selects the target fellowship scope
3. Leader clicks generate code
4. System creates a unique code record in active state
5. Leader shares that code with the intended attendance user(s)

### 2. Non-admin attendance user logs in and requests attendance access
1. User logs in with normal email/password account
2. User opens attendance portal
3. If user role is not exempt, the portal blocks attendance form and prompts for access code
4. User enters code
5. System validates:
   - user is authenticated
   - code exists
   - code is active
   - code is attendance-enabled
   - code scope is valid
   - user is permitted to use attendance code flow
6. System creates an attendance authorization session tied to the logged-in user session
7. User gains access only to attendance entry actions for the code scope

### 3. Exempt leadership user opens attendance directly
1. User logs in with normal account
2. User opens attendance portal
3. If role is exempt, no code prompt is shown
4. Attendance form opens directly using normal scope rules

### 4. Coordinator revokes code
1. Eligible leader opens generated codes list
2. Leader revokes selected code
3. System marks it inactive/revoked
4. Future attempts to activate or use it fail
5. Existing attendance authorizations created from that code should also be blocked on the next protected request

### 5. Attendance submission with code authorization
1. Logged-in user with code authorization opens attendance form
2. User can submit attendance only for the allowed centre/scope
3. System logs the code/session used for submission and the logged-in user who used it
4. User cannot access unrelated admin features through the code

## Data Model

### New table: `attendance_access_codes`
Stores persistent access codes for attendance entry.

Fields:
- `id`
- `code_hash` (store hashed code, never plain text)
- `code_label` (optional admin-readable label, e.g. "UI Central attendance code")
- `scope_type` (`fellowship_centre` initially)
- `fellowship_centre_id`
- `state`
- `region`
- `created_by`
- `revoked_by` nullable
- `status` (`active`, `revoked`)
- `last_used_at` nullable
- `created_at`
- `updated_at`
- `revoked_at` nullable

Notes:
- First implementation should scope to **one fellowship centre per code**.
- `state` and `region` can be denormalized for faster admin listing/filtering.

### New table: `attendance_access_sessions`
Tracks active validated attendance authorizations.

Fields:
- `id`
- `attendance_access_code_id`
- `user_id`
- `session_token_hash`
- `fellowship_centre_id`
- `state`
- `region`
- `status` (`active`, `revoked`, `closed`)
- `last_seen_at`
- `created_at`
- `revoked_at` nullable
- `ip_address` nullable
- `user_agent` nullable

Notes:
- This is tied to a logged-in user, not anonymous access.
- If parent code is revoked, this session becomes invalid on next server check.

### New table: `attendance_access_audit_logs`
Stores an immutable trail.

Fields:
- `id`
- `attendance_access_code_id` nullable
- `attendance_access_session_id` nullable
- `actor_user_id` nullable
- `action` (`created`, `activated`, `used_for_submission`, `revoked`, `failed_attempt`)
- `metadata_json`
- `created_at`

### Existing table updates
#### `attendance_entries`
Add nullable fields:
- `attendance_access_code_id`
- `attendance_access_session_id`

Purpose:
- know whether entry came through code-gated attendance flow
- know which authenticated user used the code

## Permissions and Authorization

### Who can generate codes
Allowed roles:
- `state_cord`
- `state_admin`
- `associate_cord`

### Who can enter attendance without code
Exempt roles:
- `administrator`
- `zonal_cord`
- `zonal_admin`
- `state_cord`
- `state_admin`
- `region_cord`
- `region_admin`
- `associate_cord` (for own centre only)

### Who must use code after login
- all other authenticated users who are allowed into attendance entry flow

### Scope rules
#### State Coordinator / State Admin
- can generate codes only for fellowship centres within their state

#### Associate Cord
- can generate codes only for their assigned fellowship centre
- cannot generate for arbitrary centres

### Who can revoke codes
- creator of the code, if still within allowed scope
- administrator
- state coordinator/state admin within their scope

## Security Model
- Access code does not replace user login
- Access code grants **attendance-only authorization** after login
- Store only hashed code values in DB
- Compare using secure hash verification
- Rate-limit activation attempts by user/IP
- Re-check active code and session status on every protected attendance request
- Never expose full code after creation, only at generation moment
- Show masked code in admin list afterward, for example `ATD-UIC-****`

## Backend API Plan

### Admin/leader endpoints
#### `POST /attendance-access-codes`
Create a new attendance access code.

Request:
- `fellowship_centre_id`
- optional `code_label`

Response:
- generated plain code, shown once
- code metadata

Auth:
- logged-in eligible role only

#### `GET /attendance-access-codes`
List generated codes visible to current leader scope.

Filters:
- state
- region
- fellowship_centre_id
- status

#### `POST /attendance-access-codes/:id/revoke`
Revoke code.

Auth:
- scope-checked eligible role

### Attendance authorization endpoints
#### `POST /attendance-access/activate`
Validate access code for the currently logged-in user and create attendance authorization session.

Request:
- `code`

Response:
- attendance access granted
- allowed centre/state/region metadata

Auth:
- logged-in user required

#### `POST /attendance-access/logout`
Close attendance authorization session.

#### `GET /attendance-access/me`
Return current attendance authorization state.

Response:
- `authorized: true/false`
- `requires_code: true/false`
- `is_exempt_role: true/false`
- `fellowship_centre_id`
- `fellowship_centre`
- `state`
- `region`

## Attendance Endpoint Changes

### `POST /attendance`
Current state:
- requires normal authenticated user session

Proposed state:
Support these access paths:
1. authenticated exempt-role user
2. authenticated user with valid attendance access session

Authorization rules:
- if exempt role user: keep current scope rules
- if code-authorized user: force attendance submission to exact centre in authorized scope
- ignore conflicting client-provided scope values

### `GET /attendance/details`
Allow only if:
- normal exempt/authorized leadership user, or
- logged-in user with attendance access session whose scope matches requested centre

### `PUT /attendance/:id`
Decision for MVP:
- disallow updates via attendance code authorization
- updates remain for exempt/admin-level attendance users only

This keeps first release safer and simpler.

## Frontend Plan

## Admin UI
Add new admin tab or panel:
- `Attendance Codes`

Features:
- select state/region/centre based on role scope
- generate new code
- display code once after creation
- list active/revoked codes
- revoke button
- last used time

For Associate Cord:
- centre should be prefilled and locked to assigned centre

## Attendance Portal UI
Current state:
- portal shows login when user is not authenticated
- authenticated users can move into attendance flow

Proposed MVP change:
- after login, portal checks attendance authorization state
- if user is exempt role, show attendance form directly
- if user is not exempt, show code prompt before attendance form
- if valid attendance authorization exists, show attendance form
- form scope fields should be auto-filled and locked when code authorization is active

UI states needed:
- not logged in
- logged in but code required
- invalid code
- revoked code
- authorized by code
- exempt-role direct access

## Page Map
- `/portal` → login if needed, then either code prompt or attendance form
- `/admin` → add attendance access code management section

No anonymous access page in MVP.

## Jobs / Cron
None required for MVP because codes do not expire automatically.

Optional future job:
- cleanup closed/revoked attendance authorization sessions older than retention threshold

## Security Basics
- hash codes before storage
- log code activation attempts
- limit brute force attempts
- bind attendance authorization session to logged-in user session/cookie token
- re-check parent code status for each request
- do not allow code-authorized user to view reports or unrelated admin features
- do not allow one user's attendance authorization to transfer to another account

## Rollout Plan

### Phase A, backend foundation
1. add migration for access code tables
2. add helper functions for attendance access session lookup and enforcement
3. add create/list/revoke endpoints
4. add activate/me/logout endpoints
5. patch attendance submission endpoint to support code-authorized users
6. add audit logging

### Phase B, frontend MVP
1. add attendance authorization state handling after login
2. add code prompt gate before attendance form for non-exempt users
3. lock scope fields when code authorization is active
4. add admin management UI for code generation and revocation

### Phase C, hardening
1. failed-attempt throttling
2. masked code display and improved audit views
3. optional revoke-all-active-authorizations action

## Non-goals for this batch
- general-purpose delegated access for GCK or biodata
- temporary expiry windows
- one code for multiple centres
- anonymous attendance access
- multi-step approvals before code generation

## Definition of Done
- eligible leaders can generate attendance codes
- generated code remains valid until revoked
- non-exempt users must log in before entering attendance code
- attendance form cannot be used without either exempt attendance role or valid code authorization after login
- code-authorized user can submit attendance only for allowed centre
- revoked code stops new authorization and invalidates further protected use
- admin can list and revoke codes
- audit records exist for creation, activation, usage, and revocation
