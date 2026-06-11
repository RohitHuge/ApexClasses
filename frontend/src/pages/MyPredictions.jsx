import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Crown, GraduationCap, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, listSearches, createPayment, verifyPayment } from '../predictor/predictorService';
import { loadRazorpayScript } from '../order/utils/loadRazorpay';

const toQuery = (inputs) => {
    const p = new URLSearchParams();
    p.set('pct', Number(inputs.percentile).toFixed(2));
    p.set('cat', inputs.category);
    p.set('hu', inputs.homeUniversity ? '1' : '0');
    if (inputs.tfws) p.set('tfws', '1');
    if (inputs.branches?.length) p.set('branches', inputs.branches.join(','));
    return p.toString();
};

export default function MyPredictions() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [price, setPrice] = useState(99);
    const [pack, setPack] = useState(15);
    const [searches, setSearches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }
        (async () => {
            try {
                const [p, s] = await Promise.all([getProfile(), listSearches()]);
                setProfile(p.profile);
                if (p.price) setPrice(p.price);
                if (p.pack) setPack(p.pack);
                setSearches(s);
            } catch (e) {
                toast.error(e.message || 'Failed to load your predictions');
            } finally {
                setLoading(false);
            }
        })();
    }, [user, authLoading, navigate]);

    const handleBuy = async () => {
        try {
            const ok = await loadRazorpayScript();
            if (!ok) return toast.error('Could not load the payment window');
            const order = await createPayment();
            new window.Razorpay({
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
                        toast.success(`Payment successful — ${order.pack} searches added!`);
                    } catch (e) { toast.error(e.message); }
                },
                prefill: { name: user?.name, contact: user?.phone, email: user?.email || undefined },
                theme: { color: '#4f46e5' },
            }).open();
        } catch (e) {
            toast.error(e.message || 'Could not start payment');
        }
    };

    const isPaid = profile?.plan === 'paid';

    return (
        <Layout>
            <div className="bg-gradient-to-b from-indigo-50 via-white to-slate-50 min-h-screen">
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Predictions</h1>
                    <p className="mt-2 text-slate-600">Your saved college searches and plan.</p>

                    {/* Plan card */}
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${isPaid ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <Crown size={22} />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{isPaid ? 'Paid plan' : 'Free plan'}</p>
                                {profile && (
                                    <p className="text-xs text-slate-500">
                                        {isPaid
                                            ? `${profile.remaining} of ${profile.limit} searches left`
                                            : 'Unlimited free previews · upgrade for full lists'}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/college-predictor" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2 hover:border-indigo-500 hover:text-indigo-600 transition">
                                <Sparkles size={15} /> New search
                            </Link>
                            <button onClick={handleBuy} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 transition">
                                <Crown size={15} /> {isPaid ? `Buy ${pack} more` : `Get ${pack} searches — ₹${price}`}
                            </button>
                        </div>
                    </div>

                    {/* Saved searches */}
                    <h2 className="mt-8 mb-3 text-lg font-bold text-slate-800">Saved searches</h2>
                    {loading ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 size={16} className="animate-spin" /> Loading…</div>
                    ) : searches.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <GraduationCap className="mx-auto text-indigo-400" size={36} />
                            <p className="mt-3 text-sm text-slate-600">No saved searches yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Reveal a full result to save it here — re-open it anytime for free.</p>
                            <Link to="/college-predictor" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold px-4 py-2 hover:bg-indigo-700 transition">
                                <Sparkles size={15} /> Run a prediction
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {searches.map((s) => {
                                const inp = s.inputs || {};
                                const c = s.counts || {};
                                return (
                                    <Link key={s.id} to={`/college-predictor?${toQuery(inp)}`}
                                        className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition group">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900">
                                                    {Number(inp.percentile).toFixed(2)} %ile · {inp.category}
                                                    {inp.homeUniversity ? ' · Home-Univ' : ''}{inp.tfws ? ' · TFWS' : ''}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                    {inp.branches?.length ? inp.branches.join(', ') : 'All branches'}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold">
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{c.safe ?? 0} High</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{c.moderate ?? 0} Likely</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">{c.reach ?? 0} Reach</span>
                                                    <span className="text-slate-400">· {c.total ?? 0} total</span>
                                                </div>
                                            </div>
                                            <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition shrink-0" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
