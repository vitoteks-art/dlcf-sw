# DLCF-SW Progress Audit — 2026-04-25

## Audit scope
Checked the current codebase against `docs/PLAN.md`, recent migrations, frontend routes, backend endpoints, docs, git history, and verification checks.

## Verification run
- Backend PHP syntax: PASS — `php -l api/index.php` and all PHP files under `api/` passed.
- Frontend production build: PASS — `cd web && npm run build` succeeded.
- Frontend lint: PASS with warnings — `npm run lint` returned 0 errors and 45 warnings.
- Known build warning: Vite bundle chunk is >500 kB; non-blocking but should be optimized later with code-splitting.

## Repository state
- Latest commits include fellowship centre Excel sync, local API startup fix, state mobile menu fixes, homepage image/public endpoint fixes, giving homepage flow, and state homepage responsiveness.
- Working tree is not clean. There are modified docs/source files and many untracked zip/build artifacts. Before the next serious release, clean/package the repo so source changes and delivery archives are separated.

## Current implementation snapshot
Implemented or substantially present:
- Session auth, CSRF, login/logout/signup/reset/verify-email.
- Scoped admin management for states, regions, institutions, fellowship centres, work units, roles, and users.
- Attendance entry and reporting.
- Attendance access code flow with access-code tables, activation endpoint, admin UI, audit logs, and scope enforcement.
- Visitors, converts, and tithe/offering capture on attendance.
- GCK entry/reporting, including recent centre filtering and program wording compatibility.
- Biodata form/listing/reporting with expanded spiritual milestone, academic, alumni, and NYSC fields.
- Biodata lifecycle dashboard/report and transition endpoint.
- Retreat, state congress, zonal congress registration and reports.
- STMC registration and reporting baseline.
- State mini-site CMS, main homepage CMS, state public pages, events, recurring events, gallery, media, publications.
- Fellowship directory enrichment and latest fellowship-centre sync from Excel.
- Giving campaigns, public giving pages, admin giving manager, and featured giving on homepage/state pages.
- Public homepage image fixes and public endpoint/CORS fixes.

## Plan progress by major area

| Plan area | Status | Notes |
|---|---:|---|
| Existing core portal/auth/reporting | Mostly complete | Core PHP + React portal is broad and active. |
| User/admin management | Partial-complete | Admin CRUD exists; full capability model is not fully normalized yet. |
| Permission/capability redesign | Partial | Access hardening and role checks exist, but full `permissions`, `role_permissions`, and `user_permissions` model remains pending. |
| Delegated access codes | Implemented for attendance | Good first implementation; plan originally envisioned broader delegated actions for GCK/biodata/follow-up too. |
| MFA for editors | Pending | Plan includes MFA tables/endpoints, but codebase does not show implemented MFA flow. |
| Default member signup | Implemented/mostly implemented | Signup defaults/role handling exists; should still be manually re-verified on live. |
| Biodata expansion | Implemented | Expanded lifecycle/spiritual/NYSC fields are present in backend and UI. |
| Spiritual milestone reporting | Implemented | Spiritual report endpoint/page exists. |
| Student/alumni/NYSC lifecycle | Implemented/partial | Lifecycle report/dashboard and transition endpoint exist; automated cron-style migration job is not confirmed. |
| Attendance visitors/converts/income | Implemented | Captured in entry and report views. |
| GCK category/follow-up upgrade | Partial | GCK reporting exists and has recent upgrades; full follow-up communication/workflow layer is not complete. |
| Visitor/convert follow-up workflow | Pending/partial | Visitor/convert counts exist; person-level follow-up assignment/task system is not implemented. |
| STMC LMS expansion | Pending | Current STMC is registration/reporting, not courses/modules/assessments/certificates LMS. |
| State mini-site CMS/public pages | Mostly complete | State home, events, media, publications, gallery, fellowship directory are implemented. |
| Testimony module | Pending | Plan mentions testimonies; no clear testimony CRUD/public module found. |
| Fellowship locator | Partial | State fellowship directory exists; full locator with maps/lat/long/public contact fields is not fully done. |
| Giving portal | Partial-complete | Campaigns/public/admin/featured flow exist; payment/webhook/reconciliation depth needs confirmation. |
| Media/audio archive | Partial-complete | Media/publications exist; dedicated audio archive remains unclear/pending. |
| Audit logs | Partial | Attendance access audit logs exist; global audit logs for all sensitive actions are pending. |
| Background jobs/cron | Pending | Alumni migration, code expiry, follow-up reminders, certificate generation, reconciliation jobs are not confirmed. |

## Overall estimate
- Phase 1 foundation: about 65–75% complete.
- Phase 2 operations/reporting: about 45–55% complete.
- Phase 3 platform growth/LMS: about 20–30% complete.
- Overall against the expansion plan: about 55–60% complete.

## Recommended next build batch
1. Clean repo structure: move/remove old zip artifacts from source tree and commit only source/docs/migrations.
2. Finish access-control foundation: central capability helper + normalized permission tables/admin mapping.
3. Add MFA for privileged users.
4. Extend delegated access beyond attendance only where needed: GCK, biodata, and scoped follow-up.
5. Build follow-up module: visitor/convert records, assignments, status, notes, email/WhatsApp export.
6. Add cron/job scripts for code expiry and lifecycle transitions.
7. Decide whether STMC LMS is next or should wait until core reporting/follow-up is stable.

## Immediate risk notes
- The repo currently mixes source files with many generated `.zip` artifacts. This can cause confusion and larger commits/deploy packages.
- Lint has no errors but many warnings; not urgent, but should be reduced before a long-term handoff.
- `api/index.php` is very large; future expansion should split modules/controllers to reduce regression risk.
