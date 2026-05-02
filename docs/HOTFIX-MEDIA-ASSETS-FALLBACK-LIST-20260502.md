# Hotfix — File Manager Fallback List

Date: 2026-05-02

## Issue

Uploads now work, but File Manager still returns 500 when listing `/admin/media-assets`.

## Fix

Rebuilt the list endpoint to be more defensive:

- no joins,
- simple unaliased `media_assets` query,
- orders by `id` instead of timestamp,
- avoids usage scans,
- adds fallback query with a smaller column set if the primary query fails,
- returns the exact database error message if both primary and fallback fail.

This should either make File Manager usable immediately or expose the exact live schema error in the API response.
