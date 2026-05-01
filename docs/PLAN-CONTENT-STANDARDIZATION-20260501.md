# DLCF-SW Content Standardization Plan — Media, Publications & Gallery

Date: 2026-05-01
Owner: Atlas
Project ID: DLCF-SW-CONTENT-STANDARDIZATION

## Goal
Bring DLCF-SW media and publications up to a professional CMS/digital-library standard so content can be created, reviewed, approved, published, searched, archived, and safely displayed across zonal and state pages.

## Current audit summary

### Publications currently have
- Admin create/edit/delete.
- Draft/published status only.
- Zonal/state scope and state filter.
- Publication type, description, rich HTML content, PDF URL/upload, cover image URL/upload, publish date, tags.
- Public zonal list/detail and state list/detail pages.

### Media currently have
- Admin create/edit/delete.
- Draft/published status only.
- Zonal/state scope and state filter.
- Audio/video only in admin form.
- Source URL/upload, thumbnail upload, speaker, series, duration, event date, tags.
- Public zonal/state list/detail pages.

### Gallery currently has
- Separate state-gallery flow, not unified with media.
- Zonal media page has photo/image expectations, but admin media only supports audio/video.

## Key problems to fix

1. **Editorial workflow is too weak**
   - Only draft/published exists.
   - No submit → review → approve → schedule → publish → archive flow.
   - No rejection notes, revision history, or approval record.

2. **Publishing permissions need clearer separation**
   - Content creators should be able to draft/submit.
   - Approvers/publishers should approve/publish.
   - State users should remain locked to their state.
   - Zonal users should manage zonal and oversee state content.

3. **Delete is destructive**
   - Media/publications currently hard-delete records.
   - Standard should use archive/soft-delete and restore.

4. **Metadata is not standardized**
   - Tags, speaker, series, publication type are free text.
   - This will create duplicates and bad filters.

5. **Search and filtering are shallow**
   - Lists are not ready for large libraries.
   - Need backend search, filters, and pagination.

6. **Uploads need stronger handling**
   - One generic upload endpoint.
   - File naming uses image-style prefix even for PDFs/audio/video.
   - No visible max-size/category validation, metadata, or orphan cleanup.

7. **Public detail pages need stronger standards**
   - Need slug URLs, SEO metadata, related content, share buttons, and tracking.

8. **Media model is inconsistent**
   - Admin supports audio/video only.
   - Public media expects photos too.
   - State gallery is separate, so photo/media experience is fragmented.

## Target standard

A small CMS + digital library:

- State teams create/submit their own media/publications.
- State approvers approve/publish state content.
- Zonal approvers approve/publish zonal content and optionally feature state content.
- All published content has required metadata, slug, SEO, cover/thumbnail, visibility, and audit history.
- Public users can search, filter, share, download/view/play, and find related resources.
- Admins can manage large libraries without losing files or publishing unreviewed content.

## Proposed workflow statuses

Use one workflow field for both media and publications:

- `draft` — editable, not submitted.
- `submitted` — waiting for review.
- `changes_requested` — reviewer asked for edits.
- `approved` — ready to publish/schedule.
- `scheduled` — approved and scheduled for future publishing.
- `published` — visible publicly.
- `archived` — hidden from public but recoverable.
- `rejected` — closed without publishing.

## Permission model

### Capabilities
- `content_create_media`
- `content_create_publications`
- `content_edit_own_state`
- `content_submit_for_review`
- `content_review_state`
- `content_review_zonal`
- `content_publish_state`
- `content_publish_zonal`
- `content_archive_restore`
- `content_delete_permanently` — administrator only, rarely used.
- `content_feature_homepage`


### Content authority model

Use **main role** for scope/authority and **work unit** for specialist content duties.

#### Main roles with built-in content authority
These roles do **not** need any content work unit to create, edit, review, approve, publish, schedule, archive, or restore content:

- Administrator — all content everywhere.
- Zonal admin — zonal content + all state content.
- Zonal coordinator — same authority as zonal admin.
- State admin — all publication/media activity within assigned state.
- State coordinator — same authority as state admin within assigned state.

#### Work units for specialist content activity
Use existing work units instead of creating new main roles:

- Media Editorial Officer
- Production Team
- Publication Editorial Officer
- Media Team

#### Work unit interpretation
- Media Editorial Officer: can edit/review media within assigned scope.
- Production Team: can create/submit media within assigned scope.
- Publication Editorial Officer: can edit/review publications within assigned scope.
- Media Team: can create/submit media within assigned scope.

If a work-unit user is not administrator/zonal/state authority, they should not publish directly unless explicitly granted publisher authority later.

#### Scope rule
- State admin/state coordinator authority is state-scoped.
- Zonal admin/zonal coordinator authority is zonal-wide and all-state.
- Work-unit users are scoped by their assigned state/region/centre according to their main role.
- A state-scoped user cannot publish zonal-wide content or another state’s content.

### Practical mapping for existing roles
- Administrator: all capabilities across the whole platform.
- Zonal coordinator and zonal admin: same permission level; full content authority across zonal and all state content.
- State coordinator and state admin: same permission level within assigned state; full content authority for state-scoped media/publications.
- Media Editorial Officer: edit/review media within assigned scope.
- Production Team: create/submit media within assigned scope.
- Publication Editorial Officer: edit/review publications within assigned scope.
- Media Team: create/submit media within assigned scope.
- Region coordinator/admin: no default final publish authority unless also given an approved content work unit and allowed by scope.
- Associate coordinator/member: no content admin by default unless given work-unit permission.

## Data model upgrades

### Add to `media_items`
- `slug VARCHAR(220) UNIQUE NULL`
- `excerpt TEXT NULL`
- `workflow_status ENUM('draft','submitted','changes_requested','approved','scheduled','published','archived','rejected') DEFAULT 'draft'`
- `visibility ENUM('public','members','leaders','private') DEFAULT 'public'`
- `scheduled_at DATETIME NULL`
- `archived_at DATETIME NULL`
- `deleted_at DATETIME NULL`
- `submitted_by INT NULL`
- `submitted_at DATETIME NULL`
- `reviewed_by INT NULL`
- `reviewed_at DATETIME NULL`
- `approved_by INT NULL`
- `approved_at DATETIME NULL`
- `published_by INT NULL`
- `is_featured TINYINT(1) DEFAULT 0`
- `featured_order INT DEFAULT 0`
- `pinned_until DATETIME NULL`
- `seo_title VARCHAR(200) NULL`
- `seo_description VARCHAR(300) NULL`
- `view_count INT DEFAULT 0`
- `play_count INT DEFAULT 0`
- `download_count INT DEFAULT 0`
- `source_type ENUM('upload','youtube','vimeo','facebook','external') DEFAULT 'external'`
- `embed_url VARCHAR(500) NULL`
- `mime_type VARCHAR(120) NULL`
- `file_size_bytes BIGINT NULL`
- `allow_download TINYINT(1) DEFAULT 0`

### Add to `publication_items`
- `slug VARCHAR(220) UNIQUE NULL`
- `excerpt TEXT NULL`
- `workflow_status ENUM('draft','submitted','changes_requested','approved','scheduled','published','archived','rejected') DEFAULT 'draft'`
- `visibility ENUM('public','members','leaders','private') DEFAULT 'public'`
- `scheduled_at DATETIME NULL`
- `archived_at DATETIME NULL`
- `deleted_at DATETIME NULL`
- `submitted_by INT NULL`
- `submitted_at DATETIME NULL`
- `reviewed_by INT NULL`
- `reviewed_at DATETIME NULL`
- `approved_by INT NULL`
- `approved_at DATETIME NULL`
- `published_by INT NULL`
- `is_featured TINYINT(1) DEFAULT 0`
- `featured_order INT DEFAULT 0`
- `pinned_until DATETIME NULL`
- `seo_title VARCHAR(200) NULL`
- `seo_description VARCHAR(300) NULL`
- `view_count INT DEFAULT 0`
- `download_count INT DEFAULT 0`
- `author_name VARCHAR(160) NULL`
- `language VARCHAR(40) DEFAULT 'English'`
- `file_size_bytes BIGINT NULL`
- `allow_download TINYINT(1) DEFAULT 1`

### New shared tables
- `content_categories` — standard categories/types.
- `content_tags` — normalized tags.
- `content_tag_map` — item/tag relationship.
- `content_series` — media/publication series.
- `content_people` — speakers/authors.
- `content_revisions` — previous versions.
- `content_audit_logs` — submit/approve/publish/archive/delete history.
- `content_assets` — uploaded files with type, mime, size, path, owner.
- `content_relationships` — related media/publications.

## API plan

### Public endpoints
Upgrade:
- `GET /media-items`
- `GET /media-items/{idOrSlug}`
- `GET /publication-items`
- `GET /publication-items/{idOrSlug}`

Support query params:
- `scope`
- `state`
- `q`
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

Return pagination:
- `items`
- `pagination: { page, limit, total, total_pages }`

Detail endpoints must validate state context:
- State page can only render matching state-scoped content or intentionally zonal/public content.
- Draft/archived/private content must not show publicly.

### Admin endpoints
Upgrade:
- `GET /admin/media-items`
- `POST /admin/media-items`
- `PUT /admin/media-items/{id}`
- `DELETE /admin/media-items/{id}` should become soft-delete/archive.
- Same for publication items.

Add workflow actions:
- `POST /admin/media-items/{id}/submit`
- `POST /admin/media-items/{id}/request-changes`
- `POST /admin/media-items/{id}/approve`
- `POST /admin/media-items/{id}/publish`
- `POST /admin/media-items/{id}/schedule`
- `POST /admin/media-items/{id}/archive`
- `POST /admin/media-items/{id}/restore`
- Equivalent endpoints for publications.

Add supporting endpoints:
- `GET /admin/content-audit-logs?item_type=&item_id=`
- `GET /admin/content-assets`
- `POST /admin/uploads/image`
- `POST /admin/uploads/publication-file`
- `POST /admin/uploads/audio`
- `POST /admin/uploads/video`

## Admin UI plan

### Publications admin
Add:
- Dashboard cards: Draft, Submitted, Approved, Scheduled, Published, Archived.
- Tabs by workflow status.
- Search/filter: state, type/category, status, date range, tag, author.
- Required publish checklist:
  - title
  - publication type/category
  - excerpt/description
  - cover image
  - content or file URL
  - scope/state
  - publish date/schedule
  - SEO title/description
- Preview before publish.
- Submit/Approve/Publish/Archive buttons based on permissions.
- Revision/history panel.
- File size/download indicator.

### Media admin
Add:
- Dashboard cards: Draft, Submitted, Approved, Scheduled, Published, Archived.
- Tabs for audio/video/photo/external.
- Source type selector: Upload, YouTube, Vimeo, Facebook, External URL.
- Auto-detect YouTube embed URL.
- Speaker/series/category fields with suggestions/dropdowns.
- Thumbnail preview.
- Playback preview.
- Download permission toggle.
- Required publish checklist:
  - title
  - media type
  - source URL/upload
  - speaker/series where applicable
  - thumbnail for video
  - scope/state
  - event date
  - SEO title/description

### Gallery/photo decision
Recommended short-term decision:
- Keep `state_gallery_items` for state photo galleries.
- Add `image/photo` to media only for zonal-wide photo albums later.
- Remove/disable misleading zonal Photo tab until photo media is fully supported, or implement `media_type=image` properly.

## Public UI plan

### Zonal publications
- Premium searchable library.
- Featured resources.
- Latest resources.
- Type/category chips.
- PDF/article badges.
- Download/read buttons.
- Pagination.

### State publications
- Match zonal standard visually.
- State hero + state-specific filters.
- State resources first.
- Optional zonal resources section.

### Zonal media
- Search/filter by speaker, series, type, date.
- Featured messages.
- Audio/video cards.
- Series landing pages.
- Related content.

### State media
- Upgrade detail page to match zonal detail standard.
- YouTube embed support.
- Related state media.
- Breadcrumbs and share buttons.

## Build phases

### Phase 1 — Baseline standard and safety
1. Add slug generation for media/publications.
2. Add detail endpoint state/scope validation.
3. Add backend search/filter/pagination.
4. Add soft archive instead of hard delete.
5. Add publish checklist validation.
6. Split upload folders and filename prefixes by type.
7. Add file-size/type validation and asset metadata.
8. Upgrade admin filters and status tabs.

### Phase 2 — Editorial workflow
1. Add workflow columns and audit log table.
2. Add submit/review/approve/publish/archive actions.
3. Implement 3-role flow: Contributor/Publisher → Editor-Reviewer → Final Approver.
4. Treat editor and reviewer as one combined capability.
5. Give state admins/state coordinators full final approval authority within their assigned state.
6. Give zonal admins/zonal coordinators full final approval authority across zonal and state content.
7. Update admin UI actions by role/capability.
8. Add rejection/change-request notes.
9. Add revision history.

### Phase 3 — Taxonomy and public library quality
1. Add categories/tags/series/speakers tables.
2. Upgrade public zonal/state library pages.
3. Add SEO fields and dynamic OG metadata.
4. Add related content.
5. Add view/download/play counters.

### Phase 4 — Media maturity
1. Decide photo/album model.
2. Add video/audio processing strategy if self-hosting.
3. Add broken-link checker.
4. Add analytics dashboard.
5. Add members/leaders/private visibility enforcement.

## Recommended immediate MVP batch

Build Phase 1 first. It gives the biggest quality/security improvement without overcomplicating the system.

### MVP files likely affected
- `api/index.php`
- new migration SQL under `database/`
- `web/src/components/admin/AdminMedia.jsx`
- `web/src/components/admin/AdminPublications.jsx`
- `web/src/pages/MediaPage.jsx`
- `web/src/pages/PublicMediaListPage.jsx`
- `web/src/pages/PublicMediaDetailPage.jsx`
- `web/src/pages/PublicationsListPage.jsx`
- `web/src/pages/PublicationsDetailPage.jsx`
- `web/src/pages/StateMediaListPage.jsx`
- `web/src/pages/StateMediaDetailPage.jsx`
- `web/src/pages/StatePublicationsListPage.jsx`
- `web/src/pages/StatePublicationsDetailPage.jsx`

## Definition of Done for Phase 1
- Public list endpoints support search and pagination.
- Detail endpoints cannot leak another state’s content.
- Admin cannot hard-delete; archive/restore exists.
- Media/publication records have slugs.
- Publish action requires required metadata.
- Uploads are type-aware and validated.
- State and zonal users see only allowed scope.
- Frontend build/package is generated for deployment.

## Approval gate
If this plan is approved, next step is:

`APPROVE PLAN DLCF-SW-CONTENT-STANDARDIZATION`

Then Atlas should implement Phase 1 as the first MVP batch.
