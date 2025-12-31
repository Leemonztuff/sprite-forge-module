
import React, { useState, useEffect } from 'react';
import { GeneratedOutfit } from '../types';
import { IconButton } from './UI';

interface ImageModalProps {
  outfit: GeneratedOutfit;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSelectAsParent: (o: GeneratedOutfit) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ outfit, onClose, onDelete, onSelectAsParent }) => {
  const [zoom, setZoom] = useState(1);
  const [showMetadata, setShowMetadata] = useState(false);

  // Close on Escape (Extra safety layer)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = outfit.url;
    link.download = `SF-ASSET-${outfit.id.slice(0, 5)}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[8000] flex flex-col animate-in fade-in duration-500 overflow-hidden bg-black">
      {/* Background with higher opacity to focus attention */}
      <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={onClose} />
      
      {/* FLOATING CLOSE BUTTON (Absolute fallback) */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[8050] w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all active:scale-90 md:hidden"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* CONSOLA SUPERIOR */}
      <div className="relative z-[8010] h-24 px-6 sm:px-12 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex w-12 h-12 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-600/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-white">GEN-INSPECTION</h3>
            <div className="flex items-center gap-2 sm:gap-3 mt-1">
              <span className="text-[7px] sm:text-[8px] font-black text-indigo-400 uppercase tracking-widest">Phase {outfit.evolutionStep}</span>
              <span className="hidden xs:inline text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[100px]">{outfit.id}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <IconButton onClick={() => setShowMetadata(!showMetadata)} variant="primary" title="Metadata" className={showMetadata ? 'bg-indigo-600 text-white' : 'hidden xs:flex'}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </IconButton>
          <IconButton onClick={handleDownload} variant="primary" title="Export Asset">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </IconButton>
          <button 
            onClick={() => { onSelectAsParent(outfit); onClose(); }}
            className="flex items-center gap-2 sm:gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="hidden xs:inline">Re-Forge</span>
            <span className="xs:hidden">Forge</span>
          </button>
          <IconButton onClick={() => { if(confirm('Purge this asset from memory?')) { onDelete(outfit.id); onClose(); } }} variant="danger" title="Purge" className="hidden sm:flex">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </IconButton>
          <div className="hidden md:flex w-px h-8 bg-white/5 mx-2" />
          <IconButton onClick={onClose} className="hidden md:flex bg-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </IconButton>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* VISOR PRINCIPAL */}
        <div className="flex-1 relative flex items-center justify-center p-6 sm:p-12 overflow-hidden touch-none">
          <div className="absolute inset-0 opacity-[0.03] checker-bg pointer-events-none" />
          
          <div className="relative w-full h-full flex items-center justify-center overflow-auto no-scrollbar scroll-smooth">
            <div className="relative group p-10 sm:p-20 flex items-center justify-center min-h-full">
              <div className="absolute inset-0 bg-indigo-600/10 blur-[150px] opacity-20 pointer-events-none" />
              <img 
                src={outfit.url} 
                style={{ 
                  transform: `scale(${zoom})`, 
                  imageRendering: 'pixelated',
                  transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
                }}
                className="max-h-[80vh] max-w-[90vw] object-contain drop-shadow-[0_0_100px_rgba(79,70,229,0.3)] select-none pointer-events-none" 
                alt="Genomic Detail" 
              />
            </div>
          </div>

          {/* CONTROLES DE ZOOM */}
          <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 sm:gap-8 bg-black/80 backdrop-blur-3xl px-6 sm:px-10 py-4 sm:py-5 rounded-full border border-white/10 shadow-3xl">
            <button onClick={() => setZoom(Math.max(1, zoom - 1))} className="text-white/40 hover:text-white transition-colors p-2">
              <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
            </button>
            <div className="flex flex-col items-center min-w-[70px] sm:min-w-[100px]">
              <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em] text-indigo-500">{zoom.toFixed(1)}X</span>
              <span className="text-[6px] sm:text-[7px] font-bold text-slate-500 uppercase tracking-widest">Neural Zoom</span>
            </div>
            <button onClick={() => setZoom(Math.min(8, zoom + 1))} className="text-white/40 hover:text-white transition-colors p-2">
              <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>

        {/* PANEL LATERAL DE DATOS */}
        {showMetadata && (
          <aside className="w-full md:w-[360px] lg:w-[400px] bg-[#050505] border-l border-white/5 p-8 sm:p-10 flex flex-col gap-8 animate-in slide-in-from-right duration-400 overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 px-1">Directive Log</h4>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 shadow-inner">
                <p className="text-[10px] font-mono text-slate-400 leading-relaxed italic">
                  "{outfit.prompt || "No directive stored."}"
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 px-1">Asset Specs</h4>
              <div className="space-y-2">
                <SpecItem label="Model" value={outfit.model} />
                <SpecItem label="Ratio" value={outfit.aspectRatio} />
                <SpecItem label="Mode" value={outfit.mode} />
                <SpecItem label="Created" value={new Date(outfit.timestamp).toLocaleDateString()} />
              </div>
            </div>

            <div className="mt-auto pt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-emerald-500/40 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Integrity Verified</span>
              </div>
              <button 
                onClick={() => { if(confirm('Delete permanently?')) { onDelete(outfit.id); onClose(); } }} 
                className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 hover:bg-red-500/5 rounded-xl border border-transparent hover:border-red-500/20 transition-all sm:hidden"
              >
                Erase Genomic Record
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

const SpecItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-xl">
    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-[8px] font-black text-white uppercase tracking-wider truncate max-w-[150px]">{value}</span>
  </div>
);
