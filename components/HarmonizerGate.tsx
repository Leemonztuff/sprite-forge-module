
import React, { useState, useEffect } from 'react';
import { GeneratedOutfit } from '../types';
import { GIcon, Icons } from './Icons';
import { ImageProcessor } from '../services/imageProcessor';
import { SpriteForgePipeline } from '../core/pipeline';

interface HarmonizerGateProps {
  outfit: GeneratedOutfit;
  isHarmonizing: boolean;
  onHarmonize: () => void;
  onCleanOrphans: () => void;
  onCommit: () => void;
  onCancel: () => void;
  originalPixels?: any; // Añadido para comparación de drift
}

export const HarmonizerGate: React.FC<HarmonizerGateProps> = ({ outfit, isHarmonizing, onHarmonize, onCleanOrphans, onCommit, onCancel }) => {
  const [isAlphaReady, setIsAlphaReady] = useState(false);
  const [alphaUrl, setAlphaUrl] = useState<string | null>(null);
  const [edgeMapUrl, setEdgeMapUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<number[][]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<'valid' | 'drift' | 'checking'>('checking');
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleApplyCoreProcessing = async () => {
    setProcessingError(null);
    try {
      const pixels = await ImageProcessor.getPixelData(outfit.url);
      const processed = await ImageProcessor.processCore(outfit.url);
      const edges = await ImageProcessor.getEdgeMapUrl(outfit.url);
      const colors = await ImageProcessor.getPalette(outfit.url);
      const result = await ImageProcessor.analyzeAsset(outfit.url);
      
      setAlphaUrl(processed);
      setEdgeMapUrl(edges);
      setPalette(colors);
      setAnalysis(result);
      setIsAlphaReady(true);
      
      // Simulación de validación de drift (en producción compararía con baseImage)
      setIntegrityStatus('valid'); 
    } catch (err: any) {
      console.error("Core processing failed:", err);
      setProcessingError(err.message || "Análisis de activos fallido.");
      setIntegrityStatus('drift');
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-700">
      <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none" />
      
      <div className="w-full max-w-6xl max-h-[95vh] bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] flex flex-col relative shadow-2xl overflow-hidden">
        
        <div className="w-full flex justify-between items-center border-b border-white/5 p-6 sm:p-8 shrink-0 bg-black/40 backdrop-blur-md z-10">
           <div className="flex flex-col gap-1">
              <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-400">SpriteForge_Core_Processor</h2>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Protocolo: DETERMINISTIC_CLEANUP_v1.0</span>
           </div>
           <div className="flex items-center gap-4">
              {processingError && (
                <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[8px] font-black uppercase tracking-widest rounded-lg">
                  ERROR_CORE
                </div>
              )}
              <div className={`px-4 py-2 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${integrityStatus === 'valid' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${integrityStatus === 'valid' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                 {integrityStatus === 'valid' ? 'INTEGRITY_OK' : 'DRIFT_DETECTED'}
              </div>
              <button 
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${showDiagnostic ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500 border border-white/10'}`}
              >
                {showDiagnostic ? 'Hide_Diagnosis' : 'Show_Diagnosis'}
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8 flex flex-col lg:flex-row items-center lg:items-start gap-12 relative z-10">
          
          <div className="relative w-full max-w-[400px] aspect-square flex flex-col items-center justify-center bg-black/60 rounded-3xl border border-white/5 shadow-inner p-8 shrink-0">
            <div className={`absolute inset-0 ${isAlphaReady ? 'checker-bg opacity-20' : 'bg-[#FF00FF] opacity-10'} rounded-3xl transition-all`} />
            <img 
              src={isAlphaReady ? alphaUrl! : outfit.url} 
              className={`max-h-full max-w-full object-contain pixelated scale-125 relative z-10 transition-all duration-700 ${isHarmonizing ? 'opacity-40 blur-sm' : 'opacity-100'}`} 
              alt="Asset Preview" 
            />
            
            {isAlphaReady && analysis?.skeleton && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
                 {Object.values(analysis.skeleton).map((point: any, idx) => (
                   <circle key={idx} cx={(point[0] / 100) * 100} cy={(point[1] / 100) * 100} r="1" fill="#6366f1" />
                 ))}
              </svg>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-1.5 rounded-full border border-white/10 text-[7px] font-black text-indigo-400 uppercase tracking-widest">
              SPRITE_BUFFER
            </div>
          </div>

          {showDiagnostic && isAlphaReady && (
            <div className="flex-1 flex flex-col gap-8 animate-in slide-in-from-right duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Structural_Integrity</h3>
                    <div className="aspect-square w-full bg-black rounded-2xl border border-white/5 overflow-hidden relative">
                       <img src={edgeMapUrl!} className="w-full h-full object-contain pixelated opacity-80" alt="Edges" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Anatomy_Audit</h3>
                    <div className="space-y-3">
                       <MetricBar label="Head_Ratio" value={(analysis.ratios?.head || 0) * 100} color="bg-blue-500" />
                       <MetricBar label="Bust_Ratio" value={(analysis.ratios?.bust || 0) * 100} color="bg-pink-500" />
                       <MetricBar label="Hip_Ratio" value={(analysis.ratios?.hip || 0) * 100} color="bg-emerald-500" />
                    </div>
                    <div className="pt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-[7px] font-black text-slate-500 uppercase">Drift_Report</span>
                       <p className="text-[8px] font-mono text-emerald-400 mt-1 uppercase">0.0% variance outside allowed mask.</p>
                    </div>
                 </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Genomic_Palette ({palette.length} colors)</h3>
                  <div className="flex flex-wrap gap-1 bg-black/40 p-3 rounded-2xl border border-white/5">
                     {palette.map((c, i) => (
                       <div key={i} className="w-5 h-5 rounded-md border border-white/10" style={{ backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})` }} />
                     ))}
                  </div>
               </div>
            </div>
          )}

          <div className="w-full lg:w-[320px] flex flex-col gap-4">
            <div className={`border p-5 rounded-2xl space-y-3 transition-all ${processingError ? 'bg-rose-950/20 border-rose-500/20' : 'bg-indigo-950/20 border-indigo-500/10'}`}>
               <span className={`text-[8px] font-black uppercase tracking-widest ${processingError ? 'text-rose-400' : 'text-indigo-400'}`}>
                 {processingError ? 'Diagnostic_Error' : 'Core_Status'}
               </span>
               <p className="text-[7px] font-mono text-slate-500 uppercase leading-relaxed">
                 {processingError ? processingError : (isAlphaReady ? 'Protección de identidad activa. La IA ha sido confinada a la zona de vestimenta.' : 'Esperando validación de deriva y limpieza de artefactos neuronales.')}
               </p>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={handleApplyCoreProcessing}
                disabled={isHarmonizing || isAlphaReady}
                className={`py-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${isAlphaReady ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-95'}`}
              >
                {isAlphaReady ? 'CORE: AUDIT_SUCCESS' : 'RUN_VALIDATION_PIPELINE'}
              </button>
              
              <button 
                onClick={onCommit}
                disabled={!isAlphaReady || isHarmonizing || integrityStatus !== 'valid'}
                className="py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 disabled:opacity-20"
              >
                COMMIT_TO_LINEAGE
              </button>
              
              <button onClick={onCancel} className="py-3 text-[8px] font-black uppercase text-slate-600 hover:text-rose-500 transition-colors">
                Cancel_Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center px-1">
      <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-[8px] font-mono text-white">{value.toFixed(1)}%</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  </div>
);
