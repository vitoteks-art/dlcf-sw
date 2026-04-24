# PLAN — GIVING-FEATURED-HOMEPAGE

## Goal
Extend the existing DLCF giving system so homepage surfaces can show curated featured giving campaigns by scope:
- Main/zonal homepage shows featured zonal gives
- State homepage shows featured state gives for that state plus featured zonal gives
- Main `/give` remains the full zonal give listing
- State `/:stateSlug/give` remains the full state give listing for that state

## Scope
### In scope
- Add `is_featured` flag to giving campaigns
- Support featured queries in backend API
- Show featured gives on the main homepage
- Show featured state gives + featured zonal gives on each state homepage
- Keep full give listing/detail pages working for both zonal and state scopes
- Add admin support to mark/unmark a giving campaign as featured

### Out of scope
- Payments gateway changes
- Donation checkout flow redesign
- Homepage visual redesign beyond inserting featured-give sections into current layouts
- Auto-expiring featured status by date

## Content rules
### Main / zonal homepage
- Show only campaigns where:
  - `scope = zonal`
  - `status = published`
  - `is_featured = 1`
- Order:
  1. urgent featured first
  2. nearest deadline next
  3. newest/most recent last fallback

### State homepage
Show two blocks:
1. **State Featured Gives**
   - `scope = state`
   - `state = current state`
   - `status = published`
   - `is_featured = 1`
2. **Zonal Featured Gives**
   - `scope = zonal`
   - `status = published`
   - `is_featured = 1`

### Give listing pages
- `/give` = all published zonal gives
- `/:stateSlug/give` = all published state gives for that state
- Detail pages remain:
  - `/give/:id`
  - `/:stateSlug/give/:id`

## User flows
### Admin / content manager
1. Open Admin → Giving
2. Create or edit a campaign
3. Set scope (`zonal` or `state`)
4. Publish the campaign
5. Toggle `Featured on homepage`
6. Save
7. Campaign appears on the correct homepage section based on scope

### Visitor on main homepage
1. Sees featured zonal gives
2. Clicks one featured campaign
3. Lands on full give detail page `/give/:id`
4. Can move to `/give` to browse all zonal campaigns

### Visitor on state homepage
1. Sees featured state gives for that state
2. Also sees featured zonal gives
3. Clicks a campaign
4. Lands on the scoped detail page
5. Can move to the state give listing page for all state campaigns

## Data model
### Existing table
`giving_campaigns`

### New column
- `is_featured TINYINT(1) NOT NULL DEFAULT 0`

### Existing relevant columns already in use
- `id`
- `title`
- `slug`
- `summary`
- `description_html`
- `campaign_type`
- `cover_image_url`
- `target_amount`
- `amount_raised`
- `beneficiary_name`
- `payment_details`
- `deadline`
- `is_urgent`
- `scope`
- `state`
- `status`

## API changes
### Public endpoints
#### `GET /giving-campaigns`
Add optional query params:
- `featured=1`
- existing `scope`, `state`, `campaign_type`, `urgent`

Behavior:
- if `featured=1`, only return featured published campaigns
- ordering should prioritize urgent, then deadline, then latest id desc

### Optional dedicated homepage endpoint (recommended)
#### `GET /giving-homepage`
Query params:
- `state=<state name optional>`

Response shape:
- `zonalFeatured: []`
- `stateFeatured: []` (empty for main homepage or when no state provided)

Reason:
- Keeps homepage fetch logic simple
- Avoids multiple frontend requests and duplicated filtering logic

### Admin endpoints
#### `GET /admin/giving-campaigns`
- Include `is_featured` in returned rows

#### `POST /admin/giving-campaigns`
- Accept `is_featured`

#### `PUT /admin/giving-campaigns/{id}`
- Accept `is_featured`

## Frontend page map
### Existing pages to update
- `web/src/pages/GivingListPage.jsx`
- `web/src/pages/GivingDetailPage.jsx`
- `web/src/components/admin/AdminGiving.jsx`
- main homepage component/page
- state homepage component/page

### Homepage insertion points
#### Main homepage
Add a section such as:
- kicker: `Featured Giving`
- title: `Support current zonal needs`
- cards sourced from zonal featured gives
- CTA: `View all giving` → `/give`

#### State homepage
Add two sections:
- `State Featured Giving`
- `Zonal Featured Giving`

Alternative compact fallback if UI space is tight:
- single giving section with state cards first and zonal cards second

## Backend implementation notes
- Add migration for `is_featured`
- Update select lists to expose `is_featured`
- Update create/update validation to normalize `is_featured` to `0/1`
- Maintain existing scope guardrails for state-scoped managers
- Preserve published-only filtering on public endpoints

## Permissions
Giving admin access should remain available to:
- `administrator`
- `zonal_cord`
- `zonal_admin`
- `state_cord`
- `state_admin`

State-scoped roles must only create/edit state campaigns within their own state where applicable.
Zonal roles and administrator can manage zonal featured campaigns.

## Security basics
- Public endpoints return only `status = published`
- Admin endpoints require authenticated authorized roles
- Scope enforcement for state roles must continue on create/update/delete
- Sanitize/validate `is_featured`, `scope`, `state`, and html fields as already done for giving content

## QA checklist
- Published zonal featured campaign appears on main homepage
- Published state featured campaign appears on matching state homepage only
- State homepage also shows zonal featured campaigns
- Non-featured campaigns do not appear on homepages
- `/give` still lists all zonal campaigns, not just featured
- `/:stateSlug/give` still lists all campaigns for that state scope
- Admin can toggle featured on/off and see it persist
- Unauthorized users cannot change featured flags

## Risks / notes
- Homepage components may currently rely on CMS-managed static section arrays; giving cards should be injected without breaking existing editable content flow
- State homepage currently uses direct public endpoint patterns for reliability, so the featured give fetch should follow the same stable public-data strategy if needed
- Urgent should remain separate from featured; urgent affects emphasis/order, featured controls homepage placement

## Recommendation
Implement this in two batches after approval:
1. Backend + admin toggle + public featured API
2. Homepage and give-page UI wiring

## Approval request
If this matches your intent, reply with:

`APPROVE PLAN GIVING-FEATURED-HOMEPAGE`
