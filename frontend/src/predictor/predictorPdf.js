import { jsPDF } from 'jspdf';

const BUCKET_LABEL = {
    safe: 'High Chance',
    moderate: 'Likely',
    reach: 'Ambitious',
};

const BUCKET_COLOR = {
    safe: [16, 185, 129],
    moderate: [245, 158, 11],
    reach: [244, 63, 94],
};

const fmt = (n) => (Number(n) || 0).toFixed(2);

// Compact via-category for the narrow PDF column (L* = home-university quota).
const viaShort = (raw) => (raw && raw[0] === 'L' ? `HU-${raw.slice(1)}` : raw || '—');

const fmtIndianPhone = (s) => (s || '').replace(/\s+/g, '').replace(/(\d{5})(\d{5})/, '$1 $2');

/**
 * Build a branded shortlist PDF of the predictor results.
 *
 * Layout:
 *  • Apex Classes branded header (logo text + tagline)
 *  • Student query summary (percentile, category, homeU, TFWS, branches)
 *  • Counts strip
 *  • Three coloured bucket sections (Safe / Likely / Ambitious)
 *  • Each row: college name, branch, cutoff, margin, via-category
 *  • Footer disclaimer + page numbers
 */
export const downloadResultsPdf = ({ query, counts, buckets, leadName, leadPhone }) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 36;                       // page margin
    let y = M;

    // ── Header band ─────────────────────────────────────────────────────────
    doc.setFillColor(30, 58, 138);     // apexBlue
    doc.rect(0, 0, W, 64, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('APEX CLASSES', M, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('MHT-CET College Predictor · Pune Region · 2024 cutoffs', M, 48);

    doc.setFontSize(8);
    doc.text(`Generated ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`, W - M, 48, { align: 'right' });

    y = 90;

    // ── Query summary ───────────────────────────────────────────────────────
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Your query', M, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const summary = [
        `Percentile:        ${fmt(query.percentile)}`,
        `Category:          ${query.category}`,
        `Home University:   ${query.homeUniversity ? 'Yes (Pune)' : 'No'}`,
        `TFWS:              ${query.tfws ? 'Included' : 'Not included'}`,
        `Branches:          ${query.branches && query.branches.length ? query.branches.join(', ') : 'All branches'}`,
    ];
    if (leadName) summary.push(`Student:           ${leadName}${leadPhone ? ' · ' + fmtIndianPhone(leadPhone) : ''}`);
    for (const line of summary) {
        doc.text(line, M, y);
        y += 12;
    }
    y += 6;

    // ── Counts strip ────────────────────────────────────────────────────────
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(M, y, W - 2 * M, 28, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const bucketsArr = ['safe', 'moderate', 'reach'];
    const countsWidth = (W - 2 * M) / 3;
    bucketsArr.forEach((bk, i) => {
        const x = M + i * countsWidth + countsWidth / 2;
        doc.setTextColor(...BUCKET_COLOR[bk]);
        doc.text(String(counts[bk] || 0), x, y + 12, { align: 'center' });
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(BUCKET_LABEL[bk].toUpperCase(), x, y + 22, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
    });
    y += 44;

    // ── Sections ────────────────────────────────────────────────────────────
    const ensureSpace = (need) => {
        if (y + need > H - 60) {
            drawFooter(doc, W, H, M);
            doc.addPage();
            y = M;
        }
    };

    for (const bk of bucketsArr) {
        const items = (buckets[bk] || []).slice().sort((a, c) => c.cutoff - a.cutoff);
        if (!items.length) continue;

        ensureSpace(40);
        // section header bar
        const [r, g, bl] = BUCKET_COLOR[bk];
        doc.setFillColor(r, g, bl);
        doc.roundedRect(M, y, W - 2 * M, 22, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`${BUCKET_LABEL[bk]}  ·  ${items.length} option${items.length === 1 ? '' : 's'}`, M + 10, y + 15);
        y += 30;

        // column header
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('COLLEGE', M + 10, y);
        doc.text('BRANCH', M + 200, y);
        doc.text('CUTOFF', M + 360, y, { align: 'right' });
        doc.text('MARGIN', M + 420, y, { align: 'right' });
        doc.text('VIA', M + 500, y, { align: 'right' });
        y += 6;
        doc.setDrawColor(226, 232, 240);
        doc.line(M, y, W - M, y);
        y += 8;

        // rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        for (const it of items) {
            ensureSpace(20);
            const margin = it.margin;
            // coloured dot
            const [rr, gg, bb] = BUCKET_COLOR[bk];
            doc.setFillColor(rr, gg, bb);
            doc.circle(M + 5, y - 3, 2, 'F');

            doc.setTextColor(30, 41, 59);
            const name = (it.college || '').length > 38 ? it.college.slice(0, 36) + '…' : it.college;
            doc.text(name, M + 14, y);
            const branch = (it.branch || '').length > 22 ? it.branch.slice(0, 20) + '…' : it.branch;
            doc.text(branch, M + 200, y);

            doc.setTextColor(71, 85, 105);
            doc.text(fmt(it.cutoff), M + 360, y, { align: 'right' });
            doc.setTextColor(margin >= 2 ? 16 : margin >= 0 ? 180 : 200, margin >= 2 ? 130 : margin >= 0 ? 83 : 50, margin >= 2 ? 100 : margin >= 0 ? 9 : 70);
            doc.text((margin >= 0 ? '+' : '') + fmt(margin), M + 420, y, { align: 'right' });
            doc.setTextColor(100, 116, 139);
            doc.text(viaShort(it.viaCategory), M + 500, y, { align: 'right' });

            y += 14;
            doc.setDrawColor(241, 245, 249);
            doc.line(M + 14, y - 4, W - M, y - 4);
        }
        y += 12;
    }

    // ── Disclaimer on every page (drawn at end + on each addPage via hook) ──
    drawFooter(doc, W, H, M);

    // filename
    const safeCat = (query.category || 'OPEN').replace(/[^A-Z0-9]/gi, '');
    doc.save(`apex-college-shortlist-${fmt(query.percentile).replace('.', '')}-${safeCat}.pdf`);
};

const drawFooter = (doc, W, H, M) => {
    const page = doc.internal.getNumberOfPages ? doc.internal.getNumberOfPages() : 1;
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(
        'Indicative only — based on 2024 closing cutoffs. Not a guarantee of admission. Actual cutoffs vary by CAP round, seat movement, and applicant volume.',
        W / 2, H - 24, { align: 'center' }
    );
    doc.text(`apexclasses.org · MHT-CET College Predictor · page ${page}`, W - M, H - 12, { align: 'right' });
};
