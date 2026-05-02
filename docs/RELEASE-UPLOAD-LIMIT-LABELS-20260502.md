# Release Notes — Upload Limit Labels and 25MB Image Limit

Date: 2026-05-02
Project: DLCF-SW WordPress-like Publication Editor

## Updated

- Increased frontend image upload limit from 15MB to 25MB.
- Kept document/PDF limit at 50MB.
- Kept audio limit at 75MB.
- Kept video limit at 100MB.
- Improved oversized-file error message so users clearly know the allowed size.
- Added visible upload limit labels in:
  - publication editor toolbar,
  - featured image panel,
  - PDF/file upload panel,
  - media library header,
  - media library upload tab.

## Verification

- `php -l api/index.php` passed.
- `npm run build` passed.
- `npm run lint` passed with 0 errors and existing warnings only.

## Backend

No backend change is required. Existing server/backend upload ceiling remains 100MB, which supports the updated frontend limits.
