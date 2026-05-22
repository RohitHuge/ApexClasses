import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { getCurrentUser } from '../../utils/appwrite';
import { toast } from 'react-hot-toast';
import { 
  ShieldAlert, 
  Loader2, 
  Plus, 
  Minus, 
  RotateCcw, 
  Moon, 
  Sun,
  Lock,
  Eye,
  CheckCircle
} from 'lucide-react';

// Configure PDF.js Worker using CDN for better performance and smaller bundle size
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Individual PDF Page Component for continuous scrolling
const PDFPage = React.memo(({ pageNum, pdfProxy, user, scale, nightMode }) => {
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

            // Capping DPR on mobile to prevent crashes
            let dpr = window.devicePixelRatio || 1;
            if (window.innerWidth < 768) {
                dpr = Math.min(dpr, 1.5);
            }

            canvas.height = viewport.height * dpr;
            canvas.width = viewport.width * dpr;
            
            // Fill with white background
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            canvas.style.height = 'auto';
            canvas.style.width = '100%';
            context.scale(dpr, dpr);

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            // Cancel any pending render
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
    <div 
        className={`relative bg-white shadow-xl rounded-lg group select-none no-select mb-6 last:mb-12 w-full max-w-3xl mx-auto overflow-hidden border border-slate-200 ${nightMode ? 'invert-pdf' : ''}`}
    >
        {/* Secure Watermark Overlay per page */}
        <div className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden mix-blend-multiply opacity-[0.04]">
            <div className="absolute inset-[-100%] flex flex-wrap gap-12 sm:gap-20 items-center justify-center rotate-[-30deg] p-8 sm:p-16">
                {Array.from({ length: 36 }).map((_, i) => (
                    <span key={i} className="text-xs md:text-sm font-black whitespace-nowrap tracking-tight text-slate-800 uppercase">
                        {user?.email || 'APEX NOTES'} • {user?.$id?.slice(-5) || 'SECURE'}
                    </span>
                ))}
            </div>
        </div>

        {/* PDF Canvas Content */}
        <canvas 
            ref={canvasRef} 
            className="block w-full h-auto" 
        />

        {/* Protection Mask */}
        <div className="absolute inset-0 z-10 cursor-default" />
    </div>
  );
});

export default function PDFViewer({ pdfUrl, onComplete, isCompleted }) {
  const [user, setUser] = useState(null);
  const [pdfProxy, setPdfProxy] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.1); 
  const [nightMode, setNightMode] = useState(false);

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.15, 2.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.15, 0.65));
  const resetZoom = () => setScale(1.1);

  // Apply browser viewport protection hooks
  useEffect(() => {
    const handleContextMenu = (e) => {
        e.preventDefault();
        toast.error('Notes content is protected.', { id: 'ctx-toast-pdf' });
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u' || e.key === 'a')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'c' || e.key === 'j')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        toast.error('Copy/Save/Print Restricted.', { icon: '🔒', id: 'security-toast-pdf' });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch and Load PDF
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch current user details for secure watermarking
        const u = await getCurrentUser();
        if (active) setUser(u);

        // Fetch PDF as array buffer
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to load PDF file (${response.status})`);
        }

        const buffer = await response.arrayBuffer();
        if (!active) return;

        const loadingTask = pdfjsLib.getDocument({ 
          data: new Uint8Array(buffer),
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
        });
        const pdf = await loadingTask.promise;
        
        if (active) {
          setPdfProxy(pdf);
          setNumPages(pdf.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Secure PDF Loader Error:', err);
        if (active) {
          setError(err.message || 'Error parsing PDF notes. Please try again.');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      active = false;
    };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-slate-50/50 rounded-2xl border border-slate-200">
        <Loader2 size={40} className="text-orange-500 animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide uppercase">Securing and loading notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-red-50/40 rounded-2xl border border-red-100 text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4 opacity-75" />
        <h4 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h4>
        <p className="text-sm text-slate-500 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col rounded-3xl overflow-hidden border border-slate-200 shadow-sm ${nightMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      
      {/* Viewer Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
            <Lock size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 leading-none block mb-0.5">Secure View Mode</span>
            <span className="text-xs font-bold text-slate-800 leading-none">ReadOnly PDF Note ({numPages} {numPages === 1 ? 'Page' : 'Pages'})</span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-3">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button onClick={zoomOut} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-white rounded-lg transition-all" title="Zoom Out">
              <Minus size={14} />
            </button>
            <div className="min-w-[40px] text-center text-[10px] font-bold text-slate-800 tabular-nums">
              {Math.round(scale * 100)}%
            </div>
            <button onClick={zoomIn} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-white rounded-lg transition-all" title="Zoom In">
              <Plus size={14} />
            </button>
            <button onClick={resetZoom} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-white rounded-lg transition-all" title="Reset Zoom">
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Night Mode Switch */}
          <button 
            onClick={() => setNightMode(!nightMode)}
            className={`p-2 rounded-xl transition-all border ${nightMode ? 'bg-[#1e293b] border-slate-700 text-yellow-400' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-950'}`}
            title={nightMode ? "Switch to Day Mode" : "Switch to Night Mode"}
          >
            {nightMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Complete Button */}
          {onComplete && (
            <button
              onClick={onComplete}
              disabled={isCompleted}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                isCompleted 
                  ? "bg-green-50 text-green-600 border border-green-200 cursor-default" 
                  : "bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/25 active:scale-95"
              }`}
            >
              <CheckCircle size={14} />
              {isCompleted ? "Completed" : "Mark as Read"}
            </button>
          )}
        </div>
      </div>

      {/* Pages Container */}
      <div className={`p-6 max-h-[70vh] overflow-y-auto custom-scrollbar flex flex-col items-center ${nightMode ? 'bg-[#0b0f19]/80' : 'bg-slate-100/50'}`}>
        <div className="w-full flex flex-col items-center select-none no-select">
          {Array.from({ length: numPages }).map((_, i) => (
            <PDFPage 
              key={i + 1} 
              pageNum={i + 1} 
              pdfProxy={pdfProxy} 
              user={user} 
              scale={scale} 
              nightMode={nightMode}
            />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <Eye size={12} className="text-orange-500 animate-pulse" />
          <span>Strictly Read-Only Access Session</span>
        </div>
        <div>
          <span>{user?.email || 'Guest Session'}</span>
        </div>
      </div>

      <style>{`
        .no-select { -webkit-user-select: none; user-select: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        
        .invert-pdf {
          filter: invert(1) hue-rotate(180deg);
        }
        .invert-pdf canvas {
          image-rendering: -webkit-optimize-contrast;
        }

        /* Prevent Print Option completely */
        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
