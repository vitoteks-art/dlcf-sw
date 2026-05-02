# Hotfix — Safe Media Assets List Endpoint

Date: 2026-05-02

## Issue

File upload succeeds, but File Manager fails when reading:

`GET /admin/media-assets?...`

## Diagnosis

Since uploads now succeed, the table/insert path is working. The remaining failure is in the list/read query.

## Fix

Made `/admin/media-assets` list endpoint safer:

- removed the `users` join from the list endpoint,
- disabled live usage-count scanning on the list endpoint,
- returned `usage_count: 0` as safe default,
- wrapped list query with a clearer JSON error message if the live schema still rejects the query.

This prioritizes making File Manager load and allowing users to select/delete/archive files. Detailed usage listing can be reintroduced after live schema verification.
