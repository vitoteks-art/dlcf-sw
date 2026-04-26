# PLAN — DLCF-SW Follow-up Workflow

Project ID: `DLCF-SW-FOLLOW-UP-WORKFLOW`

## Scope / Non-goals

### In scope
- Build a structured visitor/convert follow-up workflow for DLCF-SW.
- Capture individual visitor/convert contact details, not only aggregate counts.
- Support follow-up through:
  - Email messages
  - WhatsApp messages
- Assign follow-up responsibility by state, region, fellowship centre, and worker.
- Track follow-up status, attempts, outcomes, notes, and conversion progress.
- Add reports for pending follow-ups, completed follow-ups, unreachable contacts, and converted members.
- Keep the workflow compatible with existing attendance entry visitors/converts counts.

### Non-goals for this phase
- Full bulk SMS integration.
- Native mobile app.
- Replacing the current PHP + React stack.
- Using unsupported WhatsApp automation paths outside Evolution API.
- Complex CRM automation beyond basic templates, reminders, status tracking, and audit logs.

## Users & Roles

### Primary users
- Super Admin / Zonal Admin
- State Coordinator / State Admin
- Region Coordinator / Region Rep
- Associate Coordinator
- Fellowship Rep / delegated attendance submitter
- Follow-up Worker / Counselor

### Access rules
- Leaders can view follow-up records within their assigned scope.
- Fellowship reps can create records for their assigned fellowship centre only.
- Follow-up workers can view/update records assigned to them.
- Super Admin can view all records, templates, assignments, and message logs.
- Contact details must be protected; no global export for non-admin roles.

## User Flows

### 1. Capture visitors/converts from attendance
1. Fellowship rep opens attendance entry.
2. Existing visitors/converts count fields remain.
3. New optional section: `Add visitor/convert details`.
4. User enters name, phone, email, gender, category, decision type, source service/date, and optional notes.
5. System creates follow-up records tied to the attendance entry and fellowship centre.
6. If the entered individual count does not match aggregate count, system warns but does not block; leaders can reconcile later.

### 2. Capture from GCK or special program
1. GCK/reporting form includes `Visitors / Converts follow-up details`.
2. Records are tagged with source type: `gck`, `attendance`, `retreat`, `state_congress`, `zonal_congress`, or `manual`.
3. Follow-up assignment follows state/region/fellowship centre scope.

### 3. Assign follow-up worker
1. Admin/AC views unassigned records.
2. Select one or more records.
3. Assign to follow-up worker.
4. Worker sees assigned queue with due dates.

### 4. Send WhatsApp follow-up via Evolution API
MVP approach:
1. Worker opens a follow-up record.
2. System shows approved WhatsApp template.
3. Worker clicks `Send WhatsApp`.
4. Backend renders the template and sends the message through Evolution API.
5. System stores Evolution API response/provider message ID in message logs.
6. If Evolution API fails, system records the failure and can expose a fallback `Open WhatsApp` click-to-chat link for manual retry.

Evolution API requirements:
- Configure base URL, instance name/key, and API key/server token through backend environment/config.
- Normalize phone numbers to international format before sending.
- Log outbound request result without exposing secrets to the frontend.
- Optional later webhook endpoint can update delivery/read statuses if Evolution API events are enabled.

### 5. Send email follow-up
MVP approach:
1. Worker opens a follow-up record.
2. System shows approved email template.
3. Worker clicks `Send Email`.
4. Backend sends email using configured mail transport.
5. System logs success/failure.

Recommended implementation:
- Abstract email sending behind a small `notification_service` helper.
- Use PHP `mail()` only as fallback.
- Support SMTP config when available: host, port, username, password, sender name/email.

### 6. Track outcome
Worker updates follow-up status:
- New
- Assigned
- Contacted
- No response
- Unreachable
- Interested
- Needs visit
- Joined fellowship
- Converted to member
- Closed

Worker can add notes and schedule next follow-up date.

### 7. Reports
Leaders can filter by:
- Date range
- State
- Region
- Fellowship centre
- Source type
- Follow-up status
- Assigned worker
- Decision type: visitor / convert / first timer / recommitment

Reports show:
- Total captured
- Assigned vs unassigned
- Contacted count
- Pending count
- Converted-to-member count
- Average time to first contact
- Overdue follow-ups

## Data Model

### New table: `followup_contacts`
Stores visitor/convert identity and source context.

Columns:
- `id` bigint unsigned primary key
- `source_type` enum/string: `attendance`, `gck`, `retreat`, `state_congress`, `zonal_congress`, `manual`
- `source_id` bigint unsigned nullable
- `attendance_entry_id` bigint unsigned nullable
- `fellowship_centre_id` bigint unsigned nullable
- `state` varchar(120) nullable
- `region` varchar(120) nullable
- `full_name` varchar(190) not null
- `gender` varchar(30) nullable
- `phone` varchar(50) nullable
- `email` varchar(190) nullable
- `decision_type` varchar(60) not null default `visitor`
- `category` varchar(80) nullable
- `address` text nullable
- `notes` text nullable
- `consent_to_contact` tinyint(1) default 1
- `created_by` bigint unsigned nullable
- `created_at` datetime not null
- `updated_at` datetime not null

Indexes:
- `idx_followup_contacts_scope (state, region, fellowship_centre_id)`
- `idx_followup_contacts_source (source_type, source_id)`
- `idx_followup_contacts_phone (phone)`
- `idx_followup_contacts_email (email)`

### New table: `followup_tasks`
Tracks assignment, status, due dates, and lifecycle.

Columns:
- `id` bigint unsigned primary key
- `contact_id` bigint unsigned not null
- `assigned_to_user_id` bigint unsigned nullable
- `assigned_by_user_id` bigint unsigned nullable
- `status` varchar(60) not null default `new`
- `priority` varchar(30) default `normal`
- `due_date` date nullable
- `next_followup_at` datetime nullable
- `last_contacted_at` datetime nullable
- `closed_at` datetime nullable
- `created_at` datetime not null
- `updated_at` datetime not null

Indexes:
- `idx_followup_tasks_contact (contact_id)`
- `idx_followup_tasks_assigned_to (assigned_to_user_id)`
- `idx_followup_tasks_status_due (status, due_date)`

### New table: `followup_notes`
Stores notes and timeline entries.

Columns:
- `id` bigint unsigned primary key
- `task_id` bigint unsigned not null
- `user_id` bigint unsigned nullable
- `note_type` varchar(50) default `note`
- `content` text not null
- `created_at` datetime not null

### New table: `message_templates`
Stores approved WhatsApp/email templates.

Columns:
- `id` bigint unsigned primary key
- `channel` varchar(30) not null: `email` or `whatsapp`
- `name` varchar(120) not null
- `subject` varchar(190) nullable
- `body` text not null
- `is_active` tinyint(1) default 1
- `created_by` bigint unsigned nullable
- `created_at` datetime not null
- `updated_at` datetime not null

Template variables:
- `{{name}}`
- `{{fellowship_centre}}`
- `{{state}}`
- `{{region}}`
- `{{worker_name}}`
- `{{contact_phone}}`

### New table: `followup_message_logs`
Stores message attempts and delivery state.

Columns:
- `id` bigint unsigned primary key
- `task_id` bigint unsigned not null
- `contact_id` bigint unsigned not null
- `template_id` bigint unsigned nullable
- `channel` varchar(30) not null: `email` or `whatsapp`
- `recipient` varchar(190) not null
- `subject` varchar(190) nullable
- `body_snapshot` text not null
- `send_mode` varchar(30) not null default `manual`
- `provider_message_id` varchar(190) nullable
- `status` varchar(50) not null default `queued`
- `error_message` text nullable
- `sent_by_user_id` bigint unsigned nullable
- `sent_at` datetime nullable
- `created_at` datetime not null

### Existing table changes

#### `attendance_entries`
No breaking change required.
- Keep existing aggregate `visitors` and `converts` columns.
- Link individual contacts through `followup_contacts.attendance_entry_id`.

#### `users`
No breaking change required.
- Follow-up assignment uses existing user IDs.
- Optional future capability: `manage_followup`.

## API Endpoints

### Follow-up contacts
- `GET /followups/contacts`
  - Filters: state, region, fellowship_centre_id, source_type, status, assigned_to, date range, search.
- `POST /followups/contacts`
  - Creates one contact and its initial task.
- `POST /followups/contacts/bulk`
  - Creates multiple contacts from attendance/GCK form.
- `GET /followups/contacts/{id}`
  - Returns contact, task, notes, and message logs.
- `PUT /followups/contacts/{id}`
  - Updates contact details.

### Follow-up tasks
- `GET /followups/tasks`
- `PUT /followups/tasks/{id}/assign`
- `PUT /followups/tasks/{id}/status`
- `PUT /followups/tasks/{id}/schedule`
- `POST /followups/tasks/{id}/notes`

### Messaging
- `GET /followups/templates`
- `POST /followups/templates`
- `PUT /followups/templates/{id}`
- `POST /followups/tasks/{id}/email`
  - Sends email and logs result.
- `POST /followups/tasks/{id}/whatsapp`
  - Sends WhatsApp message through Evolution API and logs result.
- `POST /followups/tasks/{id}/whatsapp-log`
  - Optional fallback: logs manual WhatsApp attempt after click-to-chat.
- `GET /followups/tasks/{id}/whatsapp-link?template_id=...`
  - Optional fallback: returns generated `wa.me` link and rendered message.

### Reports
- `GET /followups/summary`
- `GET /followups/overdue`
- `GET /followups/export`
  - Admin-only or scoped export.

## Pages

### 1. Attendance entry page update
- Add collapsible section: `Visitor / Convert details`.
- Repeater fields for individual contacts.
- Quick buttons:
  - `Add Visitor`
  - `Add Convert`
- Warning if details count differs from aggregate count.

### 2. Follow-up Dashboard
Route: `/followups`

Cards:
- New/unassigned
- Assigned pending
- Contacted this week
- Overdue
- Converted to member

Table:
- Name
- Phone/email
- Source
- Fellowship centre
- Assigned worker
- Status
- Due date
- Last contacted
- Actions

### 3. Follow-up Detail Page
Route: `/followups/:id`

Sections:
- Contact info
- Assignment/status controls
- WhatsApp action
- Email action
- Notes timeline
- Message history

### 4. Template Management
Route: `/followups/templates`

Admin-only page for email and WhatsApp templates.

### 5. Follow-up Reports
Route: `/reports/followups`

Filterable reporting page with totals and export.

## Jobs / Cron

### Daily overdue marker/reminder job
Script: `api/jobs/followup_reminders.php`

Responsibilities:
- Find tasks due today or overdue.
- Optionally notify assigned workers by email.
- Mark tasks as overdue in dashboard queries.
- Log run summary.

Recommended cron:
```bash
/usr/local/bin/php /home/dlcfsw/api.dlcfsw.org.ng/jobs/followup_reminders.php >> /home/dlcfsw/logs/followup_reminders.log 2>&1
```

Frequency:
- Daily at 7:00 AM.

### Evolution API delivery webhook
If Evolution API events/webhooks are enabled:
- Add endpoint for message status callbacks.
- Update `followup_message_logs.status` from Evolution API delivery/read/failure events.

## Security

- Validate phone and email before sending/logging messages.
- Sanitize message body and template variables.
- Enforce scope on every follow-up list/detail/report endpoint.
- Do not expose contacts outside user’s assigned state/region/fellowship centre.
- Audit assignment, status changes, and message sends.
- Avoid storing sensitive pastoral counseling details in public exports.
- Rate-limit message endpoints to prevent accidental spam.
- Keep Evolution API credentials server-side only; never expose instance token/API key to React.
- Require CSRF/session auth for all write actions.

## Observability

- Add message log records for every email/WhatsApp attempt, including Evolution API response IDs where available.
- Add job log summary for daily reminders.
- Store send failures with error messages.
- Dashboard should expose failed email count to admins.

## Milestones

### PLAN gate
- Confirm workflow, messaging approach, data model, and MVP boundaries.

### UI gate
- Create UI spec for attendance capture, follow-up dashboard, detail page, templates, and reports.

### Build batch 1 — Database/API foundation
- Add migration tables.
- Add scoped follow-up contact/task APIs.
- Add notes/status/assignment APIs.

### Build batch 2 — UI workflow
- Update attendance page to capture individual contacts.
- Add follow-up dashboard and detail page.
- Add assignment/status/notes controls.

### Build batch 3 — Messaging
- Add template management.
- Add email send/logging.
- Add Evolution API WhatsApp send/logging.
- Add optional WhatsApp click-to-chat fallback and manual log confirmation.

### Build batch 4 — Reports/jobs/QA
- Add follow-up reports.
- Add daily reminders cron script.
- Add smoke tests and deploy documentation.

## Open Decisions Before Implementation

1. What Evolution API base URL, instance name/key, and auth token format will production use?
2. Should follow-up workers be existing users only, or should there be a lightweight `follow-up worker` role/capability added?
3. Should email use current PHP `mail()` first, or should we configure SMTP as part of this project?

## Recommended MVP Decision

Proceed with:
- WhatsApp sending through Evolution API, with click-to-chat fallback only if API send fails.
- Email via a notification helper using current mail support first, with SMTP-ready configuration.
- Existing users as assignable workers, scoped by role and fellowship centre.

This delivers a real automated WhatsApp workflow while keeping credentials server-side and preserving a manual fallback for delivery issues.
