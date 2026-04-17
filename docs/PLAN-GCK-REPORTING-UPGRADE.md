# DLCF-SW GCK Reporting Upgrade Plan

## Project ID
`DLCF-SW-GCK-REPORTING-UPGRADE`

## Goal
Upgrade the current GCK attendance/reporting flow so it can support richer program-category reporting and practical follow-up actions via email and WhatsApp.

## Current Position
The codebase already has a working GCK attendance/reporting flow:
- GCK attendance submission page exists
- monthly GCK report persistence exists
- report loading/updating exists
- leadership report viewing exists
- GCK access control was recently hardened

This means the work should extend the current flow instead of replacing it.

## User Correction / Product Direction
Follow-up for this phase does **not** mean assigning records to internal follow-up workers first.

For now, follow-up should mean:
- **email follow-up**
- **WhatsApp follow-up**

This should shape the upgrade scope.

## Corrected Program Categories for this work
Use these categories, not SMART:
- Crusade Sessions
- Ministers’ Conferences
- Impact
- Sunday Worship Service / SHS

## Scope

### In scope
1. enhance GCK report structure to support program category/type
2. improve GCK attendance/session capture where needed
3. support richer session-level reporting fields
4. prepare/report follow-up targets for **email** and **WhatsApp**
5. improve report visibility for leadership

### Out of scope
- full-blown CRM-style person-level follow-up engine
- automatic live WhatsApp provider integration if credentials/provider path are not ready
- complex workflow routing/assignment dashboards
- unrelated attendance module redesign outside GCK scope

## Proposed Functional Changes

### 1. GCK report categories
Enhance GCK report/session structure so each session can carry a category such as:
- Crusade Sessions
- Ministers’ Conferences
- Impact
- Sunday Worship Service / SHS

### 2. Richer attendance/session fields
For each session, support fields such as:
- date
- program category
- attendance totals
- male/female breakdown where relevant
- visitors count
- converts count
- rededications count
- follow-up-required count

### 3. Follow-up communication preparation
For now, follow-up should be centered on communication outputs.

That means the system should help leadership identify or prepare:
- who should receive follow-up email
- who should receive WhatsApp follow-up
- what message context it belongs to

Depending on the currently available data model, MVP can start with one of these:
- **aggregate/session-level follow-up summary**, or
- **light contact capture for target recipients** tied to the session/report

### 4. Reporting view improvements
Leadership should be able to review:
- sessions by category
- attendance by category
- visitors/converts/rededications by category
- follow-up-related communication targets or counts

## Backend Changes
Primary target:
- `/root/.openclaw/workspace-atlas/dlcf-sw/api/index.php`

Possible data model changes:
- extend `gck_reports`
- extend or normalize `gck_session_entries`
- add lightweight follow-up communication fields/tables if needed

Expected backend tasks:
- accept/store category-aware session data
- expose richer summary/report output
- prepare data needed for email/WhatsApp follow-up actions

## Frontend Changes
Primary targets:
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/GckPage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/pages/GckReportPage.jsx`
- `/root/.openclaw/workspace-atlas/dlcf-sw/web/src/App.jsx`

Expected frontend tasks:
- support category-aware GCK session capture
- show richer report fields cleanly
- expose follow-up communication-related information where useful

## Acceptance Criteria
- GCK session/report flow supports the corrected program categories
- richer attendance/reporting fields are captured and saved
- leadership can view improved GCK reporting by category
- the design direction for follow-up is aligned to email + WhatsApp, not internal manual assignment first
- current GCK submission/report flows do not regress

## Recommended Build Order
1. inspect current GCK data structure and report UI
2. define exact session/category fields for MVP
3. add backend support for upgraded GCK session/report structure
4. update GCK submission UI
5. update GCK reporting UI
6. add follow-up communication preparation/output layer
7. verify scoped access and reporting still behave correctly
