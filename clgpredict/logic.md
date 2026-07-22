# MHT-CET College Predictor — Domain Logic Reference

> This file documents how the Maharashtra CAP (Centralized Admission Process) seat
> allocation system works, and exactly how we map it to prediction logic.
> Keep this updated whenever data or rules change.

---

## 1. Category System

Maharashtra engineering admissions use reservation-based seat allocation. Every seat in
every college belongs to one category.

### 1.1 Base Categories

| Code | Full Name | Notes |
|---|---|---|
| OPEN | Open / General | No reservation — all candidates compete |
| OBC | Other Backward Class | Caste certificate from Maharashtra required |
| SC | Scheduled Caste | |
| ST | Scheduled Tribe | |
| VJ | Vimukta Jati / DT | Denotified Tribe |
| NT1 | Nomadic Tribe B | |
| NT2 | Nomadic Tribe C | |
| NT3 | Nomadic Tribe D | |
| SEBC | Socially & Educationally Backward Classes | Maratha reservation |
| EWS | Economically Weaker Section | Annual family income < ₹8 lakh, non-reserved caste |
| TFWS | Tuition Fee Waiver Scheme | Not a caste category — based on family income < ₹8 lakh regardless of caste; fee is waived, separate merit list |

**Important:** A student is eligible for their own category AND all "easier" categories above
them in the merit order. In practice, since ALL students can compete in OPEN, and reserved
candidates can use their own category cutoffs, the predictor always includes OPEN + the
student's reservation category.

TFWS is special: any student (any category) whose family income is below the threshold can
apply for TFWS seats simultaneously with their regular category.

### 1.2 Local (Home University) vs General Quota — L and G Prefix

Within each category, seats are divided into two quotas:

| Prefix | Meaning | Who is eligible |
|---|---|---|
| G | General (All Maharashtra) | Any Maharashtra domicile student |
| L | Local (Home University) | Students whose SSC/HSC is from the same university zone |

**Example:** OPEN category at a Pune college —
- G-OPEN seats: any Maharashtra student
- L-OPEN seats: only Pune divisional board (SPPU) students

Typically 50% of a college's seats are HU (L prefix), 50% are general (G prefix).
A Pune student who qualifies for L-OPEN at a Pune college sees a *higher cutoff rank*
(worse, more students compete), while a student from Nashik only competes for G-OPEN.

In our **rank data**, the full code encodes both:
- `LOPENH` = L prefix (Home Univ) + OPEN + H suffix (home-univ college)
- `GOPENH` = G prefix (General) + OPEN + H suffix

### 1.3 University Type Suffix — H, S, O

The third dimension is *which type of college* the cutoff belongs to:

| Suffix | Meaning | When it applies |
|---|---|---|
| H | Home University affiliated | College is in Pune / SPPU zone |
| S | State / Other University | College is in a different university zone |
| O | Open quota (no zone) | Universal — no university restriction |

**Full code breakdown example:**

```
G  OBC  H
│  │    └── College is in Pune (Home-Univ zone)
│  └─────── OBC reservation category
└────────── General (all Maharashtra) quota
= GOBCH
```

```
L  OPEN  S
│  │     └── College is in another univ zone (State)
│  └──────── OPEN / General category
└─────────── Local / Home University quota
= LOPENS
```

---

## 2. Home University (HU) vs Other than Home University (OTHU)

### 2.1 What "Home University" Means

A student's home university is determined by the board/university to which their class 12
college is affiliated.

- **Pune Home University (SPPU)**: students from Pune, Nashik, Aurangabad (Marathwada zone
  specific), and other SPPU-affiliated colleges.
- **Other than HU**: students from other Maharashtra university zones competing for seats
  in Pune colleges.

### 2.2 Autonomous vs Non-Autonomous Colleges

**Non-Autonomous colleges:**
- Run a *single* merit list for each category — there is no separate H/S distinction
- A student from Pune and a student from Nagpur compete on the same list
- In our data: H and S suffix cutoffs are the same or very close
- Prediction: can treat H ≈ S, include both to maximise matches

**Autonomous colleges:**
- Maintain *separate* merit lists for Home University and Other-than-Home University
- HU cutoff rank (H suffix) is typically higher (harder to get) because more Pune students compete
- OTHU cutoff (S suffix) may differ significantly
- A student from outside Pune cannot use H-quota seats; they only see S-quota seats
- **Our data covers all categories for H seats, but only OPEN category for S seats**

### 2.3 Data Coverage Summary

| Quota | Categories available in our data |
|---|---|
| Home University (H suffix) | All: OPEN, OBC, SC, ST, VJ, NT1, NT2, NT3, SEBC, EWS, TFWS, LOPENH, GOPENH |
| State / Other-than-HU (S suffix) | OPEN only: GOPENS, LOPENS |
| Open / Universal (O suffix) | GOPENO, LOPENO |

**Implication for predictions:**
- For Pune (HU) students: full data available, all categories work
- For non-Pune students: only OPEN category results will appear

### 2.4 Prediction Query Logic

When querying, always include BOTH H and S variants. The SQL returns the best (lowest)
closing rank per (college, branch) across all effective categories:

```
Student from Pune, OBC:
  Effective categories = [GOPENH, GOPENS, GOPENO,
                           LOPENH, LOPENS, LOPENO,   ← homeUniversity=true
                           GOBCH, GOBCS,              ← OBC General
                           LOBCH, LOBCS]              ← OBC Local (HU flag)
```

```
Student not from Pune, OPEN:
  Effective categories = [GOPENS, GOPENO,             ← only S/O, no H
                           LOPENS, LOPENO]             ← no L-H either
```

The query then uses `ROW_NUMBER() PARTITION BY (college, branch) ORDER BY closing_rank ASC`
to collapse to the single best match per college-branch pair.

---

## 3. Female Seats (Ladies Quota)

### 3.1 How It Works

Under Maharashtra CAP rules, **30% of seats within each category** are reserved for female
candidates. These are called "Ladies" sub-quota seats.

Example: A college with 60 OPEN seats →
- 42 seats: open to all (gents + ladies compete together)
- 18 seats: reserved for ladies only

**Female candidates compete on two lists simultaneously:**
1. General list (all candidates)
2. Ladies list (only female candidates)

The admission system grants the better (lower-rank) option. As a result, the **effective
cutoff for female candidates is always ≤ the general cutoff** — females have more seats.

Typical cutoff relationship: `ladies_cutoff ≥ general_cutoff` (higher rank number = easier
to get in for ladies since they're competing in a smaller pool).

### 3.2 Current Status in Our Data

**Ladies-specific cutoffs are NOT currently in our dataset.**

The ETL files (`etl_rank.py`, `etl.py`) do not extract female-specific columns. The Excel
source data has these columns but they were not included in the initial data pull.

**Impact:** Our predictions for female students are conservative (correct but incomplete):
- A female student may see "Reach" for a college where she would actually qualify through
  ladies quota — we underestimate her chances
- No incorrect predictions, just missed opportunities

**Planned fix:** Re-run ETL including ladies columns. Suggested category code convention:
```
GOPENH_F  → Female/Ladies variant of GOPENH
GOBCH_F   → Female/Ladies variant of GOBCH
etc.
```
When a student marks gender = Female, include both regular + _F variants in the query.

---

## 4. Probability Calculation

### 4.1 The Formula

Probability represents the chance of admission based on how a student's rank compares to
the closing rank for a given (college, branch, category).

```
margin = closing_rank - student_rank

  positive margin → student's rank is BETTER than the cutoff (lower number) → will likely get in
  negative margin → student's rank is WORSE than the cutoff (higher number) → harder to get in
```

**Step 1 — When student is better than cutoff (margin ≥ 0):**

```
margin ≥ 500  →  100%   (student comfortably ahead of cutoff)
0 ≤ margin < 500  →  99%  (student just at or barely above cutoff — near-match zone)
```

The 500-rank buffer accounts for year-to-year rank variation. A student exactly at the
cutoff in 2024 may not make it in 2025 if the cutoff tightens by a few hundred ranks.

**Step 2 — When student is worse than cutoff (margin < 0):**

```
drop_pct = (student_rank - closing_rank) / student_rank × 100

Segment 1 (0 < drop_pct ≤ 20%):   probability = 100 − 2 × drop_pct
Segment 2 (20 < drop_pct ≤ 35%):  probability = 60 − 4 × (drop_pct − 20)
drop_pct > 35%:                     probability = 0%
```

**Verification table (student rank = 8000):**

| Closing rank | drop_pct | Probability | Segment |
|---|---|---|---|
| 10,000 | — (margin +2000) | 100% | above cutoff |
| 8,200 | — (margin +200) | 99% | near-match |
| 8,000 | 0% | 100% | exactly at cutoff |
| 7,600 | 5% | 90% | Segment 1 |
| 7,200 | 10% | 80% | Segment 1 |
| 6,800 | 15% | 70% | Segment 1 |
| 6,400 | 20% | 60% | Segment 1 → kink |
| 6,000 | 25% | 40% | Segment 2 |
| 5,600 | 30% | 20% | Segment 2 |
| 5,200 | 35% | 0% | Segment 2 |

### 4.2 Graph Shape

The curve is a **piecewise linear / bilinear function** — two straight line segments
connected at the kink point (20% drop, 60% probability). The second segment is exactly
twice as steep as the first.

```
Probability
100% |●●●●●
 90% |          ●
 80% |                ●
 70% |                        ●
 60% |                                ●
 50% |                                      \
 40% |                                           \
 30% |                                                 \
 20% |                                                       ●
 10% |                                                              \
  0% |─────────────────────────────────────────────────────────────●
     0%   5%   10%   15%   20%   25%   30%   35%
     ← easier ──────── rank drop % ──────── harder →
```

Visually resembles an exponential decay curve but implemented as two line segments.
Simple to reason about and adjust.

### 4.3 Bucket Classification (Derived from Probability)

| Bucket | Probability range | Label |
|---|---|---|
| safe | ≥ 80% | High Chance |
| moderate | 40–79% | Likely |
| reach | 1–39% | Ambitious |

Colleges with probability = 0% (drop > 35%) are not shown at all.

### 4.4 JavaScript Implementation

```js
export function calcProbability(studentRank, closingRank) {
  const margin = closingRank - studentRank;  // positive = student is better
  if (margin >= 500) return 100;
  if (margin >= 0)   return 99;
  const dropPct = (-margin / studentRank) * 100;
  if (dropPct <= 20) return Math.round(100 - 2 * dropPct);
  if (dropPct <= 35) return Math.max(0, Math.round(60 - 4 * (dropPct - 20)));
  return 0;
}

export function bucketOf(probability) {
  if (probability >= 80) return 'safe';
  if (probability >= 40) return 'moderate';
  return 'reach';
}
```

---

## 5. Branch Classification & Super-Groups

### 5.1 Why Branch Names Vary

Different colleges name the same engineering discipline differently in official records:
- "Computer Engineering", "Computer Science", "Computer Science and Engineering", "CS",
  "CSE", "Comp Sci." → all mean the same thing

The ETL (`etl.py`, `etl_rank.py`) normalises all raw names to canonical names via
`BRANCH_MAP`. This happens at data-ingestion time — the database stores only canonical
names. **No runtime mapping needed.**

### 5.2 All 28 Canonical Branches

Computer, Information Technology, Computer & IT, AI & Data Science, AI & ML,
Computer (Business), Cyber Security, IoT, E&TC, Electronics, VLSI, Electrical,
Mechanical, Automobile, Robotics, Robotics & Automation, Instrumentation, Civil,
Chemical, Aeronautical, Bio-Technology, Food Technology, Fashion Technology,
Manufacturing, Metallurgy, Printing, Textile, Textile Chemistry

### 5.3 Branch Super-Groups (Frontend Presets)

For the branch selector UI, offer one-click preset groups:

| Group | Canonical branches included |
|---|---|
| Computer Science | Computer, Information Technology, Computer & IT |
| CS Specializations | AI & Data Science, AI & ML, Computer (Business), Cyber Security, IoT |
| Electronics | E&TC, Electronics, VLSI, Instrumentation |
| Mechanical | Mechanical, Automobile, Robotics, Robotics & Automation, Manufacturing |
| Civil & Chemical | Civil, Chemical |
| Other | Electrical, Aeronautical, Bio-Technology, Food Technology, Fashion Technology, Metallurgy, Printing, Textile, Textile Chemistry |

When a user selects a group, all its branches are passed to the API as the `branches[]`
array. The API treats them exactly like individually selected branches. A student wanting
"any CS branch" can click "Computer Science" + "CS Specializations" to get all CS options.

---

## 6. Complete Student Profile → Effective Categories Mapping

Given a student's inputs, expand to the full set of `rank_cutoffs.category` codes to query:

### Inputs
- `category`: one of OPEN, OBC, SC, ST, VJ, NT1, NT2, NT3, SEBC, EWS
- `homeUniversity`: boolean — is student from Pune/SPPU zone?
- `tfws`: boolean — does student qualify for TFWS?
- `gender`: 'male' | 'female' (planned — see Section 3)

### Expansion Logic

```
Always include (everyone can compete for OPEN seats):
  GOPENH, GOPENS, GOPENO
  LOPENH, LOPENS, LOPENO   ← always add L-OPEN too (home univ open is accessible)

If homeUniversity = false, remove H-suffix codes:
  drop GOPENH, LOPENH
  keep only GOPENS, GOPENO, LOPENS, LOPENO

If category ≠ OPEN:
  add G variants: e.g. GOBCH + GOBCS for OBC
  if homeUniversity: also add L variants: LOBCH + LOBCS

If tfws: add TFWS

If gender = female (future):
  add _F variants of all already-included codes
```

### Current Implementation (predictor.rank.service.js → resolveRankCategories)

```js
// Always: GOPENH, GOPENS, GOPENO, LOPENH, LOPENS, LOPENO
// If category ≠ OPEN: add G and L variants (both H and S)
// If homeUniversity: L variants already included above
// If tfws: add TFWS
```

Note: Current code includes H codes for non-HU students too — this is a minor inaccuracy.
Non-HU students should not get H-suffix seats. To fix: only add H codes when `homeUniversity=true`.

---

## 7. Data Gaps & Known Limitations

| Gap | Impact | Fix |
|---|---|---|
| No female (Ladies) cutoffs | Female students see conservative predictions | Re-run ETL with ladies columns; add `_F` category codes |
| S-suffix: only OPEN data | Non-HU students get fewer results | Obtain state-quota data for other categories |
| Single year (2024) | Year-to-year variation not modelled | Add 2025 data when available; weight recent year |
| Only Pune region | Cannot predict for Mumbai/Nagpur/Aurangabad | Expand Excel data to other cities |
| No CAP round breakdown | Later rounds have tighter cutoffs | Round 1 cutoffs only; add round column later |
| Non-autonomous vs autonomous not flagged | Cannot distinguish prediction accuracy | Add `autonomous` boolean to `colleges` table |

---

## 8. Results Display & Print Logic

### 8.1 Screen View (after payment / unlock)

- **Flat ordered list** — no bucket columns. One continuous table, ordered:
  1. **Reach colleges first (up to 10)** — margin < 0 (student's rank is WORSE than closing rank). Ordered by closing rank ascending (hardest/lowest-probability first = SR 1).
  2. **Safe colleges last (up to 20)** — margin ≥ 0 (student's rank is BETTER than or equal to closing rank). Ordered by closing rank ascending (narrowest safe margin first, 100% last = SR 30).
- Total: 30 rows (10 reach + 20 safe). SR No 1–30 matches the recommended CAP option form fill order.

**Rationale for this order:** Maharashtra CAP option form is filled once — preferences are ordered top to bottom. System admits to the FIRST qualifying preference. So you list aspirational (reach) colleges at the top and safe colleges at the bottom. This list is directly usable as the fill order.

### 8.2 Columns in the Table

| Column | Content |
|---|---|
| SR No | Sequential 1–30 (reach first, safe last) |
| College Code | 5-digit code from `colleges.code` |
| College Name | `colleges.name` |
| Branch | Canonical branch name |
| Category | Friendly name of effective category for that row (e.g., "OBC (Home Univ)") |
| Closing Rank | `closing_rank` from `rank_cutoffs` |
| Probability | Calculated % (e.g., 87%) |

### 8.3 Preview (before payment / locked)

- **No college names shown**
- Only display counts: **"Found 10 reach colleges and 18 safe colleges for your inputs"**
- This is a stronger paywall than the current 3-per-bucket preview

### 8.4 Dynamic Reach Expansion

If fewer than 10 reach colleges are found with default `REACH_RANK_SLACK`:
- Progressively expand the slack: 3000 → 5000 → 8000 → 12000
- Stop expanding when 10 reach colleges are found OR when probability drops to 0% (35% rank drop)
- Always show whatever is found (no padding with empty rows)

If fewer than 20 safe colleges found: show all available — do not expand (student's inputs may be niche).

### 8.5 Print / PDF Table

Same 30-row table as screen. PDF-specific additions:
- Header: "MHT-CET 2025 Option Form Reference — Apex Classes"
- Student inputs summary: Rank, Category, Home University, Branches selected
- Watermark / footer: "Fill CAP option form in this exact order for best results"
- Filename: `apex-rank-optionform-{rank}-{cat}.pdf`

### 8.6 Female / Ladies Quota

- **Gender input:** Shown in the input panel with a note: *"Ladies-quota cutoffs not yet available. Results show general-category cutoffs. Your actual chances may be higher."*
- When ladies data is added later: each row shows the BETTER of (general cutoff, ladies cutoff). Rows where ladies cutoff is used get a small `L` badge. Probability recalculates against the ladies closing rank.
- Ladies data category codes will use `_F` suffix convention: e.g., `GOPENH_F`, `GOBCH_F`.

---

## 9. Quick Reference: Code Glossary

| Code fragment | Meaning |
|---|---|
| G prefix | General (all-Maharashtra) quota |
| L prefix | Local (Home-University) quota |
| OPEN | No reservation — general merit |
| H suffix | College affiliated to home university (Pune/SPPU) |
| S suffix | College in other university zone (State) |
| O suffix | Open quota — no university zone restriction |
| TFWS | Tuition Fee Waiver Scheme (income-based, any category) |
| EWS | Economically Weaker Section (non-reserved castes, income < ₹8L) |
| `closing_rank` | Last rank admitted under that category in 2024 |
| `margin` | `closing_rank − student_rank` (positive = student is better) |
| `drop_pct` | `(student_rank − closing_rank) / student_rank × 100` (positive = student is worse) |
