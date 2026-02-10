# DLCF Weekly App

PHP API + React frontend (compiled locally).

## Structure
- `api/` PHP API (session auth, CSRF, JSON endpoints)
- `scripts/schema.sql` database schema
- `web/` React app (Vite)

## API setup
1) Create a MySQL database and user.
2) Import `scripts/schema.sql`.
3) Import `scripts/seed_roles.sql`.
4) Import `scripts/seed_fellowships.sql` (generated from legacy form data).
3) Copy `api/config.example.php` to `api/config.local.php` and update values.
4) Point your cPanel API subdomain to `api/public`.
5) Create an admin user and store a real `password_hash()` in `users`.

## React setup (local build)
1) `cd web`
2) `npm install`
3) `npm run build`
4) Upload `web/dist` to `public_html`.
5) Add `scripts/htaccess-spa.txt` as `.htaccess` in `public_html` for SPA routing.

## Frontend routes
- `/` dashboard and reports
- `/biodata/register` biodata form
- `/biodata` biodata directory
- `/retreat` retreat registration form

## Roles and scope
- Roles: `associate_cord`, `region_cord`, `state_cord`, `zonal_cord`, `administrator`
- Scoping fields on `users`: `state`, `region`, `fellowship_centre_id`
- Work units on `users`: JSON array in `work_units` (use `registration` to allow biodata updates)

## Retreats
- Retreat registrations use `retreat_registrations`.
- Retreat types: `easter`, `december`.
- New endpoints: `POST /retreat-registrations` and `GET /retreat-registrations`.

## Biodata
- Table: `biodata`
- Endpoints: `POST /biodata`, `GET /biodata`, `GET /biodata/:id`
- Work units are stored as JSON in `biodata.work_units`.
- Biodata updates require a logged-in user whose `users.work_units` includes `registration`.
