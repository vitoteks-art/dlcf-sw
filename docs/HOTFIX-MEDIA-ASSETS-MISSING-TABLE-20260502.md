# Hotfix — Media Assets Missing Table Guard

Date: 2026-05-02

## Issue

Live File Manager returned HTTP 500 on:

`GET /admin/media-assets?...`

Images/uploads also failed because the new Media Asset Manager requires the `media_assets` table.

## Likely Cause

The production database migration below has not been applied yet, or backend/frontend were deployed before migration:

`20260502_media_asset_manager.sql`

## Hotfix

Backend now checks whether `media_assets` exists before using the File Manager/upload asset recording flow.

If missing, API returns a clear 503 message:

> Media File Manager is not ready yet. Please apply database migration 20260502_media_asset_manager.sql before using uploads/File Manager.

## Required Production Fix

Apply this migration first:

`20260502_media_asset_manager.sql`

Then deploy backend and frontend packages.
