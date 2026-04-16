# DLCF-SW Access Code UI Spec

## Goal
Add a simple attendance access-code flow without confusing existing leaders who already use the portal.

The UX should make it clear that attendance access now works like this:
1. user logs in normally
2. if user has exempt admin-level attendance role, attendance opens directly
3. otherwise, clicking or opening attendance prompts for code
4. valid code grants attendance submission access only

## Design Principles
- Keep the current portal recognizable
- Make login mandatory for everyone
- Make the code prompt feel like a second gate, not a replacement for login
- Make scope obvious so the rep knows which centre they are submitting for
- Prevent accidental cross-centre submission
- Make revoke flow obvious for admins

## Screen 1: Attendance Portal Entry (`/portal`)

### Current state
- Login/auth block shows when no logged-in user exists
- Attendance form shows after user auth

### New layout
#### Logged out state
Show the existing login/auth area only.

Helper text:
- "Log in to continue to the attendance portal."

No code entry should appear before login.

#### Logged in state
After login, system checks attendance access state.

Possible outcomes:
1. exempt attendance role → show attendance form directly
2. non-exempt role without authorization → show code prompt
3. non-exempt role with valid authorization already active → show attendance form with locked scope

## Screen 2: Code Prompt After Login

### Audience
Authenticated users who do not have exempt attendance-entry roles.

### Layout
A focused card above or instead of the attendance form.

Fields:
- Access code
- Continue button

Helper text:
- "Enter the attendance access code given to you by your coordinator or admin."

Secondary note:
- "This code gives access to attendance submission only."

### States
#### Default
- code field empty
- form visible only as prompt card, not attendance counts yet

#### Invalid code
- inline error: "Invalid or revoked access code"

#### Successful code activation
- hide prompt
- show success banner with scope info

Success banner copy example:
- "Attendance access granted for DLCF UI Central, Oyo State, Ibadan Region."

Actions:
- `Change code`
- `Exit Access`

## Screen 3: Attendance Form with Code Authorization

### Form behavior
When access is via attendance code after login:
- `state` field is prefilled
- `region` field is prefilled
- `fellowship centre` field is prefilled
- those fields are read-only or disabled
- attendance date, service day, and count fields remain editable

### Visual indicator
Show a small badge above form:
- `Code Authorized`

Secondary text:
- "Your account is authorized to submit attendance only for the assigned fellowship centre."

### Buttons
- `Save Attendance`
- `Exit Access`

### Restrictions
- hide `Load Existing` button in MVP for code-authorized users
- do not expose report links or unrelated admin shortcuts through this flow

## Screen 4: Attendance Form for Exempt Roles

### Exempt roles
- administrator
- zonal_cord
- zonal_admin
- state_cord
- state_admin
- region_cord
- region_admin
- associate_cord (for own centre)

### Form behavior
If logged-in user belongs to exempt role:
- skip code prompt entirely
- keep current attendance workflow
- allow choosing state, region, fellowship centre according to scope rules
- keep `Load Existing` where already supported

### Visual indicator
Optional subtle badge:
- `Direct Attendance Access`

## Screen 5: Admin Attendance Access Code Management

### Placement
Inside admin dashboard as a new tab:
- `Attendance Codes`

### Panel sections
#### A. Generate Code
Fields:
- State (auto-fixed or filtered by role scope)
- Region (filtered by state)
- Fellowship Centre
- Optional label

Buttons:
- `Generate Code`

Behavior:
- after generation, show the plain code in a highlighted success box
- plain code is shown only once
- include copy button

Success box copy:
- "Code created successfully. Copy and share it now. It will not be shown in full again."

#### B. Existing Codes List
Columns:
- Label
- Fellowship Centre
- State
- Region
- Status
- Created By
- Created At
- Last Used
- Actions

Actions:
- `Revoke`

For revoked codes:
- row appears dimmed or tagged `Revoked`
- revoke button disabled/replaced

### Role-based UI rules
#### State Coordinator / State Admin
- can see centres only within their state
- can generate and revoke codes within their state scope

#### Associate Cord
- generation form should auto-lock to assigned fellowship centre
- can only view and revoke codes for assigned fellowship centre

## Screen 6: Revoke Confirmation Modal

### Trigger
Clicking `Revoke`

### Content
Title:
- `Revoke attendance code?`

Body:
- "This code will stop working for future attendance authorization. Existing attendance access using this code will also be blocked on the next protected action."

Actions:
- `Cancel`
- `Revoke Code`

## Screen 7: Authorization Session Restore / Re-check

On page reload, if a logged-in user has a valid attendance authorization already active:
- skip code prompt
- restore user directly into attendance form with locked scope

If the code was revoked after activation:
- clear authorization session
- show message: "This attendance access code is no longer active. Please request a valid code."
- return user to the code prompt

If the logged-in user is exempt role:
- skip this check and show form directly

## Field Rules

### Access code input
- single text field
- trim spaces automatically
- allow pasted values
- uppercase/lowercase normalization if code format uses mixed case

### Centre selection in admin
- searchable dropdown preferred if centres are many
- if not available yet, standard dropdown is acceptable for MVP

## Error States

### On code activation
- invalid code
- revoked code
- server error
- too many failed attempts
- login expired

### On generation
- user lacks scope permission
- no fellowship centre selected
- server failed to save

### On revoke
- already revoked
- insufficient permission
- server error

## Empty States

### Code list empty
- "No attendance access codes created yet."

### Associate cord without assigned centre
- disable generation form
- show message: "No fellowship centre is assigned to your account."

## Mobile Behavior
- login stays first step
- code prompt card appears after login
- success box appears above attendance form
- copy button remains visible after code generation
- revoke actions in code list collapse into row action menu if needed

## Copy Suggestions
- `Attendance Access Code`
- `Enter access code`
- `Continue`
- `Exit Access`
- `Generate Code`
- `Copy Code`
- `Code created successfully`
- `Invalid or revoked access code`
- `Attendance access granted`
- `Log in to continue to the attendance portal`

## MVP UI Decisions
- keep the portal route unchanged at `/portal`
- login is mandatory before code entry
- no separate public code page in MVP
- do not allow code-authorized users to update previous entries
- do not show full code again after creation
- use a simple admin tab instead of a complex wizard

## Implementation Notes
- Frontend should maintain separate state for:
  - logged-in user session
  - attendance authorization session
- Attendance access checks should run after login for non-exempt roles.
- The attendance page should avoid assuming that every logged-in user has direct attendance access.
- Admin/report routes should continue to rely on role-based user auth, not attendance authorization.

## UI Acceptance Criteria
- logged-out visitor sees login first, not code entry
- logged-in non-exempt user is prompted for code before attendance form appears
- logged-in exempt role sees attendance form directly
- valid code unlocks attendance form with locked scope
- code-authorized user cannot change centre
- eligible leaders can generate and revoke codes from admin
- generated code is shown once and can be copied
- revoked code can no longer be used
- revoked active authorization returns user to code prompt with a clear message
