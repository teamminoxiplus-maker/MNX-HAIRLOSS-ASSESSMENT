# MINOXIPLUS — Free Hair Loss Assessment

Standalone, mobile-first hair loss assessment for **MINOXIPLUS** (Happy Life
Organics Philippines). Public QR-scannable flow + an allowlisted internal admin.
Next.js 14 (App Router) + Supabase, deployable on Vercel. Independent of the HLO
Ops Hub — its own repo, its own deploy.

## What it does

- **Public assessment** (`/assessment`) — Taglish, no login, one question per
  screen, autosave, tokenized re-openable result page. QR codes land here.
- **Rules engine** — pure, deterministic, unit-tested. `classify → severity →
  mapProducts → applySafetyGates`. Every §9.4 safety gate has a test (e.g. Tri
  Active never reaches a non-male user; pregnant → consult route, no product CTA).
- **Result email** via Resend, from the same copy blocks as the web page.
- **Admin** (`/admin`, allowlisted) — funnel dashboard, leads table (server-side
  pagination + search + filters), lead detail + contacted/notes, streamed CSV export.
- **Kiosk mode** (`/kiosk`) — PIN-gated, auto-reset for in-store tablets.

## Routes

| Route | Access |
|---|---|
| `/assessment`, `/assessment/q/[step]`, `/assessment/contact`, `/assessment/result/[token]`, `/assessment/privacy` | Public |
| `/kiosk` | Public + PIN |
| `/api/assessment/{draft,submit,event}` | Public (rate-limited) |
| `/admin`, `/admin/leads`, `/admin/leads/[id]`, `/admin/export` | Signed-in + `ADMIN_ALLOWLIST` |
| `/login` | Admin sign-in |

**QR destination:** `https://<your-domain>/assessment?src=qr_[placement]`. The
path is load-bearing — never changes once printed; use `?src=` per placement.

## Setup

### 1. Database
In the Supabase **SQL editor**, paste and run **`supabase/setup.sql`** once.
(If you already ran the assessment tables in another project, just point this app
at that same project — no need to re-run.)

### 2. Environment
```bash
cp .env.example .env.local   # fill in Supabase URL + keys, ADMIN_ALLOWLIST, KIOSK_PIN
```
Only the three Supabase values are required to boot; email, Redis, and the kiosk
PIN degrade gracefully when unset.

### 3. Create an admin login (no terminal needed)
In Supabase → **Authentication → Users → Add user** → enter your email + a
password. Put that same email in `ADMIN_ALLOWLIST`. Sign in at `/login`.

### 4. Run
```bash
npm install
npm run dev        # http://localhost:3000/assessment
npm test           # 30 engine unit tests
```

## Deploy (Vercel)
Import this repo, set the same env vars, deploy. Point your QR domain (e.g.
`assess.minoxiplus.com` or `minoxiplus.com/assessment` via proxy) at it.

## Editing content
- **Questions**: `src/lib/assessment/questions.ts`
- **Result / email copy**: `src/lib/assessment/copy.ts` (single source of truth;
  follows the §9.5 claim-language rules)
- **Products / links**: `src/lib/assessment/products.ts`

## Security
Leads are **not readable with the anon key** — the `assessments` table has no
anon/authed RLS policy and grants are revoked; all access is via the service-role
client in server code only. IPs are hashed; no PII in result URLs; honeypot +
5 submits/hour/IP + PH mobile/email validation.
