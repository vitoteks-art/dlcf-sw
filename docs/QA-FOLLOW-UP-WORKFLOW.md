# QA — DLCF-SW Follow-up Workflow

Project ID: `DLCF-SW-FOLLOW-UP-WORKFLOW`

## Implemented MVP
- Database migration for follow-up contacts, tasks, notes, templates, and message logs.
- PHP follow-up APIs for list/detail/create/bulk capture, assignment/status/schedule, notes, templates, summary/overdue reports, email sending/logging, Evolution API WhatsApp sending/logging, and WhatsApp fallback link.
- Attendance portal visitor/convert individual contact capture.
- GCK session-level follow-up contact capture.
- React follow-up dashboard, detail page, template page, and report page.
- Daily reminder cron script at `api/jobs/followup_reminders.php`.
- Backend config placeholders for mail and Evolution API credentials.

## Verification run
- `php -l api/followup_routes.php` — passed
- `php -l api/lib/notification_service.php` — passed
- `php -l api/jobs/followup_reminders.php` — passed
- `php -l api/index.php` — passed
- `cd web && npm run build` — passed; existing large chunk warning only
- `cd web && npm run lint` — passed with existing warnings; 0 errors

## Manual smoke checklist
1. Apply `scripts/migrations/20260426_followup_workflow.sql`.
2. Configure Evolution API values in backend `config.local.php` or production env include.
3. Sign in as an admin/state/region/AC user.
4. Submit attendance with one visitor/convert follow-up row.
5. Confirm the row appears on `/followups`.
6. Open detail page, assign worker, set due date/status, and add note.
7. Send Email and WhatsApp; confirm attempts are stored in Message History.
8. If Evolution API is intentionally unconfigured, confirm WhatsApp failure is logged and fallback link can open.
9. Edit templates under `/followups/templates`.
10. Confirm `/reports/followups` summary and overdue table render.

## Known limitations / production notes
- SMTP config is placeholder-ready; MVP email uses PHP `mail()` fallback unless production wires SMTP/sendmail.
- Evolution API credentials must stay server-side. Do not expose them to React.
- Delivery/read webhook is not implemented in this MVP; logs record send attempt response/status.
- Reports are scoped and dashboard-oriented; CSV export is reserved for a later phase.
