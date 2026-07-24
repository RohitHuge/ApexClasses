import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    GraduationCap, Sparkles, Lock, Search, Loader2, MapPin, X, Info,
    Download, Crown, Check, Hash, Users, Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    fetchRankMeta, runRankPredict, revealRankResults,
    getProfile, createRankPayment, verifyRankPayment,
} from '../predictor/predictorService';
import { downloadRankPdf } from '../predictor/predictorPdf';
import { BRANCH_GROUPS, toggleGroup } from '../predictor/branchGroups';
import { loadRazorpayScript } from '../order/utils/loadRazorpay';
import { track } from '../analytics/analyticsClient';

const RANK_PRICE = 49;
const RANK_PACK  = 1;

const probBadge = (p) => {
    if (p >= 80) return 'bg-emerald-100 text-emerald-700';
    if (p >= 40) return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
};

const siteHost = (url) => {
    try { return new URL(url).hostname.replace(/^www\./, ''); }
    catch { return url; }
};

export default function CollegePredictor() {
    const { user, loginAsShadow, isGuest, isShadow } = useAuth();
    const navigate = useNavigate();

    const [meta, setMeta] = useState({ branches: [], categories: [] });

    // ── Inputs ──────────────────────────────────────────────────────────────
    const [rank, setRank] = useState('');
    const [category, setCategory] = useState('OPEN');
    const [homeUniversity, setHomeUniversity] = useState(true);
    const [tfws, setTfws] = useState(false);
    const [gender, setGender] = useState('male');
    const [branches, setBranches] = useState([]);

    // ── Results ──────────────────────────────────────────────────────────────
    const [rankResult, setRankResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [revealing, setRevealing] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    // ── Account ──────────────────────────────────────────────────────────────
    const [rankProfile, setRankProfile] = useState(null); // { used, limit, remaining }

    // ── UI gates ─────────────────────────────────────────────────────────────
    const [showPhone, setShowPhone] = useState(false);
    const [showPay, setShowPay] = useState(false);
    const [phoneForm, setPhoneForm] = useState({ phone: '' });
    const [busy, setBusy] = useState(false);
    const [shadowBannerDismissed, setShadowBannerDismissed] = useState(
        () => sessionStorage.getItem('shadow_banner_dismissed') === '1'
    );
    const pendingRef = useRef(null);

    const hydratedRef = useRef(false);
    const initialRunRef = useRef(false);

    const isUnlocked = !!rankResult && rankResult.locked === false;

    // ── Meta ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchRankMeta()
            .then((d) => setMeta({ branches: d.branches || [], categories: d.categories || [] }))
            .catch(() => toast.error('Could not load predictor options'));
        track('predictor_open');
    }, []);

    // ── Profile ───────────────────────────────────────────────────────────────
    const loadProfile = async () => {
        try {
            const d = await getProfile();
            if (d.rankProfile) setRankProfile(d.rankProfile);
            return d.rankProfile;
        } catch { return null; }
    };

    useEffect(() => {
        if (user) loadProfile();
        else setRankProfile(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // ── URL hydration ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (initialRunRef.current) return;
        const p = new URLSearchParams(window.location.search);
        const r   = p.get('rank');
        const cat = p.get('cat');
        const hu  = p.get('hu');
        const tf  = p.get('tfws');
        const g   = p.get('gender');
        const brs = p.get('branches');
        if (!r && !cat && !brs) { hydratedRef.current = true; return; }
        if (r) setRank(r);
        if (cat) setCategory(cat);
        if (hu !== null) setHomeUniversity(hu === '1');
        if (tf !== null) setTfws(tf === '1');
        if (g) setGender(g);
        if (brs) setBranches(brs.split(',').map((s) => s.trim()).filter(Boolean));
        initialRunRef.current = true;
        hydratedRef.current = true;
    }, [meta]);

    // Auto-run once after hydration (logged-in users)
    useEffect(() => {
        if (!initialRunRef.current || hasRun || !meta.branches.length || !user) return;
        doPredict();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialRunRef.current, meta.branches.length, user]);

    // ── URL sync ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!hydratedRef.current) return;
        const p = new URLSearchParams();
        if (rank) p.set('rank', rank);
        p.set('cat', category);
        p.set('hu', homeUniversity ? '1' : '0');
        if (tfws) p.set('tfws', '1');
        if (gender !== 'male') p.set('gender', gender);
        if (branches.length) p.set('branches', branches.join(','));
        window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`);
    }, [rank, category, homeUniversity, tfws, gender, branches]);

    // ── Predict ───────────────────────────────────────────────────────────────
    const doPredict = async () => {
        const r = parseInt(rank, 10);
        if (!r || r < 1 || r > 300000) {
            toast.error('Enter a valid rank between 1 and 3,00,000');
            return;
        }
        setLoading(true);
        setRankResult(null);
        try {
            const data = await runRankPredict({ rank: r, category, homeUniversity, branches, tfws, gender });
            setRankResult(data);
            setHasRun(true);
            track('predictor_rank_predict', { cat: category, reach: data.counts?.reach, safe: data.counts?.safe });
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Reveal ────────────────────────────────────────────────────────────────
    const reveal = async () => {
        const r = parseInt(rank, 10);
        setRevealing(true);
        try {
            const data = await revealRankResults({ rank: r, category, homeUniversity, branches, tfws, gender });
            setRankResult(data);
            if (data.rankProfile) setRankProfile(data.rankProfile);
            track('predictor_rank_reveal', { cat: category, fromCache: !!data.fromCache });
            if (!data.fromCache) toast.success('Full list unlocked and saved to your profile');
        } catch (e) {
            if (e.code === 'RANK_QUOTA_EXHAUSTED') {
                if (e.rankProfile) setRankProfile(e.rankProfile);
                setShowPay(true);
            } else {
                toast.error(e.message);
            }
        } finally {
            setRevealing(false);
        }
    };

    const requireGuest = (intent) => {
        if (user) return true;
        pendingRef.current = intent;
        setShowPhone(true);
        return false;
    };

    const handlePredictClick = () => {
        if (requireGuest('predict')) doPredict();
    };

    const handleReveal = async () => {
        if (!requireGuest('reveal')) return;
        const prof = rankProfile || (await loadProfile());
        if (prof && prof.remaining > 0) reveal();
        else setShowPay(true);
    };

    // ── Phone panel ───────────────────────────────────────────────────────────
    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        const phone = phoneForm.phone.replace(/\s+/g, '');
        if (!/^[0-9+]{7,15}$/.test(phone)) {
            toast.error('Please enter a valid phone number');
            return;
        }
        setBusy(true);
        try {
            await loginAsShadow(phone);
            setShowPhone(false);
            track('predictor_shadow_submitted', { cat: category });
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
                toast.error('This number is linked to an account. Please sign in.');
                navigate('/login');
            } else {
                toast.error(err.message);
            }
        } finally {
            setBusy(false);
        }
    };

    // ── Payment ───────────────────────────────────────────────────────────────
    const handlePay = async () => {
        try {
            const ok = await loadRazorpayScript();
            if (!ok) return toast.error('Could not load the payment window');
            const order = await createRankPayment();
            new window.Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'Apex Classes',
                description: `Rank Predictor — ${order.pack} searches`,
                order_id: order.orderId,
                handler: async (resp) => {
                    try {
                        const v = await verifyRankPayment({
                            razorpay_order_id: resp.razorpay_order_id,
                            razorpay_payment_id: resp.razorpay_payment_id,
                            razorpay_signature: resp.razorpay_signature,
                        });
                        if (v.rankProfile) setRankProfile(v.rankProfile);
                        setShowPay(false);
                        track('predictor_rank_payment_success');
                        toast.success(`Payment successful — ${order.pack} rank searches added!`);
                        reveal();
                    } catch (err) {
                        toast.error(err.message || 'Payment verification failed');
                    }
                },
                prefill: { name: user?.name, contact: user?.phone, email: user?.email || undefined },
                theme: { color: '#4f46e5' },
                modal: { ondismiss: () => toast('Payment cancelled.', { icon: 'ℹ️' }) },
            }).open();
        } catch (e) {
            toast.error(e.message || 'Could not start payment');
        }
    };

    // ── Branch helpers ────────────────────────────────────────────────────────
    const toggleBranch = (b) => {
        setBranches((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
    };

    const handleToggleGroup = (group) => {
        setBranches((prev) => toggleGroup(prev, group));
    };

    const isGroupActive = (group) => group.branches.every((b) => branches.includes(b));

    // ── PDF ───────────────────────────────────────────────────────────────────
    const handleDownloadPdf = () => {
        if (!rankResult || !isUnlocked) return;
        try {
            downloadRankPdf({
                query: { ...rankResult.query, gender },
                results: rankResult.results,
                leadName: user?.name || '',
                leadPhone: user?.phone || '',
            });
            toast.success('Option form PDF downloaded');
            track('predictor_rank_pdf_downloaded');
        } catch (e) {
            console.error(e);
            toast.error('Could not generate PDF');
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const reachItems = rankResult?.results?.filter((r) => r.type === 'reach') || [];
    const safeItems  = rankResult?.results?.filter((r) => r.type === 'safe')  || [];

    return (
        <Layout>
            <div className="bg-gradient-to-b from-indigo-50 via-white to-slate-50 min-h-screen">
                {/* Hero */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 pb-6">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                                <Sparkles size={14} /> MHT-CET · Pune Region · 2025 rank cutoffs
                            </span>
                            {user && (
                                <Link to="/my-predictions" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900">
                                    <GraduationCap size={14} /> My searches
                                    {rankProfile && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-100">
                                            {rankProfile.limit > 0 ? `${rankProfile.remaining} left` : 'Free preview'}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                        <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            College Predictor — By Rank
                        </h1>
                        <p className="mt-2 text-slate-600 max-w-2xl">
                            Enter your MHT-CET rank to get 10 ambitious reach colleges and 20 safe colleges —
                            sorted in the exact order to fill your CAP option form.
                        </p>
                    </motion.div>
                </section>

                {/* Shadow account banner */}
                {isShadow && !shadowBannerDismissed && (
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <span>
                                Your results are saved on <strong>this device only.</strong>{' '}
                                <button className="underline font-semibold hover:text-amber-900" onClick={() => navigate('/login')}>
                                    Sign in with Google
                                </button>{' '}
                                to access them anywhere.
                            </span>
                            <button onClick={() => { setShadowBannerDismissed(true); sessionStorage.setItem('shadow_banner_dismissed', '1'); }}
                                className="flex-shrink-0 text-amber-500 hover:text-amber-700">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid lg:grid-cols-[380px_1fr] gap-6">
                    {/* ── Input panel ── */}
                    <div className="lg:sticky lg:top-24 self-start bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">

                        {/* Rank input */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700">Your MHT-CET Rank</label>
                            <input
                                type="number" min="1" max="300000" step="1"
                                placeholder="e.g. 12450"
                                value={rank}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === '' || /^\d+$/.test(v)) setRank(v);
                                }}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        {/* Category */}
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

                        {/* Toggles */}
                        <div className="space-y-3">
                            <ToggleRow checked={homeUniversity} onChange={() => setHomeUniversity((v) => !v)}
                                title="Pune home university" desc="Unlocks lower home-university (L) cutoffs" icon={MapPin} />
                            <ToggleRow checked={tfws} onChange={() => setTfws((v) => !v)}
                                title="Include TFWS seats" desc="Tuition-fee-waiver scheme seats" icon={GraduationCap} />
                        </div>

                        {/* Gender toggle */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Users size={14} className="text-slate-400" /> Gender
                            </label>
                            <div className="mt-2 flex gap-2">
                                {['male', 'female'].map((g) => (
                                    <button key={g} onClick={() => setGender(g)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition capitalize ${gender === g ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'}`}>
                                        {g}
                                    </button>
                                ))}
                            </div>
                            {gender === 'female' && (
                                <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
                                    <Info size={11} className="inline mr-1" />
                                    Ladies-quota cutoffs not yet in our data. Results show general cutoffs — your actual chances are higher.
                                </p>
                            )}
                        </div>

                        {/* Branch super-group chips */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Branches <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {BRANCH_GROUPS.map((g) => (
                                    <button key={g.id} onClick={() => handleToggleGroup(g)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${isGroupActive(g) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400'}`}>
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
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
                                    <Hash className="relative text-indigo-500" size={48} />
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-slate-800">Enter your rank to get started</h3>
                                <p className="mt-2 text-sm text-slate-500 max-w-sm">
                                    We'll find the best 10 reach + 20 safe colleges for your MHT-CET rank —
                                    sorted in option-form order with probability scores.
                                </p>
                            </div>
                        )}

                        {hasRun && rankResult && (
                            <>
                                {/* Disclaimer */}
                                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-800">
                                    <Info size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
                                    <p className="leading-relaxed">
                                        <span className="font-bold">Indicative only.</span>{' '}
                                        Based on 2025 closing ranks. Actual cutoffs shift each year by round, seat matrix, and applicant volume.
                                    </p>
                                </div>

                                {/* Locked state — counts only */}
                                {rankResult.locked && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-3">
                                            <Lock size={22} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">Results ready</h3>
                                        <p className="text-slate-600 text-sm mb-4">
                                            Found{' '}
                                            <span className="font-bold text-rose-600">{rankResult.counts.reach} reach</span>{' '}
                                            {rankResult.counts.reach === 1 ? 'college' : 'colleges'} and{' '}
                                            <span className="font-bold text-emerald-600">{rankResult.counts.safe} safe</span>{' '}
                                            {rankResult.counts.safe === 1 ? 'college' : 'colleges'} for your rank &amp; preferences.
                                        </p>
                                        <div className="flex flex-wrap gap-3 justify-center mb-4">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-sm font-semibold">
                                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                {rankResult.counts.reach} Reach / Ambitious
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                {rankResult.counts.safe} Guaranteed Admission
                                            </div>
                                        </div>
                                        <button onClick={handleReveal} disabled={revealing}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 transition disabled:opacity-60">
                                            {revealing ? <Loader2 size={18} className="animate-spin" /> : <Crown size={18} />}
                                            Unlock Full List — ₹{RANK_PRICE}
                                        </button>
                                        <p className="mt-2 text-xs text-slate-400">{RANK_PACK} searches per pack · saved to your profile forever</p>
                                    </div>
                                )}

                                {/* Unlocked state — flat table */}
                                {!rankResult.locked && (
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                        {/* Table header bar */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap size={18} className="text-indigo-600" />
                                                <span className="font-bold text-slate-900 text-sm">
                                                    {rankResult.counts.reach + rankResult.counts.safe} colleges for rank {parseInt(rank).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {rankProfile && rankProfile.limit > 0 && (
                                                    <span className="text-xs text-slate-500">{rankProfile.remaining} searches left</span>
                                                )}
                                                <button onClick={handleDownloadPdf}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 transition">
                                                    <Download size={13} /> PDF / Option Form
                                                </button>
                                            </div>
                                        </div>

                                        {/* Responsive table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                                                        <th className="px-3 py-2 text-right w-10">#</th>
                                                        <th className="px-3 py-2 text-left w-16">Code</th>
                                                        <th className="px-3 py-2 text-left">College</th>
                                                        <th className="px-3 py-2 text-left hidden sm:table-cell">Branch</th>
                                                        <th className="px-3 py-2 text-left hidden md:table-cell">Category</th>
                                                        <th className="px-3 py-2 text-right">Prob.</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Reach section */}
                                                    {reachItems.length > 0 && (
                                                        <>
                                                            <tr>
                                                                <td colSpan={6} className="px-3 py-2 bg-rose-50 border-y border-rose-100">
                                                                    <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">
                                                                        ── Reach / Ambitious ({reachItems.length} colleges) ──
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {reachItems.map((it, i) => (
                                                                <tr key={`reach-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                                                    <td className="px-3 py-2.5 text-right text-xs text-rose-500 font-bold">{i + 1}</td>
                                                                    <td className="px-3 py-2.5 text-xs text-slate-500 font-mono">{it.code}</td>
                                                                    <td className="px-3 py-2.5">
                                                                        <span className="font-semibold text-slate-800 text-xs leading-snug block">{it.college}</span>
                                                                        <span className="text-xs text-slate-400 sm:hidden">{it.branch}</span>
                                                                        {(it.location || it.website) && (
                                                                            <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                                                                                {it.location && <><MapPin size={10} /><span>{it.location}</span></>}
                                                                                {it.location && it.website && <span>·</span>}
                                                                                {it.website && (
                                                                                    <a href={it.website} target="_blank" rel="noopener noreferrer"
                                                                                        className="inline-flex items-center gap-0.5 text-indigo-400 hover:text-indigo-600">
                                                                                        <Globe size={10} />{siteHost(it.website)}
                                                                                    </a>
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-slate-600 hidden sm:table-cell">{it.branch}</td>
                                                                    <td className="px-3 py-2.5 hidden md:table-cell">
                                                                        <span className="text-[11px] text-slate-500">{it.viaLabel || it.viaCategory}</span>
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-right">
                                                                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[11px] font-bold ${probBadge(it.probability)}`}>
                                                                            {it.probability}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    )}

                                                    {/* Safe section */}
                                                    {safeItems.length > 0 && (
                                                        <>
                                                            <tr>
                                                                <td colSpan={6} className="px-3 py-2 bg-emerald-50 border-y border-emerald-100">
                                                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                                                                        ── Guaranteed Admission ({safeItems.length} colleges) ──
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {safeItems.map((it, i) => (
                                                                <tr key={`safe-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                                                    <td className="px-3 py-2.5 text-right text-xs text-emerald-600 font-bold">{reachItems.length + i + 1}</td>
                                                                    <td className="px-3 py-2.5 text-xs text-slate-500 font-mono">{it.code}</td>
                                                                    <td className="px-3 py-2.5">
                                                                        <span className="font-semibold text-slate-800 text-xs leading-snug block">{it.college}</span>
                                                                        <span className="text-xs text-slate-400 sm:hidden">{it.branch}</span>
                                                                        {(it.location || it.website) && (
                                                                            <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                                                                                {it.location && <><MapPin size={10} /><span>{it.location}</span></>}
                                                                                {it.location && it.website && <span>·</span>}
                                                                                {it.website && (
                                                                                    <a href={it.website} target="_blank" rel="noopener noreferrer"
                                                                                        className="inline-flex items-center gap-0.5 text-indigo-400 hover:text-indigo-600">
                                                                                        <Globe size={10} />{siteHost(it.website)}
                                                                                    </a>
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-slate-600 hidden sm:table-cell">{it.branch}</td>
                                                                    <td className="px-3 py-2.5 hidden md:table-cell">
                                                                        <span className="text-[11px] text-slate-500">{it.viaLabel || it.viaCategory}</span>
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-right">
                                                                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[11px] font-bold ${probBadge(it.probability)}`}>
                                                                            {it.probability}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    )}

                                                    {reachItems.length === 0 && safeItems.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="px-3 py-8 text-center text-slate-500 text-sm">
                                                                No colleges found for your inputs. Try widening branches or category.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>

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
                            <p className="text-sm text-slate-500 mt-1">Enter your mobile number to view your personalised college list — no sign-up needed.</p>
                            <form onSubmit={handlePhoneSubmit} className="mt-5 space-y-3">
                                <input type="tel" placeholder="Mobile number" value={phoneForm.phone}
                                    onChange={(e) => setPhoneForm({ phone: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                <button type="submit" disabled={busy}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition disabled:opacity-60">
                                    {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Show my matches
                                </button>
                            </form>
                            <p className="text-[11px] text-slate-400 mt-3 text-center">
                                Have an account?{' '}
                                <Link to="/login" className="text-indigo-600 font-semibold">Sign in</Link>
                                {' '}to sync across devices.
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
                                {rankProfile && rankProfile.limit > 0 ? "You're out of rank searches" : 'Unlock the full list'}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                ₹{RANK_PRICE} for <b>{RANK_PACK} full searches</b> — saved forever, re-open free.
                            </p>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600">
                                <li className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> Full list: 10 reach + 20 safe colleges</li>
                                <li className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> Probability score for every college</li>
                                <li className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> Download CAP option form PDF</li>
                                <li className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> {RANK_PACK} searches saved to your profile</li>
                            </ul>
                            <button onClick={handlePay}
                                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition">
                                <Crown size={18} /> Pay ₹{RANK_PRICE} &amp; unlock
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
