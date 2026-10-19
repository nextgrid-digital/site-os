# Site-OS Architecture

Last reviewed: 2026-10-19. This describes the code as it stands after the pricing, paywall, Leads and Work removal.

## 1. What the app does

Site-OS audits a company website and, when the owner connects Google, the site's own analytics:

1. **Free audit (crawl-only).** The owner enters a website. The crawler reads the public site, and the AI layer scores it and produces findings and a teaser report.
2. **Connected audit (full).** The owner connects Google (Search Console, GA4, and Google Ads through the agency MCC). Findings are joined with real search and traffic data, and a growth brief is produced.
3. **Dashboard, Brief, Monthly.** These read the latest completed audit. The Brief is the client-ready memo. Monthly compares the latest audit with the previous one.
4. **Operator area (`/operator`).** Admin-only. Lists projects and shows admin tools.

There is no paid tier. Google Search Console, GA4 and the Dashboard are free for every signed-in user. Google Ads is kept as it was.

## 2. Stack and runtime

| Concern | Technology | Where |
| --- | --- | --- |
| Web app | Next.js 16 App Router, React 19, TypeScript | `src/app`, `src/components` |
| Styling and UI | Tailwind CSS 4, shadcn-style primitives, Base UI | `src/app/globals.css`, `src/components/ui` |
| Auth and database | Supabase (Postgres, Auth, RLS) via `@supabase/ssr` and `@supabase/supabase-js` | `src/utils/supabase`, `src/lib/supabase` |
| Google APIs | OAuth 2.0, Search Console, GA4 Data API, Google Ads REST (GAQL) through the MCC | `src/lib/google` |
| AI | Gemini, used for scoring, AEO analysis and finding text | `src/lib/ai/gemini.ts`, `src/lib/aeo` |
| Crawling | `cheerio` HTML parsing, sitemap discovery | `src/lib/crawl` |
| Scheduled job | GitHub Actions runs a Supabase keepalive every 3 days | `.github/workflows/supabase-keepalive.yml`, `scripts/cron.js` |
| Hosting | Vercel (production origin set in `NEXT_PUBLIC_APP_URL`) | `src/lib/app-url.ts` |

Tests use `node:test` through `tsx`: `npm test` runs `src/lib/**/*.test.ts`.

## 3. Layers

```
Browser ──► App Router pages (src/app)
              │   server components load data directly (cookies → Supabase user)
              │   client components call /api routes or the audit-bundle endpoint
              ▼
          Route handlers (src/app/api)  ──► access checks (lib/db/profiles, lib/db/projects)
              │
              ▼
          Domain modules (src/lib)
              ├─ audit/      run-audit pipeline, findings, scoring, funnel and story builders
              ├─ crawl/      site crawler and sitemaps
              ├─ evidence/   brand evidence record (historical diffs)
              ├─ graph/      buyer-path graph, programmatic opportunities, work orders
              ├─ google/     OAuth, GSC, GA4, Ads clients and token refresh
              ├─ connectors/ per-source status and sync adapters
              ├─ reports/    growth brief and report builders
              ├─ workflow/   work items (open issues) and monthly comparison
              └─ db/         Supabase queries grouped by aggregate
                    │
                    ▼
          Supabase Postgres (service-role client for server writes; RLS for the rest)
```

Components are grouped by surface: `components/marketing` (public landing), `components/audit` (customer workspace), `components/operator` (admin), `components/ui` (primitives).

## 4. Route map

### Public
| Path | Purpose |
| --- | --- |
| `/` | Landing page and free audit entry |
| `/login`, `/auth/update-password`, `/auth/callback` | Sign-in, password reset, OAuth return |
| `/privacy`, `/terms`, `/refund-policy` | Legal pages |

### Customer workspace (signed in)
| Path | Purpose |
| --- | --- |
| `/app` | Customer's sites list (`sites-dashboard`) |
| `/audit` | Legacy entry, redirects to `/` |
| `/audit/[projectId]` | Redirects to `/audit/[projectId]/workflow` |
| `/audit/[projectId]/workflow` | **Dashboard tab**: connected metrics and traffic report |
| `/audit/[projectId]/brief` | **Brief tab**: client memo and open issues |
| `/audit/[projectId]/monthly` | **Monthly tab**: comparison with the previous audit |
| `/audit/[projectId]/connect` | **Setup tab**: Google connection and property mapping |
| `/audit/[projectId]/intake` | Client requirements and notes |
| `/account`, `/account/password`, `/account/billing` | Account settings. Billing explains that GA4, Search Console and the Dashboard are free. |

The four primary tabs are one client shell (`audit-tab-keep-alive.tsx`). Tab switches use `history.pushState` and never run a server navigation. The route files under `/audit/[projectId]/*` only exist so direct links resolve to the shell.

### Operator (admin only)
| Path | Purpose |
| --- | --- |
| `/operator` | Project list with admin status and Google connection state |

`src/app/operator/layout.tsx` checks `profiles.is_admin` and redirects everyone else to `/app`.

### API routes
| Route | Purpose |
| --- | --- |
| `POST /api/auth/{login,signup,logout}`, `POST /api/auth/forgot-password` | Auth actions |
| `POST /api/audit/start` | Create a project from a URL and start the free audit |
| `GET /api/audit/[projectId]/status` | Poll audit progress |
| `POST /api/audit/[projectId]/intake` | Save intake answers |
| `GET /api/google/oauth/start`, `GET /api/google/oauth/callback` | Google connection flow |
| `POST /api/projects` (admin only), `GET,PATCH,DELETE /api/projects/[projectId]` | Operator project creation; project read, update, delete |
| `GET /api/projects/[projectId]/audit-bundle?include=…` | Slices for the workspace shell (dashboard, brief, monthly, connect) |
| `POST /api/projects/[projectId]/run-audit` | Run a free or connected audit |
| `POST /api/projects/[projectId]/confirm-access` | Client confirms the agency has access to their Google properties |
| `GET,POST /api/projects/[projectId]/properties` | Read and select GSC / GA4 / Ads properties |
| `GET,POST /api/projects/[projectId]/ads-invite` | Google Ads invite state and sending the invite |
| `POST /api/projects/[projectId]/notes`, `POST /api/projects/[projectId]/architecture-inputs` | Operator notes and architecture inputs |
| `PATCH /api/projects/[projectId]/findings/[findingId]` | Update a finding's workflow status |

## 5. Core flows

**Free audit.** `POST /api/audit/start` finds or creates the project for the domain, then calls `runAudit(projectId, 'free')`. The crawler reads the site, the AI layer scores it, and `finalizeAuditRun` writes the audit run, findings, agent prompts and a teaser snapshot.

**Connect Google.** `/api/google/oauth/start` redirects to Google with the scopes in `lib/google/oauth.ts`. The callback stores tokens in `google_connections`. Setup lists the accessible properties and the user selects them. Google access is checked per property.

**Connected audit.** `POST /api/projects/[id]/run-audit` runs `runAudit(projectId, 'full')`. The pipeline:
1. Loads the project, website, selected properties and the Google connection.
2. Refreshes the access token if it is near expiry. Free audits never block on Google.
3. In parallel: crawls the site, pulls GSC rows, GA4 pages and conversions, and Ads campaigns (only for accounts linked under the MCC).
4. Builds the brand evidence record and compares it with the previous one.
5. Generates findings, architecture recommendations, the growth brief and the commercial graph.
6. `finalizeAuditRun` persists everything and marks the run completed.

**Workspace reads.** Server components seed the first render from `loadDashboardMetricsForProject`. Every later read goes through `/api/projects/[id]/audit-bundle`, which returns only the slices the tab asks for. `workspace-audit-store.tsx` merges slices and keeps values it already has when a response omits a slice.

**Brief and Monthly.** Both use `getAuditWorkBundle` (findings, work orders, prompts) and build unified work items in `lib/workflow/work-items.ts`. Brief lists the open items. Monthly compares them with the previous run through `lib/workflow/monthly-compare.ts`.

## 6. Data model

Tables are created by `supabase/migrations/001…023` and the dated migration. TypeScript types are in `src/lib/supabase/types.ts`.

| Group | Tables |
| --- | --- |
| Accounts and access | `profiles` (incl. `plan`, `is_admin`), `projects` (incl. `user_id`, `client_access_confirmed_at`, `full_brief_unlocked_at`), `audit_sessions`, `audit_access_codes` |
| Sites | `websites`, `page_metrics`, `query_metrics`, `architecture_inputs`, `client_intake`, `notes` |
| Google | `google_connections`, `search_console_properties`, `ga4_properties`, `google_ads_accounts`, `ads_invites`, `external_sources` |
| Audits | `audit_runs`, `audit_metrics`, `findings`, `architecture_recommendations`, `agent_prompts`, `technical_observations`, `report_exports` |
| Evidence | `brand_evidence_snapshots`, `evidence_records`, `brand_claims`, `brand_claim_evidence`, `brand_associations`, `brand_contradictions`, `historical_changes`, `competitor_observations`, `company_identity_fields`, `company_descriptions`, `content_coverage`, `buyer_question_coverage`, `prompt_runs` |
| Graph and programmatic | `graph_entities`, `graph_relationships`, `graph_gaps`, `graph_summaries`, `buyer_paths`, `graph_work_orders`, `programmatic_opportunities`, `aeo_analyses` |
| Retired, still in the database | `leads` and lead status history (migration 010), `pricing_plans` |

**Retained but no longer read or written by app code.** `profiles.plan`, `projects.full_brief_unlocked_at`, `pricing_plans`, and the lead tables. The owner chose to keep these so a later migration can remove them once they are no longer needed. No migration was added in this change.

## 7. Access control

- **Sign-in.** Supabase Auth through `@supabase/ssr`. `src/proxy.ts` refreshes the session cookie. The `(product)` layout and the operator layout check the user.
- **Project ownership.** `projects.user_id` (migration 018). `requireProjectOwner` and `requireProjectAccess` in `lib/db/projects.ts` gate reads and writes for a project.
- **Admin.** `profiles.is_admin` (migration 020). `requireAdminSession` gates the operator area. The Setup panel shows operator-only controls only to admins (`connect.isAdmin`).
- **Plans.** None. Any signed-in owner can connect Google and run connected audits.
- **One rule for project access.** `canAccessProject` in `lib/db/project-access.ts` decides every project read and write, in both API routes (`requireProjectAccess`) and audit pages (`resolveAuditWorkspace`). The owner may. An admin may. A project with no owner (an anonymous free audit) may only be used by the browser that started it, identified by the `audit_session_id` cookie matching an audit session for that project.
- **Writes from the server.** Use the service-role client (`getSupabaseAdmin`). It is never sent to the browser. Only `NEXT_PUBLIC_*` values are exposed.

## 8. Google integration

- **OAuth scopes** (`lib/google/oauth.ts`): Search Console read-only, Analytics read-only, Google Ads read-only, and the email scope. `getMissingGoogleFeatures` reports any scope the user did not grant.
- **Operator account.** `OPERATOR_EMAIL` names the agency Google account that clients invite. It must be set. When it is unset, `getOperatorEmail()` returns `null` and the UI shows no invite address.
- **Google Ads.** Read through the agency login and the MCC (`GOOGLE_ADS_MCC_ID`, `GOOGLE_ADS_REFRESH_TOKEN`). Each client account is linked under the MCC by an invite the client accepts. Requests send `login-customer-id`. Unchanged by this work.

## 9. Configuration

Names only. Values are in `.env.local` (local) and the Vercel project (production). The template is `env.example.txt`.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server writes; keepalive job |
| `NEXT_PUBLIC_APP_URL` | Public origin for OAuth and absolute links |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google OAuth |
| `OPERATOR_EMAIL` | Agency Google account clients invite |
| `GOOGLE_ADS_MCC_ID`, `GOOGLE_ADS_REFRESH_TOKEN` | Google Ads through the MCC |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS`, `GEMINI_BASE_URL` | AI layer |

## 10. Configuration values in code

Brand and contact values live in one place where possible:
- Support email: `src/lib/site-config.ts` (`SITE_CONFIG.supportEmail`).
- Operator Google account: environment only (`OPERATOR_EMAIL`).
- Google OAuth scope URLs: `src/lib/google/oauth.ts`.

## 11. Removed in this change

- Pricing: tiers and prices, the pricing page, the pricing recommendation and `pricing_plans` writes, the commercial pricing block in the Brief.
- Paywall and billing: Paddle checkout and webhook, the billing plan list, upgrade banners and CTAs, plan toggles, the admin plan override, and the `unlock-full-brief` flow.
- Leads: the Leads tab and page, the lead table and funnel, lead API routes, lead data loaders, and the Leads section of the Dashboard.
- Work: the Work tab and page, Work Orders pages, the work-item queue, the work-order status API, and Work links from Dashboard, Brief and Monthly.
- Legacy: redirect-only route stubs (`architecture`, `evidence`, `findings`, `graph`, `growth`, `journey`, `overview`, `systems`, and the operator project tree), the legacy report views and their components, the unused shadcn primitives, and modules nothing imported (found by reachability from the app entry points).

## 12. Open items

- Legal pages (`/terms`, `/refund-policy`, `/privacy`) still describe paid plans and Paddle payments. They need a rewrite once the owner confirms the policy.
- Marketing content still mentions Paddle as a logo and uses `/pricing` in demo analytics. These are not links.
- `.env.local` still holds `PADDLE_*` values. They are unused and can be deleted.
- Many exported helpers and types have no callers. A full unused-export pass is still to do.
- Marketing SVG and motion files still carry `@ts-nocheck`.
- Migration 024 closes the open `siteos_operator_all` policies. It is written but not applied. Run it in Supabase.
- Dropping the retired tables and columns needs a migration. Plan that after the owner confirms no data is needed.
