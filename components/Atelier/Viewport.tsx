
import React from 'react';
import { AppState, BackgroundStyle } from '../../types';
// Fixed: GIcon and Icons are imported from ../Icons, only ComparisonSlider from ../UI
import { ComparisonSlider } from '../UI';
import { GIcon, Icons } from '../Icons';

interface ViewportProps {
  state: AppState;
  previewStage: BackgroundStyle;
  isZenMode: boolean;
  onToggleZen: () => void;
  onCommit: () => void;
  onUpdateConfig: (conf: any) => void;
  onSetStage: (s: BackgroundStyle) => void;
}

const STAGES: { id: BackgroundStyle; color: string }[] = [
  { id: 'magenta', color: 'bg-[#FF00FF]' },
  { id: 'forest', color: 'bg-emerald-900' },
  { id: 'dungeon', color: 'bg-slate-900' },
  { id: 'ui', color: 'bg-indigo-950' }
];

export const Viewport: React.FC<ViewportProps> = ({ 
  state, previewStage, isZenMode, onToggleZen, onCommit, onUpdateConfig, onSetStage 
}) => {
  const [showHUD, setShowHUD] = React.useState(false);
  const isOrthographic = state.config.mode === 'Orthographic' || state.pendingOutfit?.mode === 'Orthographic';

  return (
    <div className={`flex-1 relative flex items-center justify-center p-8 overflow-hidden transition-all duration-700 ${
      previewStage === 'forest' ? 'bg-[#062c16]' : previewStage === 'dungeon' ? 'bg-[#1a1a2e]' : previewStage === 'ui' ? 'bg-[#0a0a0f]' : 'tech-grid'
    }`}>
      {state.pendingOutfit ? (
         <div className="relative group max-h-full flex flex-col items-center gap-8 animate-in zoom-in duration-500 w-full">
           <div className="relative w-full flex justify-center">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
              <img 
                src={state.pendingOutfit.url} 
                className={`max-h-[50vh] object-contain pixelated drop-shadow-[0_0_60px_rgba(99,102,241,0.3)] transition-all duration-500 ${isOrthographic ? 'w-[95%] scale-100' : 'scale-125 sm:scale-150'} ${isZenMode ? 'scale-150 sm:scale-[2]' : ''}`} 
                alt="Synthesis" 
              />
              <button 
                onClick={onCommit}
                className={`absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-90 transition-all border border-emerald-400 z-50 whitespace-nowrap flex items-center gap-3 animate-bounce ${isZenMode ? 'scale-75 opacity-70' : ''}`}
              >
                <GIcon d={Icons.Tree} size={16} />
                GUARDAR EN LINAJE
              </button>
           </div>
         </div>
      ) : state.activeParent ? (
        <ComparisonSlider before={state.baseImage!} after={state.activeParent.url} className={`w-full ${isOrthographic ? 'max-w-4xl aspect-[16/9]' : 'max-w-xs aspect-square'}`} />
      ) : (
        <div className="relative group max-h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-600/5 blur-[100px] rounded-full" />
          <img src={state.baseImage!} className={`max-h-[60vh] object-contain pixelated transition-all duration-500 drop-shadow-[0_0_80px_rgba(99,102,241,0.2)] ${isZenMode ? 'scale-150 sm:scale-[1.8]' : 'scale-125'}`} alt="Specimen" />
        </div>
      )}

      {/* Viewport UI Controls */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[100] transition-all duration-500">
         <button 
           onClick={onToggleZen}
           className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-xl transition-all shadow-2xl ${isZenMode ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'}`}
         >
            <GIcon d={isZenMode ? Icons.Eye : Icons.EyeOff} size={20} />
         </button>
      </div>

      <div className={`absolute top-4 right-4 flex flex-col items-end gap-3 z-40 transition-all duration-500 ${isZenMode ? 'translate-x-20 opacity-0 pointer-events-none' : 'translate-x-0'}`}>
         <button 
          onClick={() => setShowHUD(!showHUD)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${showHUD ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-black/40 border-white/10 text-slate-400 backdrop-blur-xl'}`}
         >
            <GIcon d={showHUD ? Icons.Grid : Icons.Settings} size={20} />
         </button>
         
         {showHUD && (
           <div className="flex flex-col gap-2 p-2 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 animate-in slide-in-from-top-2">
              {STAGES.map(s => (
                <button key={s.id} onClick={() => {onSetStage(s.id); setShowHUD(false);}} className={`w-10 h-10 rounded-xl border-2 transition-all ${previewStage === s.id ? 'border-indigo-500 scale-110' : 'border-transparent opacity-50'}`}>
                  <div className={`w-full h-full rounded-lg ${s.color}`} />
                </button>
              ))}
              <div className="h-px bg-white/10 my-1" />
              <button onClick={() => onUpdateConfig({ isSeedLocked: !state.config.isSeedLocked })} className={`w-10 h-10 rounded-xl flex items-center justify-center ${state.config.isSeedLocked ? 'text-indigo-400' : 'text-slate-600'}`}>
                 <GIcon d={state.config.isSeedLocked ? Icons.Lock : Icons.Unlock} size={18} />
              </button>
           </div>
         )}
      </div>
    </div>
  );
};
