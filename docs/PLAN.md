# DLCF-SW Expansion Plan

## Scope
This plan covers the next expansion phase for DLCF-SW based on the current codebase and the newly requested features.

### In scope
1. User management and access control improvements
2. Enhanced bio-data and spiritual tracking
3. Student and alumni lifecycle module
4. Attendance and reporting upgrades for GCK flows
5. STMC portal expansion into a proper training portal
6. CMS/content expansion for state mini-sites and testimony/fellowship discovery
7. Financial and communication tools, including giving and expanded media hub

### Out of scope
- Naming standard enforcement for fellowship centres
- Full native mobile apps
- Replacing the current PHP + React stack
- Third-party accounting/ERP features beyond giving records and reporting

## Current System Snapshot

### Already implemented
- Session-based authentication with CSRF protection
- Role-based users and scoped access by state, region, and fellowship centre
- Admin management for users, roles, states, regions, institutions, fellowships, work units
- Biodata registration and listing
- Attendance reporting
- GCK monthly reporting
- Retreat, state congress, zonal congress registrations and reports
- STMC registration and reporting
- State homepage CMS, state events/posts, media, publications
- Public state mini-sites and media pages

### Known architectural constraints
- Permissions are mostly hardcoded in API/controller logic and frontend conditionals
- Current auth does not support MFA or delegated secure access codes
- Biodata schema is too shallow for lifecycle and spiritual milestone reporting
- GCK tracking is present, but not normalized for the richer program taxonomy and follow-up workflows now desired
- STMC currently behaves like a form/reporting module, not an LMS

## Product Goals
1. Preserve what already works and extend it safely
2. Avoid password sharing among field leaders
3. Make reporting useful for state, region, and zonal leadership
4. Support student-to-alumni lifecycle without manual spreadsheet work
5. Turn STMC into a structured learning and certification portal
6. Strengthen public-facing engagement with testimonies, locator, giving, and media

## User Roles and Access Model

### Role tiers
- Super Admin
- Zonal Coordinator / Zonal Admin
- State Coordinator / State Admin / State Rep
- Region Coordinator / Region Rep
- Associate Coordinator
- Fellowship Rep (new delegated access mode)
- Member
- Alumni Member (functional profile type, not necessarily separate auth role)
- NYSC Member (status/profile subtype, not necessarily separate auth role)

### Proposed permission model
Use two layers:
1. **Primary role** for structural authority
2. **Capabilities** for fine-grained actions

Example capabilities:
- `manage_users`
- `grant_roles`
- `edit_state_site`
- `submit_biodata_for_centre`
- `view_state_reports`
- `manage_followup`
- `manage_stmc_courses`
- `grade_stmc_exams`
- `publish_testimonies`
- `view_financial_reports`

This replaces over-reliance on hardcoded `if user.role in [...]` checks.

### Delegated access code flow
Problem: Fellowship reps need to enter data on behalf of ACs without password sharing.

Proposed model:
- Create `delegated_access_codes` table
- AC or admin generates time-bound code for a fellowship/centre
- Fellowship rep enters code on a dedicated portal
- Code grants limited scoped actions only, such as:
  - submit attendance
  - submit GCK report
  - submit biodata for assigned centre
  - register visitors/converts/follow-up entries
- Codes are revocable, expirable, auditable

This should be implemented as scoped session elevation, not as permanent user impersonation.

### MFA for editors
Apply MFA to users with any edit/publish/admin capability.

Recommended rollout:
- Phase 1: Email OTP or TOTP for admin/editor login challenge
- Phase 2: TOTP app-based MFA preferred for persistent leaders

Tables needed:
- `user_mfa_methods`
- `login_challenges`
- `recovery_codes`

Security baseline:
- Require MFA for admin, zonal, state, region, associate, publication/media editors
- Log device/IP metadata for editor logins and destructive actions

### Registration rule
All new public signups default to:
- role = `member`
- elevated capabilities = none

Any higher role must be manually granted in admin.

## Core User Flows

### 1. Member signup and profile completion
1. User signs up
2. Account is created as `member`
3. Email verification completes
4. User fills biodata
5. System classifies person as student, corper, alumni, worker, etc. based on profile data

### 2. AC/Fellowship rep delegated reporting
1. AC/admin creates access code for a fellowship centre
2. Fellowship rep logs in with code or enters code in a secure gateway page
3. System grants temporary scoped access
4. Rep submits attendance/GCK/follow-up/biodata updates
5. Audit log stores who generated code, who used it, and what was submitted

### 3. Leadership reporting
1. State/region/zonal leaders open reporting dashboard
2. System applies scope automatically
3. Dashboards show attendance, spiritual milestones, student/alumni counts, convert follow-up, course progress, giving summaries

### 4. Student to alumni migration
1. Member profile stores program type, start year, expected completion year, current level/status
2. Scheduled job evaluates expected completion date
3. Status changes from `active_student` to `alumni` when due, unless manually overridden
4. Alumni-specific views and communication filters become available

### 5. NYSC tracking
1. Member marked as `corper` or `nysc_member`
2. Service batch, start date, end date, PPA location stored
3. Dedicated NYSC dashboard/report groups corps members by batch and service state/date ranges

### 6. STMC learning journey
1. Member registers for course track
2. Assigned to course sessions/classes/materials
3. Takes assessments
4. Results recorded
5. Transcript and certificate generated on completion

### 7. Visitor/convert follow-up
1. Attendance/GCK form captures visitors and converts
2. System creates follow-up tasks instantly
3. Tasks are assigned to designated follow-up workers by scope
4. Follow-up outcomes are tracked and reportable

## Data Model Plan

## A. Access control and audit
### New tables
- `permissions`
- `role_permissions`
- `user_permissions` (optional direct overrides)
- `delegated_access_codes`
- `delegated_access_sessions`
- `audit_logs`
- `user_mfa_methods`
- `login_challenges`
- `recovery_codes`

### Existing table changes
#### `users`
Add fields such as:
- `primary_role`
- `status` (`active`, `disabled`, `pending`)
- `last_login_at`
- `mfa_required`
- `mfa_enabled`
- `created_by`
- `updated_by`

Note: current `role` can be retained initially for backward compatibility, then migrated.

## B. Biodata and spiritual tracking
### Extend `biodata`
Add:
- `date_of_birth`
- `marital_status`
- `program_type` (`ND`, `HND`, `NCE`, `BSc`, `PG`, etc.)
- `academic_level`
- `entry_year`
- `expected_graduation_year`
- `student_status` (`active_student`, `graduated`, `alumni`, `deferred`, `withdrawn`)
- `is_alumni` boolean
- `nysc_status` (`none`, `serving`, `completed`)
- `nysc_batch`
- `nysc_state`
- `nysc_start_date`
- `nysc_end_date`
- `new_birth_status` boolean
- `new_birth_recorded_at`
- `sanctification_status` boolean
- `sanctification_recorded_at`
- `holy_ghost_baptism_status` boolean
- `holy_ghost_baptism_recorded_at`
- `spiritual_notes` text

### Reporting support tables
Optional but recommended:
- `member_spiritual_milestones`
  - normalized history of milestone changes over time
- `member_status_history`
  - tracks changes from student to alumni, NYSC, worker, etc.

This helps analytics remain auditable instead of only storing final yes/no states.

## C. Attendance, GCK, visitors, converts, follow-up
### New/updated entities
- `program_types` or enum-backed config for event/report categories:
  - Crusade Sessions
  - Ministers’ Conferences
  - SMART for Students
  - Impact Academy
  - Sunday Worship Service / SHS
- `gck_reports` enhancement to store report type/category
- `gck_session_entries` normalized child rows per session/program
- `visitor_followups`
- `followup_assignments`
- `followup_notes`

### Proposed data fields
For each tracked meeting/session:
- program category
- total attendance
- male/female breakdown where needed
- visitors count
- converts count
- rededications count (optional, recommended)
- follow-up-required count
- assigned follow-up worker/team

## D. STMC / LMS module
### New tables
- `courses`
- `course_modules`
- `course_lessons`
- `course_enrollments`
- `lesson_progress`
- `study_materials`
- `virtual_class_sessions`
- `assessments`
- `assessment_questions`
- `assessment_attempts`
- `assessment_results`
- `certificates`
- `transcripts`

### Existing reuse
- Existing `stmc_registrations` can become intake/registration source table or be migrated into `course_enrollments`

## E. Content and public engagement
### New tables
- `testimonies`
- `fellowship_locations`
- `giving_campaigns`
- `giving_transactions`
- `media_collections` (optional)

### Existing reuse
- `state_homepages` remains for mini-site content
- `media_items` already supports media hub basics
- `publication_items` already supports publication archive

### Fellowship locator structure
`fellowship_locations` fields:
- fellowship_centre_id
- address
- landmark
- meeting_days
- latitude
- longitude
- contact_phone
- contact_email
- directions_text
- is_public

## API Plan

## Auth and access control
- `POST /signup`
- `POST /login`
- `POST /login/mfa/challenge`
- `POST /login/mfa/verify`
- `POST /admin/users/:id/mfa/reset`
- `POST /delegated-access-codes`
- `GET /delegated-access-codes`
- `POST /delegated-access/activate`
- `POST /delegated-access/revoke`
- `GET /audit-logs`

## Biodata and lifecycle
- `GET /biodata/me`
- `POST /biodata`
- `PUT /biodata/:id`
- `GET /biodata`
- `GET /reports/spiritual-milestones`
- `GET /reports/student-lifecycle`
- `GET /reports/alumni`
- `GET /reports/nysc`

## Attendance and GCK
- `POST /attendance`
- `GET /attendance`
- `POST /gck`
- `GET /gck/summary`
- `POST /followups`
- `GET /followups`
- `PUT /followups/:id/assign`
- `PUT /followups/:id/status`

## STMC portal
- `GET /courses`
- `POST /courses`
- `GET /courses/:id`
- `POST /courses/:id/enroll`
- `GET /my-courses`
- `GET /assessments/:id`
- `POST /assessments/:id/submit`
- `GET /transcripts/me`
- `GET /certificates/me`

## Content / public tools
- `GET /public/testimonies`
- `POST /admin/testimonies`
- `GET /public/fellowship-locator`
- `POST /admin/fellowship-locations`
- `GET /public/media`
- `GET /public/audio-archives`
- `POST /giving/initialize`
- `POST /giving/webhook`
- `GET /giving/history/me`

## Page Map

### Member-facing
- `/signup`
- `/login`
- `/profile`
- `/biodata`
- `/my-growth` (spiritual milestones)
- `/alumni`
- `/nysc`
- `/giving`
- `/stmc`
- `/stmc/my-courses`
- `/stmc/my-transcript`
- `/media`
- `/testimonies`
- `/locator`

### Leadership/admin
- `/admin/users`
- `/admin/access-control`
- `/admin/delegated-access`
- `/admin/audit-logs`
- `/admin/reports/spiritual-growth`
- `/admin/reports/lifecycle`
- `/admin/reports/followup`
- `/admin/stmc/courses`
- `/admin/stmc/results`
- `/admin/testimonies`
- `/admin/fellowship-locations`
- `/admin/giving`

### Public
- `/states/:slug`
- `/states/:slug/events`
- `/states/:slug/media`
- `/states/:slug/publications`
- `/testimonies`
- `/locator`
- `/giving`
- `/media`
- `/audio`

## Jobs / Cron
1. **Alumni migration job**
   - Daily
   - Converts eligible students to alumni based on expected completion rules
   - Logs changes to `member_status_history`

2. **Delegated code expiry job**
   - Hourly
   - Expires unused or outdated access codes/sessions

3. **Follow-up reminder job**
   - Daily
   - Notifies coordinators about unassigned or overdue visitor/converts follow-up

4. **Certificate generation job**
   - On assessment completion or nightly batch
   - Issues transcript/certificate records for completed STMC learners

5. **Financial reconciliation job**
   - Periodic webhook reconciliation for giving payments

## Security Basics
- Keep CSRF protection for session-based requests
- Add MFA for all privileged/editorial users
- Add audit logs for:
  - role changes
  - delegated code creation/use/revocation
  - biodata edits by proxies
  - published content changes
  - financial status changes
- Rate-limit login, MFA, and delegated-code verification attempts
- Store access codes hashed, not plain text
- Use short expiry windows for delegated access codes
- Restrict delegated sessions to exact capabilities and scope
- Webhook signature verification required for giving providers
- Certificate/transcript downloads should require authorization tokens or member session validation

## Recommended Delivery Phases

### Phase 1, foundation and safest wins
1. Permission model cleanup
2. Default member signup enforcement
3. Delegated access codes
4. MFA for editors
5. Biodata schema expansion
6. Spiritual milestone reporting
7. Student/alumni/NYSC tracking

### Phase 2, operations and leadership reporting
1. GCK category upgrade
2. Visitor/convert capture
3. Follow-up workflow and assignment dashboard
4. Lifecycle and spiritual analytics dashboards
5. Testimony module
6. Fellowship locator

### Phase 3, platform growth
1. STMC LMS architecture
2. Online classes and library
3. Examination engine
4. Transcript/certificate generation
5. Giving portal
6. Expanded media/audio archive

## Implementation Notes Against Current Codebase
- The current API is centralized in `api/index.php`; before major expansion, split new modules into reusable include files or controller sections to reduce risk.
- Existing hardcoded role checks should be wrapped in capability helper functions first, even before a full role-permission UI is introduced.
- Existing biodata, GCK, STMC, and admin pages can be extended incrementally rather than rewritten.
- Existing `state_homepages`, `state_posts`, `media_items`, and `publication_items` should be reused for the state mini-site/public engagement layer.
- STMC should be treated as a separate bounded module after Phase 1 to avoid destabilizing core reporting features.

## Recommended Immediate Next Build Batch
1. Design DB migration set for access control + biodata lifecycle fields
2. Add capability helper layer in backend
3. Enforce `member` default signup role
4. Build delegated access code tables and activation endpoint
5. Add spiritual milestone fields to biodata form and reporting endpoints
6. Add alumni/NYSC fields and automated migration job design

## Definition of Done for planning phase
- Requested features mapped against current implementation
- Scope exclusions respected, including removal of naming standard enforcement
- Data model, API, page map, jobs, and security baseline documented
- Prioritized rollout sequence defined
