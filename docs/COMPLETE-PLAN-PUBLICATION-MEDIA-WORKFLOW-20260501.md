# Complete Plan — DLCF-SW Publication & Media Posting Workflow

Date: 2026-05-01
Project ID: DLCF-SW-CONTENT-STANDARDIZATION

## 1. Objective

Build a standard content-management workflow for DLCF-SW publications and media so that content can be created, edited, reviewed, approved, published to the website, scheduled, archived, restored, and searched properly.

The system must support:

- Zonal/South-West-wide media and publications.
- State-level media and publications.
- Clear state and zonal access control.
- Work-unit-based content contribution.
- Admin/coordinator authority for publishing.
- Public website display for only approved/published content.

## 2. Final Authority Model

### Main role controls scope and publishing authority

These roles have built-in content authority. They do not need any work unit to create, edit, review, approve, publish, schedule, archive, or restore media/publications.

#### Administrator
- Full authority everywhere.
- Can manage zonal and all state content.
- Can override, restore, archive, publish, schedule, and manage settings.

#### Zonal Admin
- Full authority over zonal content and all state content.
- Can create, edit, review, approve, publish, schedule, archive, and restore.

#### Zonal Coordinator
- Same content authority as Zonal Admin.
- Full zonal and all-state authority.

#### State Admin
- Full content authority within assigned state only.
- Can create, edit, review, approve, publish, schedule, archive, and restore state-scoped media/publications.
- Cannot publish zonal-wide content.
- Cannot manage another state’s content.

#### State Coordinator
- Same content authority as State Admin within assigned state.
- Full state-scoped media/publication authority.

## 3. Work Unit Model

Work units are for specialist content team activity, not for the core admin/coordinator authority.

Use the existing work units:

### Media Editorial Officer
- Can edit/review media within assigned scope.
- Can request changes.
- Can mark media ready for approval/publishing.
- Should not publish unless the user’s main role gives publishing authority.

### Production Team
- Can create/submit media.
- Can upload media files, thumbnails, speaker, series, tags, and event date.
- Should not publish unless the user’s main role gives publishing authority.

### Publication Editorial Officer
- Can edit/review publications within assigned scope.
- Can request changes.
- Can mark publications ready for approval/publishing.
- Should not publish unless the user’s main role gives publishing authority.

### Media Team
- Can create/submit media.
- Can upload audio/video/external links and metadata.
- Should not publish unless the user’s main role gives publishing authority.

## 4. Scope Rules

### Zonal scope
Users with these roles can act across zonal and all state content:

- Administrator
- Zonal Admin
- Zonal Coordinator

### State scope
Users with these roles can act only within their assigned state:

- State Admin
- State Coordinator

### Work-unit users
Work-unit users inherit the scope of their main role/profile assignment:

- If assigned to a state, they only work within that state.
- If assigned to a region, they only work within that region/state if allowed.
- If not assigned to a state/scope, they should fail closed and not access content admin.

## 5. Content Workflow

### Stage 1 — Draft
- Content is created but not visible publicly.
- Creator can continue editing.
- State/zonal authority can also create drafts directly.

### Stage 2 — Submitted
- Contributor submits content for editorial review.
- Content appears in the Submitted queue.

### Stage 3 — Edit/Review
Editor/reviewer checks:

- Title
- Description/excerpt
- Content body
- PDF/media file
- Cover image/thumbnail
- Speaker/author
- Series/category
- Tags
- Scope/state
- SEO title/description
- Formatting and quality
- Doctrinal/organizational suitability

Possible actions:

- Edit content directly.
- Request changes.
- Reject content.
- Mark ready for approval/publishing.

### Stage 4 — Approved / Ready to Publish
- Content has passed editorial check.
- A user with publishing authority can publish or schedule it.

### Stage 5 — Published
- Content is live on the public website.
- Public pages display it.
- It can be searched, viewed, downloaded/played if allowed.

### Stage 6 — Scheduled
- Content is approved and scheduled for future publishing.
- It becomes public when scheduled time arrives.

### Stage 7 — Archived
- Content is hidden from public pages.
- Content remains recoverable.
- Normal users should not hard-delete records.

## 6. Workflow Statuses

Use these statuses:

- `draft`
- `submitted`
- `changes_requested`
- `approved`
- `scheduled`
- `published`
- `archived`
- `rejected`

## 7. Publication Features

Each publication should support:

- Title
- Slug URL
- Description/excerpt
- Rich article content
- Publication type/category
- PDF/file URL or upload
- Cover image
- Author name
- Publish date
- Scheduled date/time
- Tags
- Scope: zonal/state
- State, when state-scoped
- Visibility: public/members/leaders/private
- SEO title
- SEO description
- Featured/pinned option
- Download allowed toggle
- View/download counters
- Revision history
- Audit trail

## 8. Media Features

Each media item should support:

- Title
- Slug URL
- Description/excerpt
- Media type: audio/video/image/external
- Source type: upload/YouTube/Vimeo/Facebook/external
- Source URL/upload
- Embed URL
- Thumbnail image
- Speaker
- Series
- Event date
- Duration
- Tags/category
- Scope: zonal/state
- State, when state-scoped
- Visibility: public/members/leaders/private
- SEO title
- SEO description
- Featured/pinned option
- Download allowed toggle
- View/play/download counters
- Revision history
- Audit trail

## 9. Admin Dashboard Plan

### Main tabs

- Drafts
- Submitted
- Changes Requested
- Approved
- Scheduled
- Published
- Archived
- Rejected

### Filters

- Search keyword
- State
- Scope: zonal/state
- Status
- Type/category
- Speaker/author
- Series
- Date range
- Featured

### Admin actions

Based on permission/scope, show actions:

- Create
- Edit
- Submit
- Request changes
- Approve/mark ready
- Publish
- Schedule
- Archive
- Restore
- Preview

## 10. Publishing Checklist

Before publishing, require:

### Publications
- Title
- Description/excerpt
- Publication type/category
- Cover image
- Content body or PDF/file
- Scope/state
- SEO title/description
- Publish date or schedule date

### Media
- Title
- Description/excerpt
- Media type
- Source URL/upload
- Thumbnail for video/external media
- Speaker or source attribution where applicable
- Scope/state
- Event date
- SEO title/description

If required fields are missing, the system should prevent publishing and show the missing checklist.

## 11. Public Website Plan

### Zonal Publications page
- Searchable publication library.
- Featured publications.
- Latest releases.
- Category/type filters.
- PDF/article badges.
- Download/read buttons.
- Pagination.

### State Publications page
- Same quality as zonal page.
- State-specific resources first.
- Optional zonal resources section.
- State branding and breadcrumbs.

### Zonal Media page
- Search/filter by type, speaker, series, category, date.
- Featured media.
- Audio/video cards.
- YouTube/external embeds.
- Related media.

### State Media page
- Same standard as zonal media.
- State-specific media first.
- Embedded player support.
- Related state media.
- Share buttons.

## 12. Security Rules

- Public pages only show `published` content.
- State pages must not show another state’s private/state-scoped content.
- State Admin/Coordinator can only manage assigned state.
- Zonal Admin/Coordinator can manage zonal and all state content.
- Work-unit users cannot publish unless their main role gives publishing authority.
- Detail endpoints must validate scope/state.
- Delete should become archive/soft-delete.
- Audit logs must record who submitted, edited, approved, published, archived, or restored.

## 13. API Plan

### Public endpoints
Upgrade:

- `GET /media-items`
- `GET /media-items/{idOrSlug}`
- `GET /publication-items`
- `GET /publication-items/{idOrSlug}`

Add support for:

- `q`
- `state`
- `scope`
- `status` public only published
- `type`
- `category`
- `tag`
- `speaker`
- `series`
- `featured`
- `from`
- `to`
- `page`
- `limit`

Return pagination data.

### Admin endpoints
Upgrade:

- `GET /admin/media-items`
- `POST /admin/media-items`
- `PUT /admin/media-items/{id}`
- `POST /admin/media-items/{id}/submit`
- `POST /admin/media-items/{id}/request-changes`
- `POST /admin/media-items/{id}/approve`
- `POST /admin/media-items/{id}/publish`
- `POST /admin/media-items/{id}/schedule`
- `POST /admin/media-items/{id}/archive`
- `POST /admin/media-items/{id}/restore`

Same for publication items.

## 14. Upload Plan

Split uploads by type:

- Images → `/uploads/images`
- PDFs/publications → `/uploads/publications`
- Audio → `/uploads/audio`
- Video → `/uploads/video`

Validate:

- MIME type
- file extension
- file size
- upload category

Store metadata:

- original filename
- stored filename
- MIME type
- file size
- uploaded by
- upload date
- content item relation if attached

## 15. Database Plan

Add fields to media/publication tables:

- `slug`
- `excerpt`
- `workflow_status`
- `visibility`
- `scheduled_at`
- `archived_at`
- `deleted_at`
- `submitted_by`
- `submitted_at`
- `reviewed_by`
- `reviewed_at`
- `approved_by`
- `approved_at`
- `published_by`
- `is_featured`
- `featured_order`
- `pinned_until`
- `seo_title`
- `seo_description`
- counters: `view_count`, `download_count`, `play_count` where applicable

Add new tables later:

- `content_audit_logs`
- `content_revisions`
- `content_assets`
- `content_categories`
- `content_tags`
- `content_series`
- `content_people`
- `content_relationships`

## 16. Recommended Build Phases

### Phase 1 — Core standardization
- Add workflow status columns.
- Add slug support.
- Add state/scope validation to detail endpoints.
- Add archive/restore instead of delete.
- Add backend search/filter/pagination.
- Add publish checklist validation.
- Add admin status tabs.
- Add role/work-unit permission enforcement.

### Phase 2 — Workflow actions and audit
- Add submit/request changes/approve/publish/schedule/archive/restore endpoints.
- Add audit logs.
- Add revision history.
- Add preview before publishing.

### Phase 3 — Public library upgrade
- Upgrade zonal/state publication pages.
- Upgrade zonal/state media pages.
- Add related content.
- Add SEO/Open Graph metadata.
- Add view/play/download counters.

### Phase 4 — Taxonomy and advanced media
- Add categories/tags/series/speaker tables.
- Add photo/album decision.
- Add video/audio processing strategy if self-hosting.
- Add analytics dashboard.

## 17. Definition of Done for MVP

The MVP is done when:

- State Admin/Coordinator can manage all media/publication activity within assigned state.
- Zonal Admin/Coordinator can manage zonal and all state content.
- Work-unit users can contribute/edit/review based on assigned unit.
- Public pages only show published content.
- Detail pages cannot leak another state’s content.
- Content can move through draft → submitted → approved → published/archived.
- Publishing requires mandatory metadata.
- Delete is replaced with archive/restore.
- Search/filter/pagination works.
- Deployment package is generated and verified.

## 18. Approval Gate

To proceed with implementation, approve with:

`APPROVE PLAN DLCF-SW-CONTENT-STANDARDIZATION`
