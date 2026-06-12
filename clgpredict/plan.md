# College Predictor — Implementation Plan

> MHT-CET (Pune region) college predictor for the ApexClasses website.
> Student enters their **percentile + category + preferences** → gets a ranked list of
> colleges/branches they can realistically get, bucketed by probability.

---

## 0. Current State (done)

- ✅ Full backups of `apex_db`, `jeet_db`, `logto` taken → `backups/db_backup_20260609_234503/`
- ✅ Prisma 7 introspected from live `apex_db` (5 models) → `backend/prisma/schema.prisma`
- ✅ Prisma client singleton wired (`backend/src/db/prisma.js`) + verified against prod
- ✅ Source data analysed: `pune data final for book wih branch ready.xlsx`,
  sheet `remove other university` → **77 colleges, 483 branch rows, ~20 category columns**

---

## Data Shape (recap)

The sheet is **hierarchical/wide**, not tabular:
- A **college header row** = `code + name` (e.g. `06004  Government College of Engineering & Research, Avasari`)
- Followed by **branch rows** (Civil, Comp, IT, Mech, ETC…) underneath it
- Each branch row holds the **closing percentile per category column**:
  `OPEN, LOPEN, OBC, LOBC, SC, LSC, ST, VJ, SEBC, LSEBC, EWS, TFWS, GOPENO, NT1, NT2, NT3, LST, LOPENO`
- The `L*` columns = **Home-University (local) quota** → lower cutoffs. Core domain rule.

We normalise this **wide → long**: one row per `(college, branch, category, cutoff, year)`.

---

## Phase 1 — Database Schema & Migration ✅ DONE

**Goal:** Add predictor tables to `apex_db` via a proper Prisma migration (establishes migration baseline).

- [x] 1.1 Added models to `backend/prisma/schema.prisma`: `College`, `Cutoff`, plus a 3rd model `PredictorLead` (lead capture). Constraints + indexes as designed.
- [x] 1.2 Baseline established (`migrations/0_init`) then applied `20260609192934_add_predictor_tables` and `20260609194834_add_predictor_leads` against prod `apex_db`.
- [x] 1.3 Tables verified in prod.

```prisma
model College {
  id      Int      @id @default(autoincrement())
  code    String   @unique @db.VarChar(10)
  name    String
  city    String   @default("Pune") @db.VarChar(60)
  cutoffs Cutoff[]
  @@map("colleges")
}

model Cutoff {
  id        Int      @id @default(autoincrement())
  collegeId Int      @map("college_id")
  branch    String   @db.VarChar(60)
  category  String   @db.VarChar(10)
  cutoff    Decimal  @db.Decimal(6, 3)
  year      Int      @default(2024) @db.SmallInt
  college   College  @relation(fields: [collegeId], references: [id])
  @@unique([collegeId, branch, category, year])
  @@index([category, branch, cutoff])
  @@map("cutoffs")
}
```

---

## Phase 2 — ETL (Excel → Database) ✅ DONE

**Goal:** Parse the messy hierarchical sheet and load clean long-form rows.

- [x] 2.1 Python parser `clgpredict/etl.py` built (header regex, wide→long, category-col map, branch normalisation 79→28 canonical, noise cols skipped, dedupe by MIN cutoff).
- [x] 2.2 Output `clgpredict/cutoffs_seed.sql` (idempotent `INSERT ... ON CONFLICT DO NOTHING`).
- [x] 2.3 Loaded into prod → **77 colleges, 5999 cutoffs**.
- [x] 2.4 Sanity checks passed; live spot-checks confirmed against the sheet.

---

## Phase 3 — Backend API ✅ DONE

**Goal:** Prediction endpoints following the existing module pattern (`auth/`, `order/`, `slots/`).

New folder `backend/src/predictor/` (all 4 files present):
- [x] 3.1 `predictor.routes.js` mounted in `app.js` → `app.use('/api/predictor', predictorRoutes)`.
- [x] 3.2 `predictor.controller.js` + `predictor.service.js` + `predictor.model.js` (raw SQL via shared `query`; bucketing + L-quota category expansion logic).
- [x] 3.3 Endpoints live: `GET /meta`, `POST /predict`, **plus** `POST /lead` (lead capture).
- [x] 3.4 Global `generalLimiter` applied; inputs validated (percentile 0–100, category whitelist, phone regex).

### Filtering / Prediction logic
1. **Effective category set:** map `(category + homeUniversity)` → e.g. OBC + Pune → `['OBC','LOBC','OPEN','LOPEN']`; take **MIN(cutoff)** per (college, branch).
2. **Branch filter** if provided; **TFWS** only if opted in.
3. **Margin** = `percentile − cutoff`; bucket:
   | Bucket | Condition | Label |
   |---|---|---|
   | 🟢 Safe | `cutoff ≤ pct − 2.0` | High chance |
   | 🟡 Moderate | `pct − 2.0 < cutoff ≤ pct` | Likely |
   | 🟠 Reach | `pct < cutoff ≤ pct + 1.0` | Ambitious |
   | hidden | `cutoff > pct + 1.0` | not shown |
4. Sort by bucket, then cutoff desc (best college first). Thresholds in one config constant for tuning.

```sql
SELECT c.code, c.name, cu.branch, MIN(cu.cutoff) AS best_cutoff,
       ROUND($1::numeric - MIN(cu.cutoff), 3) AS margin
FROM cutoffs cu JOIN colleges c ON c.id = cu.college_id
WHERE cu.year = 2024 AND cu.category = ANY($2)
  AND ($3::text[] IS NULL OR cu.branch = ANY($3))
  AND cu.cutoff <= $1 + 1.0
GROUP BY c.code, c.name, cu.branch
ORDER BY best_cutoff DESC;
```

---

## Phase 4 — Frontend (Interactive UI) ✅ DONE (core)

**Goal:** A polished, guided predictor page (mirrors the existing TrackRecord page style).

Route: `/college-predictor` (wired in `App.jsx`; page `frontend/src/pages/CollegePredictor.jsx`, ~431 lines; service `frontend/src/predictor/predictorService.js`).

**Decisions taken:** Single-page (not wizard) · Home-University toggle default ON · Free preview (3/bucket) + lead-gated full list.

**Built:** sticky input panel (percentile slider+number, category buttons, Home-University toggle, TFWS toggle, branch chips) · live **what-if** debounced re-predict (550ms) · filter/sort bar · three colour-coded buckets (High Chance / Likely / Ambitious) with counts · college cards with margin badge + "via L-quota" chip · `PREVIEW_LIMIT=3` free per bucket · lead-gate modal persisting unlock in `localStorage`.

**Deferred (4.3 nice-to-haves, NOT built):** shareable result link · Download-as-PDF · compare tray · empty-state/disclaimer polish — moved to Phase 5.

### 4.1 Input — a multi-step wizard (feels lighter than one big form)
- **Step 1 – Score:** large percentile input with a live slider (0–100) + inline validation
- **Step 2 – Category:** segmented buttons / dropdown (OPEN, OBC, SC, ST, VJ, NT1-3, EWS…)
  + a **"Home University = Pune?"** toggle (unlocks L-quota) with a tooltip explaining it
- **Step 3 – Preferences:** multi-select branch chips (Comp, IT, Mech…), TFWS toggle
- Sticky **"Predict my colleges"** CTA; progress dots between steps

### 4.2 Results — interactive, not a flat table
- **Three colour-coded sections**: 🟢 Safe · 🟡 Moderate · 🟠 Reach, with counts
- Each result = an expandable **college card**: name, branch, closing cutoff, **your margin** badge,
  and "qualified via *Home-University OBC*" chip explaining *why*
- **Filter/sort bar** on results: by branch, by margin, by college name (client-side, instant)
- **Probability gauge** per card (margin → visual bar)
- **Compare tray:** select up to 3–4 colleges → side-by-side compare drawer
- Empty state ("No matches — try widening branches / lowering threshold")
- **Disclaimer banner:** "Based on 2024 closing cutoffs; not a guarantee of admission."

### 4.3 Nice-to-have interactions
- **Shareable result link** (encodes inputs in query params) → for counselling/marketing
- **Download as PDF** (reuse the existing PDF component) — branded shortlist
- **"What-if" slider** on results page: drag percentile to see the list re-rank live
- Lead capture: gate PDF download behind name/phone → feeds your existing `users` flow

---

## Phase 4.5 — Infra: Dev/Prod DB Split & Deploy Setup ✅ DONE

**Goal:** Stop running local dev against production; make Dockerfile-only deploy self-contained.

- [x] 4.5.1 **Dev DB on Supabase** provisioned (`aws-1-ap-southeast-1`). All 3 migrations applied via `prisma migrate deploy`; cutoffs seeded → **77 colleges / 5999 cutoffs** (matches prod).
- [x] 4.5.2 **Local `backend/.env` re-pointed at Supabase dev.** `DATABASE_URL`=transaction pooler (6543, app), `DIRECT_URL`=session pooler (5432, migrations), `DATABASE_SSL=true`, password URL-encoded (`@`→`%40`). Prod URLs kept commented for switch-back.
- [x] 4.5.3 **`prisma.config.ts`** now uses `DIRECT_URL` (falls back to `DATABASE_URL`) — migrations can't run through pgbouncer/6543.
- [x] 4.5.4 **`package.json`**: added `prisma:deploy` (`prisma migrate deploy`, apply-only for prod).
- [x] 4.5.5 **`backend/Dockerfile`**: added `npx prisma generate` at build; CMD now `prisma migrate deploy && node src/server.js` → future migrations auto-apply on deploy. `.dockerignore` already excludes `.env`/`node_modules`.
- [x] 4.5.6 **`backend/DATABASE.md`** written — dev/prod flow, migrate-dev vs migrate-deploy, re-seed command.

**Confirmed:** prod = VPS Postgres `82.180.144.69:5432/apex_db` (already migrated + seeded). VPS runs backend via Dockerfile only (no compose). Root dir for deploy = `backend/`.

---

## Phase 4.6 — Discoverability & Homepage Showcase ✅ DONE

**Goal:** Make the predictor findable; replace the stale book-photo hero with an interactive demo.

- [x] 4.6.1 **Header CTA replaced** — `Layout.jsx` "Book Counselling" pill → "Try College Predictor" orange-gradient button (size matched to the 2xl nav row: `text-[13px] px-4 py-2`).
- [x] 4.6.2 **Duplicate nav link removed** — dropped the standalone "College Predictor" link from desktop nav, mobile menu, and footer Quick Links (the CTA now serves that role; prevents nav overflow/clipping at 1280–1536px).
- [x] 4.6.3 **Hero illustration removed** — `home.jsx` right-column `Gemini_Generated_Image_r4o6xrr4o6xrr4o6.png` deleted; "Buy Counselling Book" secondary CTA replaced with "Try College Predictor" (routes to `/college-predictor`).
- [x] 4.6.4 **Hero right column → `<PredictorPreview />`** — a self-running, looping mini-app card. Cycles 5 steps: percentile ticks 70 → 96.42 (animated bar fills), "OBC" category lights up, Pune home-university toggle flips on, "Computer" branch chip highlights, then a "College of Engineering, Pune — Computer Engineering · High Chance · +3.42 margin" result card slides in. Auto-loops indefinitely. Includes a "Open the Predictor" button and a floating "Match found!" toast card.
- [x] 4.6.5 **"Free Tool 2026" section upgraded** — replaced static list of colleges with a brand-new interactive widget `<PercentileLandscape />`. Real, draggable: 24 representative Pune colleges (COEP, PICT, VIT, PCCOE, WCE, Sinhgad, MIT WPU, …) plotted as dots on a horizontal axis by 2024 closing cutoff. Auto-cycles on load; the moment you touch the slider it stops and you take control. Each dot colour-codes live (emerald Safe / amber Likely / rose Ambitious / grey out-of-range); hover shows tooltip with name + cutoff. Live Safe/Likely/Ambitious counters update on every drag. "Open the Full Predictor" CTA below.
- [x] 4.6.6 **Trust stat updated** — "Colleges Listed: 450+" → "Pune Colleges Covered: 77" (matches the actual predictor data).
- [x] 4.6.7 **Build verified** — `vite build` passes clean (47s first build, ~2s incremental).

**Files touched in 4.6:** `frontend/src/components/Layout.jsx`, `frontend/src/pages/home.jsx`. No backend or schema changes.

---

## Phase 5 — QA, Polish, Launch

### 5.A Deploy (the only thing blocking go-live) ⏳ REMAINING
- [ ] 5.A.1 On deploy platform, set root dir = `backend/`, build from `Dockerfile`.
- [ ] 5.A.2 Set prod env vars on the platform (NOT baked in image): `DATABASE_URL` (VPS apex_db), `DATABASE_SSL=false`, `PORT=5000`, `FRONTEND_URL`, `JWT_SECRET`, `BREVO_API_KEY`, `EMAIL_FROM`, `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET`.
- [ ] 5.A.3 ⚠️ Swap Razorpay **test** keys → **live** keys for prod.
- [ ] 5.A.4 Deploy backend image; confirm container logs show `migrate deploy` no-op + `✅ Connected to PostgreSQL`.
- [ ] 5.A.5 Build & deploy frontend (set `VITE_API_URL` to the prod API base).
- [ ] 5.A.6 Smoke test prod: `/api/predictor/meta`, `/predict`, `/lead`, and `/college-predictor` page end-to-end.

### 5.B Discoverability
- [x] 5.B.1 ✅ Hero "Try College Predictor" CTA in `Layout.jsx` header (orange-gradient, sized to nav row). Standalone "College Predictor" nav link removed to prevent overflow.
- [x] 5.B.2 ✅ Landing-page CTA — `PredictorPreview` (hero right column, animated) + `PercentileLandscape` (replaces "Free Tool 2026" static list, interactive draggable widget).
- [ ] 5.B.3 *(optional)* Add a footer Quick Link if traffic data shows people want it.

### 5.C QA & correctness
- [x] 5.C.1 ✅ **Invariants pass** — `backend/scripts/validate_predictor.mjs` covers the SQL contract (no duplicates, year=2024, MIN(cutoff) used, bucket math, sort order, no TFWS leak).
- [x] 5.C.2 ✅ **Edge cases pass** — `backend/scripts/edge_cases.mjs` runs 15 cases (pct 0/50/100, all categories, homeU on/off, TFWS on/off, empty/specific branch lists). All green.
- [ ] 5.C.3 Mobile responsiveness + loading/skeleton states. *(not yet manually verified on real devices)*
- [ ] 5.C.4 Real-case spot-check vs Excel sheet (5–10 known `(college, branch, category)` triples) — pick COEP/PICT/VIT, confirm predicted cutoffs match 2024 sheet values within margin.

### 5.D Deferred 4.3 features (nice-to-have) ✅ ALL DONE

- [x] 5.D.1 ✅ **Disclaimer banner** — amber-tinted card above bucket sections, amber `Info` icon, copy: "Indicative only. Predictions are based on 2024 closing cutoffs and don't guarantee admission — actual cutoffs shift by CAP round, seat movement, and applicant volume each year."
- [x] 5.D.2 ✅ **Empty-state polish** — dashed-border card with `SearchX` icon, headline "No matches in range", sub-copy explaining the cause, and three recovery actions: **Clear branch filter** · **Try percentile 70** · **Book a counsellor** (links to `/services`). `predictor_empty_state_seen` event fires when `counts.total === 0`.
- [x] 5.D.3 ✅ **Download-as-PDF branded shortlist** — `frontend/src/predictor/predictorPdf.js` (jsPDF, 186 lines). Apex Classes blue header band, query summary (percentile/cat/homeU/TFWS/branches/student), counts strip, three coloured bucket sections, college rows with margin colour-coded green/amber/rose, page footer disclaimer + page numbers. Filename: `apex-college-shortlist-{pct}-{cat}.pdf`. PDF button is gated behind lead unlock.
- [x] 5.D.4 ✅ **Shareable result link** — URL params auto-hydrate on first load (`pct`, `cat`, `hu`, `tfws`, `branches`), and any input change calls `history.replaceState` to keep the URL in sync. "Share" button copies the current URL via `navigator.clipboard`, shows "Copied" feedback, fires `predictor_share_link_copied` event.
- [x] 5.D.5 ✅ **Compare tray** — sticky bottom bar appears with `framer-motion` slide-in when ≥1 college is selected (max 4). Each pill shows college + branch with × to remove. "Compare N" button opens a side-by-side drawer (`<motion.div>` modal, backdrop click to close) with grid of cards showing bucket badge, college, branch, 2024 cutoff, margin (colour-coded), via-category, code. Empty state when <2 selected.
- [x] 5.D.6 ✅ **Analytics events live** — `frontend/src/analytics/analyticsClient.js` (44 lines): fire-and-forget client with 5s batching buffer, `pagehide`/`beforeunload` flush, `keepalive: true` so events survive navigation. Events firing: `predictor_open`, `predictor_predict_run` (with `pctBucket`, `cat`, `homeU`, `tfws`, `nBranches`, `nResults`), `predictor_branch_toggled`, `predictor_empty_state_seen`, `predictor_lead_submitted`, `predictor_pdf_downloaded`, `predictor_share_link_copied`, `predictor_compare_toggled`.

---

## Phase 5.E — Audit Fixes ✅ DONE (2026-06-11)

Post-implementation audit findings, all fixed:
- [x] 5.E.1 **Analytics summary secured** — `GET /api/analytics/summary` now behind `requireAdmin` (was public).
- [x] 5.E.2 **Lead gate is now server-enforced** — `/predict` caps results to `PREVIEW_LIMIT=3` per bucket while locked; full list only returned with a valid JWT `unlockToken` (issued on lead capture, 30-day, scope `predictor_unlock`). `counts` still reflect true totals for the "unlock N more" CTA. Frontend stores the token and re-fetches on unlock. *(This is the gate the upcoming PAID plan will build on — swap "lead captured" for "payment verified".)*
- [x] 5.E.3 **Friendly via-category labels** — service returns `viaLabel` (`LOPEN`→"Home-University Open", `LOBC`→"Home-University OBC", …); cards + compare drawer use it; PDF uses compact `HU-OBC` form to fit its column.
- [x] 5.E.4 **Dead code removed** — unused `getCategories()` dropped from `predictor.model.js`.
- [x] 5.E.5 **URL-sync ordering fixed** — `hydratedRef` guard prevents the sync effect from writing default params before a shared link is read.
- [x] Verified: locked=3/bucket vs unlocked=full (451 total) against dev DB; frontend `vite build` clean.

### Pending discussion → PAID plan (next session)
- Move **share link + PDF download behind payment** (currently free-after-lead).
- Enrich **Compare** with extra metrics: placement %, infra, **NAAC grade/ranking**, etc. → premium tier. Needs a data source + new `college_meta` table.

---

## Phase 6 — Accounts, Paywall, Quota & Saved Searches ⏳ IN PROGRESS

**Goal:** Turn the predictor into an account-based, paid product. Reuses existing auth (`users`, JWT + `apex_refresh` cookie, `AuthContext`) and Razorpay (`order/payment.service.js`).

### Decisions (interview, 2026-06-11)
- **Tiers:** Free (anon-lead OR logged-in unpaid) = unlimited **3/3/2 previews + total count**, nothing else. Paid = full list + PDF + share + saved searches.
- **Plan:** one-time **₹99 → 15 lifetime full searches**; re-buy another ₹99/15 pack when exhausted.
- **Search consumption:** live preview + slider what-if always free. Clicking **"Reveal full list"** consumes **1 of 15** for a *new unique combo* (normalized `percentile|cat|homeU|tfws|sortedBranches`); re-opening a saved combo is free.
- **Anon flow:** phone panel → create/link a **guest account** (phone-keyed, no password) + lead → issue JWT → show 3/3/2. Guest **upgrades to email+password** to return.
- **Account merge:** phone matching a **guest (no password)** → reuse it. Phone matching a **password account** → DO NOT auto-login; prompt "account exists, please log in" (security).
- **Profile:** Dashboard card + dedicated **`/my-predictions`** page (quota, plan, saved searches, re-buy CTA).
- **Header:** an **Account** button beside "Try College Predictor" (Login/Register when logged out; name/profile menu when logged in).

### 6.1 Data model (new migration) ✅ DONE
- [x] `predictor_profiles`, `predictor_searches` (unique `user_id,combo_hash`), `predictor_payments` — migration `20260611120000_add_predictor_accounts` applied to dev. Prisma models added.

### 6.2 Backend ✅ DONE
- [x] `predictor.account.model.js` + `predictor.account.controller.js`; routes added.
- [x] `POST /guest` (create/reuse guest, block password accounts, issue JWT + refresh cookie, lead row).
- [x] `GET /profile`, `POST /reveal` (auth + quota; dedupe by combo_hash; consume 1 on new; snapshot). `/predict` is now **preview-only** (full list never leaves server without auth+quota).
- [x] `GET /searches`, `GET /searches/:id`.
- [x] `POST /pay/create` + `POST /pay/verify` (reuse `payment.service.js`; HMAC verify; one-time grant via status guard → `searches_limit += 15`, plan='paid').
- [x] PDF/share are paid-only by construction (data only exists after a paid reveal).

### 6.3 Frontend ✅ MOSTLY DONE
- [x] `Layout.jsx`: Account button (logged-out) + "My Predictions" in menu; switched to reactive `useAuth()`.
- [x] `CollegePredictor.jsx`: reworked — anon → phone panel (guest) → 3/3/2; "Reveal" consumes quota; paywall modal (Razorpay); upsell banner; PDF/share gated to `isFull`.
- [x] Razorpay checkout (reuses `order/utils/loadRazorpay`).
- [x] `/my-predictions` page: plan, X/15, saved searches (re-open via query params = free), re-buy.
- [ ] Dashboard **card** summary (detail page done; small card on `Dashboard.jsx` still pending).
- [ ] **Guest→full-account upgrade/merge**: a guest who registers with the same phone currently creates a NEW account (register doesn't merge by phone). Needs an upgrade path that sets email+password on the existing guest row.

### 6.4 Verify
- [x] Guest → token → preview 3/3/2 (HTTP: 201 / locked / total 61 / 3 visible). ✅
- [x] Free user reveal → `402 QUOTA_EXHAUSTED`. ✅
- [x] Model-level: pay grant → 15; reveal new combo → used 1/15 + saved; re-open same combo → free. ✅
- [x] Frontend `vite build` clean. ✅
- [ ] Live Razorpay test-key checkout in browser (needs manual click-through).
- [ ] 15 used → re-buy adds 15 (logic ready; browser-verify).

### Known follow-ups / risks
- ⚠️ Auth stores **passwords in plaintext** (pre-existing) — should hash before this goes paid/live.
- Guest→full upgrade/merge (6.3) not yet built.
- Dashboard summary card (6.3) not yet built.

---

## Future Enhancements (design now, build later)
- **Multi-year data** → trend-based prediction (cutoff drift) instead of single year → tighter Reach band
- **CAP round number** stored (Round 1 cutoffs > later rounds) → big accuracy gain
- **More regions** beyond Pune (the `city` column already supports it)
- **Save / login** to persist a student's shortlist

---

## Decisions Made (resolved)
1. ✅ **Home-University default** — toggle, default **ON** (Pune-first audience).
2. ✅ **Lead-gen gating** — free preview (3/bucket) + gate **full list** behind name/phone.
3. ✅ **UI approach** — **single-page** (not wizard).
4. ✅ **Dev DB** — Supabase; **Prod DB** — VPS Postgres `apex_db`. Deploy = Dockerfile only, root `backend/`.
5. ✅ **5.B discoverability strategy** — header CTA only, no nav link (avoids nav clipping at 1280–1536px).
6. ✅ **5.D.6 analytics** — lightweight `predictor_open` event in `predictor_leads`-adjacent table; keep it simple, no funnel tracking yet.

---

## What you can test right now (with dev server already running or restartable)

### Backend (port 5000)
```bash
# Health
curl http://localhost:5000/health

# Predictor meta (categories, branches, year)
curl http://localhost:5000/api/predictor/meta

# Predict — 95th pct, OBC, Pune, Comp/IT
curl -X POST http://localhost:5000/api/predictor/predict \
  -H "Content-Type: application/json" \
  -d '{"percentile":95,"category":"OBC","homeUniversity":true,"branches":["Computer Engineering","Information Technology"],"tfws":false}'

# Lead capture
curl -X POST http://localhost:5000/api/predictor/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"+919999999999","percentile":92,"category":"OPEN"}'

# Analytics
curl -X POST http://localhost:5000/api/analytics/event \
  -H "Content-Type: application/json" \
  -d '{"event":"predictor_open"}'
curl http://localhost:5000/api/analytics/summary
```

### Validation scripts
```bash
cd backend
node scripts/validate_predictor.mjs   # SQL-contract invariants
node scripts/edge_cases.mjs          # 15 edge cases
```

### Frontend
- `/` — homepage: hero `PredictorPreview` animates on load, `PercentileLandscape` is draggable
- `/college-predictor` — full predictor with live what-if re-rank
- Mobile: resize browser to 375px / 768px to check responsiveness

### Still NOT testable locally
- 5.A.4–5.A.6: prod deploy (needs platform access)
- 5.A.3: Razorpay live keys (no test mode for live)
- 5.C.4: needs a real student/coaching dataset to spot-check against the sheet
- 5.D.1–5.D.5: not built yet

### To start dev server
```bash
# Backend (terminal 1)
cd E:/PROJECTS/ApexClasses/backend && npm run dev

# Frontend (terminal 2)
cd E:/PROJECTS/ApexClasses/frontend && npm run dev
```
