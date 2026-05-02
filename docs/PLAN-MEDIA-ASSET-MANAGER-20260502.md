# Plan — DLCF-SW Media Asset Manager

Date: 2026-05-02
Project ID: DLCF-SW-MEDIA-ASSET-MANAGER
Gate: PLAN — Approved by Victor on 2026-05-02

## 1. Goal

Create a proper dashboard-managed media/file system for DLCF-SW so every uploaded image, document, audio, and video is:

- identified by owner scope: zonal or state,
- stored in a clear folder structure,
- recorded in a database media library,
- visible from the admin dashboard,
- searchable/filterable,
- reusable in publications/content,
- safely deletable/archiveable from the dashboard,
- protected by state/zonal permissions.

This becomes the backend foundation for a true WordPress-like media library.

---

## 2. Current Problem

The current upload endpoint saves files under broad type folders such as:

- `uploads/images`
- `uploads/documents`
- `uploads/audio`
- `uploads/video`

But it does not yet permanently record each file as a managed media asset with:

- state ownership,
- uploader,
- usage context,
- delete/archive status,
- alt/caption metadata,
- dashboard deletion controls.

This means uploaded files can exist on the server without a proper dashboard record.

---

## 3. Target Folder Structure

Use state/zonal aware folders.

```text
uploads/
  zonal/
    images/
    documents/
    audio/
    video/

  states/
    oyo-state/
      images/
      documents/
      audio/
      video/

    lagos-state/
      images/
      documents/
      audio/
      video/
```

Examples:

```text
/uploads/zonal/images/img_20260502_xxxx.jpg
/uploads/states/oyo-state/images/img_20260502_xxxx.jpg
/uploads/states/lagos-state/documents/doc_20260502_xxxx.pdf
```

## Folder ownership rule

- If user uploads for zonal content, save under `uploads/zonal/{type}/`.
- If user uploads for a state, save under `uploads/states/{state-slug}/{type}/`.
- State admin/coordinator uploads default to their assigned state.
- Zonal/admin users can select zonal or a state depending on the upload context.

---

## 4. New Database Table

Create `media_assets`.

Recommended fields:

```sql
id INT AUTO_INCREMENT PRIMARY KEY,
uuid VARCHAR(64) UNIQUE,
title VARCHAR(220),
original_filename VARCHAR(255),
stored_filename VARCHAR(255),
mime_type VARCHAR(120),
file_ext VARCHAR(20),
file_type ENUM('image','document','audio','video','other'),
file_size BIGINT,
folder VARCHAR(255),
url VARCHAR(500),
scope ENUM('zonal','state') DEFAULT 'zonal',
state VARCHAR(120) NULL,
usage_context VARCHAR(80) NULL,
alt_text VARCHAR(255) NULL,
caption TEXT NULL,
description TEXT NULL,
uploaded_by INT NULL,
uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
status ENUM('active','archived','deleted') DEFAULT 'active',
archived_at DATETIME NULL,
deleted_at DATETIME NULL,
deleted_by INT NULL,
updated_at DATETIME NULL
```

Indexes:

- `scope`
- `state`
- `file_type`
- `status`
- `uploaded_by`
- `uploaded_at`

---

## 5. Upload API Changes

Upgrade `/admin/uploads` to accept optional metadata:

- `scope`
- `state`
- `usage_context`
- `title`
- `alt_text`
- `caption`

The backend must validate scope:

- State users cannot upload into another state.
- State users cannot upload into zonal scope unless permitted.
- Zonal/admin users can upload into zonal or state scope.

After saving the file physically, the backend inserts a row into `media_assets` and returns:

```json
{
  "id": 123,
  "url": "/uploads/states/oyo-state/images/img_xxx.jpg",
  "file_type": "image",
  "scope": "state",
  "state": "Oyo State"
}
```

---

## 6. Dashboard API

Add protected admin endpoints:

### List media assets

`GET /admin/media-assets`

Filters:

- search `q`
- `file_type`
- `scope`
- `state`
- `status`
- date range
- uploader
- usage context

Returns paginated assets.

### Update media metadata

`PUT /admin/media-assets/{id}`

Can update:

- title
- alt text
- caption
- description
- usage context

### Archive media asset

`POST /admin/media-assets/{id}/archive`

Soft hides asset from library/public selection.

### Restore media asset

`POST /admin/media-assets/{id}/restore`

Restores archived asset.

### Delete media asset

`DELETE /admin/media-assets/{id}`

Recommended behavior:

- Default: soft delete/mark as deleted.
- Optional later: permanent delete file from disk for administrator only.

---

## 7. File Usage Checks

Before deletion/archive, detect whether file URL appears in:

- `publication_items.cover_image_url`
- `publication_items.file_url`
- `publication_items.content_html`
- `media_items.thumbnail_url`
- `media_items.source_url`
- `state_gallery_items.image_url`
- state homepage content fields where practical

If file is in use, dashboard should warn:

> This file is currently used in one or more content items. Deleting it may break those pages.

Recommended MVP:

- Show usage count and basic usage list.
- Allow archive with warning.
- Restrict permanent delete to administrator only.

---

## 8. Permission Rules

### Administrator

- See all assets.
- Upload to zonal or any state.
- Archive/restore/delete all assets.

### Zonal Admin / Zonal Coordinator

- See zonal assets and all state assets.
- Upload to zonal or any state.
- Archive/restore state and zonal assets.

### State Admin / State Coordinator

- See only their assigned state assets.
- Upload only to their assigned state.
- Archive/restore their state assets.
- Cannot delete zonal or another state’s files.

### Publisher / Editor-Reviewer / Work-unit content users

- Manage assets only within assigned content scope.
- No permanent delete by default.

---

## 9. Frontend Dashboard

Add/upgrade Admin → Media Library / File Manager.

Dashboard sections:

- summary cards: images, documents, audio, video, archived, total size
- filters: search, type, state, scope, status, date
- grid/list view
- preview panel
- asset details panel
- edit metadata
- copy URL
- use/select asset in publication editor
- archive/restore/delete controls

---

## 10. Integration With Publication Editor

Publication editor should use this real media library instead of only recent/current publication assets.

Actions:

- set featured image from media assets
- insert image into article body
- attach PDF/document
- browse files by current state/scope
- upload new file directly into correct state/zonal folder

---

## 11. Migration Strategy

MVP migration creates the table and records new uploads going forward.

Optional later migration:

- scan existing `/uploads` files,
- create media asset rows for legacy files,
- infer type from folder/MIME,
- mark scope as `zonal` or `unknown` where state cannot be determined.

Do not move existing live files immediately unless necessary. Moving old files could break existing URLs.

---

## 12. Implementation Phases

### Phase 1 — Backend media assets foundation

- Add `media_assets` table migration.
- Update upload endpoint to save state/zonal folder path.
- Insert media asset record on every upload.
- Add media asset list/update/archive/restore/delete endpoints.
- Add usage check helper.

### Phase 2 — Admin dashboard file manager

- Add dashboard UI for all uploaded files.
- Add filters/search/type/status/state.
- Add preview/details/delete controls.
- Enforce scope-based visibility.

### Phase 3 — Publication editor integration

- Connect Add Media modal to `/admin/media-assets`.
- Upload from publication editor into the correct scope/state folder.
- Insert selected media into publication body, featured image, or file attachment.

### Phase 4 — Legacy import and deeper WordPress features

- Optional import of existing uploads.
- Permanent delete with stricter checks.
- Image thumbnails/compression.
- Bulk select/actions.

---

## 13. Acceptance Criteria

MVP is complete when:

- every new upload creates a `media_assets` record,
- every new upload is saved under zonal or state folder,
- state uploads are identifiable by state,
- admin dashboard can list uploaded files,
- dashboard can filter by state/type/status,
- users can archive/delete files they are allowed to manage,
- state users cannot see/delete other states’ files,
- publication editor can browse/select media assets,
- oversized and invalid uploads still show clear errors,
- build and PHP syntax checks pass.

---

## 14. Next Gate

Proceed to UI gate for the dashboard and publication-editor integration.
