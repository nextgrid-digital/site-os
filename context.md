# Site-OS: Google connect flow context

Hand-off doc for a fresh session. Describes the current state of the Google connect flow (GA4, Search Console, Google Ads), the decisions behind it, what is verified, and what is still open. Written against branch `feature/product`.

## 1. Product flow

1. Client signs up and pays (paid tier, $700 audit).
2. On their project's **Setup** page, they click **Connect Google** and sign in with their own Google account.
3. Search Console and GA4 are read from that sign-in once the client allows them. No instructions to add `hello@nextgrid.digital` for these two anymore.
4. **Google Ads uses the MCC method** (decided 2026-10-18, see §5). We send the client an invite from our manager account (MCC). The client accepts it once in Google Ads. Ads is then read with the agency login (`hello@nextgrid.digital`), not the client's sign-in.
5. **Sync** lists the GSC sites, GA4 properties and Ads accounts the connected login can see.
6. The client (or an admin) picks one property per source and clicks **Save mapping**.
7. **Run audit** pulls the data for the mapped sources and builds the report.

Admin view is currently **hard-coded on** for everyone (`isAdminView={true}` in `src/components/audit/spa-tab-panels.tsx`). Intentional for testing; remove later.

## 2. Architecture

- **Next.js 16 (App Router), Supabase (Postgres + auth), googleapis, date-fns.**
- Audit URLs can carry a **project UUID** or an **audit-session id**. Helper: `src/lib/audit/canonical-workspace-redirect.ts`.
- Tabs are an SPA shell. Data loads through `/api/projects/[projectId]/audit-bundle?include=...` into `workspace-audit-store.tsx`.
- Tokens: `google_connections` (one row per project: `access_token`, `refresh_token`, `token_expiry`, `scopes[]`). `operator_email` stores the **connected Google account email** (legacy column name).
- Selected sources: `search_console_properties`, `ga4_properties`, `google_ads_accounts` (each has `is_selected`). `google_ads_accounts.login_customer_id` is the manager (MCC) an account was reached through, or null for direct access (migration `022`).

## 3. Key files

| Area | File |
|---|---|
| OAuth scopes, feature list, missing-feature helper | `src/lib/google/oauth.ts` |
| Operator email (default `hello@nextgrid.digital`, env `OPERATOR_EMAIL`) | `src/lib/google/operator-email.ts` |
| OAuth start / callback | `src/app/api/google/oauth/start/route.ts`, `src/app/api/google/oauth/callback/route.ts` |
| Token refresh | `src/lib/google/fresh-connection.ts` |
| Per-source sync result + loader | `src/lib/google/source-sync.ts` |
| Property sync (Sync button), save selection | `src/lib/db/google.ts` |
| Inventory sync (cached list on connection row) | `src/lib/db/google-inventory.ts` |
| Google Ads API client, listing, analysis | `src/lib/google/ads.ts` |
| Audit run (gates per source on scope) | `src/lib/audit/run-audit.ts` |
| Client instructions card | `src/components/audit/client-google-invite-card.tsx` |
| Connect page UI | `src/components/operator/connect-flow.tsx` |
| Connector cards / statuses | `src/components/audit/connectors/connector-source-cards.tsx`, `src/lib/connectors/status.ts`, `project-status.ts` |
| Connect bundle, properties endpoint | `src/app/api/projects/[projectId]/audit-bundle/route.ts`, `src/app/api/projects/[projectId]/properties/route.ts` |

## 4. Behaviour implemented

- **Connect:** requests `webmasters.readonly`, `analytics.readonly`, `adwords`, `userinfo.email`. Uses `prompt=consent`.
- **Partial consent:** connection is still stored. Setup shows **Grant missing access**.
- **Sync is per source.** Missing scope clears that source's rows. Error keeps last good rows. Saved selection is preserved.
- **Token refresh:** access tokens last 1 hour and refresh silently. "Needs refresh" only on `invalid_grant` or no refresh token.
- **Audit:** a mapped source whose scope was unticked is treated as unmapped for that run. No API call.
- **Google Ads API calls** do not use a developer token. Google sunset developer tokens on 2026-09-09 (checked against developers.google.com, 2026-10-18). Access level (Basic) belongs to the GCP project. Calls use v25 and send `login-customer-id` (our MCC).

## 5. Google Ads: decision and model

**Decision (2026-10-18): MCC method, simplest form.** Ads is read by one agency login through NextGrid's manager account. No per-client sign-in for Ads, no per-project agency connection, no new table.

- **Invite (automated):** on the Connect page the admin or client enters the client's 10-digit Ads ID and clicks Send invite. The app calls `customerClientLinks:mutate` on our MCC with status `PENDING` (`sendAdsInvite`, `src/lib/google/ads.ts`). The client accepts once under Google Ads → Access and security → Managers. Google requires that click.
- **Status:** `ads_invites` (migration `023`) stores one invite per project. `GET /api/projects/[projectId]/ads-invite` re-checks it. Sync also re-checks it (`refreshAdsInvite`). When the link is `ACTIVE`, the account is selected for the project if nothing else is.
- **Read path:** `listAgencyAdsAccounts()` (`src/lib/google/ads.ts`) lists accounts linked under `GOOGLE_ADS_MCC_ID` using the agency token from `GOOGLE_ADS_REFRESH_TOKEN`. Sync and the audit both use it. Requests send `login-customer-id` (our MCC).
- **Audit gate:** an Ads account is read only if its `login_customer_id` equals our MCC. Other accounts are skipped with a log line.
- **Client's Google sign-in** still covers Search Console and GA4. Its Ads scope is still requested but no longer used for Ads. Remove it in a follow-up.
- **Quota:** Basic access is shared by all clients. Each audit makes a few calls per client. Cache where possible. Standard access applies for growth.
- **Parked:** the earlier direct method (client adds `hello@` to their Ads account) is dropped.

**Agency refresh token (one-time):** sign in as `hello@nextgrid.digital` through the app's Connect flow on any project (this asks for consent, so Google returns a refresh token). Copy `refresh_token` from that `google_connections` row into `GOOGLE_ADS_REFRESH_TOKEN`. Revoking that grant in Google breaks Ads until it's redone.

## 6. Setup steps before testing

1. **Apply migrations** in Supabase, in order: `021_client_access_confirmation.sql`, `022_google_ads_login_customer.sql` (required, or Setup sync fails).
2. **`.env.local`** (and Vercel): `GOOGLE_ADS_MCC_ID` (10 digits), `GOOGLE_ADS_REFRESH_TOKEN` (hello@, see §5). No developer token.
   - Apply migration `023_ads_invites.sql`.
3. **Click Sync once per client** after deploying, so existing Ads rows get `login_customer_id`.
6. **"Connected as hello@…" on a client project:** the project used to copy `GOOGLE_ADS_REFRESH_TOKEN` (§5) still holds the hello@ sign-in. Reconnect that project with the client's own Google account. The env token is unaffected.
4. Local dev: `GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/oauth/callback`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
5. Google Cloud: the OAuth consent screen must list the scopes above. In "Testing", refresh tokens expire after 7 days and only test users can sign in.

## 7. Verification status

- `tsc --noEmit`: passing (last run before the 2026-10-18 Ads header change; re-run before merging).
- `npm test`: 72/72 passing.
- **Not verified live:** Google OAuth consent, Sync against real GSC/GA4/Ads data, Ads API calls, Manage button in a browser.

## 8. Known gaps / open items

- **Each client must accept the MCC invite** before their Ads data appears. Until then the invite panel shows PENDING.
- **Invite API is untested live.** The endpoint and request shape come from Google's linking guide (`developers.google.com/google-ads/api/docs/account-management/linking-manager-accounts`). The first real invite confirms it.
- **Cron:** the daily cron job does not re-check invites yet. Status updates on Sync or on opening the Connect page.
- **Ads quota:** account listing and each audit make several calls per client. Watch the Basic-access daily limit.
- **Operator list** (`src/app/operator/page.tsx`) uses raw token expiry, so it can show "needs refresh" for tokens that would refresh silently.
- **"Last synced"** also changes on token refresh (uses `updated_at`). Should use a dedicated sync timestamp.
- **Full-brief gate:** non-admin OAuth start and run-audit require `full_brief_unlocked_at`. Decide the policy.
- **Client view:** `isAdminView` is hard-coded to true.
- **Security (from earlier audit):** projects with no owner (`user_id` null) load audit pages without login. `resolveAuditWorkspace` creates audit sessions on GET.
- **Naming:** `operator_email` column holds the connected account email; rename is a follow-up migration.
- **Bugs reported by the user on 2026-10-18:** not yet listed in this doc. Add them here as they're reported.

## 9. Conventions for this repo

- Read `AGENTS.md`: this is Next.js 16 with breaking changes. Check `node_modules/next/dist/docs/` before writing code.
- Tests: `npm test`. Typecheck: `npx tsc --noEmit -p tsconfig.json`.
- In zsh, quote globbed paths (`"src/app/api/projects/[projectId]/..."`).
- Commit messages and PRs: end with the attribution lines specified in the session instructions.
