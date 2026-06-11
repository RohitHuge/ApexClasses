import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    GraduationCap, Sparkles, Lock, Search, SlidersHorizontal,
    ShieldCheck, Gauge, Target, Loader2, MapPin, X, Info, SearchX, Download, Link2, Check, Crown, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMeta, runPredict, revealResults, getProfile, createPayment, verifyPayment } from '../predictor/predictorService';
import { downloadResultsPdf } from '../predictor/predictorPdf';
import { loadRazorpayScript } from '../order/utils/loadRazorpay';
import { track } from '../analytics/analyticsClient';

const PREVIEW_LIMIT = 3; // free results shown per bucket before the paywall

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
    const { user, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const [meta, setMeta] = useState({ branches: [], categories: [] });
    const [percentile, setPercentile] = useState(90);
    const [category, setCategory] = useState('OPEN');
    const [homeUniversity, setHomeUniversity] = useState(true); // default ON
    const [tfws, setTfws] = useState(false);
    const [branches, setBranches] = useState([]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [revealing, setRevealing] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    // results filtering / sorting
    const [filterBranch, setFilterBranch] = useState('');
    const [sortBy, setSortBy] = useState('cutoff'); // cutoff | margin | name

    // account / entitlement
    const [profile, setProfile] = useState(null); // { plan, used, limit, remaining }
    const [price, setPrice] = useState(99);
    const [pack, setPack] = useState(15);

    // gates
    const [showPhone, setShowPhone] = useState(false);
    const [showPay, setShowPay] = useState(false);
    const [phoneForm, setPhoneForm] = useState({ name: '', phone: '' });
    const [busy, setBusy] = useState(false);
    const pendingRef = useRef(null); // 'predict' | 'reveal'

    const [linkCopied, setLinkCopied] = useState(false);
    const [compareIds, setCompareIds] = useState([]);
    const [showCompare, setShowCompare] = useState(false);

    const debounceRef = useRef(null);
    const initialRunRef = useRef(false);
    const hydratedRef = useRef(false);

    // The result is "full" only when the server returned an unlocked payload.
    const isFull = !!result && result.locked === false;
    const isPaid = profile?.plan === 'paid';

    useEffect(() => {
        fetchMeta()
            .then((d) => setMeta({ branches: d.branches || [], categories: d.categories || [] }))
            .catch(() => toast.error('Could not load predictor options'));
        track('predictor_open');
    }, []);

    const loadProfile = async () => {
        try {
            const d = await getProfile();
            setProfile(d.profile);
            if (d.price) setPrice(d.price);
            if (d.pack) setPack(d.pack);
            return d.profile;
        } catch { return null; }
    };

    useEffect(() => {
        if (user) loadProfile();
        else setProfile(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Hydrate state from URL query params on first load.
    useEffect(() => {
        if (initialRunRef.current) return;
        const params = new URLSearchParams(window.location.search);
        const pct = params.get('pct');
        const cat = params.get('cat');
        const homeU = params.get('hu');
        const tf = params.get('tfws');
        const brs = params.get('branches');
        if (!pct && !cat && !brs) { hydratedRef.current = true; return; }
        if (pct) setPercentile(Number(pct));
        if (cat) setCategory(cat);
        if (homeU !== null) setHomeUniversity(homeU === '1');
        if (tf !== null) setTfws(tf === '1');
        if (brs) setBranches(brs.split(',').map((s) => s.trim()).filter(Boolean));
        initialRunRef.current = true;
        hydratedRef.current = true;
    }, [meta]);

    // Auto-run the preview once hydrated + meta ready — only for logged-in users
    // (anonymous users must pass the phone panel first).
    useEffect(() => {
        if (!initialRunRef.current || hasRun || !meta.branches.length || !user) return;
        doPredict();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialRunRef.current, meta.branches.length, user]);

    // Sync state → URL.
    useEffect(() => {
        if (!hydratedRef.current) return;
        const params = new URLSearchParams();
        params.set('pct', Number(percentile).toFixed(2));
        params.set('cat', category);
        params.set('hu', homeUniversity ? '1' : '0');
        if (tfws) params.set('tfws', '1');
        if (branches.length) params.set('branches', branches.join(','));
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }, [percentile, category, homeUniversity, tfws, branches]);

    // ── Preview (locked 3/3/2) ──
    const doPredict = async () => {
        setLoading(true);
        try {
            const data = await runPredict({ percentile: Number(percentile), category, homeUniversity, tfws, branches });
            setResult(data);
            setHasRun(true);
            track('predictor_predict_run', {
                pctBucket: Number(percentile) >= 90 ? '90+' : Number(percentile) >= 75 ? '75-90' : '<75',
                cat: category, homeU: homeUniversity, tfws, nBranches: branches.length, nResults: data.counts?.total || 0,
            });
            if ((data.counts?.total || 0) === 0) track('predictor_empty_state_seen');
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    // live "what-if": re-preview (debounced) on input changes once a run exists.
    useEffect(() => {
        if (!hasRun || !user) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doPredict(), 550);
        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [percentile, category, homeUniversity, tfws, branches]);

    // ── Gate helpers ──
    // Returns true if already logged in; otherwise opens the phone panel and stashes intent.
    const requireGuest = (intent) => {
        if (user) return true;
        pendingRef.current = intent;
        setShowPhone(true);
        return false;
    };

    const handlePredictClick = () => {
        if (requireGuest('predict')) doPredict();
    };

    // ── Reveal full list (consumes 1 of quota for a new combo) ──
    const reveal = async () => {
        setRevealing(true);
        try {
            const data = await revealResults({ percentile: Number(percentile), category, homeUniversity, tfws, branches });
            setResult(data);
            if (data.profile) setProfile(data.profile);
            track('predictor_reveal', { cat: category, fromCache: !!data.fromCache });
            if (!data.fromCache) toast.success('Full list unlocked & saved to your profile');
        } catch (e) {
            if (e.code === 'QUOTA_EXHAUSTED') {
                if (e.profile) setProfile(e.profile);
                setShowPay(true);
            } else {
                toast.error(e.message);
            }
        } finally {
            setRevealing(false);
        }
    };

    const handleReveal = async () => {
        if (!requireGuest('reveal')) return;
        const prof = profile || (await loadProfile());
        if (prof && prof.remaining > 0) reveal();
        else setShowPay(true);
    };

    // ── Phone panel → guest login ──
    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (!phoneForm.name.trim() || !/^[0-9+]{7,15}$/.test(phoneForm.phone.replace(/\s+/g, ''))) {
            toast.error('Please enter your name and a valid phone number');
            return;
        }
        setBusy(true);
        try {
            await loginAsGuest(phoneForm.name.trim(), phoneForm.phone.replace(/\s+/g, ''));
            setShowPhone(false);
            track('predictor_lead_submitted', { cat: category });
            const prof = await loadProfile();
            const intent = pendingRef.current; pendingRef.current = null;
            if (intent === 'reveal') {
                if (prof && prof.remaining > 0) reveal();
                else setShowPay(true);
            } else {
                doPredict();
            }
        } catch (err) {
            if (err.code === 'ACCOUNT_EXISTS') {
                toast.error('You already have an account — please log in.');
                navigate('/login');
            } else {
                toast.error(err.message);
            }
        } finally {
            setBusy(false);
        }
    };

    // ── Payment ──
    const handlePay = async () => {
        try {
            const ok = await loadRazorpayScript();
            if (!ok) return toast.error('Could not load the payment window');
            const order = await createPayment();
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'Apex Classes',
                description: `College Predictor — ${order.pack} searches`,
                order_id: order.orderId,
                handler: async (resp) => {
                    try {
                        const v = await verifyPayment({
                            razorpay_order_id: resp.razorpay_order_id,
                            razorpay_payment_id: resp.razorpay_payment_id,
                            razorpay_signature: resp.razorpay_signature,
                        });
                        setProfile(v.profile);
                        setShowPay(false);
                        track('predictor_payment_success');
                        toast.success(`Payment successful — ${pack} searches added!`);
                        reveal();
                    } catch (err) {
                        toast.error(err.message || 'Payment verification failed');
                    }
                },
                prefill: { name: user?.name, contact: user?.phone, email: user?.email || undefined },
                theme: { color: '#4f46e5' },
                modal: { ondismiss: () => toast('Payment cancelled.', { icon: 'ℹ️' }) },
            };
            new window.Razorpay(options).open();
        } catch (e) {
            toast.error(e.message || 'Could not start payment');
        }
    };

    const toggleBranch = (b) => {
        setBranches((prev) => {
            const adding = !prev.includes(b);
            track('predictor_branch_toggled', { branch: b.slice(0, 30), adding });
            return adding ? [...prev, b] : prev.filter((x) => x !== b);
        });
    };

    const handleDownloadPdf = () => {
        if (!result || !isFull) return;
        try {
            downloadResultsPdf({
                query: result.query, counts: result.counts, buckets: result.buckets,
                leadName: user?.name || '', leadPhone: user?.phone || '',
            });
            toast.success('Shortlist PDF downloaded');
            track('predictor_pdf_downloaded', { nResults: result.counts?.total || 0 });
        } catch (e) {
            console.error(e);
            toast.error('Could not generate PDF');
        }
    };

    const toggleCompare = (key) => {
        setCompareIds((prev) => {
            if (prev.includes(key)) {
                track('predictor_compare_toggled', { key, action: 'remove', n: prev.length - 1 });
                return prev.filter((k) => k !== key);
            }
            if (prev.length >= 4) {
                toast.error('Compare up to 4 colleges — remove one to add another');
                return prev;
            }
            track('predictor_compare_toggled', { key, action: 'add', n: prev.length + 1 });
            return [...prev, key];
        });
    };

    const handleShareLink = async () => {
        if (!isFull) return;
        try {
            await navigator.clipboard.writeText(window.location.href);
            setLinkCopied(true);
            toast.success('Shareable link copied');
            track('predictor_share_link_copied');
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            toast.error('Copy failed — long-press the URL bar instead');
        }
    };

    const shape = (items) => {
        let arr = filterBranch ? items.filter((i) => i.branch === filterBranch) : items.slice();
        arr.sort((a, b) => {
            if (sortBy === 'name') return a.college.localeCompare(b.college);
            if (sortBy === 'margin') return b.margin - a.margin;
            return b.cutoff - a.cutoff;
        });
        return arr;
    };

    const totalShown = result?.counts?.total ?? 0;

    const allItems = result
        ? [
            ...result.buckets.safe.map((i) => ({ ...i, _bucket: 'safe' })),
            ...result.buckets.moderate.map((i) => ({ ...i, _bucket: 'moderate' })),
            ...result.buckets.reach.map((i) => ({ ...i, _bucket: 'reach' })),
        ]
        : [];
    const compareItems = compareIds
        .map((k) => {
            const [code, branch] = k.split('|');
            return allItems.find((i) => String(i.code) === code && i.branch === branch);
        })
        .filter(Boolean);

    return (
        <Layout>
            <div className="bg-gradient-to-b from-indigo-50 via-white to-slate-50 min-h-screen">
                {/* Hero */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                                <Sparkles size={14} /> MHT-CET • Pune Region • 2024 cutoffs
                            </span>
                            {user && (
                                <Link to="/my-predictions" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900">
                                    <GraduationCap size={14} /> My searches
                                    {profile && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-100">{isPaid ? `${profile.remaining} left` : 'Free'}</span>}
                                </Link>
                            )}
                        </div>
                        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">College Predictor</h1>
                        <p className="mt-2 text-slate-600 max-w-2xl">
                            Enter your percentile and preferences to see which colleges and branches you can
                            realistically get — sorted by your chances.
                        </p>
                    </motion.div>
                </section>

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid lg:grid-cols-[380px_1fr] gap-6">
                    {/* ── Input panel ── */}
                    <div className="lg:sticky lg:top-24 self-start bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
                        <div>
                            <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                                <span>Your percentile</span>
                                <span className="text-indigo-600 text-lg font-bold tabular-nums">{Number(percentile).toFixed(2)}</span>
                            </label>
                            <input type="range" min="0" max="100" step="0.01" value={percentile}
                                onChange={(e) => setPercentile(e.target.value)} className="w-full mt-2 accent-indigo-600" />
                            <input type="number" min="0" max="100" step="0.01" value={percentile}
                                onChange={(e) => setPercentile(e.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">Category</label>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {meta.categories.map((c) => (
                                    <button key={c} onClick={() => setCategory(c)}
                                        className={`px-2 py-2 rounded-lg text-xs font-semibold border transition ${category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'}`}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <ToggleRow checked={homeUniversity} onChange={() => setHomeUniversity((v) => !v)}
                                title="Pune home university" desc="Unlocks lower home-university (L) cutoffs" icon={MapPin} />
                            <ToggleRow checked={tfws} onChange={() => setTfws((v) => !v)}
                                title="Include TFWS seats" desc="Tuition-fee-waiver scheme seats" icon={GraduationCap} />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Preferred branches <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <div className="mt-2 flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                                {meta.branches.map((b) => (
                                    <button key={b} onClick={() => toggleBranch(b)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${branches.includes(b) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-400'}`}>
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handlePredictClick} disabled={loading}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition disabled:opacity-60">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            Predict my colleges
                        </button>
                    </div>

                    {/* ── Results ── */}
                    <div>
                        {!hasRun && (
                            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-10">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-60" />
                                    <GraduationCap className="relative text-indigo-500" size={48} />
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-slate-800">Your college list, ready in 2 seconds</h3>
                                <p className="mt-2 text-sm text-slate-500 max-w-sm">
                                    Set your percentile, category, and home-university status, then hit
                                    <b className="text-slate-700"> Predict</b>. We'll show every Pune engineering
                                    college you can realistically get into, sorted by your chances.
                                </p>
                            </div>
                        )}

                        {hasRun && result && (
                            <>
                                {/* summary + filter bar */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
                                    {totalShown > 0 && (
                                        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap size={20} className="text-indigo-600" />
                                                <p className="text-sm sm:text-base font-bold text-slate-900">
                                                    {totalShown} {totalShown === 1 ? 'college' : 'colleges'} match your profile
                                                </p>
                                            </div>
                                            {!isFull && (
                                                <button onClick={handleReveal} disabled={revealing}
                                                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 transition disabled:opacity-60">
                                                    {revealing ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
                                                    Reveal all {totalShown}
                                                </button>
                                            )}
                                            {isFull && isPaid && profile && (
                                                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5">
                                                    <Crown size={13} /> {profile.remaining} searches left
                                                </span>
                                            )}
                                        </div>
                                    )}
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
                                            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
                                                className="text-xs rounded-lg border border-slate-300 px-2 py-1.5 focus:outline-none">
                                                <option value="">All branches</option>
                                                {meta.branches.map((b) => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                                className="text-xs rounded-lg border border-slate-300 px-2 py-1.5 focus:outline-none">
                                                <option value="cutoff">Sort: Best first</option>
                                                <option value="margin">Sort: Safest first</option>
                                                <option value="name">Sort: College name</option>
                                            </select>
                                            <button onClick={handleDownloadPdf} disabled={!isFull}
                                                title={isFull ? 'Download a branded shortlist PDF' : 'Reveal the full list first (paid)'}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed">
                                                <Download size={13} /> PDF
                                            </button>
                                            <button onClick={handleShareLink} disabled={!isFull}
                                                title={isFull ? 'Copy a shareable link' : 'Reveal the full list first (paid)'}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 text-xs font-semibold px-3 py-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed">
                                                {linkCopied ? <Check size={13} className="text-emerald-500" /> : <Link2 size={13} />}
                                                {linkCopied ? 'Copied' : 'Share'}
                                            </button>
                                        </div>
                                    </div>
                                    {(loading || revealing) && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-indigo-500">
                                            <Loader2 size={12} className="animate-spin" /> {revealing ? 'Unlocking…' : 'Updating…'}
                                        </div>
                                    )}
                                </div>

                                {/* upsell banner (free users) */}
                                {!isFull && totalShown > PREVIEW_LIMIT && (
                                    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5">
                                        <Zap size={16} className="flex-shrink-0 mt-0.5 text-indigo-600" />
                                        <div className="text-xs text-indigo-900 leading-relaxed flex-1">
                                            <span className="font-bold">You're seeing a free preview.</span>{' '}
                                            Unlock the full ranked list of <b>{totalShown}</b> colleges + PDF shortlist + shareable link.
                                            <button onClick={handleReveal} className="ml-1 underline font-semibold hover:text-indigo-700">
                                                {isPaid ? 'Reveal now' : `Get full access — ₹${price} for ${pack} searches`}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* disclaimer banner */}
                                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-800">
                                    <Info size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
                                    <p className="leading-relaxed">
                                        <span className="font-bold">Indicative only.</span>{' '}
                                        Predictions are based on 2024 closing cutoffs and don't guarantee admission — actual
                                        cutoffs shift by CAP round, seat movement, and applicant volume each year.
                                    </p>
                                </div>

                                {totalShown === 0 && (
                                    <div className="text-center bg-white rounded-2xl border border-dashed border-slate-300 p-10">
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4">
                                            <SearchX className="text-slate-400" size={28} />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-700 mb-1">No matches in range</h3>
                                        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
                                            Your percentile is too low (or branch set too narrow) for any 2024 cutoff.
                                            Try widening branches or lowering the percentile.
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <button onClick={() => setBranches([])} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition">
                                                <X size={12} /> Clear branch filter
                                            </button>
                                            <button onClick={() => setPercentile(70)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition">
                                                Try percentile 70
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* buckets */}
                                <div className="space-y-6">
                                    {BUCKETS.map((b) => {
                                        const items = shape(result.buckets[b.key] || []);
                                        const bucketTotal = result.counts[b.key] || 0;
                                        if (!bucketTotal) return null;
                                        const visible = isFull ? items : items.slice(0, PREVIEW_LIMIT);
                                        const hiddenCount = Math.max(0, bucketTotal - visible.length);
                                        const Icon = b.icon;
                                        return (
                                            <div key={b.key}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${ACCENT[b.accent].chip}`}>
                                                        <Icon size={16} />
                                                    </span>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 leading-none">{b.label}</h3>
                                                        <p className="text-xs text-slate-400">{b.sub} • {bucketTotal} options</p>
                                                    </div>
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {visible.map((it, i) => {
                                                        const k = `${it.code}|${it.branch}`;
                                                        return (
                                                            <CollegeCard key={`${it.code}-${it.branch}-${i}`} item={it} accent={b.accent}
                                                                compareKey={k} isCompared={compareIds.includes(k)} onToggleCompare={() => toggleCompare(k)} />
                                                        );
                                                    })}
                                                </div>
                                                {!isFull && hiddenCount > 0 && (
                                                    <button onClick={handleReveal}
                                                        className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition">
                                                        <Lock size={15} /> Reveal {hiddenCount} more {b.label.toLowerCase()} {hiddenCount === 1 ? 'college' : 'colleges'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>

            {/* ── Compare tray ── */}
            <AnimatePresence>
                {compareIds.length > 0 && (
                    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 text-white shadow-2xl">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-300 hidden sm:inline">Compare:</span>
                            <div className="flex-1 flex flex-wrap gap-2 overflow-x-auto">
                                {compareItems.map((it) => (
                                    <span key={`${it.code}-${it.branch}`} className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 text-white text-xs pl-3 pr-1.5 py-1">
                                        <span className="font-semibold max-w-[160px] truncate">{it.college}</span>
                                        <span className="text-slate-400">·</span>
                                        <span className="text-slate-300">{it.branch}</span>
                                        <button onClick={() => toggleCompare(`${it.code}|${it.branch}`)}
                                            className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white">
                                            <X size={11} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => setCompareIds([])} className="text-xs text-slate-400 hover:text-white px-2 py-1">Clear</button>
                                <button onClick={() => setShowCompare(true)} disabled={compareItems.length < 2}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Sparkles size={13} /> Compare {compareItems.length} ({4 - compareIds.length} slots left)
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Compare drawer ── */}
            <AnimatePresence>
                {showCompare && compareItems.length >= 2 && (
                    <motion.div className="fixed inset-0 z-[70] bg-slate-900/70 flex items-center justify-center p-4 sm:p-8"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCompare(false)}>
                        <motion.div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto relative"
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 p-4 flex items-center justify-between z-10">
                                <h3 className="text-lg font-bold text-slate-900">Compare {compareItems.length} colleges</h3>
                                <button onClick={() => setShowCompare(false)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${compareItems.length}, minmax(0,1fr))` }}>
                                    {compareItems.map((it) => {
                                        const acc = ACCENT[it._bucket === 'safe' ? 'emerald' : it._bucket === 'moderate' ? 'amber' : 'rose'];
                                        return (
                                            <div key={`${it.code}-${it.branch}`} className={`rounded-xl border-2 p-4 ${acc.ring}`}>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 ${acc.chip}`}>
                                                    {it._bucket === 'safe' ? 'High Chance' : it._bucket === 'moderate' ? 'Likely' : 'Ambitious'}
                                                </span>
                                                <h4 className="text-sm font-bold text-slate-800 leading-snug">{it.college}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">{it.branch}</p>
                                                <div className="mt-4 space-y-2 text-xs">
                                                    <div className="flex justify-between"><span className="text-slate-400">2024 cutoff</span><b className="text-slate-800">{it.cutoff.toFixed(3)}</b></div>
                                                    <div className="flex justify-between"><span className="text-slate-400">Your margin</span><b className={it.margin >= 2 ? 'text-emerald-600' : it.margin >= 0 ? 'text-amber-600' : 'text-rose-600'}>{it.margin >= 0 ? '+' : ''}{it.margin.toFixed(3)}</b></div>
                                                    <div className="flex justify-between"><span className="text-slate-400">Via</span><b className="text-slate-800">{it.viaLabel || it.viaCategory}</b></div>
                                                    <div className="flex justify-between"><span className="text-slate-400">Code</span><b className="text-slate-800">{it.code}</b></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Phone panel (anonymous → guest) ── */}
            <AnimatePresence>
                {showPhone && (
                    <motion.div className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPhone(false)}>
                        <motion.div className="bg-white rounded-2xl w-full max-w-md p-6 relative"
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowPhone(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-3"><GraduationCap size={22} /></div>
                            <h3 className="text-xl font-bold text-slate-900">See your college matches</h3>
                            <p className="text-sm text-slate-500 mt-1">Enter your details to view your free preview. We'll save your searches to your profile.</p>
                            <form onSubmit={handlePhoneSubmit} className="mt-5 space-y-3">
                                <input type="text" placeholder="Full name" value={phoneForm.name}
                                    onChange={(e) => setPhoneForm({ ...phoneForm, name: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                <input type="tel" placeholder="Phone number" value={phoneForm.phone}
                                    onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                <button type="submit" disabled={busy}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition disabled:opacity-60">
                                    {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Show my matches
                                </button>
                            </form>
                            <p className="text-[11px] text-slate-400 mt-3 text-center">
                                Already have an account? <Link to="/login" className="text-indigo-600 font-semibold">Log in</Link>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Paywall ── */}
            <AnimatePresence>
                {showPay && (
                    <motion.div className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPay(false)}>
                        <motion.div className="bg-white rounded-2xl w-full max-w-md p-6 relative"
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowPay(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-3"><Crown size={22} /></div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {profile && profile.limit > 0 ? "You're out of searches" : 'Unlock the full predictor'}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                ₹{price} for <b>{pack} full searches</b> — saved to your profile, re-open them anytime free.
                            </p>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600">
                                <li className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> Full ranked list of every matching college</li>
                                <li className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> Download a branded PDF shortlist</li>
                                <li className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> Shareable result link</li>
                                <li className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> {pack} searches saved to your profile</li>
                            </ul>
                            <button onClick={handlePay}
                                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition">
                                <Crown size={18} /> Pay ₹{price} & unlock
                            </button>
                            <p className="text-[11px] text-slate-400 mt-3 text-center">Secure payment via Razorpay.</p>
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

function CollegeCard({ item, accent, isCompared, onToggleCompare }) {
    const span = 6;
    const pct = Math.max(0, Math.min(1, (item.margin + 1) / (span + 1)));
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-xl border bg-white p-4 ${ACCENT[accent].ring} ${isCompared ? 'ring-2 ring-indigo-500 border-indigo-300' : ''}`}>
            {onToggleCompare && (
                <button onClick={onToggleCompare} title={isCompared ? 'Remove from compare' : 'Add to compare (up to 4)'}
                    className={`absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-md border transition ${isCompared ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-400 hover:border-indigo-500 hover:text-indigo-600'}`}>
                    {isCompared ? <Check size={12} /> : <Sparkles size={11} />}
                </button>
            )}
            <div className="flex items-start justify-between gap-2 pr-6">
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
                <span className="text-slate-400">via <b className="text-slate-600">{item.viaLabel || item.viaCategory}</b></span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${ACCENT[accent].bar}`} style={{ width: `${pct * 100}%` }} />
            </div>
        </motion.div>
    );
}
