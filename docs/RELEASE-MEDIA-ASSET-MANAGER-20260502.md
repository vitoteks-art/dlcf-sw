# Release Notes — Media Asset Manager

Project ID: DLCF-SW-MEDIA-ASSET-MANAGER
Date: 2026-05-02

## Backend

- New `media_assets` table migration.
- Upload endpoint now supports scope/state metadata.
- New uploads are stored under zonal/state folder paths.
- New admin media asset endpoints:
  - `GET /admin/media-assets`
  - `PUT /admin/media-assets/{id}`
  - `POST /admin/media-assets/{id}/archive`
  - `POST /admin/media-assets/{id}/restore`
  - `DELETE /admin/media-assets/{id}`

## Frontend

- Added Admin → File Manager.
- Added upload, filters, asset cards, details modal, metadata editing, archive/restore/delete.
- Publication editor can browse/select real media assets.

## Required Deployment Order

1. Apply `scripts/migrations/20260502_media_asset_manager.sql`.
2. Deploy backend package.
3. Deploy frontend package.
4. Test upload + File Manager + publication media picker.
