"""
ETL: Pune MHT-CET cutoff workbook -> long-form seed SQL for apex_db.

Reads the hierarchical sheet `remove other university`:
  - a row whose col1 starts with a 4-5 digit code = a COLLEGE header (code + name)
  - following non-empty rows = BRANCH rows, each holding closing percentiles
    per category column (col2..col21)

Emits cutoffs_seed.sql:
  - INSERT colleges (code, name, city)
  - INSERT cutoffs  (college_id, branch, category, cutoff, year) via a join on code

Run:  python etl.py
Load: psql "$DATABASE_URL" -f cutoffs_seed.sql
"""
import pandas as pd
import re

XLSX = "pune data final  for book wih branch ready.xlsx"
SHEET = "remove other university"
YEAR = 2024
OUT = "cutoffs_seed.sql"

# Category columns to import (col index -> category code).
# Skipped on purpose: col9 'higest in NT' (noise) and col19 duplicate 'ST'.
CATEGORY_COLS = {
    2: "OPEN", 3: "LOPEN", 4: "OBC", 5: "LOBC", 6: "SC", 7: "LSC",
    8: "ST", 10: "VJ", 11: "SEBC", 12: "LSEBC", 13: "EWS", 14: "TFWS",
    15: "GOPENO", 16: "NT1", 17: "NT2", 18: "NT3", 20: "LST", 21: "LOPENO",
}

# Canonical branch names. Key = lowercased/stripped raw label.
BRANCH_MAP = {
    # Computer
    "comp": "Computer", "cs": "Computer", "cse": "Computer", "comp sci.": "Computer",
    "cs regional": "Computer", "comp soft": "Computer", "comp (soft.)": "Computer",
    "comp soft.": "Computer",
    # IT
    "it": "Information Technology", "it -unaided": "Information Technology",
    "csit": "Computer & IT",
    # AI & Data Science
    "aids": "AI & Data Science", "ai-ds": "AI & Data Science", "ai ds": "AI & Data Science",
    "ads": "AI & Data Science", "cse-aids": "AI & Data Science", "cs-ds": "AI & Data Science",
    "cs-data": "AI & Data Science", "cse data": "AI & Data Science",
    "comp data sc": "AI & Data Science", "csd": "AI & Data Science",
    "comp data science": "AI & Data Science",
    # AI & ML
    "aiml": "AI & ML", "cs-aiml": "AI & ML", "cse-aiml": "AI & ML", "cse aiml": "AI & ML",
    "cs -aiml": "AI & ML", "cs-ai": "AI & ML", "cs -ai": "AI & ML", "cse ai": "AI & ML",
    # Computer (business / data variants -> keep as Computer specialisations)
    "comp business": "Computer (Business)", "cs buisness": "Computer (Business)",
    "cs-business": "Computer (Business)", "cs business": "Computer (Business)",
    # Mechanical
    "mech": "Mechanical", "meh": "Mechanical", "mech sand": "Mechanical",
    "mechanical engineering": "Mechanical",
    # Civil
    "civil": "Civil",
    # E&TC / Electronics
    "etc": "E&TC", "ece": "E&TC", "etc-act": "E&TC", "electronics": "Electronics",
    "tronics": "Electronics",
    # Electrical
    "electrical": "Electrical",
    # Instrumentation
    "instru. control": "Instrumentation", "instru.": "Instrumentation",
    # Automobile
    "automob.": "Automobile", "auto": "Automobile", "automution": "Automobile",
    # Robotics / Automation
    "robotics": "Robotics", "robo": "Robotics", "robo ai": "Robotics",
    "robo auto": "Robotics & Automation", "robo  auto": "Robotics & Automation",
    "auto robo": "Robotics & Automation",
    # IoT
    "iot": "IoT", "cse iot": "IoT",
    # Other specialisations
    "cyber secu": "Cyber Security", "vlsi": "VLSI", "chemical": "Chemical",
    "bio -tech": "Bio-Technology", "aeronautical": "Aeronautical", "food tech": "Food Technology",
    "fashion": "Fashion Technology", "printing": "Printing", "metallurgy": "Metallurgy",
    "manufa": "Manufacturing",
    # Textiles
    "textiles": "Textile", "textile tech": "Textile", "textile chem": "Textile Chemistry",
    "man made textiles": "Textile",
}


def canon_branch(raw: str):
    """Return canonical branch name; second value True if it was an explicit map hit."""
    key = re.sub(r"\s+", " ", raw.strip().lower())
    if key in BRANCH_MAP:
        return BRANCH_MAP[key], True
    # fallback: title-case the cleaned label, flag for review
    return re.sub(r"\s+", " ", raw.strip()).title(), False


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main():
    df = pd.read_excel(XLSX, SHEET, header=None)

    colleges = []          # list of (code, name)
    cutoffs = []           # list of (code, branch, category, cutoff)
    unmapped = set()
    cur_code = None

    college_re = re.compile(r"^\s*(\d{4,5})\s+(.*)$")

    for i in range(1, len(df)):
        c1 = df.iloc[i, 1]
        if pd.isna(c1):
            continue
        c1 = str(c1).strip()
        if not c1:
            continue

        m = college_re.match(c1)
        if m:
            cur_code = m.group(1)
            name = re.sub(r"\s+", " ", m.group(2).strip())
            colleges.append((cur_code, name))
            continue

        if cur_code is None:
            continue  # branch row before any college header — skip

        # strip a stray leading long code if present (e.g. "0631961210  Mechanical Engineering")
        c1 = re.sub(r"^\d{6,}\s+", "", c1)
        branch, hit = canon_branch(c1)
        if not hit:
            unmapped.add(c1)

        for col, cat in CATEGORY_COLS.items():
            val = df.iloc[i, col]
            if pd.isna(val):
                continue
            try:
                v = round(float(val), 3)
            except (TypeError, ValueError):
                continue
            if v <= 0 or v > 100:
                continue
            cutoffs.append((cur_code, branch, cat, v))

    # De-duplicate cutoffs on (code, branch, category) keeping the MIN cutoff
    # (handles branch variants that collapse to the same canonical name).
    best = {}
    for code, branch, cat, v in cutoffs:
        k = (code, branch, cat)
        if k not in best or v < best[k]:
            best[k] = v
    cutoffs = [(c, b, cat, v) for (c, b, cat), v in best.items()]

    # ---- write SQL ----
    lines = []
    lines.append("-- Auto-generated by etl.py — Pune MHT-CET cutoffs " + str(YEAR))
    lines.append("BEGIN;")
    lines.append("")
    lines.append("-- Colleges")
    for code, name in colleges:
        lines.append(
            f"INSERT INTO colleges (code, name, city) VALUES "
            f"({sql_str(code)}, {sql_str(name)}, 'Pune') ON CONFLICT (code) DO NOTHING;"
        )
    lines.append("")
    lines.append("-- Cutoffs")
    lines.append(
        "INSERT INTO cutoffs (college_id, branch, category, cutoff, year)"
    )
    lines.append("SELECT c.id, v.branch, v.category, v.cutoff, " + str(YEAR))
    lines.append("FROM (VALUES")
    val_rows = [
        f"  ({sql_str(code)}, {sql_str(branch)}, {sql_str(cat)}, {v})"
        for code, branch, cat, v in cutoffs
    ]
    lines.append(",\n".join(val_rows))
    lines.append(") AS v(code, branch, category, cutoff)")
    lines.append("JOIN colleges c ON c.code = v.code")
    lines.append("ON CONFLICT (college_id, branch, category, year) DO NOTHING;")
    lines.append("")
    lines.append("COMMIT;")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Colleges: {len(colleges)}")
    print(f"Cutoff rows (deduped): {len(cutoffs)}")
    print(f"Wrote {OUT}")
    if unmapped:
        print(f"\n[!] {len(unmapped)} unmapped branch labels (fell back to Title Case):")
        for u in sorted(unmapped):
            print("   ", repr(u), "->", canon_branch(u)[0])


if __name__ == "__main__":
    main()
