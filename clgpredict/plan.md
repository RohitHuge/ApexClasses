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

## Phase 1 — Database Schema & Migration

**Goal:** Add predictor tables to `apex_db` via a proper Prisma migration (establishes migration baseline).

- [ ] 1.1 Add models to `backend/prisma/schema.prisma`:
  - `College` → `id, code (unique), name, city default 'Pune'`
  - `Cutoff` → `id, collegeId (FK), branch, category, cutoff Decimal(6,3), year default 2024`
  - Unique constraint `(collegeId, branch, category, year)`
  - Index `(category, branch, cutoff)` for fast lookups
- [ ] 1.2 `npx prisma migrate dev --name add_predictor_tables` (baseline existing 5 tables first if needed)
- [ ] 1.3 Verify tables created in prod via Prisma Studio

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

## Phase 2 — ETL (Excel → Database)

**Goal:** Parse the messy hierarchical sheet and load clean long-form rows.

- [ ] 2.1 Python parser (`clgpredict/etl.py`, pandas already installed):
  - Walk rows; regex `^\s*\d{4,5}\s` detects a **college header** → split code + name
  - Subsequent non-empty rows = **branches** under the current college
  - For each branch row, iterate category columns → emit `(code, name, branch, category, cutoff)`
  - Skip blanks, `0`, and noise columns (`higest in NT`, duplicate `ST`)
  - Normalise branch labels (`Comp`/`MECH` casing, `Instru. Control`, `Automob.`)
- [ ] 2.2 Output `clgpredict/cutoffs_seed.sql` (idempotent `INSERT ... ON CONFLICT DO NOTHING`)
- [ ] 2.3 Load once via `psql` (or a Node seed script under `backend/scripts/seed-cutoffs.js`)
- [ ] 2.4 Sanity checks: 77 colleges, branch counts, no cutoff > 100 or < 0, spot-check 3 colleges vs sheet

---

## Phase 3 — Backend API

**Goal:** Prediction endpoints following the existing module pattern (`auth/`, `order/`, `slots/`).

New folder `backend/src/predictor/`:
- [ ] 3.1 `predictor.routes.js` mounted in `app.js` → `app.use('/api/predictor', predictorRoutes)`
- [ ] 3.2 `predictor.controller.js` + `predictor.service.js` (Prisma queries + bucketing logic)
- [ ] 3.3 Endpoints:
  - `GET /api/predictor/meta` → distinct branches + category list (for dropdowns)
  - `POST /api/predictor/predict` → body `{ percentile, category, homeUniversity, branches[], tfws }`
- [ ] 3.4 Rate-limit using existing `generalLimiter`; validate inputs (0–100 percentile)

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

## Phase 4 — Frontend (Interactive UI)

**Goal:** A polished, guided predictor page (mirrors the existing TrackRecord page style).

Route: `/college-predictor`.

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

## Phase 5 — QA, Polish, Launch

- [ ] 5.1 Validate predictions against 5–10 known real cases
- [ ] 5.2 Edge cases: percentile 100 / very low, reserved categories with no L-quota college, empty branches
- [ ] 5.3 Mobile responsiveness + loading/skeleton states
- [ ] 5.4 Analytics events (searches, branches chosen) — product insight + lead gen
- [ ] 5.5 Deploy: backend route + migration on VPS, frontend build
- [ ] 5.6 Add to site nav / a landing CTA

---

## Future Enhancements (design now, build later)
- **Multi-year data** → trend-based prediction (cutoff drift) instead of single year → tighter Reach band
- **CAP round number** stored (Round 1 cutoffs > later rounds) → big accuracy gain
- **More regions** beyond Pune (the `city` column already supports it)
- **Save / login** to persist a student's shortlist

---

## Open Decisions
1. **Home-University default** — is the audience mostly Pune students (L-quota ON by default) or mixed (toggle)?
2. **Lead-gen gating** — free results, or gate PDF/full list behind phone number?
3. **UI approach** — wizard (recommended) vs single-page form.
