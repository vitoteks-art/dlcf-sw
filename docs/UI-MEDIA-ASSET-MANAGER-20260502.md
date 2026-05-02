# UI Spec — DLCF-SW Media Asset Manager

Date: 2026-05-02
Project ID: DLCF-SW-MEDIA-ASSET-MANAGER
Gate: UI
Status: Awaiting `APPROVE UI DLCF-SW-MEDIA-ASSET-MANAGER`

## 1. UI Goal

Add a proper admin dashboard for managing every uploaded file across DLCF-SW:

- images,
- documents/PDFs,
- audio,
- video.

The UI must show where each file belongs:

- zonal file, or
- state file with state name.

It must allow authorized users to:

- view uploaded files,
- search/filter files,
- preview files,
- edit metadata,
- copy file URL,
- archive/restore files,
- delete files where allowed,
- see whether a file is used by a publication/media/gallery item.

---

## 2. Admin Navigation

Add or repurpose admin tab:

**Media Library / File Manager**

Recommended label: **File Manager**

Reason: there is already a “Media” content area for audio/video/media posts. “File Manager” clearly means uploaded files.

---

## 3. Dashboard Header

Header title:

**File Manager**

Subtitle:

> Manage uploaded images, documents, audio, and video files by zonal or state ownership.

Actions:

- `Upload File`
- `Refresh`

For state users, show small notice:

> You are viewing files for your assigned state only.

For zonal/admin users:

> You can view zonal files and state files according to your authority.

---

## 4. Summary Cards

Show cards across the top:

- Total files
- Images
- Documents
- Audio
- Video
- Archived
- Storage used

Cards should be clickable filters where practical.

---

## 5. Filters

Filters row:

- Search: title, filename, caption
- File type: All, Images, Documents, Audio, Video, Other
- Scope: All, Zonal, State
- State dropdown
- Status: Active, Archived, Deleted
- Usage context: Publications, Media, Gallery, Homepage, Giving, General
- Date range

Behavior:

- State users: state dropdown locked to assigned state.
- Zonal/admin users: can choose zonal or a state.

---

## 6. File Display Modes

### 6.1 Grid View

Best for images.

Each file card shows:

- thumbnail/preview,
- file title/name,
- file type badge,
- scope/state badge,
- file size,
- upload date,
- status,
- actions.

### 6.2 List View

Best for documents/audio/video.

Columns:

- Preview/icon
- Title / filename
- Type
- Scope / State
- Size
- Uploaded by
- Uploaded date
- Usage count
- Status
- Actions

MVP can start with one responsive grid/list hybrid.

---

## 7. File Details Panel

Clicking a file opens a details side panel or modal.

Show:

- large preview if image,
- playable preview for audio/video if possible,
- document icon/link for PDF/docs,
- title,
- original filename,
- file URL,
- copy URL button,
- MIME type,
- file size,
- scope,
- state,
- uploaded by,
- uploaded date,
- status.

Editable fields:

- title,
- alt text,
- caption,
- description,
- usage context.

Actions:

- Save metadata
- Archive
- Restore
- Delete
- Close

---

## 8. Upload Modal

Clicking `Upload File` opens modal.

Fields:

- File picker / drag-and-drop
- Title optional
- Alt text for images
- Caption optional
- Description optional
- Usage context dropdown
- Scope: Zonal / State
- State dropdown

Upload limit note visible:

> Upload limits: images up to 25MB, PDF/documents up to 50MB, audio up to 75MB, video up to 100MB.

Scope behavior:

- State users: scope locked to State and state locked to assigned state.
- Zonal/admin users: can choose Zonal or State.

After upload:

- show success message,
- show file preview,
- file appears in list immediately.

---

## 9. Delete / Archive UX

Use safe deletion.

### Archive button

Label: `Archive`

Message:

> Archive this file? It will no longer appear for normal selection, but can be restored later.

### Delete button

Label: `Delete`

Before delete, show usage warning if file is used:

> This file appears to be used in existing content. Deleting it may break images, downloads, or media on public pages.

If no usage:

> Delete this file from the dashboard? This action may not be recoverable depending on server settings.

MVP behavior:

- soft delete from dashboard,
- do not physically remove from disk unless administrator permanent-delete is added later.

---

## 10. Usage Indicator

Each file should show:

- `Not used`, or
- `Used in 2 places`

Details panel should list usage where available:

- Publication: title
- Media item: title
- Gallery item
- Homepage section

MVP can show usage count first, then improve to detailed list.

---

## 11. Publication Editor Integration

Inside the WordPress-like publication editor, the Media Library modal should be connected to the new file manager data.

When user clicks:

- `Add Media`
- `Choose from Library`
- `Choose File`

The modal should show files from `/admin/media-assets`.

User can:

- upload new file into correct state/zonal folder,
- select image for featured image,
- insert image into article content,
- attach PDF/document.

The upload modal should pass scope/state automatically from the publication being edited.

---

## 12. Permission Behavior

### Administrator

- See all files.
- Upload to zonal or any state.
- Archive/restore/delete all files.

### Zonal Admin / Zonal Coordinator

- See zonal and state files.
- Upload to zonal or any state.
- Archive/restore/delete within authority.

### State Admin / State Coordinator

- See only assigned state files.
- Upload only to assigned state.
- Archive/restore/delete only assigned state files.

### Content work-unit users

- See/manage only allowed scope.
- No permanent delete.

---

## 13. Empty and Error States

### Empty state

> No files found for this view. Upload a file or change your filters.

### Upload too large

> This file is too large. Maximum allowed size for this file type is 25MB/50MB/75MB/100MB.

### Forbidden

> You do not have permission to manage files in this state or scope.

### In-use warning

> This file is currently used in content. Please review before deleting.

---

## 14. Mobile Behavior

- Filter controls stack vertically.
- File cards become one-column.
- Details panel becomes full-screen modal.
- Action buttons remain large enough to tap.

---

## 15. Acceptance Criteria

UI is approved when it supports:

- a clear dashboard for all uploaded files,
- state/zonal ownership display,
- upload modal with scope/state and limits,
- preview/details panel,
- metadata editing,
- archive/restore/delete controls,
- usage warning,
- integration path for publication editor media picker,
- permission-aware views for state and zonal users.

---

## 16. Approval Gate

If approved, reply:

`APPROVE UI DLCF-SW-MEDIA-ASSET-MANAGER`

Implementation will not begin until this UI gate is approved.
