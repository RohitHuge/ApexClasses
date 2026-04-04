import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { getCurrentUser, createJWT } from '../utils/appwrite';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ShieldAlert, 
  Loader2, 
  Maximize2, 
  Minimize2,
  Lock,
  Eye,
  Plus,
  Minus,
  RotateCcw,
  BookOpen
} from 'lucide-react';

// Configure PDF.js Worker using CDN for better performance and smaller bundle size
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Individual Page Component for High-Performance Continuous Scroll
const PDFPage = React.memo(({ pageNum, pdfProxy, user, scale }) => {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
        if (!pdfProxy || !canvasRef.current) return;

        try {
            const page = await pdfProxy.getPage(pageNum);
            if (isCancelled) return;

            const viewport = page.getViewport({ scale });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d', { alpha: false });

            // Setup high DPR for Sharp Text rendering
            const dpr = window.devicePixelRatio || 1;
            canvas.height = viewport.height * dpr;
            canvas.width = viewport.width * dpr;
            
            // Set styles based on viewport to maintain correct ratio
            // Use logical CSS for responsiveness while keeping a high-res source
            canvas.style.height = 'auto'; // Let height scale naturally with width
            canvas.style.width = '100%';   // Fill the container
            context.scale(dpr, dpr);

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            // Before starting a new render, check if another one is in flight
            if (renderTaskRef.current) {
                await renderTaskRef.current.cancel();
            }

            if (isCancelled) return;

            renderTaskRef.current = page.render(renderContext);
            await renderTaskRef.current.promise;
            renderTaskRef.current = null;
        } catch (err) {
            if (err.name !== 'RenderingCancelledException' && !isCancelled) {
                console.error(`Page ${pageNum} render failure:`, err);
            }
        }
    };

    renderPage();

    return () => {
        isCancelled = true;
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }
    };
  }, [pdfProxy, pageNum, scale]);

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "100px" }}
        transition={{ duration: 0.5 }}
        className="relative bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] rounded-sm group no-select mb-8 lg:mb-12 last:mb-20 w-fit max-w-full overflow-hidden"
    >
        {/* Secure Watermark Overlay per page */}
        <div className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden mix-blend-multiply opacity-[0.05]">
            <div className="absolute inset-[-100%] flex flex-wrap gap-12 sm:gap-24 items-center justify-center rotate-[-35deg] p-12 sm:p-24">
                {Array.from({ length: 48 }).map((_, i) => (
                    <span key={i} className="text-lg md:text-2xl font-black whitespace-nowrap tracking-tighter text-slate-900 uppercase">
                        {user?.email} • {user?.$id?.slice(-6)}
                    </span>
                ))}
            </div>
        </div>

        {/* PDF Canvas Content - Fixed max-w to prevent layout breaking */}
        <canvas 
            ref={canvasRef} 
            className="block max-w-full h-auto" 
        />

        {/* Protection Mask */}
        <div className="absolute inset-0 z-10 cursor-default" />
    </motion.div>
  );
});

export default function BookReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pdfProxy, setPdfProxy] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.2); // Current zoom level
  const [fullscreen, setFullscreen] = useState(false);
  const viewerRef = useRef(null);

  // Zoom control helpers
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.2);

  // Security Policy: Block common Save/Print/Source shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => {
        e.preventDefault();
        toast.error('Copying or saving is restricted.', { id: 'ctx-toast' });
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u' || e.key === 'a')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'c' || e.key === 'j')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        toast.error('Security Restriction Active.', { icon: '🔒', id: 'security-toast' });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loadPDF = async (u) => {
    try {
      const jwt = await createJWT();
      if (!jwt) throw new Error('Authorization token failure.');

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/orders/secure-pdf/${id}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error('Access Denied: You do not have valid license to read this book.');
        if (response.status === 404) throw new Error('Document was not found on the secure server.');
        throw new Error(`Connection Error (${response.status})`);
      }

      const buffer = await response.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      
      setPdfProxy(pdf);
      setNumPages(pdf.numPages);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
        const u = await getCurrentUser();
        if (!u) {
            navigate('/');
            return;
        }
        setUser(u);
        loadPDF(u);
    };
    init();
  }, [id, navigate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        viewerRef.current?.requestFullscreen();
        setFullscreen(true);
    } else {
        document.exitFullscreen();
        setFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white z-[100]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="mb-8">
            <Loader2 size={64} className="text-indigo-500" />
        </motion.div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Syncing Digital Guide</h2>
      </div>
    );
  }

  if (error) {
    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white z-[100] p-6 text-center">
            <ShieldAlert size={80} className="text-red-500 mb-8 opacity-50 mx-auto" />
            <h2 className="text-3xl font-black tracking-tight mb-4 uppercase">License Denied</h2>
            <p className="text-slate-400 font-medium mb-12 max-w-md mx-auto">{error}</p>
            <button onClick={() => navigate('/dashboard')} className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95">
                Back to Dashboard
            </button>
        </div>
    );
  }

  return (
    <div ref={viewerRef} className="fixed inset-0 bg-slate-900 flex flex-col z-[50] overflow-hidden">
      
      {/* Dynamic Header with Zoom Controls */}
      <header className="h-20 bg-slate-950 border-b border-white/5 flex items-center justify-between px-4 sm:px-12 shrink-0 z-30">
        <div className="flex items-center gap-4 sm:gap-8">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-xl transition-all group">
              <ChevronLeft size={24} className="text-white/60 group-hover:text-white" />
            </button>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 leading-none mb-1">MHT-CET 2026</span>
                <span className="hidden sm:block text-sm font-black text-white">Engineering Admission Guide</span>
            </div>
        </div>

        {/* Central Zoom & Scale Interface */}
        <div className="flex items-center gap-1 sm:gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5 ml-auto mr-4 md:mr-0">
            <button onClick={zoomOut} title="Zoom Out" className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <Minus size={18} />
            </button>
            <div className="min-w-[60px] text-center text-xs font-black text-white tabular-nums">
                {Math.round(scale * 100)}%
            </div>
            <button onClick={zoomIn} title="Zoom In" className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <Plus size={18} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
            <button onClick={resetZoom} title="Reset Zoom" className="hidden sm:flex p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <RotateCcw size={16} />
            </button>
        </div>

        <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/10">
                <BookOpen size={16} className="text-indigo-400" />
                <span className="text-xs font-black text-indigo-100 uppercase tabular-nums">{numPages} Pages</span>
            </div>
            <button onClick={toggleFullscreen} className="p-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all border border-white/5">
                {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
        </div>
      </header>

      {/* Optimized Multi-Page Viewport */}
      <main className="flex-1 overflow-auto bg-black/40 custom-scrollbar p-4 sm:p-12">
        <div className="flex flex-col items-center">
            <AnimatePresence mode="popLayout">
                {Array.from({ length: numPages }).map((_, i) => (
                    <PDFPage 
                        key={i + 1} 
                        pageNum={i + 1} 
                        pdfProxy={pdfProxy} 
                        user={user} 
                        scale={scale} 
                    />
                ))}
            </AnimatePresence>
        </div>
      </main>

      <footer className="h-10 bg-slate-950 border-t border-white/5 px-6 sm:px-10 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest overflow-hidden">
            <div className="flex items-center gap-2 whitespace-nowrap">
                <Lock size={12} className="text-green-500" />
                Encrypted Session
            </div>
            <div className="hidden sm:flex items-center gap-2">
                <Eye size={12} className="text-indigo-500" />
                License: {user?.$id}
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">
            © 2026 Apex Counselling Services
          </p>
      </footer>

      <style>{`
        .no-select { -webkit-user-select: none; user-select: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
