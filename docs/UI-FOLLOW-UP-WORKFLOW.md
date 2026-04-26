# UI SPEC — DLCF-SW-FOLLOW-UP-WORKFLOW

Project ID: `DLCF-SW-FOLLOW-UP-WORKFLOW`

## UI Goal

Add a practical follow-up workflow around existing attendance/GCK visitor and convert counts, without disrupting the current reporting flow.

The UI should help leaders and follow-up workers answer four questions quickly:
1. Who needs follow-up?
2. Who is responsible?
3. Has email or WhatsApp been sent?
4. What happened after contact?

## Existing UI Style

Follow the current DLCF-SW admin/portal style:
- Card-based sections
- Simple grid forms
- Existing `.card`, `.card-header`, `.grid`, `.form-actions`, `btn-outline`, and report table patterns where possible
- Avoid a radically new design system
- Keep the screens mobile-friendly for fellowship reps using phones

Primary files likely involved:
- `dlcf-sw/web/src/pages/PortalHome.jsx`
- `dlcf-sw/web/src/pages/GckPage.jsx`
- `dlcf-sw/web/src/pages/FollowupDashboardPage.jsx` (new)
- `dlcf-sw/web/src/pages/FollowupDetailPage.jsx` (new)
- `dlcf-sw/web/src/pages/FollowupTemplatesPage.jsx` (new)
- `dlcf-sw/web/src/pages/FollowupReportPage.jsx` (new)
- `dlcf-sw/web/src/App.jsx`

## Navigation / Page Map

### New routes
- `/followups` — Follow-up dashboard / task queue
- `/followups/:id` — Follow-up detail
- `/followups/templates` — Message template management
- `/reports/followups` — Follow-up reports

### Navigation labels
Use short labels:
- `Follow-up`
- `Follow-up Reports`
- `Message Templates`

### Access visibility
- Super Admin / Zonal / State / Region / AC: show dashboard, reports, assignments, templates where permitted.
- Follow-up worker: show assigned queue and detail pages only.
- Fellowship rep/delegated attendance user: show capture form, not global dashboard unless role permits.

## Screen 1 — Attendance Entry Follow-up Capture

Location: existing attendance entry/portal page under `Service Summary`.

### Section placement
Below current fields:
- Visitors
- Converts
- Tithe and Offering

Add collapsible card:
`Visitor / Convert Follow-up Details`

### Header content
Title: `Visitor / Convert Follow-up Details`
Helper text: `Add individual names and contacts for people who should receive follow-up by email or WhatsApp.`

### Actions
- `Add Visitor`
- `Add Convert`
- `Clear Details`

### Repeater fields per person
Each contact row/card should include:
- Full name — required
- Phone / WhatsApp number — optional but recommended
- Email — optional
- Gender — optional select
- Decision type — required select:
  - Visitor
  - Convert
  - First timer
  - Recommitment
- Category — optional select:
  - Student
  - Worker
  - Alumni
  - NYSC
  - Other
- Address / Hostel / Location — optional
- Notes — optional
- Consent to contact — checkbox, default checked

### Count warning
Show non-blocking warning when:
- Visitor count does not match number of `Visitor`/`First timer` rows
- Convert count does not match number of `Convert`/`Recommitment` rows

Warning text:
`The summary count and individual details do not match. You can still save, but please confirm the numbers.`

### Save behavior
- Saving attendance also saves follow-up contact rows.
- If attendance save succeeds but follow-up save partially fails, show a clear warning and list failed contacts.
- Empty follow-up rows should not be submitted.

### Empty state
When no rows:
`No individual follow-up details added yet. Use Add Visitor or Add Convert if you have names/contact details.`

## Screen 2 — GCK / Special Program Follow-up Capture

Location: GCK/reporting page below visitors/converts fields.

Use the same component pattern as Attendance Entry.

### Differences
Source type should be saved as:
- `gck` for GCK page
- future program source for congress/retreat/manual use

### Helper text
`Capture people who need follow-up after this program. They will appear in the Follow-up dashboard.`

## Screen 3 — Follow-up Dashboard

Route: `/followups`

### Purpose
A queue for leaders and workers to see follow-up work by status, assignment, and urgency.

### Top cards
Show compact metric cards:
- `New / Unassigned`
- `Assigned Pending`
- `Overdue`
- `Contacted This Week`
- `Converted to Member`

Each card shows count and can filter the table when clicked.

### Filters
Filter bar fields:
- Search: name, phone, email
- State
- Region
- Fellowship centre
- Source type
- Status
- Decision type
- Assigned worker
- Date range

### Table columns
- Name
- Decision
- Phone / WhatsApp
- Email
- Source
- Fellowship Centre
- Assigned To
- Status
- Due Date / Next Follow-up
- Last Contacted
- Actions

### Row actions
- `Open`
- `Assign`
- `Send WhatsApp`
- `Send Email`
- `Mark Contacted`

### Bulk actions
For leaders/admins:
- Assign selected
- Set due date
- Mark status

### Empty states
No records:
`No follow-up records found for this filter.`

No assignment:
`No one has been assigned yet. Assign a follow-up worker to begin contact.`

### Loading/error states
- Loading table skeleton or simple `Loading follow-up records...`
- Error: `Unable to load follow-up records. Please try again.`

## Screen 4 — Follow-up Detail Page

Route: `/followups/:id`

### Layout
Two-column desktop, single-column mobile.

Left column:
- Contact profile card
- Assignment/status card
- Message actions card

Right column:
- Notes timeline
- Message history

### Contact profile card
Fields shown:
- Full name
- Decision type
- Gender/category
- Phone / WhatsApp
- Email
- Address/location
- Fellowship centre
- State/region
- Source type and date
- Consent to contact

### Assignment/status card
Controls:
- Assigned worker select
- Status select:
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
- Priority select: Low / Normal / High
- Due date
- Next follow-up date/time
- Save button

### Message actions card
Tabs or sections:
- WhatsApp
- Email

#### WhatsApp section
- Template select
- Rendered message preview
- Button: `Send WhatsApp via Evolution API`
- Secondary fallback button shown only if API fails or config is missing: `Open WhatsApp Manually`

Success state:
`WhatsApp message sent and logged.`

Failure state:
`WhatsApp could not be sent through Evolution API. You can retry or open WhatsApp manually.`

Show technical error details only to admin users. Workers see user-friendly error.

#### Email section
- Template select
- Subject preview
- Body preview
- Button: `Send Email`

Success state:
`Email sent and logged.`

Failure state:
`Email could not be sent. Please check the email address or mail configuration.`

### Notes timeline
Input:
- Multiline note field
- Button: `Add Note`

Timeline entries show:
- Note type
- Author
- Date/time
- Content

Auto timeline events should include:
- Record created
- Assigned to worker
- Status changed
- WhatsApp sent/failed
- Email sent/failed
- Follow-up scheduled

## Screen 5 — Message Templates

Route: `/followups/templates`

### Purpose
Manage approved message templates for email and WhatsApp.

### Template list columns
- Name
- Channel
- Subject (email only)
- Active
- Updated
- Actions

### Template editor fields
- Channel: Email / WhatsApp
- Template name
- Subject (email only)
- Body
- Active toggle

### Variable helper
Show allowed variables beside editor:
- `{{name}}`
- `{{fellowship_centre}}`
- `{{state}}`
- `{{region}}`
- `{{worker_name}}`
- `{{contact_phone}}`

### Default templates
Create initial templates:

#### WhatsApp — First-time visitor follow-up
`Hello {{name}}, thank you for worshipping with DLCF {{fellowship_centre}}. We are glad you joined us. A follow-up worker will be happy to help you settle in. God bless you.`

#### WhatsApp — Convert follow-up
`Hello {{name}}, we rejoice with you for your decision for Christ. DLCF {{fellowship_centre}} would love to support your new walk with God. Can we reach you for a short follow-up?`

#### Email — First-time visitor follow-up
Subject: `Thank you for worshipping with DLCF`
Body includes greeting, fellowship centre, and contact encouragement.

#### Email — Convert follow-up
Subject: `We rejoice with you`
Body includes salvation encouragement and next-step invitation.

### Validation
- WhatsApp templates require body.
- Email templates require subject and body.
- Template body cannot be empty.

## Screen 6 — Follow-up Reports

Route: `/reports/followups`

### Filters
- Date range
- State
- Region
- Fellowship centre
- Source type
- Status
- Decision type
- Assigned worker

### Summary cards
- Total captured
- Contacted
- Pending
- Overdue
- Unreachable
- Joined fellowship
- Converted to member

### Report table columns
- Fellowship centre
- Visitors
- Converts
- First timers
- Recommitments
- Contacted
- Pending
- Overdue
- Converted to member

### Export
Button: `Export Follow-up Report`

Export should respect role scope and active filters.

## Evolution API Configuration UX

No Evolution API secret should be entered in the React frontend.

### Admin config status card
On template/admin page or follow-up dashboard, show backend-reported status only:
- `WhatsApp: Configured`
- `WhatsApp: Not configured`
- `WhatsApp: Last send failed`

Do not show:
- API key
- Instance token
- Full authorization header

### Send button behavior
If Evolution API is not configured:
- Disable primary send button
- Show: `WhatsApp sending is not configured yet. Please ask an admin to configure Evolution API on the backend.`
- Show fallback manual link only if user has permission and phone exists.

## Permission UX

### Leaders/admins
Can:
- View scoped dashboard
- Assign records
- Send messages
- Manage status
- View reports

### Follow-up workers
Can:
- View assigned records
- Send WhatsApp/email for assigned records
- Add notes
- Update status/outcome

### Fellowship reps/delegated users
Can:
- Add contacts from attendance/GCK capture
- Cannot browse global follow-up list unless assigned role allows it

## Mobile UX

Must work well on phone:
- Contact repeater rows should collapse into cards
- Dashboard table should become stacked cards or horizontally scroll safely
- Primary actions should be easy to tap:
  - Send WhatsApp
  - Send Email
  - Add Note
  - Update Status

## Acceptance Criteria

### Capture
- User can add individual visitor/convert records while submitting attendance.
- User can save attendance without individual records.
- Count mismatch warning appears but does not block save.

### Dashboard
- Scoped users only see permitted contacts.
- Dashboard filters by state/region/fellowship/status/assignment.
- Workers can see assigned queue.

### Messaging
- User can select WhatsApp template and send through Evolution API.
- WhatsApp sends are logged with status and provider response/message ID where available.
- User can select email template and send email.
- Email sends are logged with success/failure.
- Failed sends show clear retry/fallback options.

### Detail tracking
- User can assign a worker, update status, add notes, and schedule next follow-up.
- Message history and timeline are visible on the detail page.

### Reports
- Leaders can view follow-up summary by scope.
- Reports include pending, contacted, overdue, unreachable, and converted counts.

## Implementation Notes

- Reuse existing attendance page layout rather than redesigning the whole page.
- Keep the current aggregate visitors/converts fields intact.
- Store individual follow-up records separately and link to attendance/source record.
- Backend should render templates before sending messages.
- React receives only safe config status and message outcomes, never provider secrets.
