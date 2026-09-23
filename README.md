# Site-OS

Site-OS is a self-serve website audit product. Anyone can paste a URL for a free crawl-based
audit; signing in unlocks the full report, and connecting Google Search Console, GA4, and Google
Ads unlocks a connected audit with real performance data, findings, pricing guidance, and
universal agent prompts for client-ready reports. An internal `/operator` console also exists for
running and managing audits directly.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Supabase
- Google OAuth

## Setup

1. Copy `env.example.txt` to `.env.local`
2. Create a Supabase project and run all migrations in `supabase/migrations/` in order (see
   `docs/auth-setup.md` for required Supabase Auth dashboard settings)
3. Configure Google OAuth credentials with these scopes:
   - `https://www.googleapis.com/auth/webmasters.readonly`
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `https://www.googleapis.com/auth/adwords`
4. Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the public product, or `http://localhost:3000/operator` for the
internal console.

## Core flow (self-serve)

1. Paste a website URL for a free crawl audit — no signup required
2. Sign up / log in (email+password or Google) to unlock the full free report
3. Connect Google Search Console, GA4, and/or Google Ads to unlock the connected audit
4. Run the audit and review findings, pricing guidance, architecture gaps, and the report

## Routes

- `/` — marketing/landing + free audit entry point
- `/app` — signed-in project list
- `/audit/[projectId]` — audit workspace (overview, findings, connect, report, etc.)
- `/operator/*` — internal console for running/managing audits directly

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Notes

- Every project and Google connection is scoped to the owning account; see
  `supabase/migrations/018_project_ownership.sql` and `019_tighten_rls_policies.sql`.
- No demo data or fake sample reports.
- Payment/billing (Paddle) is not yet integrated — see the project roadmap for sequencing.
