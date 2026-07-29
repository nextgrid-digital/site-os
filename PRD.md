# Site-OS — Product Requirements Document

## Overview

**Site-OS** is a private, internal SEO audit operating system built for **Nextgrid Digital**. It enables operators to connect client websites to Google Search Console and GA4, run automated crawl-based audits, build a commercial knowledge graph, generate AI-powered findings, and produce client-ready growth briefs with pricing recommendations.

**Target user:** Internal SEO operators/consultants at Nextgrid Digital (no client-facing login).

---

## Problem Statement

SEO audits are time-intensive, fragmented across tools, and inconsistent between operators. Producing a client-ready report with actionable findings, pricing guidance, and a clear growth strategy requires manually stitching together crawler output, Google property data, and subjective analysis.

Site-OS consolidates the entire audit-to-report pipeline into a single operator workflow, augmented by AI for analysis and content recommendations.

---

## Core Workflow

```
Create project → Add website URL → Connect Google (GSC + GA4)
→ Select properties → Run audit → Review findings, graph, pricing
→ Generate growth brief → Share report with client
```

---

## Features

### 1. Project Management

- Create and archive projects, each tied to one website
- Project intake form capturing ICP, offers, proof assets, business type, and conversion goals
- Operator notes per project

### 2. Google Connect

- OAuth 2.0 flow linking Google Search Console and GA4
- Property selection (choose which GSC site and GA4 property to analyze)
- Automatic token refresh with graceful degradation on expiry

### 3. Site Crawler

- Cheerio-based crawler (configurable max pages)
- Extracts: page titles, meta descriptions, H1s, FAQ schemas, internal links, text excerpts
- Runs independently of Google data (supports site-only analysis)

### 4. Audit Engine

- Combines crawl data + GSC query/page performance + GA4 session data
- Generates scored findings with:
  - Type and category classification
  - Severity rating
  - Buyer moment mapping
  - Revenue impact score
  - Priority score (composite)
- Supports mini audits (teaser) and full audits (after brief unlock)
- Confidence scoring and readiness detection

### 5. AEO Analysis (Answer Engine Optimization)

- Gemini AI inference assessing citability and entity clarity
- Evaluates how well pages can be referenced by AI answer engines
- Integrated into finding scoring

### 6. Commercial Knowledge Graph

- Builds an entity-relationship graph from audit data:
  - **Nodes:** page, ICP, offer, product, use_case, claim, proof, CTA, query, competitor, topic
  - **Edges:** targets, supports, proves, links_to, answers, converts_to, references, missing
- Gap detection with multi-dimensional scoring
- Buyer path analysis (query → page → offer → proof → CTA chains)
- Programmatic opportunity detection (curation pages, comparisons, use cases, glossary)

### 7. Work Orders

- Actionable tasks generated from graph gaps
- Types: create_node, rewrite_node, add_proof, add_link, etc.
- Status tracking: open → done/skipped

### 8. Agent Prompts

- AI-generated universal prompts per finding
- Includes: context, problem statement, exact change needed, copy guidance
- Designed for any AI writing tool to execute the fix

### 9. Pricing Engine

- Recommends pricing tier based on:
  - Number and severity of findings
  - Audit scope (pages crawled, queries analyzed)
  - Complexity signals
- Produces tier label + price range

### 10. Architecture Recommendations

- Suggests new page types based on audit findings
- Maps missing content to structural opportunities

### 11. Growth Brief / Reports

- Compiles full client-ready report:
  - Executive memo
  - Scored findings with visualizations
  - Commercial graph data
  - Pricing recommendation
  - Architecture suggestions
- Supports teaser (pre-unlock) and full brief modes
- Exportable as JSON snapshot

### 12. Lead Pipeline

- CRM-lite lead funnel per project
- Stages: new → qualified → proposal → won → lost
- Statuses: open, follow_up, stalled, closed
- Channel attribution (organic search, social, paid, direct, referral, email)
- Status history tracking
- Channel-wise traffic distribution (from GA4)
- Summary views on dashboard and report pages

---

## Data Model

### Core Tables

| Table | Purpose |
|-------|---------|
| `projects` | Top-level entity (name, status) |
| `websites` | 1:1 per project (URL, domain, crawl config) |
| `google_connections` | OAuth tokens per operator |
| `search_console_properties` | GSC property linked to project + connection |
| `ga4_properties` | GA4 property linked to project + connection |
| `audit_runs` | Each audit execution (type, status, scores) |
| `audit_metrics` | Aggregate metrics per run |
| `page_metrics` | Per-page crawl + performance data |
| `query_metrics` | Per-query GSC data with opportunity scoring |
| `findings` | Audit issues with multi-dimensional scoring |
| `agent_prompts` | 1:1 per finding; AI-generated fix instructions |
| `architecture_inputs` | Project intake data |
| `architecture_recommendations` | Suggested page types |
| `pricing_plans` | Tier + price range per run |
| `report_exports` | Snapshot JSON of compiled report |
| `notes` | Operator notes |

### Knowledge Graph Tables

| Table | Purpose |
|-------|---------|
| `graph_entities` | Nodes in the commercial graph |
| `graph_relationships` | Edges between entities |
| `graph_summaries` | Completeness scores per run |
| `graph_gaps` | Detected gaps with scoring |
| `buyer_paths` | Query-to-CTA journey chains |
| `programmatic_opportunities` | Scalable page system suggestions |
| `graph_work_orders` | Actionable tasks from gaps |

### Lead Tables

| Table | Purpose |
|-------|---------|
| `leads` | Lead records with channel/stage/status |
| `lead_status_history` | Stage and status change audit log |

---

## Integrations

| Service | Usage |
|---------|-------|
| **Google OAuth 2.0** | Authentication for GSC + GA4 access |
| **Google Search Console API** | Query/page performance data |
| **Google Analytics 4 Data API** | Landing page sessions, conversions, channel data |
| **Google Gemini AI** | AEO analysis, site-only inference |
| **Supabase (Postgres)** | Database with Row Level Security |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | Supabase (Postgres + RLS) |
| AI | Google Gemini (gemini-3.1-flash-lite) |
| Crawler | Cheerio |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Pages & Navigation

| Route | Purpose |
|-------|---------|
| `/operator` | Dashboard |
| `/operator/projects` | Project list |
| `/operator/projects/[id]` | Project overview with lead funnel snapshot |
| `/operator/projects/[id]/connect` | Google OAuth + property selection |
| `/operator/projects/[id]/leads` | Lead pipeline management |
| `/operator/projects/[id]/audit` | Audit results + visualizations |
| `/operator/projects/[id]/findings` | Findings table |
| `/operator/projects/[id]/findings/[fid]` | Finding detail + agent prompt |
| `/operator/projects/[id]/graph` | Knowledge graph visualization |
| `/operator/projects/[id]/systems` | Programmatic page systems |
| `/operator/projects/[id]/work-orders` | Work order queue |
| `/operator/projects/[id]/pricing` | Pricing recommendation |
| `/operator/projects/[id]/architecture` | Architecture recommendations |
| `/operator/projects/[id]/settings` | Project intake form |
| `/operator/projects/[id]/report` | Full growth brief |

---

## API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/projects` | Create project |
| GET/PATCH | `/api/projects/[id]` | Get/update project |
| POST | `/api/projects/[id]/run-audit` | Trigger audit |
| GET/PUT | `/api/projects/[id]/properties` | Manage property selection |
| GET/PUT | `/api/projects/[id]/architecture-inputs` | Intake form data |
| GET/POST | `/api/projects/[id]/notes` | Notes CRUD |
| GET/POST | `/api/projects/[id]/leads` | Lead CRUD |
| PATCH | `/api/projects/[id]/leads/[leadId]` | Update lead |
| PATCH | `/api/projects/[id]/work-orders/[woId]` | Update work order |
| POST | `/api/projects/[id]/unlock-full-brief` | Unlock full brief |
| GET | `/api/google/oauth/start` | Start OAuth |
| GET | `/api/google/oauth/callback` | OAuth callback |

---

## Non-Functional Requirements

- **Access control:** Single-operator tool; RLS policies allow all operations for authenticated/anon roles (no multi-tenant auth)
- **Performance:** Audit runs are async; crawler respects configurable page limits
- **Resilience:** Graceful degradation when Google tokens expire or tables are missing
- **Deployment:** Vercel production with environment-variable-driven configuration
- **Cost:** Uses Gemini flash-lite model to minimize AI inference cost

---

## Future Considerations

- Multi-operator authentication
- Client-facing report sharing portal
- Automated recurring audits (scheduled re-crawls)
- Competitor tracking over time
- Integration with content management systems for direct publishing
- Webhook notifications on lead stage changes
