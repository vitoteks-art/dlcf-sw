# Deploy Notes — DLCF-SW Follow-up Workflow

Project ID: `DLCF-SW-FOLLOW-UP-WORKFLOW`

Do not deploy until Victor explicitly approves DEPLOY for this project.

## Files to include
- Backend: `api/index.php`, `api/followup_routes.php`, `api/lib/notification_service.php`, `api/jobs/followup_reminders.php`, `api/config.php`, `api/config.example.php`
- Migration: `scripts/migrations/20260426_followup_workflow.sql`
- Frontend: rebuilt `web/dist/`

## Database migration
Apply once:

```bash
mysql -u <user> -p <database> < scripts/migrations/20260426_followup_workflow.sql
```

## Production config placeholders
Set these in backend config/local env include. Keep real secrets out of Git.

```php
$MAIL_FROM_EMAIL = 'no-reply@dlcfsw.org.ng';
$MAIL_FROM_NAME = 'DLCF South West';
$SMTP_HOST = '';
$SMTP_PORT = '';
$SMTP_USER = '';
$SMTP_PASS = '';

$EVOLUTION_API_BASE_URL = 'https://your-evolution-server.example';
$EVOLUTION_API_INSTANCE = 'your-instance-name';
$EVOLUTION_API_KEY = 'server-side-token-only';
$EVOLUTION_DEFAULT_COUNTRY_CODE = '234';
```

## Cron
Recommended daily reminder cron:

```bash
/usr/local/bin/php /home/dlcfsw/api.dlcfsw.org.ng/jobs/followup_reminders.php >> /home/dlcfsw/logs/followup_reminders.log 2>&1
```

Schedule: daily around 7:00 AM.

## Post-deploy smoke
- Open `/followups`, `/followups/templates`, and `/reports/followups` after login.
- Submit one attendance follow-up contact and confirm task creation.
- Test one WhatsApp send with Evolution API configured.
- Test one email send with production mail transport.
- Confirm message logs do not expose secrets.

## Rollback
- Revert uploaded backend/frontend files to previous release.
- Leave migration tables in place if data has been captured; do not drop production follow-up data without an export/backup.
