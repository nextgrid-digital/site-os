# Link audit report

Scope: signed-in product UI, operator UI, login/auth/account pages, public nav/footer and home page.
Method: static read of every `href`, `Link`, `onClick`, `router.*`, `fetch()`, form submit and nav config array, each checked against the route files and the exported HTTP methods under `src/app`.

## Snapshot caveat (read first)

The working tree was being edited while this audit ran (about 213 changed or deleted files vs `HEAD` 6ac4f78: Work, Leads, Pricing, Billing, Upgrade, plan toggle, `/operator/projects/*`, `/audit/[id]/{overview,evidence,findings,work,leads,...}`, `navbar.tsx`, `product-grid-section2.tsx` and their API routes were deleted).
This report describes the tree as of about 13:51 local on 2026-10-19. Files were still changing in the last minute (`account/billing/page.tsx`, `joined-traffic-report.tsx`), so re-run the check after the removal work settles.
Routes that exist now: `/`, `/privacy`, `/terms`, `/refund-policy`, `/login`, `/auth/update-password`, `/app`, `/audit`, `/audit/[id]`, `/audit/[id]/{workflow,brief,monthly,connect,intake}`, `/account`, `/account/password`, `/account/billing`, `/operator`.

Classification notes:
- A redirect target is checked as a route, not as a page that renders content.
- Components that nothing imports (dead code) were found with an import-graph walk. The tree now has none left in `components/audit` or `components/operator`.
- Items about Leads, Work, Pricing, Billing and Upgrade are tagged scheduled-removal. Their links to removed routes are already gone from the code.

## Status after fixes (2026-10-19, re-checked against the current code)

All 14 NOT WORKING items below were fixed. `tsc` passes after the changes.

| Item | Was | Now |
| --- | --- | --- |
| Operator site card and add-site redirect (`site-card.tsx`, `add-site-dialog.tsx`) | `/audit/[id]/overview` (deleted) | `/audit/[id]/workflow` (Dashboard) |
| Footer and FAQ "Sign in" / "Sign in for full report" / "Sign in to audit" (`content.ts`, `faq-section.tsx`) | `/audit` (redirects to `/`) | `/login` |
| Footer "Get help" (`content.ts`) | `/audit` | `mailto:` support address from `SITE_CONFIG` |
| "Start free audit", "Paste a URL", footer CTA | `/#` (empty hash) | `/` |
| Footer and nav "How it works" / "Work orders" | `/#how-it-works` (no element with that id exists) | `/` |

Not changed, by decision:
- Scheduled-removal items: the "Billing" links point to `/account/billing`, which still exists as a free-plan info page.
- Product gap, not a broken link: in Setup, a non-admin client with no Google connection has no "Connect Google" button. The button is inside the admin-only block. Decide whether clients should get one.
- Orphan pages: `/audit/[id]/intake` has no inbound link. `/operator` is reached by URL only. `/auth/update-password` is reached from the reset email.
- The six API routes with no UI caller and the three `console.log` calls were noted by the audit and not touched.

The sections below are the original audit output. Where they disagree with this status section, this status section is current.

## 1. Summary counts

| Result | Count |
|---|---|
| Total checked (one per clickable element or nav item) | 178 |
| WORKING | 160 |
| NOT WORKING | 14 |
| scheduled-removal | 4 |

The NOT WORKING count has two parts. Two items are hard failures (404 after click). The other 12 are marketing links that do not do what their label says (see "Unsure" at the end).

## 2. NOT WORKING items

| file:line | element | target / handler | why it fails |
|---|---|---|---|
| src/components/operator/site-card.tsx:58 | Operator site card (whole card) | `Link href=/audit/${site.id}/overview` | `app/(product)/audit/[projectId]/overview/page.tsx` was deleted. No other route matches, so it 404s. This is the only way into a project from `/operator`. |
| src/components/operator/add-site-dialog.tsx:54 | "Add website" submit (operator) | `router.push(/audit/${id}/overview)` after `POST /api/projects` | The POST works, but the redirect target `/overview` no longer exists, so the admin lands on a 404 right after creating a site. |
| src/components/marketing/site-os/content.ts:178 | Footer "Sign in" | `/audit` | `app/(product)/audit/page.tsx:5` does `redirect('/')`. The click returns to the home page and never reaches a sign-in form. |
| src/components/marketing/site-os/content.ts:186 | Footer "Sign in" | `/audit` | Same as above. |
| src/components/marketing/site-os/content.ts:240 | Footer "Sign in" | `/audit` | Same as above. |
| src/components/marketing/site-os/content.ts:266 | Footer "Get help" | `/audit` | Same redirect to `/`. It is not a help page. |
| src/components/marketing/site-os/content.ts:275 | Footer "Sign in for full report" | `/audit` | Same redirect to `/`. |
| src/components/marketing/site-os/content.ts:289 | Footer "Sign in" | `/audit` | Same redirect to `/`. |
| src/components/marketing/site-os/sections/faq-section.tsx:48 | FAQ "Sign in to audit" | `href="/audit"` | Same redirect to `/`. |
| src/components/marketing/site-os/content.ts:188 | Footer "Start free audit" | `/#` | Empty hash. It only scrolls to the top (see "Unsure"). |
| src/components/marketing/site-os/content.ts:239 | Footer "Start free audit" | `/#` | Same. |
| src/components/marketing/site-os/content.ts:274 | Footer "Paste a URL" | `/#` | Same. |
| src/components/marketing/site-os/content.ts:290 | Footer "Start free audit" | `/#` | Same. |
| src/components/marketing/site-os/sections/footer.tsx:35 | Footer banner CTA "Start free audit" | `href="/#"` | Same. |

Dead items (not counted): `content.ts:12` and `content.ts:10-13` (`listRowData`, including a `/audit` "Sign in") fed `sections/navbar.tsx`, which has been deleted. Nothing imports `listRowData` now.

## 3. WORKING items (grouped)

Status is WORKING unless marked scheduled-removal (SR).

### Public nav, home, footer
| file:line | element | target | status |
|---|---|---|---|
| src/components/audit/site-nav.tsx:41 | Logo | `/` | WORKING |
| src/components/audit/site-nav.tsx:70 | "How it works" | `/#how-it-works` (id at `sections/product-grid-section.tsx:9`) | WORKING |
| src/components/audit/site-nav.tsx:70 | "FAQ" | `/#faq` (id at `sections/faq-section.tsx:31`) | WORKING |
| src/components/audit/site-nav.tsx:87 | "Sign in" | `/login?next=/app` | WORKING |
| src/components/audit/home-audit-form.tsx:71 (via `hero-audit-ctas.tsx`) | Hero "Start free audit" form | `POST /api/audit/start` then `router.push(/audit/{id})` | WORKING |
| src/components/marketing/site-os/content.ts:69-72 (rendered by `everything-you-need-section.tsx`) | 4 feature-card links | `/#how-it-works`, `/login?next=/app`, `/#audit` (hero id at `hero-section.tsx:116`), `/#faq` | WORKING x4 |
| src/components/marketing/site-os/content.ts:176-177, 187, 206-208, 216-220, 228, 230-231, 241-242, 250-252, 260-265, 276-281, 291-293 (minus the `/#` and `/audit` rows above) | Footer column links | `/#how-it-works`, `/#faq` | WORKING x34 |
| src/components/marketing/site-os/content.ts:196-198 | Privacy / Terms / Refund | `/privacy`, `/terms`, `/refund-policy` | WORKING x3 |
| src/components/marketing/site-os/sections/footer.tsx:126, 131 | External credits | onmy.land, lexingtonthemes.com (not fetched) | WORKING x2 |
| src/components/marketing/site-os/content.ts:229, 293 | Footer "Work orders" (x2) | `/#how-it-works` | SR (label names the Work feature; link itself resolves) |

The footer counts above rely on `content.ts` row numbers. All `/#how-it-works`, `/#faq` and `/#audit` anchors have a matching element id on the home page.

### Signed-in header and account
| file:line | element | target | status |
|---|---|---|---|
| src/components/audit/user-account-menu.tsx:54 | "Dashboard" menu toggle | state toggle | WORKING |
| src/components/audit/user-account-menu.tsx:72 | Dashboard | `/app` | WORKING |
| src/components/audit/user-account-menu.tsx:80 | Account | `/account` | WORKING |
| src/components/audit/user-account-menu.tsx:88 | Billing | `/account/billing` (page now a static "Free for every account" stub) | SR |
| src/components/audit/user-account-menu.tsx:98 | Sign out | `POST /api/auth/logout` (POST exported), then `router.push('/')` | WORKING |
| src/components/audit/account-nav.tsx:36 | Account information / Password | `/account`, `/account/password` | WORKING x2 |
| src/components/audit/account-nav.tsx:36 | Billing | `/account/billing` | SR |
| src/components/audit/account-nav.tsx:51 | Sign out | `POST /api/auth/logout` | WORKING |
| src/components/audit/account-info-form.tsx:34 | Save name | `supabase.auth.updateUser` (client SDK) | WORKING |
| src/components/audit/password-form.tsx:48 | Update password | `supabase.auth.updateUser`, validates length and match | WORKING |
| src/components/theme-mode-toggle.tsx (in `app-shell.tsx` footer and `operator/layout.tsx`) | System / Light / Dark (x3 per place, 2 places) | `setTheme` | WORKING x6 |

### Login and auth
| file:line | element | target | status |
|---|---|---|---|
| src/components/audit/auth-sign-in-gate.tsx:187 | Sign in / Sign up tabs | `switchMode` | WORKING |
| src/components/audit/auth-sign-in-gate.tsx:194 | Email submit | `POST /api/auth/login` or `/api/auth/signup`, then `router.push(next)` | WORKING |
| src/components/audit/auth-sign-in-gate.tsx:213 | Forgot password? | `switchMode('forgot')` | WORKING |
| src/components/audit/auth-sign-in-gate.tsx:149 | Send reset link | `POST /api/auth/forgot-password` | WORKING |
| src/components/audit/auth-sign-in-gate.tsx:166 | Back to sign in | `switchMode('signin')` | WORKING |
| src/components/audit/auth-sign-in-gate.tsx:270 | Continue with Google | Supabase OAuth, redirect `/auth/callback` (GET exists) | WORKING |
| src/app/auth/update-password/update-password-form.tsx:116 | Save password | `supabase.auth.updateUser`, then `router.replace('/app')` | WORKING |
| src/app/auth/update-password/update-password-form.tsx:156 | Back | `router.back()` | WORKING |

### /app (Your sites)
| file:line | element | target | status |
|---|---|---|---|
| src/components/audit/add-site-audit-dialog.tsx:79 | "Add site" trigger (also in empty state) | opens dialog | WORKING |
| src/components/audit/add-site-audit-dialog.tsx:88 | "Analyze website" submit | `POST /api/audit/start`, then `router.push(/audit/{id})` | WORKING |
| src/components/audit/site-card.tsx:88 | Site card | `/audit/{sessionId}/workflow` | WORKING |
| src/components/audit/site-card.tsx:126 | Delete icon | opens confirm dialog | WORKING |
| src/components/audit/site-card.tsx:155 | Cancel | closes dialog | WORKING |
| src/components/audit/site-card.tsx:163 | Delete | `DELETE /api/projects/{id}` (DELETE exported) | WORKING |

### Audit workspace shell and tabs (`/audit/[id]/*`)
| file:line | element | target | status |
|---|---|---|---|
| src/components/audit/audit-workspace-tabs.tsx:107-123 | Tabs Dashboard / Brief / Monthly / Setup | `setTab` (pushState) to `/workflow`, `/brief`, `/monthly`, `/connect`; all four page.tsx exist | WORKING x4 |
| src/components/audit/rerun-full-audit-button.tsx:139 | Re-run full audit (tabs bar and Monthly panel, `monthly-review-panel.tsx:32`) | `POST /api/projects/{id}/run-audit`, polls `GET /api/audit/{id}/status` | WORKING x2 |
| src/components/audit/rerun-free-audit-button.tsx:51 | Re-run audit | `POST /api/audit/start`, then `router.push` | WORKING |
| src/components/audit/audit-running-panel.tsx:73 | Back to workspace | `clearError` | WORKING |
| src/components/audit/workspace-audit-store.tsx:137, 161 | Tab data loads | `GET /api/projects/{id}/audit-bundle` | WORKING x2 |
| src/components/audit/report/brand/brand-section-nav.tsx:117 | Mobile section pills (8) | `#overview #channels #inventory #pages #search #ads #funnel #issues`; each id exists in `joined-traffic-report.tsx:323-476` and `brand-ads-section.tsx:23` | WORKING x8 |
| src/components/audit/report/brand/brand-section-nav.tsx:150 (via `motion/preview-rail.tsx`) | Desktop section rail (8) | same hashes | WORKING x8 |
| src/components/audit/report/brand/brand-section-nav.tsx:176 | "Open Setup" | `/audit/{id}/connect` | WORKING |
| src/components/audit/dashboard/dashboard-source-strip.tsx:47 | "Setup" (SoftAuditTabLink) | `/audit/{id}/connect`, pushState | WORKING |
| src/components/audit/report/joined/joined-traffic-report.tsx:369 | Channels / Keywords toggle | `setSecondaryTab` | WORKING x2 |
| src/components/operator/report-pdf-button.tsx:66 (used in `client-workflow-brief.tsx:43`) | Download PDF | html2canvas + jsPDF on `#client-workflow-brief` (id exists) | WORKING |
| src/components/audit/workflow/client-workflow-brief.tsx:160 | Brief "Dashboard" link | `/audit/{id}/workflow`, soft tab switch | WORKING |

### Setup tab (connect-flow)
| file:line | element | target | status |
|---|---|---|---|
| src/components/operator/connect-flow.tsx:238 | View Brief | `/audit/{id}/brief` | WORKING |
| src/components/operator/connect-flow.tsx:241 | Your sites | `/app` | WORKING |
| src/components/operator/connect-flow.tsx:253 | Grant missing access | `GET /api/google/oauth/start?projectId=` | WORKING |
| src/components/operator/connect-flow.tsx:348, 355 | Reconnect Google / Connect Google | `GET /api/google/oauth/start` | WORKING x2 |
| src/components/operator/connect-flow.tsx:373 | Sync | `POST /api/projects/{id}/properties`; disabled until Google connected, then enabled | WORKING |
| src/components/operator/connect-flow.tsx:389, 410, 433 | GSC / GA4 / Ads selects | state | WORKING x3 |
| src/components/operator/connect-flow.tsx:457 | Save mapping | `POST /api/projects/{id}/properties`; disabled until Google connected | WORKING |
| src/components/audit/connectors/connector-source-cards.tsx:121 | Manage | scrolls to ids `gsc`, `ga4`, `ads`, `google-account` (all exist in connect-flow) | WORKING |
| src/components/operator/ads-invite-panel.tsx:33 | Invite status load | `GET /api/projects/{id}/ads-invite` | WORKING |
| src/components/operator/ads-invite-panel.tsx:85 | Send invite | `POST /api/projects/{id}/ads-invite` | WORKING |
| src/components/audit/client-google-invite-card.tsx:56 | Copy | clipboard write | WORKING |

### /audit/[id]/intake
| file:line | element | target | status |
|---|---|---|---|
| src/components/operator/settings-form.tsx:111 | Save website | `PATCH /api/projects/{id}` | WORKING |
| src/components/operator/settings-form.tsx:247 | Save architecture inputs | `POST /api/projects/{id}/architecture-inputs` | WORKING |
| src/components/operator/settings-form.tsx:274 | Add note | `POST /api/projects/{id}/notes`; disabled only while empty | WORKING |

### Operator (`/operator`)
| file:line | element | target | status |
|---|---|---|---|
| src/components/operator/operator-topbar.tsx:41 | Logo | `/operator` | WORKING |
| src/components/operator/operator-topbar.tsx:57 | Dashboard / Brief / Setup pills | `/audit/{id}/workflow`, `/brief`, `/connect` | WORKING x3 |
| src/components/operator/operator-topbar.tsx:80 | How it works / FAQ | `/#how-it-works`, `/#faq` | WORKING x2 |
| src/components/operator/operator-topbar.tsx:92 | Your sites | `/app` | WORKING |
| src/components/operator/operator-sign-out.tsx:32 | Sign out | `POST /api/auth/logout`, then `router.push('/')` | WORKING |
| src/components/operator/add-site-dialog.tsx:60 | "Add site" trigger | opens dialog | WORKING |

### Error, not-found and legal pages
| file:line | element | target | status |
|---|---|---|---|
| src/app/error.tsx:26, 27 | Try again / Go home | `unstable_retry` (documented in Next 16 `error.md`), `/` | WORKING x2 |
| src/app/global-error.tsx:26 | Try again | `unstable_retry` | WORKING |
| src/app/not-found.tsx:11 | Go home | `/` | WORKING |
| src/app/(product)/audit/[projectId]/error.tsx:26, 27 | Try again / Back to projects | `unstable_retry`, `/app` | WORKING x2 |
| src/app/privacy/page.tsx:14, 78, 93, 154 | Back, 2 Google links, mailto | `/`, external, `mailto:` | WORKING x4 |
| src/app/terms/page.tsx:14, 65, 128 | Back, Privacy link, mailto | `/`, `/privacy`, `mailto:` | WORKING x3 |
| src/app/refund-policy/page.tsx:14, 63, 94, 126 | Back, 3 mailto | `/`, `mailto:` | WORKING x4 |

### Server-side redirects
| file:line | element | target | status |
|---|---|---|---|
| src/app/(product)/app/page.tsx:16, 26 | Redirects | `/`, `/login?next=/app` | WORKING x2 |
| src/app/(product)/audit/page.tsx:5 | Redirect | `/` | WORKING |
| src/app/(product)/audit/[projectId]/page.tsx:15 | Redirect | `/audit/{id}/workflow` | WORKING |
| src/app/(product)/account/{page,password/page,billing/page}.tsx:16 | Redirects | `/login?next=...` | WORKING x3 |
| src/app/operator/layout.tsx:14, 17 | Redirects | `/login?next=/operator`, `/app` | WORKING x2 |

## 4. Routes that exist but are not linked from anywhere

| page file | note |
|---|---|
| src/app/(product)/audit/[projectId]/intake/page.tsx | No inbound link found. Before the cleanup `/operator/projects/[id]/settings` redirected here; that route is gone. Reachable by typing the URL only. Its three save buttons work. |
| src/app/operator/page.tsx | No link from the product UI. The only way in is typing `/operator` (admins only). The topbar logo links to itself. |
| src/app/auth/update-password/page.tsx | Reached only through the emailed reset link (`api/auth/forgot-password` then `/auth/callback?next=...`). Expected, not a bug. |
| src/app/(product)/audit/page.tsx | Linked only by the footer and FAQ "Sign in" links, and it just redirects to `/`. |

API routes with no UI caller (not pages, listed for cleanup): `POST /api/audit/verify`, `POST /api/audit/[projectId]/intake`, `PATCH /api/projects/[projectId]/findings/[findingId]`, `POST /api/projects/[projectId]/confirm-access`, `GET /api/projects`, `GET /api/projects/[projectId]`.
Leftover debug output: `console.log` at `connect-flow.tsx:193`, `run-audit/route.ts:33`, `properties/route.ts:16`.

## 5. Unsure / judgment calls

- Footer and FAQ "Sign in" links to `/audit` (7 items): the route exists, so by a strict route rule they would be WORKING. I marked them NOT WORKING because the page redirects to `/`, so a signed-out visitor never sees a sign-in screen. Point them at `/login?next=/app` to fix.
- `/#` links labelled "Start free audit" or "Paste a URL" (5 items): they land on the home page top, where the hero audit form is, so they may be acceptable. They were marked NOT WORKING under the empty-hash rule. `/#audit` would be the precise target.
- The audit workspace is still being edited. The operator pills and tabs now match (Dashboard, Brief, Monthly, Setup), but `/audit/{id}/work` and `/leads` no longer exist; nothing links to them any more.
- `connect-flow.tsx` now passes `isAdminView={connect?.isAdmin ?? false}`. For a non-admin client with no Google connection there is no "Connect Google" button (it sits in the admin-only block); they only see the status text and the invite card. That is a product gap, not a broken link.
- External links (`privacy/page.tsx:78, 93`, footer credits) were not fetched.
