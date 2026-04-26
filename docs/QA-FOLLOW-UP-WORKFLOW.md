# QA — DLCF-SW Follow-up Workflow

Project ID: `DLCF-SW-FOLLOW-UP-WORKFLOW`

## Implemented MVP
- Database migration for follow-up contacts, tasks, notes, templates, and message logs.
- PHP follow-up APIs for list/detail/create/bulk capture, assignment/status/schedule, notes, templates, summary/overdue reports, email sending/logging, Evolution API WhatsApp sending/logging, and WhatsApp fallback link.
- Attendance portal visitor/convert individual contact capture.
- GCK session-level follow-up contact capture.
- React follow-up dashboard, detail page, template page, and report page.
- Daily reminder cron script at `api/jobs/followup_reminders.php`.
- Backend config placeholders for mail and Evolution API credentials, plus Super Admin-only database settings UI for Evolution API.
- Evolution API token masking/replacement and a Super Admin test WhatsApp endpoint.

## Verification run
- `php -l api/followup_routes.php` — passed
- `php -l api/lib/notification_service.php` — passed
- `php -l api/jobs/followup_reminders.php` — passed
- `php -l api/index.php` — passed
- `cd web && npm run lint && npm run build` — passed; existing lint warnings and large chunk warning only, 0 errors

## Manual smoke checklist
1. Apply `scripts/migrations/20260426_followup_workflow.sql`.
2. Configure Evolution API values in Admin Dashboard → Integrations as a Super Admin, or use backend `config.local.php`/production env include as fallback.
3. Sign in as an admin/state/region/AC user.
4. Submit attendance with one visitor/convert follow-up row.
5. Confirm the row appears on `/followups`.
6. Open detail page, assign worker, set due date/status, and add note.
7. Send Email and WhatsApp; confirm attempts are stored in Message History.
8. Confirm the Integrations tab masks the saved token, does not expose raw token, and can replace/clear the token.
9. If Evolution API is intentionally unconfigured/disabled, confirm WhatsApp failure is logged and fallback link can open.
10. Edit templates under `/followups/templates`.
11. Confirm `/reports/followups` summary and overdue table render.

## Known limitations / production notes
- SMTP config is placeholder-ready; MVP email uses PHP `mail()` fallback unless production wires SMTP/sendmail.
- Evolution API credentials stay server-side; React receives only `has_api_token` and `api_token_masked`.
- Delivery/read webhook is not implemented in this MVP; logs record send attempt response/status.
- Reports are scoped and dashboard-oriented; CSV export is reserved for a later phase.
