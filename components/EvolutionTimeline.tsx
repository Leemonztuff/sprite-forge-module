
import React, { useState, useMemo } from 'react';
import { AppState, GeneratedOutfit } from '../types';
import { GIcon, Icons } from './Icons';

interface EvolutionTimelineProps {
  state: AppState;
  onExecuteHybrid: (idA: string, idB: string) => void;
  onClose: () => void;
}

export const EvolutionTimeline: React.FC<EvolutionTimelineProps> = ({ state, onExecuteHybrid, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [blendValue, setBlendValue] = useState(50);

  const sortedOutfits = useMemo(() => 
    [...state.outfits].sort((a, b) => b.timestamp - a.timestamp),
  [state.outfits]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const outfitA = useMemo(() => state.outfits.find(o => o.id === selectedIds[0]), [selectedIds, state.outfits]);
  const outfitB = useMemo(() => state.outfits.find(o => o.id === selectedIds[1]), [selectedIds, state.outfits]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500 overflow-hidden">
      
      {/* Header Fijo */}
      <div className="flex justify-between items-center shrink-0 border-b border-white/5 p-6 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <GIcon d={Icons.Dna} size={20} className="text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Genetics_Lab</h2>
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">DNA_Merging_Engine</span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Contenido con Scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {state.outfits.length === 0 ? (
          /* Estado Vacío */
          <div className="h-[70vh] flex flex-col items-center justify-center p-12 text-center gap-6">
            <div className="w-24 h-24 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center opacity-20">
               <GIcon d={Icons.Dna} size={48} className="text-white" />
            </div>
            <div className="space-y-2">
               <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Secuencia Vacía</h3>
               <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                 Debes guardar al menos dos diseños en la forja para realizar cruces genéticos.
               </p>
            </div>
            <button onClick={onClose} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">
              Volver a la Forja
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-10">
            {/* Visor de Fusión */}
            <div className="w-full aspect-square sm:aspect-video bg-[#050505] rounded-[2.5rem] border border-white/5 relative flex flex-col items-center justify-center overflow-hidden tech-grid">
              <div className="absolute inset-0 bg-radial-at-c from-indigo-500/5 to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-6 sm:gap-16 relative z-10 scale-90 sm:scale-100">
                {/* Slot A */}
                <div className={`relative w-32 h-32 rounded-full border-2 transition-all flex items-center justify-center ${outfitA ? 'border-indigo-500 bg-indigo-500/5' : 'border-dashed border-white/5'}`}>
                   {outfitA ? (
                     <img src={outfitA.url} className="w-24 h-24 object-contain pixelated scale-125 animate-in zoom-in" />
                   ) : (
                     <span className="text-[6px] font-black text-slate-700 uppercase tracking-widest text-center">Slot_A</span>
                   )}
                </div>
                <div className="text-slate-800 text-xl font-black">+</div>
                {/* Slot B */}
                <div className={`relative w-32 h-32 rounded-full border-2 transition-all flex items-center justify-center ${outfitB ? 'border-pink-500 bg-pink-500/5' : 'border-dashed border-white/5'}`}>
                   {outfitB ? (
                     <img src={outfitB.url} className="w-24 h-24 object-contain pixelated scale-125 animate-in zoom-in" />
                   ) : (
                     <span className="text-[6px] font-black text-slate-700 uppercase tracking-widest text-center">Slot_B</span>
                   )}
                </div>
              </div>

              {outfitA && outfitB && (
                <div className="mt-8 w-[80%] max-w-sm flex flex-col gap-4 animate-in slide-in-from-bottom-4">
                  <div className="flex justify-between text-[7px] font-black uppercase text-indigo-400">
                    <span>Alpha</span>
                    <span>Ratio: {blendValue}%</span>
                    <span>Beta</span>
                  </div>
                  <input type="range" value={blendValue} onChange={e => setBlendValue(parseInt(e.target.value))} className="w-full" />
                  <button 
                    onClick={() => onExecuteHybrid(outfitA.id, outfitB.id)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 active:scale-95"
                  >
                    Sintetizar Híbrido
                  </button>
                </div>
              )}
            </div>

            {/* Historial Horizontal (Thumbs) */}
            <div className="space-y-4">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 px-2">Gen_Library</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {sortedOutfits.map(outfit => {
                  const isSelected = selectedIds.includes(outfit.id);
                  return (
                    <button 
                      key={outfit.id} 
                      onClick={() => toggleSelection(outfit.id)}
                      className={`shrink-0 w-24 h-24 rounded-2xl border flex flex-col items-center justify-center p-2 relative transition-all
                        ${isSelected ? 'bg-indigo-600/20 border-indigo-500 scale-105' : 'bg-white/[0.02] border-white/5'}`}
                    >
                      <img src={outfit.url} className="w-16 h-16 object-contain pixelated" />
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black border-2 border-black">
                          {selectedIds.indexOf(outfit.id) + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
