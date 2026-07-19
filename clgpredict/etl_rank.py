"""
ETL: Pune MHT-CET rank cutoff workbook -> long-form seed SQL for apex_db.

Reads the hierarchical sheet `remove other university`:
  - A row whose col0 starts with a 4-5 digit code = COLLEGE header (code + name)
  - A row whose col0 starts with a 6+ digit code = BRANCH header
  - Following 3 rows per branch: category label row, rank row, percentile row
    (we extract ranks; percentile row is skipped)

Category codes in this sheet have a university-type suffix:
  H = college is in Pune/home-university zone   (e.g. GOPENH, GOBCH, LOPENH)
  S = college is in state/other-university zone (e.g. GOPENS, GOBCS, LOPENS)
  O = open quota, no university restriction     (e.g. GOPENO, LOPENO)
  No suffix = TFWS, EWS (universal)

Emits rank_cutoffs_seed.sql:
  INSERT rank_cutoffs (college_id, branch, category, closing_rank, year)

Run:  python etl_rank.py
Load: psql "$DIRECT_URL" -f rank_cutoffs_seed.sql
"""
import pandas as pd
import re

XLSX = "pune data final for segregation.xlsx"
SHEET = "remove other university"
YEAR = 2024
OUT = "rank_cutoffs_seed.sql"

# Noise labels to skip (stray numbers and unknown codes that appear in label rows)
NOISE = {'MI', 'nan', ''}

# Column indices where category data lives (same positions as the percentile ETL)
DATA_COLS = [1, 2, 4, 6, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

# Canonical branch names (same map as etl.py)
BRANCH_MAP = {
    # ── Abbreviations (from the percentile ETL) ──────────────────────────────
    "comp": "Computer", "cs": "Computer", "cse": "Computer", "comp sci.": "Computer",
    "cs regional": "Computer", "comp soft": "Computer", "comp (soft.)": "Computer",
    "comp soft.": "Computer",
    "it": "Information Technology", "it -unaided": "Information Technology",
    "csit": "Computer & IT",
    "aids": "AI & Data Science", "ai-ds": "AI & Data Science", "ai ds": "AI & Data Science",
    "ads": "AI & Data Science", "cse-aids": "AI & Data Science", "cs-ds": "AI & Data Science",
    "cs-data": "AI & Data Science", "cse data": "AI & Data Science",
    "comp data sc": "AI & Data Science", "csd": "AI & Data Science",
    "comp data science": "AI & Data Science",
    "aiml": "AI & ML", "cs-aiml": "AI & ML", "cse-aiml": "AI & ML", "cse aiml": "AI & ML",
    "cs -aiml": "AI & ML", "cs-ai": "AI & ML", "cs -ai": "AI & ML", "cse ai": "AI & ML",
    "comp business": "Computer (Business)", "cs buisness": "Computer (Business)",
    "cs-business": "Computer (Business)", "cs business": "Computer (Business)",
    "mech": "Mechanical", "meh": "Mechanical", "mech sand": "Mechanical",
    "civil": "Civil",
    "etc": "E&TC", "ece": "E&TC", "etc-act": "E&TC", "electronics": "Electronics",
    "tronics": "Electronics",
    "electrical": "Electrical",
    "instru. control": "Instrumentation", "instru.": "Instrumentation",
    "automob.": "Automobile", "auto": "Automobile", "automution": "Automobile",
    "robotics": "Robotics", "robo": "Robotics", "robo ai": "Robotics",
    "robo auto": "Robotics & Automation", "robo  auto": "Robotics & Automation",
    "auto robo": "Robotics & Automation",
    "iot": "IoT", "cse iot": "IoT",
    "cyber secu": "Cyber Security", "vlsi": "VLSI", "chemical": "Chemical",
    "bio -tech": "Bio-Technology", "aeronautical": "Aeronautical", "food tech": "Food Technology",
    "fashion": "Fashion Technology", "printing": "Printing", "metallurgy": "Metallurgy",
    "manufa": "Manufacturing",
    "textiles": "Textile", "textile tech": "Textile", "textile chem": "Textile Chemistry",
    "man made textiles": "Textile",

    # ── Full names (from the rank Excel file) ────────────────────────────────
    # Computer family
    "computer engineering": "Computer",
    "computer engineering (regional language)": "Computer",
    "computer engineering (software engineering)": "Computer",
    "computer science": "Computer",
    "computer science and engineering": "Computer",
    "computer science and technology": "Computer",
    "mechanical engineering": "Mechanical",
    "mechanical engineering[sandwich]": "Mechanical",
    "mechanical & automation engineering": "Mechanical",
    "mechatronics engineering": "Mechanical",
    # CS specialisations
    "computer science and engineering (artificial intelligence and data science)": "AI & Data Science",
    "computer science and engineering(data science)": "AI & Data Science",
    "artificial intelligence (ai) and data science": "AI & Data Science",
    "artificial intelligence and data science": "AI & Data Science",
    "computer science and engineering (artificial intelligence)": "AI & ML",
    "computer science and engineering(artificial intelligence and machine learning)": "AI & ML",
    "artificial intelligence and machine learning": "AI & ML",
    "computer science and engineering (cyber security)": "Cyber Security",
    "cyber security": "Cyber Security",
    "computer science and engineering (internet of things and cyber security including block chain technology)": "IoT",
    "computer science and engineering (internet of things and cyber security including block chaintechnology)": "IoT",
    "internet of things (iot)": "IoT",
    "computer science and business systems": "Computer (Business)",
    "computer science and design": "Computer",
    "computer science and information technology": "Computer & IT",
    "computer science and engineering (data science)": "AI & Data Science",
    # Electronics family
    "electronics and telecommunication engg": "E&TC",
    "electronics and communication (advanced communication technology)": "E&TC",
    "electronics and communication(advanced communication technology)": "E&TC",
    "electronics and computer engineering": "Electronics",
    "electronics and computer science": "Electronics",
    "electronics engineering": "Electronics",
    "electronics engineering ( vlsi design and technology)": "VLSI",
    # Other engineering
    "civil engineering": "Civil",
    "civil and environmental engineering": "Civil",
    "electrical engineering": "Electrical",
    "electrical and computer engineering": "Electrical",
    "instrumentation engineering": "Instrumentation",
    "instrumentation and control engineering": "Instrumentation",
    "automobile engineering": "Automobile",
    "automation and robotics": "Robotics & Automation",
    "robotics and automation": "Robotics & Automation",
    "robotics and artificial intelligence": "Robotics",
    "aeronautical engineering": "Aeronautical",
    "chemical engineering": "Chemical",
    "manufacturing science and engineering": "Manufacturing",
    "metallurgy and material technology": "Metallurgy",
    "bio technology": "Bio-Technology",
    "food technology": "Food Technology",
    "fashion technology": "Fashion Technology",
    "printing and packing technology": "Printing",
    # Textiles
    "textile technology": "Textile",
    "technical textiles": "Textile",
    "man made textile technology": "Textile",
    "textile chemistry": "Textile Chemistry",
}


def canon_branch(raw: str):
    key = re.sub(r"\s+", " ", raw.strip().lower())
    if key in BRANCH_MAP:
        return BRANCH_MAP[key], True
    return re.sub(r"\s+", " ", raw.strip()).title(), False


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def is_noise_label(s: str) -> bool:
    """True if the cell value looks like a stray number or known noise token."""
    s = str(s).strip()
    if s in NOISE:
        return True
    # stray numeric values that appear in label rows
    try:
        float(s)
        return True
    except ValueError:
        return False


def main():
    df = pd.read_excel(XLSX, SHEET, header=None)

    college_re = re.compile(r"^\s*(\d{4,5})\s+(.*)$")
    branch_re  = re.compile(r"^\s*(\d{6,})\s+(.*)")

    colleges = []       # (code, name) — may already exist in DB, use ON CONFLICT
    cutoffs  = []       # (code, branch, category, rank)
    unmapped = set()
    cur_code = None

    i = 1
    while i < len(df):
        c0 = str(df.iloc[i, 0]).strip() if not pd.isna(df.iloc[i, 0]) else ""

        # ── College header ──────────────────────────────────────────────────
        m = college_re.match(c0)
        if m:
            cur_code = m.group(1)
            name = re.sub(r"\s+", " ", m.group(2).strip())
            colleges.append((cur_code, name))
            i += 1
            continue

        # ── Branch header ───────────────────────────────────────────────────
        bm = branch_re.match(c0)
        if bm and cur_code is not None:
            raw_branch = re.sub(r"\s+", " ", bm.group(2).strip())
            branch, hit = canon_branch(raw_branch)
            if not hit:
                unmapped.add(raw_branch)

            # Row layout: [i] branch, [i+1] label row, [i+2] rank row, [i+3] percentile row
            if i + 2 >= len(df):
                i += 4
                continue

            label_row = df.iloc[i + 1]
            rank_row  = df.iloc[i + 2]

            for col in DATA_COLS:
                if col >= len(label_row):
                    continue
                lbl = label_row.iloc[col]
                rnk = rank_row.iloc[col]

                if pd.isna(lbl) or pd.isna(rnk):
                    continue

                lbl_s = str(lbl).strip()
                if is_noise_label(lbl_s):
                    continue

                try:
                    r = int(float(rnk))
                except (TypeError, ValueError):
                    continue

                if r <= 0 or r > 300000:
                    continue

                cutoffs.append((cur_code, branch, lbl_s, r))

            i += 4
            continue

        i += 1

    # De-duplicate: same (code, branch, category) → keep MIN rank (most accessible)
    best: dict = {}
    for code, branch, cat, r in cutoffs:
        k = (code, branch, cat)
        if k not in best or r < best[k]:
            best[k] = r
    cutoffs = [(c, b, cat, r) for (c, b, cat), r in best.items()]

    # ── Write SQL ────────────────────────────────────────────────────────────
    lines = [
        f"-- Auto-generated by etl_rank.py — Pune MHT-CET rank cutoffs {YEAR}",
        "BEGIN;",
        "",
        "-- Colleges (insert only if not already present from percentile ETL)",
    ]
    for code, name in colleges:
        lines.append(
            f"INSERT INTO colleges (code, name, city) VALUES "
            f"({sql_str(code)}, {sql_str(name)}, 'Pune') ON CONFLICT (code) DO NOTHING;"
        )

    lines += [
        "",
        "-- Rank cutoffs",
        "INSERT INTO rank_cutoffs (college_id, branch, category, closing_rank, year)",
        "SELECT c.id, v.branch, v.category, v.closing_rank, " + str(YEAR),
        "FROM (VALUES",
    ]
    val_rows = [
        f"  ({sql_str(code)}, {sql_str(branch)}, {sql_str(cat)}, {r})"
        for code, branch, cat, r in cutoffs
    ]
    lines.append(",\n".join(val_rows))
    lines += [
        ") AS v(code, branch, category, closing_rank)",
        "JOIN colleges c ON c.code = v.code",
        "ON CONFLICT (college_id, branch, category, year) DO NOTHING;",
        "",
        "COMMIT;",
    ]

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Colleges:          {len(colleges)}")
    print(f"Rank cutoff rows:  {len(cutoffs)}")
    print(f"Wrote {OUT}")

    ranks = [r for _, _, _, r in cutoffs]
    if ranks:
        ranks.sort()
        n = len(ranks)
        print(f"\nRank distribution:")
        print(f"  Min:    {ranks[0]:,}")
        print(f"  Median: {ranks[n//2]:,}")
        print(f"  Max:    {ranks[-1]:,}")

    if unmapped:
        print(f"\n[!] {len(unmapped)} unmapped branch labels (fell back to Title Case):")
        for u in sorted(unmapped):
            print("   ", repr(u), "->", canon_branch(u)[0])


if __name__ == "__main__":
    main()
