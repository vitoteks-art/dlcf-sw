# DLCF-SW Retreat Biodata Autofill Plan

## Project ID
`DLCF-SW-RETREAT-BIODATA-AUTOFILL`

## Goal
Make the retreat registration biodata lookup actually populate the retreat form with the participant's existing biodata so registration officers do not retype details manually.

## Problem Summary
Current retreat lookup behavior is incomplete:
- user searches biodata
- matching biodata records appear in a list
- clicking a result only partially helps and does not fully serve the purpose of lookup
- the retreat registration form is not being filled with all the useful fields from biodata as expected

This makes the lookup feel cosmetic instead of operational.

## Intended Behavior
When a registration officer selects a biodata result from `Lookup Biodata`, the retreat registration form should immediately fill the relevant participant fields.

## Fields to Autofill
From biodata into retreat form:
- `full_name`
- `phone`
- `email`
- `gender`
- `state`
- `region`
- `fellowship_centre`
- `category`
- `membership_status`
- `cluster`

Fields not sourced from biodata and should remain manual/current form-controlled:
- `retreat_type`
- `registration_date`
- `title` (unless later added to biodata, leave manual for now)

## UX Rules
- selecting a biodata match should immediately update the retreat form
- existing manual values should be replaced only for the fields mapped from biodata
- retreat-specific fields should remain untouched
- after applying biodata, dependent dropdowns must still stay consistent:
  - state
  - region
  - fellowship centre
  - cluster
- user should get clear feedback such as:
  - `Biodata loaded into the form.`

## Backend Needs
Likely no new backend endpoint is required if `/biodata/lookup` already returns the necessary fields.

However, verify whether `/biodata/lookup` currently returns all fields needed for retreat autofill, especially:
- `membership_status`
- `fellowship_centre`
- `cluster`
- `gender`

If any required field is missing, extend `/biodata/lookup` response.

## Frontend Needs
Primary file:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/RetreatPage.jsx`

Possible support logic:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/App.jsx`

Implementation expectations:
- expand `applyBiodata(item)` mapping if needed
- ensure dropdown-linked values remain valid after autofill
- clear lookup result list after apply
- show user feedback after successful apply

## Acceptance Criteria
- searching biodata still returns matches
- clicking a biodata result fills the retreat form automatically
- autofilled values include at least name, phone, email, gender, state, region, fellowship centre, category, membership status, and cluster
- retreat-specific values like retreat type and registration date are preserved
- no manual retyping is required for available biodata fields

## Recommended Build Order
1. inspect `/biodata/lookup` payload
2. extend lookup payload if any needed fields are missing
3. update retreat biodata apply logic
4. verify dependent state/region/centre behavior
5. test lookup → autofill → submit flow
