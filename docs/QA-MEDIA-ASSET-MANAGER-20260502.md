# QA — Media Asset Manager

Project ID: DLCF-SW-MEDIA-ASSET-MANAGER
Date: 2026-05-02

## Implemented

- Added `media_assets` migration.
- Updated uploads to save files into zonal/state-aware folders.
- Every new upload now records a media asset row with scope/state/type/size/uploader metadata.
- Added admin APIs for listing, updating metadata, archiving, restoring, and dashboard-deleting media assets.
- Added basic usage count checks against publications, media items, and state gallery records.
- Added Admin → File Manager dashboard.
- Added upload form, filters, grid cards, file details modal, metadata editing, copy URL, archive/restore/delete controls.
- Connected publication editor media picker to `/admin/media-assets`.
- Updated upload function to accept scope/state metadata.

## Verification

- `php -l api/index.php` — passed.
- `cd web && npm run build` — passed.
- `cd web && npm run lint` — passed with 0 errors and existing warnings only.

## Deployment Notes

Apply migration before deploying backend:

- `scripts/migrations/20260502_media_asset_manager.sql`

Deploy backend and frontend together for the File Manager feature.

## Smoke Test

1. Apply migration.
2. Login as administrator or zonal admin.
3. Open Admin → File Manager.
4. Upload an image as zonal.
5. Confirm it appears under zonal and image filters.
6. Upload an image for a state.
7. Confirm URL path includes `/uploads/states/{state-slug}/images/`.
8. Login as state admin and confirm only assigned-state files show.
9. Edit metadata.
10. Archive, restore, and delete from dashboard.
11. Open Publications → Add Media and confirm media assets appear for selection.
