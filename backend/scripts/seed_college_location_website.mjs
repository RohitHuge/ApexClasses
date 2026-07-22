import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const xlsx = require('xlsx');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const DRY_RUN = process.argv.includes('--dry-run');

const XLSX_PATH = path.resolve(__dirname, '../../clgpredict/pune data final for segregation.xlsx');

function extractData() {
    const workbook = xlsx.readFile(XLSX_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    const map = new Map(); // collegeCode → { location, website }

    for (const row of rows) {
        // Column A contains "<code>  <name>" — extract the leading numeric token.
        const code = String(row[0] ?? '').trim().split(/\s+/)[0];
        if (code.length !== 10) continue; // only branch rows have 10-digit codes

        const collegeCode = code.slice(0, 5);
        const location = String(row[1] ?? '').trim() || null;
        // Normalise bare hostnames like "www.coep.org.in" to full URLs.
        const rawWeb  = String(row[2] ?? '').trim();
        const website = rawWeb ? (rawWeb.startsWith('http') ? rawWeb : `https://${rawWeb}`) : null;

        if (!map.has(collegeCode)) {
            map.set(collegeCode, { location: null, website: null });
        }
        const entry = map.get(collegeCode);
        if (!entry.location && location) entry.location = location;
        if (!entry.website  && website)  entry.website  = website;
    }

    return map;
}

async function run() {
    const dataMap = extractData();

    console.log(`Extracted data for ${dataMap.size} colleges from xlsx.\n`);

    if (DRY_RUN) {
        console.log('DRY RUN — no DB writes.\n');
        console.log('Code  | Location                        | Website');
        console.log('------|----------------------------------|--------------------------------');
        for (const [code, { location, website }] of dataMap) {
            console.log(`${code} | ${(location || '—').padEnd(32)} | ${website || '—'}`);
        }
        return;
    }

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    const client = await pool.connect();
    let updated = 0;
    const noMatch = [];
    const noLocation = [];
    const noWebsite = [];

    try {
        for (const [code, { location, website }] of dataMap) {
            const res = await client.query(
                `UPDATE colleges SET location = $1, website = $2 WHERE code = $3`,
                [location, website, code]
            );
            if (res.rowCount === 0) {
                noMatch.push(code);
            } else {
                updated++;
                if (!location) noLocation.push(code);
                if (!website)  noWebsite.push(code);
            }
        }
    } finally {
        client.release();
        await pool.end();
    }

    console.log(`Updated: ${updated} colleges`);
    if (noMatch.length)    console.log(`No DB match (skipped): ${noMatch.join(', ')}`);
    if (noLocation.length) console.log(`Missing location: ${noLocation.join(', ')}`);
    if (noWebsite.length)  console.log(`Missing website:  ${noWebsite.join(', ')}`);
}

run().catch((err) => { console.error(err); process.exit(1); });
