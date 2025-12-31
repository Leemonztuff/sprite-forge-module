
import React from 'react';
import { AppState, MorphPart, MorphConfig } from '../types';
import { ParameterBox } from './UI';
import { GIcon, Icons } from './Icons';

interface MorphLabProps {
  state: AppState;
  onUpdateMorph: (update: Partial<MorphConfig>) => void;
  onExecute: () => void;
  onClose: () => void;
}

export const MorphLab: React.FC<MorphLabProps> = ({ state, onUpdateMorph, onExecute, onClose }) => {
  const parts: { id: MorphPart; label: string; icon: string }[] = [
    { id: 'all', label: 'Global', icon: 'M256 32L64 416h384L256 32z' },
    { id: 'head', label: 'Cráneo', icon: 'M256 48c-66.3 0-120 53.7-120 120s53.7 120 120 120 120-53.7 120-120S322.3 48 256 48z' },
    { id: 'torso', label: 'Torso/Busto', icon: 'M256 128c-44.2 0-80 35.8-80 80v64h160v-64c0-44.2-35.8-80-80-80z' },
    { id: 'arms', label: 'Brazos', icon: 'M128 256v128h64V256h-64zm192 0v128h64V256h-64z' },
    { id: 'legs', label: 'Piernas', icon: 'M160 384v96h64v-96h-64zm128 0v96h64v-96h-64z' }
  ];

  return (
    <div className="absolute inset-0 z-[600] bg-black/95 backdrop-blur-2xl p-4 sm:p-8 flex flex-col gap-6 sm:gap-10 animate-in fade-in duration-500 overflow-y-auto pb-32">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0 border-b border-white/5 pb-4 sm:pb-6 sticky top-0 bg-black/60 backdrop-blur-md z-50">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-indigo-500/30">
            <GIcon d={Icons.Alchemy} size={18} className="text-indigo-400 sm:hidden" />
            <GIcon d={Icons.Alchemy} size={20} className="text-indigo-400 hidden sm:block" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white">Anatomical_Recalibration</h2>
            <span className="text-[6px] sm:text-[7px] font-bold text-slate-500 uppercase tracking-widest">Morph_Engine_v3.1</span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-12 min-h-full">
        {/* Visual Selector */}
        <div className="w-full lg:flex-1 min-h-[350px] sm:min-h-[500px] bg-[#0a0a0f] rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/5 relative flex items-center justify-center p-4 sm:p-12 overflow-hidden shadow-inner group shrink-0">
          <div className="absolute inset-0 tech-grid opacity-[0.05]" />
          <div className="absolute inset-0 bg-radial-at-c from-indigo-500/5 to-transparent pointer-events-none" />
          
          <img 
            src={state.baseImage!} 
            className="max-h-[40vh] sm:max-h-[60vh] object-contain pixelated scale-110 sm:scale-125 relative z-10 drop-shadow-[0_0_40px_rgba(99,102,241,0.1)] transition-transform duration-500 group-hover:scale-[1.15] sm:group-hover:scale-[1.3]" 
            alt="Current DNA" 
          />
          
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center">
             <div className={`w-16 h-16 sm:w-32 sm:h-32 rounded-full border-2 border-indigo-500/40 bg-indigo-500/5 animate-pulse transition-opacity duration-300 ${state.morph.part === 'head' ? 'opacity-100' : 'opacity-0'}`} style={{ transform: window.innerWidth < 640 ? 'translateY(-60px)' : 'translateY(-140px)' }} />
             <div className={`w-24 h-28 sm:w-48 sm:h-56 rounded-2xl sm:rounded-3xl border-2 border-indigo-500/40 bg-indigo-500/5 animate-pulse transition-opacity duration-300 ${state.morph.part === 'torso' ? 'opacity-100' : 'opacity-0'}`} style={{ transform: window.innerWidth < 640 ? 'translateY(-10px)' : 'translateY(-20px)' }} />
             <div className={`w-14 h-32 sm:w-24 sm:h-64 rounded-full border-2 border-indigo-500/40 bg-indigo-500/5 animate-pulse transition-opacity duration-300 ${state.morph.part === 'legs' ? 'opacity-100' : 'opacity-0'}`} style={{ transform: window.innerWidth < 640 ? 'translateY(80px)' : 'translateY(180px)' }} />
          </div>
        </div>

        {/* Controls Sidebar */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 sm:gap-8 shrink-0">
          <div className="space-y-4">
             <h3 className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-indigo-400 px-1">Target_Region</h3>
             <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
                {parts.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => onUpdateMorph({ part: p.id })}
                    className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all ${state.morph.part === p.id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 neon-shadow scale-105' : 'bg-black border-white/5 text-slate-700 hover:text-slate-400'}`}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 512 512"><path d={p.icon} /></svg>
                    <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest">{p.label}</span>
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
             <h3 className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-indigo-400 px-1">Calibration_Matrix</h3>
             <div className="grid grid-cols-1 gap-4">
                <ParameterBox 
                  label="Escala" 
                  description="Proporción general de la región."
                  value={state.morph.scale} 
                  icon={Icons.Forge}
                  onChange={(v) => onUpdateMorph({ scale: v })} 
                />
                <ParameterBox 
                  label="Masa" 
                  description="Densidad muscular y volumen."
                  value={state.morph.mass} 
                  icon={Icons.Armor}
                  onChange={(v) => onUpdateMorph({ mass: v })} 
                />
                <ParameterBox 
                  label="Definición" 
                  description="Nitidez anatómica y detalle."
                  value={state.morph.definition} 
                  icon={Icons.Circuitry}
                  onChange={(v) => onUpdateMorph({ definition: v })} 
                />
             </div>
          </div>

          <div className="pt-4 sm:pt-6 flex flex-col gap-4">
             <div className="p-3 sm:p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full animate-pulse shrink-0" />
                <p className="text-[7px] sm:text-[8px] font-mono text-indigo-400/80 uppercase leading-relaxed tracking-wider">
                  Ready for recalibration. All genetic locks verified. Synthesis will preserve original DNA essence.
                </p>
             </div>
             <button 
                onClick={onExecute}
                disabled={state.isGenerating}
                className="w-full py-4 sm:py-5 bg-indigo-600 text-white rounded-xl sm:rounded-[1.5rem] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50"
             >
                {state.isGenerating ? "RECONFIGURING..." : "EXECUTE_MORPH"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
