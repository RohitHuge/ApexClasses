# College Predictor — Phase 7 Execution Plan

> Rank-based MHT-CET college predictor for ApexClasses.
> Reference: `clgpredict/logic.md` for all domain rules, probability formula, category codes.
> Last updated: 2026-07-18

---

## Pre-Development Checklist

| # | Task | Who | Status |
|---|---|---|---|
| P1 | Run `node backend/scripts/sync_dev_db.mjs` — clones prod → Neon, applies Phase 7 migration, seeds rank_cutoffs | Rohit (terminal) | ✅ Done |
| P2 | Verify Neon has `rank_cutoffs` table with ~5,971 rows | Dev DB check | ✅ Done (5,971 rows confirmed) |
| P3 | Verify Neon has new columns: `predictor_profiles.rank_searches_limit`, `predictor_searches.mode`, `predictor_payments.product_type` | Dev DB check | ✅ Done (all columns confirmed) |
| P4 | Start local backend (`npm run dev` in `backend/`) and confirm server starts without errors | Dev check | ⏳ |

---

## Phase 7.A — Data (ETL + Migration)

### Status: ✅ FULLY COMPLETE (Neon dev DB ready)

| Task | File | Status |
|---|---|---|
| ETL script to parse rank Excel → seed SQL | `clgpredict/etl_rank.py` | ✅ Done |
| Seed SQL generated (5,971 rows, 77 colleges, 28 branches) | `clgpredict/rank_cutoffs_seed.sql` | ✅ Done |
| Prisma schema updated (`RankCutoff` model, new profile/search/payment columns) | `backend/prisma/schema.prisma` | ✅ Done |
| Migration SQL written | `backend/prisma/migrations/20260704000000_add_rank_predictor/migration.sql` | ✅ Done |
| Migration applied to Neon dev DB | via `apply_phase7.mjs` (direct pg approach) | ✅ Done |
| Seed data loaded into Neon dev DB | via `apply_phase7.mjs` | ✅ Done |
| Migration applied to prod (VPS) | auto on `main` merge via Dockerfile | ⏳ After Phase 7.D |

---

## Phase 7.B — Backend Rework

### Status: ✅ INITIAL CODE EXISTS — 🔧 3 FILES NEED UPDATES

The initial backend was written before the UI/logic decisions were finalised. Three files need
targeted updates to match the agreed design.

---

### 7.B.1 — `predictor.rank.service.js` 🔧 UPDATE NEEDED

**Current state:** Returns `{ buckets: { safe, moderate, reach }, counts, locked }` with margin-based bucketing.

**Required changes:**

#### Micro-task 1 — Add `calcProbability(studentRank, closingRank)`
```js
// Piecewise linear. See logic.md §4.1 for full formula.
// gap = closingRank - studentRank (positive = student is BETTER than cutoff)
// gap >= 500  → 100%
// gap >= 0    → 99%
// 0–20% rank drop → 100 - 2×dropPct
// 20–35% drop → 60 - 4×(dropPct-20)
// >35% drop → 0%
```

#### Micro-task 2 — Replace bucket response with flat sorted array
```js
// New response shape:
// {
//   results: [
//     { code, college, branch, closingRank, margin, probability, viaCategory, viaLabel, type }
//   ],                      // type: 'reach' | 'safe'
//   counts: { reach, safe, total },
//   locked: bool,
// }
//
// Order: reach rows first (margin < 0, sorted closing_rank ASC = hardest first)
//        safe rows last  (margin >= 0, sorted closing_rank ASC = narrowest margin first)
// reach = margin < 0   (student rank is WORSE than cutoff)
// safe  = margin >= 0  (student rank is BETTER than or equal to cutoff)
// When locked = true: results = [] (empty), only counts returned — NO names leaked
```

#### Micro-task 3 — Dynamic reach expansion
```js
// If reach count < 10, progressively widen slack: 3000 → 5000 → 8000 → 12000
// Re-query with wider slack until reach >= 10 OR max slack reached
// Always cap at probability > 0% (35% rank drop)
// Safe count: show all found, no minimum enforcement
```

#### Micro-task 4 — Fix `resolveRankCategories` for non-HU students
```js
// Current bug: H-suffix codes are included even when homeUniversity = false
// Fix: only add GOPENH, LOPENH when homeUniversity = true
// Non-HU students get: GOPENS, GOPENO, LOPENS, LOPENO (+ reservation S variants)
```

#### Micro-task 5 — Remove `SAFE_RANK_MARGIN` constant (replaced by probability)
Keep `REACH_RANK_SLACK` as the initial value (3000). Dynamic expansion handles the rest.

---

### 7.B.2 — `predictor.rank.controller.js` 🔧 UPDATE NEEDED

#### Micro-task 1 — Fix two-step insert bug in `rankReveal`
Replace lines 120–128:
```js
// REMOVE this:
const saved = await AccountModel.insertSearch({ userId, comboHash, inputs: { ...inputs, mode: 'rank' }, result });
const { query } = await import('../db/db.js');
await query(`UPDATE predictor_searches SET mode = 'rank' WHERE id = $1`, [saved.id]);

// REPLACE with:
const saved = await AccountModel.insertSearch({ userId, comboHash, inputs, result, mode: 'rank' });
```

#### Micro-task 2 — Counts-only preview in `rankPredict`
When `unlocked = false`, the service returns `results: []` (empty array) and only `counts`.
Controller must NOT accidentally leak results. Confirm response shape passes through correctly.

#### Micro-task 3 — Update `rankReveal` response to use new flat `results` array
Replace spread of `buckets` with spread of `results` and `counts` from the updated service.

---

### 7.B.3 — `predictor.rank.model.js` 🔧 MINOR UPDATE

#### Micro-task 1 — Accept dynamic `reachSlack` as a parameter (already does this ✅)
#### Micro-task 2 — Verify query returns correct sort order (closing_rank ASC) ✅

No structural changes needed — the model is correct. Only the service layer changes how
it calls the model (multiple times with expanding slack if needed).

---

### 7.B.4 — `backend/src/order/products.json` 🔧 UPDATE NEEDED

Change `rank_predictor_pack` entry:
```json
// CHANGE:  "price": 200, "pack": 15
// TO:      "price": 50,  "pack": 3
```

---

### 7.B.5 — Already-done backend files (no changes needed) ✅

| File | What was done |
|---|---|
| `predictor.account.model.js` | `getRankProfile`, `incrementRankUsed`, `grantRankSearches`, updated `createPayment`, `markPaymentPaid`, `insertSearch` (mode param), `adminStats` |
| `predictor.account.controller.js` | `profile` returns `rankProfile`, `adminStats` includes rank metrics |
| `predictor.routes.js` | All 5 rank routes wired: meta, predict, reveal, pay/create, pay/verify |

---

## Phase 7.C — Frontend

### Status: ❌ NOT STARTED

### Key decision: Percentile UI is REMOVED
The percentile predictor tab is removed from the UI entirely. The backend percentile routes stay untouched (existing paid users can still access their saved results). `CollegePredictor.jsx` becomes rank-only — no tab toggle, no percentile slider.

---

### 7.C.1 — NEW FILE: `frontend/src/predictor/branchGroups.js`

Define super-group presets. Each group has a label and list of canonical branch names.

```js
export const BRANCH_GROUPS = [
  { id: 'cs',   label: 'Computer Science',    branches: ['Computer', 'Information Technology', 'Computer & IT'] },
  { id: 'csp',  label: 'CS Specializations',  branches: ['AI & Data Science', 'AI & ML', 'Computer (Business)', 'Cyber Security', 'IoT'] },
  { id: 'elex', label: 'Electronics',         branches: ['E&TC', 'Electronics', 'VLSI', 'Instrumentation'] },
  { id: 'mech', label: 'Mechanical',          branches: ['Mechanical', 'Automobile', 'Robotics', 'Robotics & Automation', 'Manufacturing'] },
  { id: 'chem', label: 'Civil & Chemical',    branches: ['Civil', 'Chemical'] },
  { id: 'other',label: 'Other',               branches: ['Electrical', 'Aeronautical', 'Bio-Technology', 'Food Technology', 'Fashion Technology', 'Metallurgy', 'Printing', 'Textile', 'Textile Chemistry'] },
];
```

Micro-tasks:
- [ ] Create file with above constants
- [ ] Export helper `toggleGroup(branches, group)` → adds all if any missing, removes all if all present

---

### 7.C.2 — `frontend/src/predictor/predictorService.js` — Add rank API calls

Micro-tasks:
- [ ] Add `fetchRankMeta()` → GET `/predictor/rank/meta`
- [ ] Add `runRankPredict(payload)` → POST `/predictor/rank/predict` (no auth)
- [ ] Add `revealRankResults(payload)` → POST `/predictor/rank/reveal` (auth)
- [ ] Add `createRankPayment()` → POST `/predictor/rank/pay/create` (auth)
- [ ] Add `verifyRankPayment(payload)` → POST `/predictor/rank/pay/verify` (auth)

---

### 7.C.3 — `frontend/src/pages/CollegePredictor.jsx` — Rank-only inputs

**No percentile tab.** The page opens directly in rank mode. Percentile UI (slider, percentile result display) is hidden/removed.

#### Micro-task 1 — Replace percentile inputs with rank input
- Remove percentile slider and any percentile mode state
- `<input type="number">` for rank, 1–250000, integers only, label "Your MHT-CET Rank"
- Same category buttons, homeUniversity toggle, TFWS toggle as before
- Add **gender toggle**: Male / Female (default Male)
  - When Female: show small info banner: *"Ladies-quota cutoffs not yet in our data. Results show general cutoffs — your actual chances are higher."*

#### Micro-task 2 — Branch super-group chips
- Show above the branch chip grid
- Clicking a group chip toggles all its branches via `toggleGroup()`
- A group chip shows as "active" only when ALL its branches are selected

#### Micro-task 3 — Rank state additions
```js
const [rank, setRank] = useState('');
const [gender, setGender] = useState('male');
const [rankResult, setRankResult] = useState(null);    // { results, counts, locked }
const [rankProfile, setRankProfile] = useState(null);  // { used, limit, remaining }
const [rankMeta, setRankMeta] = useState(null);        // { branches, categories }
```

---

### 7.C.4 — `CollegePredictor.jsx` — Flat results table

#### Micro-task 1 — Locked/preview state
When `rankResult.locked === true`:
- Show only: *"Found {counts.reach} reach colleges and {counts.safe} safe colleges for your inputs."*
- Show "Unlock Full List (₹50)" button
- No college names, no table

#### Micro-task 2 — Unlocked results table
Flat `<table>` (not cards/buckets):

| SR No | Code | College | Branch | Category | Closing Rank | Probability |
|---|---|---|---|---|---|---|

- **Section divider row** between reach and safe sections:
  - Before reach rows: `────── Reach / Ambitious (10 colleges) ──────`
  - After reach rows / before safe rows: `────── Guaranteed Admission (20 colleges) ──────`
- Probability displayed as colored badge: green (≥80%), amber (40–79%), red (<40%)
- Each row: alternating background for readability

#### Micro-task 3 — Print button
- "Print / Save PDF" button above the table
- On click: generates PDF via `predictorPdf.js` rank mode

---

### 7.C.5 — `frontend/src/predictor/predictorPdf.js` — Rank mode

Micro-tasks:
- [ ] Accept `mode` param; if `'rank'`, switch to option-form layout
- [ ] Header: "MHT-CET 2025 Option Form Reference — Apex Classes"
- [ ] Summary row: Rank: `{rank}` | Category: `{category}` | Home Univ: Yes/No | Branches: `{list}`
- [ ] Table columns: SR No | Code | College | Branch | Category | Closing Rank | Probability
- [ ] Section divider between reach (1–10) and safe (11–30)
- [ ] Footer: *"Fill your CAP option form in this exact SR order. Reach options first, safe options last."*
- [ ] Filename: `apex-rank-optionform-{rank}-{cat}.pdf`

---

### 7.C.6 — `CollegePredictor.jsx` — Rank paywall modal

Micro-tasks:
- [ ] When `rankProfile.remaining === 0` and user tries to reveal: show `showRankPay` modal
- [ ] Modal shows ₹50 price, 3 searches, feature list
- [ ] Razorpay flow: `createRankPayment()` → open checkout → `verifyRankPayment()` → update `rankProfile`
- [ ] Re-run reveal automatically after successful payment

---

### 7.C.7 — `CollegePredictor.jsx` — URL sync (rank mode)

Micro-tasks:
- [ ] On rank predict: update URL to `?rank=12450&cat=OBC&hu=1&tfws=0&gender=male&branches=Computer,Mechanical`
- [ ] On hydration: if `?rank=...` in URL, restore all inputs + auto-run predict

---

### 7.C.8 — `frontend/src/pages/MyPredictions.jsx` — Mode badges + rank quota

Micro-tasks:
- [ ] Read `s.inputs.mode` (or detect from presence of `s.inputs.rank`) per saved search
- [ ] Percentile searches: blue `%` badge; Rank searches: orange `#` badge
- [ ] Rank quota meter: "Rank Searches: X / 3"
- [ ] "Buy more" section shows rank pack only: ₹50 / 3 searches

---

### 7.C.9 — Homepage rank widget (replaces percentile hero)

**Files:** `frontend/src/pages/Home.jsx` (or wherever `PercentileLandscape` / `PredictorPreview` is imported)

Micro-tasks:
- [ ] Remove `PercentileLandscape` and `PredictorPreview` components from homepage
- [ ] Add a rank input widget: rank number input + category dropdown + "Predict Colleges" CTA button
- [ ] Show a static sample result row (live teaser — no API call needed) to illustrate output
- [ ] CTA links to `/college-predictor` with `?rank=<value>&cat=<cat>` pre-filled

---

## Phase 7.E — User Migration Script (One-Time)

### Status: ❌ NOT STARTED

Paid percentile users (who purchased before Phase 7) should be migrated to rank searches automatically.

**Script:** `backend/scripts/migrate_percentile_users.mjs`

Logic:
```js
// Find all predictor_profiles where searches_limit > 0
// For each: set searches_limit = 0, set rank_searches_limit = 3
// (grant 3 free rank searches; retain their existing percentile history)
```

Micro-tasks:
- [ ] Write `migrate_percentile_users.mjs`
- [ ] Dry-run first: print affected user IDs and counts before modifying
- [ ] Run on Neon dev DB, confirm output
- [ ] Run on VPS prod (Rohit runs manually after Phase 7 goes live)

---

## Phase 7.D — Verification Checklist

Run all checks on dev (Neon) before merging to `main`.

### Backend API checks (curl / Postman)
- [ ] `GET /api/predictor/rank/meta` → returns branches + categories
- [ ] `POST /api/predictor/rank/predict` → returns `{ counts: { reach, safe }, locked: true, results: [] }`
- [ ] `POST /api/predictor/rank/predict` with invalid rank → 400
- [ ] `POST /api/predictor/rank/reveal` without auth → 401
- [ ] `POST /api/predictor/rank/reveal` with auth + 0 quota → 402 `RANK_QUOTA_EXHAUSTED`
- [ ] `POST /api/predictor/rank/pay/create` → returns Razorpay orderId
- [ ] `POST /api/predictor/rank/pay/verify` (mock sig) → `rank_searches_limit += 3`
- [ ] After payment: `POST /api/predictor/rank/reveal` → returns `{ results: [...30 rows], locked: false }`
- [ ] Results order: first rows have `type: 'reach'`, last rows have `type: 'safe'`
- [ ] Re-open same combo → `fromCache: true`, no quota consumed
- [ ] Non-HU student: only S/O suffix categories in `effectiveCategories` (no H codes)

### Data spot-checks
- [ ] Pick 3 (college, branch, category) rows from Excel — verify closing rank matches DB
- [ ] Verify reach colleges (margin < 0) appear before safe (margin >= 0) in results
- [ ] Verify probability at 5% rank drop ≈ 90%, at 20% ≈ 60%, at 30% ≈ 20%

### Frontend browser checks
- [ ] Page loads in rank-only mode — no percentile slider visible
- [ ] Rank input: non-integers rejected, 0 rejected, > 250000 rejected
- [ ] Branch group chip selects/deselects all branches in group
- [ ] Gender = Female shows disclaimer banner
- [ ] Locked state: only counts shown, no college names
- [ ] Unlocked table: reach section appears first, safe section second
- [ ] Probability badge colors: green / amber / red
- [ ] Print/PDF: option form layout, 30 rows, section dividers
- [ ] URL hydration: paste rank URL in new tab → inputs restored + results auto-loaded
- [ ] MyPredictions: rank search shows `#` badge, rank quota meter visible
- [ ] Homepage rank widget renders and CTA pre-fills the predictor URL
- [ ] `vite build` clean with no errors

### Final deployment
- [ ] Merge `dev` → `main`
- [ ] Confirm Coolify triggers rebuild
- [ ] Confirm `prisma migrate deploy` runs in container logs (migration auto-applied to prod VPS)
- [ ] Run `migrate_percentile_users.mjs` on prod (Rohit)
- [ ] Spot-check one rank prediction on production URL

---

## Task Summary

| Phase | Tasks | Done | Remaining |
|---|---|---|---|
| Pre-dev setup | 4 | 3 | 1 (start local backend) |
| 7.A Data | 7 | 7 | 0 ✅ |
| 7.B Backend rework | 9 micro-tasks across 3 files + products.json | 0 | 9 |
| 7.B Already done | 3 files | 3 | 0 |
| 7.C Frontend | 28 micro-tasks across 7 files | 0 | 28 |
| 7.D Verification | 23 checks | 0 | 23 |
| 7.E User migration | 4 tasks | 0 | 4 |
| **Total** | **~67** | **~10** | **~57** |

---

## File Change Map

| File | Status | What changes |
|---|---|---|
| `backend/src/predictor/predictor.rank.service.js` | 🔧 Rework | Probability fn, flat list, dynamic reach, HU bug fix |
| `backend/src/predictor/predictor.rank.controller.js` | 🔧 Rework | Two-step bug fix, counts-only preview, flat result passthrough |
| `backend/src/predictor/predictor.rank.model.js` | ✅ No change | Already correct |
| `backend/src/predictor/predictor.account.model.js` | ✅ No change | Already done |
| `backend/src/predictor/predictor.account.controller.js` | ✅ No change | Already done |
| `backend/src/predictor/predictor.routes.js` | ✅ No change | Already done |
| `backend/src/order/products.json` | 🔧 Update | price: 200→50, pack: 15→3 |
| `backend/scripts/migrate_percentile_users.mjs` | ❌ New file | One-time user migration script |
| `frontend/src/predictor/branchGroups.js` | ❌ New file | Branch group constants |
| `frontend/src/predictor/predictorService.js` | 🔧 Add | 5 rank API functions |
| `frontend/src/pages/CollegePredictor.jsx` | 🔧 Rework | Remove percentile, rank input, flat table, paywall, URL sync |
| `frontend/src/predictor/predictorPdf.js` | 🔧 Add | Rank / option form mode |
| `frontend/src/pages/MyPredictions.jsx` | 🔧 Add | Mode badges, rank quota meter |
| `frontend/src/pages/Home.jsx` (or similar) | 🔧 Rework | Remove percentile hero, add rank widget |
