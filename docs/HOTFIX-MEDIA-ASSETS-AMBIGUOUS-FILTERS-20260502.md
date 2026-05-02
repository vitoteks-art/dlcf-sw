# Hotfix — Media Assets 500 on File Manager List

Date: 2026-05-02

## Issue

Live File Manager still returned HTTP 500 on:

`GET /admin/media-assets?q=&file_type=&scope=&state=&status=active&usage_context=`

## Root Cause Fixed

The Media Asset Manager list query joins `media_assets` with `users`, but filter columns such as `status`, `state`, `scope`, and search fields were not fully qualified. On production MySQL this can trigger an ambiguous-column SQL error and return 500.

## Fix

The query now prefixes media asset columns with `ma.`:

- `ma.status`
- `ma.state`
- `ma.scope`
- `ma.file_type`
- `ma.usage_context`
- `ma.title`
- `ma.original_filename`
- `ma.caption`
- `ma.url`

## Deploy

Upload the backend hotfix package after the `media_assets` migration has already been applied.
