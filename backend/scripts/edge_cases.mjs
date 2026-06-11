// 5.C.2 — Edge case tests against the live API.
// Requires the backend running on PORT (default 5000).
import 'dotenv/config';

const BASE = `http://localhost:${process.env.PORT || 5000}/api/predictor`;

const cases = [
  { name: 'pct = 0, OPEN, all branches',             body: { percentile: 0,   category: 'OPEN', homeUniversity: false, branches: [] } },
  { name: 'pct = 100, OPEN, all branches',           body: { percentile: 100, category: 'OPEN', homeUniversity: false, branches: [] } },
  { name: 'pct = 100, OBC, home U, all branches',    body: { percentile: 100, category: 'OBC',  homeUniversity: true,  branches: [] } },
  { name: 'empty branches (should mean all)',        body: { percentile: 92,  category: 'OPEN', homeUniversity: false, branches: [] } },
  { name: 'OPEN for reserved category (SC)',         body: { percentile: 88,  category: 'SC',   homeUniversity: false, branches: [] } },
  { name: 'category = OPEN itself',                  body: { percentile: 90,  category: 'OPEN', homeUniversity: true,  branches: ['Computer'] } },
  { name: 'tfws on (does not affect non-TFWS col)',  body: { percentile: 95,  category: 'OBC',  homeUniversity: false, branches: [], tfws: true } },
  { name: 'nt1 with home U (L* variants)',           body: { percentile: 85,  category: 'NT1',  homeUniversity: true,  branches: [] } },
  { name: 'vj with home U (L* variants)',            body: { percentile: 85,  category: 'VJ',   homeUniversity: true,  branches: [] } },
  { name: 'invalid category',                        body: { percentile: 85,  category: 'FOO',  homeUniversity: false, branches: [] }, expectError: true },
  { name: 'missing percentile',                      body: { category: 'OPEN', branches: [] }, expectError: true },
  { name: 'percentile negative',                     body: { percentile: -5, category: 'OPEN', branches: [] }, expectError: true },
  { name: 'percentile > 100',                        body: { percentile: 150, category: 'OPEN', branches: [] }, expectError: true },
  { name: 'branches with bogus name',                body: { percentile: 90, category: 'OPEN', branches: ['Astrology Engineering'] } },
  { name: 'pct = 50, OPEN, no L, all branches',      body: { percentile: 50,  category: 'OPEN', homeUniversity: false, branches: [] } },
];

let pass = 0, fail = 0;
for (const tc of cases) {
  try {
    const res = await fetch(`${BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tc.body),
    });
    const json = await res.json();

    if (tc.expectError) {
      if (!res.ok) { console.log(`  ✅ ${tc.name}  → rejected with ${res.status}`); pass++; }
      else          { console.log(`  ❌ ${tc.name}  → expected error but got ${res.status}`); fail++; }
      continue;
    }

    if (!res.ok) {
      console.log(`  ❌ ${tc.name}  → HTTP ${res.status} ${JSON.stringify(json).slice(0, 80)}`);
      fail++;
      continue;
    }

    // Invariants for success cases
    const { counts, effectiveCategories, query } = json;
    if (counts.total < 0) { console.log(`  ❌ ${tc.name}  → negative total`); fail++; continue; }
    if (counts.safe + counts.moderate + counts.reach !== counts.total) {
      console.log(`  ❌ ${tc.name}  → bucket sum != total (${counts.safe}+${counts.moderate}+${counts.reach} vs ${counts.total})`);
      fail++; continue;
    }
    if (!Array.isArray(effectiveCategories)) { console.log(`  ❌ ${tc.name}  → effectiveCategories not array`); fail++; continue; }
    if (query.percentile !== tc.body.percentile) { console.log(`  ❌ ${tc.name}  → echo mismatch`); fail++; continue; }

    // pct=0 must return 0
    if (tc.body.percentile === 0 && counts.total !== 0) {
      console.log(`  ❌ ${tc.name}  → expected 0 matches, got ${counts.total}`); fail++; continue;
    }

    console.log(`  ✅ ${tc.name}  → total=${counts.total} (s=${counts.safe} m=${counts.moderate} r=${counts.reach})`);
    pass++;
  } catch (e) {
    console.log(`  ❌ ${tc.name}  → THROW ${e.message}`);
    fail++;
  }
}

console.log(`\n${pass}/${pass+fail} passed.`);
process.exit(fail === 0 ? 0 : 1);
