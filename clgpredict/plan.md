# ApexClasses — Master Execution Plan

> Reference for domain logic, category codes, and probability formula: `clgpredict/logic.md`
> DB: Neon (dev) | VPS Postgres `82.180.144.69` (prod, 186 users)
> Branch: `dev` → merge to `main` triggers Coolify prod rebuild
> Last updated: 2026-07-21
> **Ship order:** Phase 1 (Shadow Phone) → Phase 2 (Logto Auth) → Phase 3 (Verify & Ship All)

---

## What Is Already Done

| Area | Status |
|---|---|
| Rank cutoffs ETL + seed (5,971 rows, 77 colleges, 28 branches) | ✅ |
| DB migration (rank_cutoffs table, rank quota columns on predictor_profiles) | ✅ |
| `predictor.rank.model.js` — two-query design (findReachByRank + findSafeByRank) | ✅ |
| `predictor.rank.service.js` — probability formula, slack ladder, 0% colleges kept | ✅ |
| `predictor.rank.controller.js` — predict + reveal + pay/create + pay/verify | ✅ |
| `predictor.account.model.js` — rank quota functions (getRankProfile, incrementRankUsed, grantRankSearches) | ✅ |
| `predictor.account.controller.js` — profile returns rankProfile, adminStats includes rank metrics | ✅ |
| `predictor.routes.js` — all 5 rank routes wired | ✅ |
| `frontend/src/predictor/branchGroups.js` | ✅ |
| `frontend/src/predictor/predictorService.js` — rank API functions | ✅ |
| `frontend/src/predictor/predictorPdf.js` — rank mode | ✅ |
| `frontend/src/pages/CollegePredictor.jsx` — rank-only rewrite | ✅ |
| `frontend/src/pages/MyPredictions.jsx` — mode badges + rank quota | ✅ |
| `frontend/src/pages/home.jsx` — RankLandscape + RankPreview widgets | ✅ |
| DB grants: rohitrhuge@gmail.com → 50 rank searches, tushar1382@gmail.com → 50 rank searches | ✅ |
| Bug fix: `getOrCreateProfile` now returns `rank_searches_limit, rank_searches_used` | ✅ |
| Bug fix: reach query split into two separate queries — COEP now appears for rank 500 | ✅ |

---

## Phase 1 — Shadow Phone Flow (Frictionless Entry)

**Goal:** User enters phone only → instant shadow account → can pay and predict → data saved in localStorage + DB. Zero name/email/password required. Cross-device access deliberately not supported — intentional friction to push users toward Google login.

### 1.1 — DB Migration

- [ ] Write migration SQL `backend/prisma/migrations/YYYYMMDD_shadow_logto/migration.sql`:
  ```sql
  ALTER TABLE users ADD COLUMN account_type VARCHAR(20) NOT NULL DEFAULT 'registered';
  ALTER TABLE users ADD COLUMN shadow_expires_at TIMESTAMPTZ;
  ALTER TABLE users ADD COLUMN shadow_device_token VARCHAR(255);
  -- account_type values: 'registered' (existing), 'shadow' (phone-only temp)
  ```
- [ ] Apply migration to Neon dev DB
- [ ] Verify existing users have `account_type = 'registered'` (default applies cleanly)

### 1.2 — Backend: Shadow Account Endpoint

- [ ] Create `POST /api/predictor/shadow-guest` (no auth required):
  - Input: `{ phone }` — phone only, no name
  - Validate: 7–15 digits
  - If phone exists with `account_type = 'shadow'` → return existing user (do NOT re-create)
  - If phone exists with `account_type = 'registered'` → return `{ code: 'ACCOUNT_EXISTS', error: 'This number has a registered account. Sign in via Google to access it.' }`
  - If new: `INSERT INTO users (id, phone, name, role, account_type, shadow_expires_at, shadow_device_token) VALUES (uuid, phone, 'Student', 'user', 'shadow', NOW() + INTERVAL '30 days', gen_random_uuid()::text)`
  - Call `getOrCreateProfile(userId)` to create quota row
  - Issue JWT (15 min) — returned in response body only, no refresh cookie
  - Response: `{ success: true, accessToken, deviceToken: <shadow_device_token>, userId, isShadow: true }`
- [ ] Add `POST /shadow-guest` route to `predictor.routes.js`
- [ ] Add `shadowGuest()` handler in `predictor.account.controller.js`
- [ ] Add `createShadowUser()`, `findShadowByPhone()` in `predictor.account.model.js`

### 1.3 — Backend: Shadow Token Refresh

- [ ] Create `POST /api/predictor/shadow-refresh` (no auth required):
  - Input: `{ phone, deviceToken }`
  - Lookup user by phone AND `account_type = 'shadow'`
  - Verify `deviceToken` matches `shadow_device_token` column AND `shadow_expires_at > NOW()`
  - If match: issue new access JWT
  - If mismatch: `{ code: 'DEVICE_MISMATCH', error: 'Access not available on this device. Sign in with Google to continue.' }`
- [ ] Add `POST /shadow-refresh` route to `predictor.routes.js`
- [ ] Add `shadowRefresh()` handler in `predictor.account.controller.js`
- [ ] Add `findShadowByToken()` in `predictor.account.model.js`

### 1.4 — Backend: Shadow Cleanup Script

- [ ] Create `backend/scripts/cleanup_shadow_accounts.mjs`:
  - `DELETE FROM users WHERE account_type = 'shadow' AND shadow_expires_at < NOW()`
  - Logs count of deleted rows
- [ ] Register as daily cron in Coolify (or call from server startup for simplicity)

### 1.5 — Frontend: Phone-Only Modal

- [ ] Update `CollegePredictor.jsx` phone panel:
  - Remove `name` input field entirely
  - Keep only `phone` input (label: "Your Mobile Number")
  - On submit: call `/api/predictor/shadow-guest`
  - On success: store `deviceToken` in `localStorage['apex_shadow_<phone_last4>']`; keep `accessToken` in memory only (not in `localStorage['apex_token']`)
  - On `ACCOUNT_EXISTS` error: show "This number is linked to a Google account. Sign in with Google to continue." + Google login button
- [ ] Update `AuthContext.jsx`:
  - Add `loginAsShadow(phone)` function
  - Add `isShadow` derived state: `!!user?.isShadow`
  - Shadow access token stored in React state / memory only — not persisted in localStorage
  - On 401: try shadow refresh via `/api/predictor/shadow-refresh` using stored deviceToken; if fails, show "Sign in with Google" prompt

### 1.6 — Frontend: Shadow User Banner

- [ ] Add persistent banner for shadow users on `CollegePredictor.jsx` and `MyPredictions.jsx`:
  - Text: "Your results are saved on this device only. Sign in with Google to access them anywhere."
  - CTA: "Save Permanently" → triggers Google login (Phase 2)
  - Dismissable per session via `sessionStorage` flag

### 1.7 — Shadow → Full Account Merge

- [ ] Create `POST /api/auth/merge-shadow` (auth required — called after Google login):
  - Input: `{ phone, deviceToken }`
  - Find shadow user by phone + deviceToken
  - Transfer `predictor_profiles` quota to the newly registered user (`UPDATE ... SET user_id = newId`)
  - Transfer `predictor_searches` rows (`UPDATE predictor_searches SET user_id = newId WHERE user_id = shadowId`)
  - Transfer `predictor_payments` rows
  - `DELETE FROM users WHERE id = shadowId`
  - Response: `{ success: true, transferred: { searches, payments } }`
- [ ] In `AuthCallback.jsx` (Phase 2): after successful login, check localStorage for any `apex_shadow_*` key → if found, call `merge-shadow` automatically

---

## Phase 2 — Logto Auth Migration

**Goal:** Move all authentication to self-hosted Logto. Existing 103 registered users imported via Management API with plain-text passwords (Logto auto-upgrades to bcrypt on first login). Google login becomes the primary new-user path. Forgot password handled entirely by Logto + Brevo connector.

### DB state going in (prod):
- 103 registered users (email + plain-text password) → bulk import to Logto
- 75 phone-only guests → converted to shadow accounts by Phase 1 migration
- 8 email-no-password users → import to Logto, force password reset on first login

### 2.1 — DB Migration for Logto

- [ ] Add to the same migration file from Phase 1 (or a new file if Phase 1 is already deployed):
  ```sql
  ALTER TABLE users ADD COLUMN logto_sub VARCHAR(255) UNIQUE;
  ALTER TABLE users ADD COLUMN avatar_url TEXT;
  ```
- [ ] Apply to Neon dev DB

### 2.2 — Logto Instance Setup (Rohit does this on VPS)

- [ ] Install Logto on VPS: `docker run -d --name logto -p 3001:3001 -p 3002:3002 svhd/logto`
- [ ] Expose admin console at `auth-admin.apexclasses.org` (port 3002) via Traefik — restrict to VPN/IP
- [ ] Expose OIDC endpoint at `auth.apexclasses.org` (port 3001) via Traefik — public
- [ ] Open Logto admin console → complete initial setup wizard
- [ ] Create application → type "Traditional Web" → note `App ID` and `App Secret`
- [ ] Set allowed redirect URIs: `https://apexclasses.org/auth/callback`, `https://dev.apexclasses.org/auth/callback`
- [ ] Configure email connector → SMTP → Brevo host + API key from `.env`
- [ ] Configure Google connector → create OAuth app in Google Cloud Console → paste Client ID + Secret into Logto

### 2.3 — User Import Script

- [ ] Create `backend/scripts/import_users_to_logto.mjs`:
  - Get Logto Management API token: `POST https://auth.apexclasses.org/oidc/token` with `client_credentials` grant
  - Query prod DB: `SELECT id, name, email, phone, password FROM users WHERE password IS NOT NULL`
  - For each user:
    ```js
    POST https://auth.apexclasses.org/api/users
    {
      primaryEmail: user.email,
      name: user.name,
      customData: { apex_user_id: user.id },
      passwordEncryptionMethod: 'Plain',
      passwordEncrypted: user.password
    }
    ```
  - On success: `UPDATE users SET logto_sub = <logto_id> WHERE id = <apex_id>`
  - Log each result: success / already_exists / error
  - Dry-run flag: print what would be imported, make no API calls
- [ ] Run dry-run first → inspect output
- [ ] Run live on dev → verify users appear in Logto console
- [ ] Run live on prod after Phase 2 is deployed (Rohit runs manually)
- [ ] For 8 email-no-password users: import with `passwordEncrypted: null` → Logto forces reset on first login

### 2.4 — Backend: Logto Callback Endpoint

- [ ] Add to `backend/.env`: `LOGTO_APP_ID`, `LOGTO_APP_SECRET`, `LOGTO_ENDPOINT=https://auth.apexclasses.org`
- [ ] Create `POST /api/auth/logto/callback` in `auth.controller.js`:
  - Input: `{ code, redirectUri }`
  - Exchange code: `POST /oidc/token` at Logto
  - Fetch identity: `GET /oidc/userinfo` → get `sub`, `email`, `name`, `picture`
  - Lookup by `logto_sub` → if found, log in
  - Lookup by `email` → if found, link `logto_sub` + `avatar_url`, log in
  - If neither: `INSERT INTO users` as new registered user (`account_type = 'registered'`)
  - Issue JWT + refresh cookie (same mechanics as current login)
  - Response: `{ success: true, accessToken, user: { id, name, email, phone, role } }`
- [ ] Add `upsertLogtoUser()`, `linkLogtoSub()` to `auth.model.js`
- [ ] Add route `POST /api/auth/logto/callback` to `auth.routes.js`

### 2.5 — Backend: Remove Old Auth Endpoints

- [ ] Remove `POST /api/auth/register` controller logic and route
- [ ] Remove `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` routes
- [ ] Change `POST /api/auth/login`: return `{ error: 'Login is now handled via Google sign-in', redirect: '/login' }` — keeps old bookmarks from 404ing
- [ ] Keep unchanged: `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`

### 2.6 — Frontend: Auth Callback Page

- [ ] Create `frontend/src/pages/AuthCallback.jsx`:
  - Read `?code=...` from URL
  - `POST /api/auth/logto/callback` with `{ code, redirectUri: window.location.origin + '/auth/callback' }`
  - On success: store token + user in `localStorage['apex_token']` + `localStorage['apex_user']`; redirect to `/`
  - On error: show error + "Try again" link back to `/login`
  - Check localStorage for any `apex_shadow_*` key → if found, call `POST /api/auth/merge-shadow` automatically
- [ ] Add route `path="/auth/callback"` in `App.jsx`

### 2.7 — Frontend: Replace Login / Register Pages

- [ ] Update `Login.jsx`:
  - Remove email/password form entirely
  - Show two buttons:
    - "Continue with Google" → `https://auth.apexclasses.org/oidc/auth?...&direct_sign_in=social:google`
    - "Continue with Email" → `https://auth.apexclasses.org/oidc/auth?...&interaction_mode=signIn`
  - Both redirect URIs point to `https://apexclasses.org/auth/callback`
  - Keep `scope=openid profile email phone`
- [ ] Delete `Register.jsx` and remove its route from `App.jsx`
- [ ] Delete `ForgotPassword.jsx` and `ResetPassword.jsx` and remove their routes
- [ ] Grep for links to `/register`, `/forgot-password`, `/reset-password` and remove them

### 2.8 — Frontend: AuthContext Update

- [ ] Remove `register()` function
- [ ] Remove direct `login(email, password)` call
- [ ] Add `loginWithLogto(mode)` → constructs Logto authorize URL and redirects (`mode`: `'google'` or `'email'`)
- [ ] Keep `logout()` unchanged
- [ ] Add `isShadow` derived state (feeds from Phase 1)

### 2.9 — Frontend: Env Vars

- [ ] Add to `frontend/.env`:
  ```
  VITE_LOGTO_APP_ID=<from Logto console>
  VITE_LOGTO_ENDPOINT=https://auth.apexclasses.org
  ```

---

## Phase 3 — Verify & Ship Everything

**Goal:** With Phases 1 and 2 complete on `dev`, run the full verification checklist across rank predictor + shadow flow + Logto auth, then merge to `main` in one release.

### 3.1 — Rank Predictor Smoke Test

- [ ] Restart backend dev server (`npm run dev` in `backend/`)
- [ ] Hard-refresh browser (Ctrl+Shift+R)
- [ ] Login as `rohitrhuge@gmail.com` via Google (Logto) → profile shows 50 rank searches remaining
- [ ] Run: rank 500, OBC, HU=true, branch=Computer → COEP appears in reach section with 0% probability
- [ ] Click Unlock → 1 search consumed (49 remaining), no paywall

### 3.2 — Rank Predictor API Checks

- [ ] `GET /api/predictor/rank/meta` → `{ branches: [...28], categories: [...] }`
- [ ] `POST /api/predictor/rank/predict` `{ rank: 8000, category: "OBC", homeUniversity: true }` → `{ counts: { reach, safe }, locked: true, results: [] }`
- [ ] `POST /api/predictor/rank/predict` with `rank: 0` → 400
- [ ] `POST /api/predictor/rank/reveal` without auth → 401
- [ ] `POST /api/predictor/rank/reveal` with auth + 0 rank quota → 402 `RANK_QUOTA_EXHAUSTED`
- [ ] `POST /api/predictor/rank/reveal` with valid auth → `{ results: [...], locked: false, fromCache: false }`
- [ ] Repeat same reveal → `{ fromCache: true }` — no quota consumed
- [ ] Results order: reach rows (margin < 0) before safe rows (margin ≥ 0)
- [ ] Non-HU student: `effectiveCategories` contains no H-suffix codes

### 3.3 — Data Spot Checks

- [ ] Pick 3 rows from the original Excel → confirm `closing_rank` in DB matches exactly
- [ ] Rank 8000, closing rank 7200 → probability 80% (10% drop, segment 1)
- [ ] Rank 8000, closing rank 5600 → probability 20% (30% drop, segment 2)

### 3.4 — Frontend Browser Checks (Rank Predictor)

- [ ] Page loads rank-only — no percentile slider
- [ ] Rank input: non-integers rejected, 0 rejected, >250000 rejected
- [ ] Branch group chip selects/deselects all group branches
- [ ] Locked state: only counts shown, no college names
- [ ] Unlocked table: reach section header + safe section header, SR numbers 1–30
- [ ] Probability badge colors: green (≥80%), amber (40–79%), red (<40%)
- [ ] PDF download: correct filename, 30 rows, correct headers
- [ ] URL hydration: paste `?rank=8000&cat=OBC&hu=1` → inputs restored + predict auto-runs
- [ ] MyPredictions: rank search shows `#` badge, "Rank Searches: X / 3" quota meter visible
- [ ] Homepage rank widget renders, CTA pre-fills predictor URL
- [ ] `vite build` exits 0

### 3.5 — Shadow Flow Browser Checks

- [ ] Open CollegePredictor logged out → phone modal appears with phone field only (no name field)
- [ ] Enter phone → shadow account created → predict runs
- [ ] Shadow banner visible: "Your results are saved on this device only."
- [ ] Open same phone in incognito → device mismatch → "Sign in with Google" shown
- [ ] Close browser → reopen → shadow token refresh works on same device (results still accessible)
- [ ] Phone number that already has a registered account → ACCOUNT_EXISTS message shown

### 3.6 — Logto Auth Checks

- [ ] Existing user (rohitrhuge@gmail.com) signs in via "Continue with Email" → same password works
- [ ] New user signs in via "Continue with Google" → account created → lands on home
- [ ] Forgot password: Logto sends Brevo email → reset link works
- [ ] Shadow user signs in with Google → merge runs automatically → searches transferred → shadow row deleted
- [ ] `POST /api/auth/register` returns friendly redirect message
- [ ] Admin accounts (tushar + rohit) can access admin dashboard after Google login

### 3.7 — User Migration Script (Paid Percentile Users)

- [ ] Create `backend/scripts/migrate_percentile_users.mjs`:
  - Query: `SELECT user_id, searches_limit FROM predictor_profiles WHERE searches_limit > 0`
  - Dry-run: print affected user IDs and amounts, no writes
  - Live: `SET searches_limit = 0, rank_searches_limit = rank_searches_limit + 3`
  - Log each row updated
- [ ] Run dry-run on Neon dev DB → confirm output correct
- [ ] Run live on Neon dev DB → verify rank quota incremented
- [ ] Run live on prod VPS after deploy (Rohit runs manually)

### 3.8 — Deploy

- [ ] `git add -A && git commit` on `dev` branch
- [ ] `git push origin dev`
- [ ] Open PR: `dev` → `main`
- [ ] Merge PR → Coolify triggers rebuild
- [ ] Confirm `prisma migrate deploy` appears in build logs (DB migration applied to prod)
- [ ] Run `import_users_to_logto.mjs` against prod (Rohit)
- [ ] Run `migrate_percentile_users.mjs` against prod (Rohit)
- [ ] Spot-check one rank prediction on `apexclasses.org/college-predictor`
- [ ] Spot-check Google login on `apexclasses.org`

---

## Phase 4 — Post-Launch Improvements (Backlog)

Do after Phases 1–3 are live and stable.

| Task | What |
|---|---|
| Female / Ladies quota data | Re-run ETL with ladies columns; add `_F` category codes; show `L` badge on rows using ladies cutoff |
| State-quota data (S suffix) | Non-HU students only get OPEN results now; expand Excel data to fill non-HU category gaps |
| 2025 data when available | Add `year = 2025` rows; weight recent year in probability |
| Mumbai / Nagpur / Aurangabad | Expand to other city regions — separate Excel source files |
| Autonomous flag | Add `autonomous BOOLEAN` to `colleges` table; show on result rows |
| CAP round breakdown | Add `round SMALLINT` column to `rank_cutoffs`; round 1 cutoffs only now |
| OTP for shadow recovery | Send SMS OTP to let shadow users recover on new device without Google |
| Admin: shadow account stats | Show shadow vs registered breakdown in admin dashboard |

---

## File Change Map

| File | Phase | Change |
|---|---|---|
| `backend/prisma/migrations/YYYYMMDD_shadow_logto/migration.sql` | 1+2 | New: account_type, shadow_expires_at, shadow_device_token, logto_sub, avatar_url |
| `backend/src/predictor/predictor.routes.js` | 1 | Add `POST /shadow-guest`, `POST /shadow-refresh` |
| `backend/src/predictor/predictor.account.controller.js` | 1 | Add shadowGuest(), shadowRefresh() handlers |
| `backend/src/predictor/predictor.account.model.js` | 1 | Add createShadowUser(), findShadowByPhone(), findShadowByToken() |
| `backend/src/auth/auth.routes.js` | 2 | Add logto/callback, remove register/forgot-password/reset-password |
| `backend/src/auth/auth.controller.js` | 2 | Add logtoCallback(), stub removed routes |
| `backend/src/auth/auth.model.js` | 2 | Add upsertLogtoUser(), linkLogtoSub() |
| `backend/scripts/migrate_percentile_users.mjs` | 3 | New: grant 3 rank searches to paid percentile users |
| `backend/scripts/import_users_to_logto.mjs` | 2 | New: bulk import 103 users into Logto |
| `backend/scripts/cleanup_shadow_accounts.mjs` | 1 | New: delete expired shadow accounts |
| `backend/.env` | 2 | Add LOGTO_APP_ID, LOGTO_APP_SECRET, LOGTO_ENDPOINT |
| `frontend/src/pages/CollegePredictor.jsx` | 1 | Phone modal → phone-only, call shadow-guest endpoint |
| `frontend/src/pages/AuthCallback.jsx` | 2 | New: exchange Logto code, merge shadow if needed |
| `frontend/src/pages/Login.jsx` | 2 | Replace form with Logto redirect buttons |
| `frontend/src/pages/Register.jsx` | 2 | Delete |
| `frontend/src/pages/ForgotPassword.jsx` | 2 | Delete |
| `frontend/src/pages/ResetPassword.jsx` | 2 | Delete |
| `frontend/src/context/AuthContext.jsx` | 1+2 | Add isShadow, loginAsShadow(), loginWithLogto(), remove register() |
| `frontend/.env` | 2 | Add VITE_LOGTO_APP_ID, VITE_LOGTO_ENDPOINT |

---

## Current Prod DB Snapshot (2026-07-21)

| Segment | Count | Notes |
|---|---|---|
| Registered users (email + password) | 103 (incl. 2 admins) | Plain-text passwords — Logto auto-upgrades on first login |
| Guest users (phone only, no password) | 75 | 0 paid, 0 searches used — safe to convert to shadow type via migration |
| Email users without password | 8 | Import to Logto; forced password reset on first login |
| Paid predictor payments | 6 PAID @ ₹544 | All percentile, no rank payments yet |
| Pending payments | 5 CREATED @ ₹455 | Abandoned checkouts — ignore |
| Rank searches granted | 100 (2 test accounts) | rohitrhuge + tushar1382 |
