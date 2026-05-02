# QA — WordPress-like Publication Editor Upgrade

Project ID: DLCF-SW-WORDPRESS-LIKE-PUBLICATION-EDITOR
Date: 2026-05-02

## Implemented

- Reworked Admin Publications into a larger WordPress-like editing workspace.
- Added title-first editor layout with main writing area and right settings sidebar.
- Expanded rich editor toolbar: paragraph/headings/quote, bold, italic, underline, lists, alignment, link, clear formatting.
- Added inline image upload with upload status and inserted image figure markup.
- Added Add Media flow for selecting uploaded/reusable media into the article body.
- Added featured image panel with preview, upload, choose from media library, remove, alt text, and caption.
- Added Media Library modal with upload tab, browse/search/filter tab, and reusable media selection.
- Added publication preview panel.
- Added draft/save status messaging and unsaved-changes browser warning.
- Preserved existing state/zonal scope controls and publish checklist behavior.

## Verification

- `php -l api/index.php` — passed.
- `cd web && npm run build` — passed. Vite large chunk warning remains existing/non-blocking.
- `cd web && npm run lint` — passed with existing warnings only; no lint errors.

## Notes

- This batch is frontend-focused and uses the existing upload endpoint.
- Media library currently reuses files known from recent uploads and publication cover/file records available to the admin screen.
- A future deeper media-library phase can add persistent media metadata, global media browsing, alt/caption storage per asset, and image transformations.
