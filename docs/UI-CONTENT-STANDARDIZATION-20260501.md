# UI Spec — DLCF-SW Publication & Media Workflow

Date: 2026-05-01
Project ID: DLCF-SW-CONTENT-STANDARDIZATION
Gate: UI

## 1. UI Goal

Upgrade the existing **Admin → Media** and **Admin → Publications** screens into a standard CMS workflow interface while preserving the current DLCF admin look and navigation style.

The UI should make it clear:

- who can create content,
- who can edit/review,
- who can publish,
- what state/scope the content belongs to,
- what workflow status the content is in,
- what is missing before publishing.

## 2. Existing layout to preserve

Keep the current admin dashboard shell:

- Left/main admin tabs already shown in `AdminPage.jsx`.
- Existing card style, form-card style, table-container style, compact-form style.
- Continue using separate admin tabs:
  - **Media**
  - **Publications**

Do not redesign the whole admin dashboard. This is a functional CMS workflow upgrade inside the current UI.

## 3. Admin Media screen

### 3.1 Top header

Title: **Media Library**

Subtitle/description:
> Manage audio, video, and external media through draft, review, approval, and publishing.

Header actions:
- `+ Add Media` button
- `Refresh` button

### 3.2 Workflow summary cards

Show small count cards across the top:

- Drafts
- Submitted
- Changes Requested
- Approved
- Scheduled
- Published
- Archived
- Rejected

Each card shows:
- status label
- count
- click to filter by that status

### 3.3 Status tabs

Below summary cards, show tab buttons:

- All
- Drafts
- Submitted
- Changes Requested
- Approved
- Scheduled
- Published
- Archived
- Rejected

Selected tab updates the table filter.

### 3.4 Filters row

Filters:

- Search input: title, speaker, series, tags
- State dropdown
- Scope dropdown: All, Zonal, State
- Media type dropdown: All, Audio, Video, Image/Photo, External
- Date range: From / To
- Featured dropdown: All, Featured only

State dropdown behavior:
- Administrator/zonal users: can select all states.
- State admin/coordinator: locked to their assigned state.
- Work-unit state users: locked to their assigned state.
- No state assignment: show empty locked dropdown and warning.

### 3.5 Media table

Columns:

- Title
- Type
- Speaker
- Series
- Scope/State
- Workflow status
- Public status
- Event date
- Updated at
- Actions

Status badges:

- Draft — gray
- Submitted — blue
- Changes Requested — orange
- Approved — purple/green
- Scheduled — indigo
- Published — green
- Archived — dark/gray
- Rejected — red

Public status:
- Live
- Hidden
- Scheduled

### 3.6 Media actions by status

Available actions depend on role/scope.

Common actions:
- View/Preview
- Edit
- Duplicate optional later

Contributor actions:
- Save Draft
- Submit for Review

Editor/reviewer actions:
- Edit
- Request Changes
- Mark Approved / Ready to Publish
- Reject

Publisher/admin/coordinator actions:
- Publish
- Schedule
- Archive
- Restore
- Unpublish to Draft/Archived

No hard delete in normal UI.

### 3.7 Add/Edit Media form

Display as existing card form or modal-style card.

Sections:

#### Basic information
- Title required
- Slug auto-generated, editable by advanced users
- Description/excerpt required for publishing
- Media type: audio, video, image/photo, external
- Source type: Upload, YouTube, Vimeo, Facebook, External URL

#### Media source
- Source URL
- Upload file
- Embed URL auto-derived where possible
- Download allowed toggle
- Duration seconds

#### People/category
- Speaker
- Series
- Tags
- Category/type field initially text or select later

#### Thumbnail/visual
- Thumbnail URL
- Upload thumbnail
- Preview thumbnail

#### Scope and visibility
- Scope: Zonal / State
- State dropdown
- Visibility: Public, Members, Leaders, Private
- Featured toggle
- Pinned until date

#### Dates
- Event date
- Publish date
- Schedule date/time

#### SEO
- SEO title
- SEO description

#### Workflow
- Current workflow status badge
- Review notes / change request notes
- Submit/review/publish action buttons

### 3.8 Publish checklist panel

Show a side or bottom checklist before publish:

Required for media:

- title
- description/excerpt
- media type
- source URL/upload
- thumbnail for video/external media
- scope/state
- event date
- SEO title/description

If missing, show red checklist item and disable Publish button.

## 4. Admin Publications screen

### 4.1 Top header

Title: **Publications Library**

Subtitle/description:
> Manage articles, PDFs, outlines, manuals, and study resources through review and publishing.

Header actions:
- `+ Add Publication`
- `Refresh`

### 4.2 Workflow summary cards

Same statuses as media:

- Drafts
- Submitted
- Changes Requested
- Approved
- Scheduled
- Published
- Archived
- Rejected

### 4.3 Status tabs

- All
- Drafts
- Submitted
- Changes Requested
- Approved
- Scheduled
- Published
- Archived
- Rejected

### 4.4 Filters row

Filters:

- Search input: title, description, tags, author
- State dropdown
- Scope dropdown: All, Zonal, State
- Publication type/category
- Date range
- Featured dropdown

### 4.5 Publications table

Columns:

- Title
- Type
- Author
- Scope/State
- Workflow status
- Public status
- Publish date
- Updated at
- Actions

### 4.6 Add/Edit Publication form

Sections:

#### Basic information
- Title required
- Slug auto-generated, editable by advanced users
- Description/excerpt required for publishing
- Publication type/category required
- Author name
- Language optional

#### Content
- Rich article content using existing RichTextEditor
- PDF/file URL
- Upload PDF
- File size display when available
- Allow download toggle

#### Cover and metadata
- Cover image URL
- Upload cover image
- Preview cover image
- Tags

#### Scope and visibility
- Scope: Zonal / State
- State dropdown
- Visibility: Public, Members, Leaders, Private
- Featured toggle
- Pinned until date

#### Dates
- Publish date
- Schedule date/time

#### SEO
- SEO title
- SEO description

#### Workflow
- Current status badge
- Review/change notes
- Workflow buttons

### 4.7 Publish checklist panel

Required for publications:

- title
- description/excerpt
- publication type/category
- cover image
- content body or PDF/file
- scope/state
- SEO title/description
- publish date or schedule date

If missing, show red checklist item and disable Publish/Schedule.

## 5. Workflow action UI

### Buttons

Use clear action buttons:

- Save Draft
- Submit for Review
- Request Changes
- Mark Approved
- Publish Now
- Schedule
- Archive
- Restore
- Reject

### Confirmation modals

Require confirmation for:

- Publish Now
- Archive
- Restore
- Reject

The confirmation should show:

- content title
- target state/scope
- action being taken

### Review/change notes

For Request Changes and Reject, require a note.

Fields:
- note textarea
- save action

## 6. Access UI behavior

### Administrator
- Sees all content and states.
- Can run all actions.

### Zonal Admin / Zonal Coordinator
- Sees zonal and all state content.
- Can run all content actions.

### State Admin / State Coordinator
- Sees own state content only.
- Scope defaults to State.
- State field locked to assigned state.
- Can run all actions within assigned state.
- Cannot create zonal content.

### Media Editorial Officer
- Sees media within assigned scope.
- Can edit/review/request changes/mark approved.
- Cannot publish unless also admin/coordinator authority.

### Production Team / Media Team
- Can create and submit media.
- Cannot publish unless also admin/coordinator authority.

### Publication Editorial Officer
- Sees publications within assigned scope.
- Can edit/review/request changes/mark approved.
- Cannot publish unless also admin/coordinator authority.

## 7. Public pages UI upgrades

### Zonal media page

Add/ensure:

- Search bar
- Type filter
- Speaker/series filter
- Featured media section
- Latest media grid
- Pagination
- Audio/video/embed card labels

### State media page

Match zonal standard:

- State title/hero
- Search/filter
- State media first
- Related content on details
- Embedded player support

### Zonal publications page

Add/ensure:

- Search bar
- Category/type chips
- Featured publications
- Latest resources
- PDF/article badges
- Pagination

### State publications page

Match zonal standard:

- State title/hero
- Search/filter
- State resources first
- Optional zonal resources section
- Read/download buttons

## 8. Empty/loading/error states

### Empty states

- No drafts yet.
- No submitted content waiting for review.
- No published content yet.
- No archived content.

Each empty state should include a helpful action if permitted:

- Add Media
- Add Publication
- Clear Filters

### Loading states

- Show loading text or skeleton inside table.

### Error states

- Show status message using existing admin status area.
- Keep form data when save fails.

## 9. MVP UI scope

For first implementation, keep UI practical:

- Existing card/table style.
- Add workflow tabs/counts.
- Expand forms with new fields.
- Add checklist panel.
- Add workflow action buttons.
- Add archive/restore replacing delete.
- Add search/filter inputs.

Do not build a new visual theme yet.

## 10. Approval Gate

Approve this UI direction with:

`APPROVE UI DLCF-SW-CONTENT-STANDARDIZATION`
