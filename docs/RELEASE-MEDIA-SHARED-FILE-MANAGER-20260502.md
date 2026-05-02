# Release Notes — Shared File Manager for Media

Date: 2026-05-02
Project: DLCF-SW-MEDIA-ASSET-MANAGER follow-up

## Updated

- Admin → Media now uses the same shared File Manager upload system as Publications.
- Media uploads now pass scope/state metadata so files are saved into the same zonal/state folder structure.
- Media source file upload uses `usage_context=media`.
- Media thumbnail upload also uses the shared media asset records.
- Added “Choose Existing Media/File” for media source.
- Added “Choose Existing Thumbnail” for thumbnail selection.
- Added shared asset picker modal in Admin Media.
- Users can select already uploaded files from `/admin/media-assets` instead of uploading duplicates.
- The existing Admin → File Manager remains the dashboard for deleting/archiving/restoring uploaded files.

## Verification

- `php -l api/index.php` passed.
- `npm run build` passed.
- `npm run lint` passed with 0 errors and existing warnings only.

## Backend

No new backend migration beyond `20260502_media_asset_manager.sql` is required for this follow-up.
