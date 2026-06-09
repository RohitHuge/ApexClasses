import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    GraduationCap, Sparkles, Lock, Search, SlidersHorizontal,
    ShieldCheck, Gauge, Target, Loader2, MapPin, X,
} from 'lucide-react';
import { fetchMeta, runPredict, submitLead } from '../predictor/predictorService';

const PREVIEW_LIMIT = 3; // free results shown per bucket before the gate

const BUCKETS = [
    { key: 'safe', label: 'High Chance', sub: 'Comfortably above last year', accent: 'emerald', icon: ShieldCheck },
    { key: 'moderate', label: 'Likely', sub: 'Close to the closing line', accent: 'amber', icon: Gauge },
    { key: 'reach', label: 'Ambitious', sub: 'A reach — worth a shot', accent: 'rose', icon: Target },
];

const ACCENT = {
    emerald: { chip: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', ring: 'border-emerald-200', dot: 'bg-emerald-500' },
    amber: { chip: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500', ring: 'border-amber-200', dot: 'bg-amber-500' },
    rose: { chip: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500', ring: 'border-rose-200', dot: 'bg-rose-500' },
};

export default function CollegePredictor() {
    const [meta, setMeta] = useState({ branches: [], categories: [] });
    const [percentile, setPercentile] = useState(90);
    const [category, setCategory] = useState('OPEN');
    const [homeUniversity, setHomeUniversity] = useState(true); // default ON
    const [tfws, setTfws] = useState(false);
    const [branches, setBranches] = useState([]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    // results filtering / sorting
    const [filterBranch, setFilterBranch] = useState('');
    const [sortBy, setSortBy] = useState('cutoff'); // cutoff | margin | name

    // lead gate
    const [unlocked, setUnlocked] = useState(() => localStorage.getItem('predictor_unlocked') === '1');
    const [showGate, setShowGate] = useState(false);
    const [lead, setLead] = useState({ name: '', phone: '' });
    const [savingLead, setSavingLead] = useState(false);

    const debounceRef = useRef(null);

    useEffect(() => {
        fetchMeta()
            .then((d) => setMeta({ branches: d.branches || [], categories: d.categories || [] }))
            .catch(() => toast.error('Could not load predictor options'));
    }, []);

    const doPredict = async (override = {}) => {
        const payload = {
            percentile: Number(percentile),
            category,
            homeUniversity,
            tfws,
            branches,
            ...override,
        };
        setLoading(true);
        try {
            const data = await runPredict(payload);
            setResult(data);
            setHasRun(true);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    // live "what-if": once a prediction exists, re-run (debounced) on input changes
    useEffect(() => {
        if (!hasRun) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doPredict(), 550);
        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [percentile, category, homeUniversity, tfws, branches]);

    const toggleBranch = (b) =>
        setBranches((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        if (!lead.name.trim() || !/^[0-9+]{7,15}$/.test(lead.phone.replace(/\s+/g, ''))) {
            toast.error('Please enter your name and a valid phone number');
            return;
        }
        setSavingLead(true);
        try {
            await submitLead({ ...lead, percentile: Number(percentile), category, branches });
            localStorage.setItem('predictor_unlocked', '1');
            setUnlocked(true);
            setShowGate(false);
            toast.success('Unlocked! Here are all your matches.');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSavingLead(false);
        }
    };

    // apply client-side filter + sort to a bucket's items
    const shape = (items) => {
        let arr = filterBranch ? items.filter((i) => i.branch === filterBranch) : items.slice();
        arr.sort((a, b) => {
            if (sortBy === 'name') return a.college.localeCompare(b.college);
            if (sortBy === 'margin') return b.margin - a.margin;
            return b.cutoff - a.cutoff; // best college first
        });
        return arr;
    };

    const totalShown = result?.counts?.total ?? 0;

    return (
        <Layout>
            <div className="bg-gradient-to-b from-indigo-50 via-white to-slate-50 min-h-screen">
                {/* Hero */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                            <Sparkles size={14} /> MHT-CET • Pune Region • 2024 cutoffs
                        </span>
                        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            College Predictor
                        </h1>
                        <p className="mt-2 text-slate-600 max-w-2xl">
                            Enter your percentile and preferences to see which colleges and branches you can
                            realistically get — sorted by your chances.
                        </p>
                    </motion.div>
                </section>

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid lg:grid-cols-[380px_1fr] gap-6">
                    {/* ── Input panel ── */}
                    <div className="lg:sticky lg:top-24 self-start bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
                        {/* Percentile */}
                        <div>
                            <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                                <span>Your percentile</span>
                                <span className="text-indigo-600 text-lg font-bold tabular-nums">{Number(percentile).toFixed(2)}</span>
                            </label>
                            <input
                                type="range" min="0" max="100" step="0.01" value={percentile}
                                onChange={(e) => setPercentile(e.target.value)}
                                className="w-full mt-2 accent-indigo-600"
                            />
                            <input
                                type="number" min="0" max="100" step="0.01" value={percentile}
                                onChange={(e) => setPercentile(e.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700">Category</label>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {meta.categories.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCategory(c)}
                                        className={`px-2 py-2 rounded-lg text-xs font-semibold border transition ${
                                            category === c
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3">
                            <ToggleRow
                                checked={homeUniversity}
                                onChange={() => setHomeUniversity((v) => !v)}
                                title="Pune home university"
                                desc="Unlocks lower home-university (L) cutoffs"
                                icon={MapPin}
                            />
                            <ToggleRow
                                checked={tfws}
                                onChange={() => setTfws((v) => !v)}
                                title="Include TFWS seats"
                                desc="Tuition-fee-waiver scheme seats"
                                icon={GraduationCap}
                            />
                        </div>

                        {/* Branch chips */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Preferred branches <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <div className="mt-2 flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                                {meta.branches.map((b) => (
                                    <button
                                        key={b}
                                        onClick={() => toggleBranch(b)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                                            branches.includes(b)
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-400'
                                        }`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => doPredict()}
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            Predict my colleges
                        </button>
                    </div>

                    {/* ── Results ── */}
                    <div>
                        {!hasRun && (
                            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-slate-300 p-10">
                                <GraduationCap className="text-indigo-400" size={48} />
                                <p className="mt-4 text-slate-500 max-w-sm">
                                    Set your percentile and hit <b>Predict</b> to see your personalised college list.
                                </p>
                            </div>
                        )}

                        {hasRun && result && (
                            <>
                                {/* summary + filter bar */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
                                    <div className="flex flex-wrap items-center gap-3 justify-between">
                                        <div className="flex items-center gap-2 text-sm">
                                            {BUCKETS.map((b) => (
                                                <span key={b.key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ACCENT[b.accent].chip}`}>
                                                    <span className={`w-2 h-2 rounded-full ${ACCENT[b.accent].dot}`} />
                                                    {result.counts[b.key]} {b.label}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <SlidersHorizontal size={16} className="text-slate-400" />
                                            <select
                                                value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
                                                className="text-xs rounded-lg border border-slate-300 px-2 py-1.5 focus:outline-none"
                                            >
                                                <option value="">All branches</option>
                                                {meta.branches.map((b) => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                            <select
                                                value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                                className="text-xs rounded-lg border border-slate-300 px-2 py-1.5 focus:outline-none"
                                            >
                                                <option value="cutoff">Sort: Best first</option>
                                                <option value="margin">Sort: Safest first</option>
                                                <option value="name">Sort: College name</option>
                                            </select>
                                        </div>
                                    </div>
                                    {loading && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-indigo-500">
                                            <Loader2 size={12} className="animate-spin" /> Updating…
                                        </div>
                                    )}
                                </div>

                                {totalShown === 0 && (
                                    <div className="text-center bg-white rounded-2xl border border-slate-200 p-10 text-slate-500">
                                        No matches in range. Try widening branches or lowering filters.
                                    </div>
                                )}

                                {/* buckets */}
                                <div className="space-y-6">
                                    {BUCKETS.map((b) => {
                                        const items = shape(result.buckets[b.key] || []);
                                        if (!items.length) return null;
                                        const visible = unlocked ? items : items.slice(0, PREVIEW_LIMIT);
                                        const hiddenCount = items.length - visible.length;
                                        const Icon = b.icon;
                                        return (
                                            <div key={b.key}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${ACCENT[b.accent].chip}`}>
                                                        <Icon size={16} />
                                                    </span>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 leading-none">{b.label}</h3>
                                                        <p className="text-xs text-slate-400">{b.sub} • {items.length} options</p>
                                                    </div>
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {visible.map((it, i) => (
                                                        <CollegeCard key={`${it.code}-${it.branch}-${i}`} item={it} accent={b.accent} />
                                                    ))}
                                                </div>
                                                {!unlocked && hiddenCount > 0 && (
                                                    <button
                                                        onClick={() => setShowGate(true)}
                                                        className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                                                    >
                                                        <Lock size={15} /> Unlock {hiddenCount} more {b.label.toLowerCase()} {hiddenCount === 1 ? 'college' : 'colleges'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <p className="mt-8 text-xs text-slate-400 text-center max-w-xl mx-auto">
                                    Predictions are based on 2024 closing cutoffs and are indicative only — not a
                                    guarantee of admission. Actual cutoffs vary by CAP round and seat movement.
                                </p>
                            </>
                        )}
                    </div>
                </section>
            </div>

            {/* Lead gate modal */}
            <AnimatePresence>
                {showGate && (
                    <motion.div
                        className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowGate(false)}
                    >
                        <motion.div
                            className="bg-white rounded-2xl w-full max-w-md p-6 relative"
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowGate(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-3">
                                <Lock size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">See your full college list</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Enter your details to unlock every match. Our counsellors can also guide you for free.
                            </p>
                            <form onSubmit={handleLeadSubmit} className="mt-5 space-y-3">
                                <input
                                    type="text" placeholder="Full name" value={lead.name}
                                    onChange={(e) => setLead({ ...lead, name: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                                <input
                                    type="tel" placeholder="Phone number" value={lead.phone}
                                    onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                                <button
                                    type="submit" disabled={savingLead}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition disabled:opacity-60"
                                >
                                    {savingLead ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                    Unlock my results
                                </button>
                            </form>
                            <p className="text-[11px] text-slate-400 mt-3 text-center">
                                We respect your privacy. Your details are only used to assist your admission.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    );
}

function ToggleRow({ checked, onChange, title, desc, icon: Icon }) {
    return (
        <button onClick={onChange} className="w-full flex items-center gap-3 text-left">
            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${checked ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Icon size={16} />
            </span>
            <span className="flex-1">
                <span className="block text-sm font-semibold text-slate-700">{title}</span>
                <span className="block text-xs text-slate-400">{desc}</span>
            </span>
            <span className={`w-10 h-6 rounded-full p-0.5 transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white transition ${checked ? 'translate-x-4' : ''}`} />
            </span>
        </button>
    );
}

function CollegeCard({ item, accent }) {
    // confidence bar: how far the student's percentile sits above the cutoff
    const span = 6; // points considered "full confidence"
    const pct = Math.max(0, Math.min(1, (item.margin + 1) / (span + 1)));
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border bg-white p-4 ${ACCENT[accent].ring}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h4 className="text-sm font-semibold text-slate-800 leading-snug">{item.college}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.branch}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${ACCENT[accent].chip}`}>
                    {item.margin >= 0 ? `+${item.margin.toFixed(2)}` : item.margin.toFixed(2)}
                </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Closing: <b className="text-slate-700">{item.cutoff.toFixed(3)}</b></span>
                <span className="text-slate-400">via <b className="text-slate-600">{item.viaCategory}</b></span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${ACCENT[accent].bar}`} style={{ width: `${pct * 100}%` }} />
            </div>
        </motion.div>
    );
}
