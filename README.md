# Site-OS

Site-OS is a private internal audit operating system for operators. It connects a website to Google Search Console and GA4, runs a live crawl-based audit, and generates findings, pricing guidance, and universal agent prompts for client-ready reports.

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
2. Create a Supabase project and run `supabase/migrations/001_siteos.sql`
3. Configure Google OAuth credentials with these scopes:
   - `https://www.googleapis.com/auth/webmasters.readonly`
   - `https://www.googleapis.com/auth/analytics.readonly`
4. Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/operator`.

## Core flow

1. Create a project
2. Add website URL
3. Connect Google account
4. Pick Search Console property
5. Pick GA4 property
6. Save mapping
7. Run audit
8. Review findings, pricing, architecture gaps, and report output

## Routes

- `/operator`
- `/operator/projects`
- `/operator/projects/[projectId]`
- `/operator/projects/[projectId]/connect`
- `/operator/projects/[projectId]/audit`
- `/operator/projects/[projectId]/pricing`
- `/operator/projects/[projectId]/findings`
- `/operator/projects/[projectId]/findings/[findingId]`
- `/operator/projects/[projectId]/architecture`
- `/operator/projects/[projectId]/settings`
- `/operator/projects/[projectId]/report`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Notes

- Internal operator use only. No client login/signup UI.
- No demo data or fake sample reports.
- No billing, PDF export, or direct CMS writebacks in this MVP.
