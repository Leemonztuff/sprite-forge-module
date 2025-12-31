
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, AnimationSequence } from '../types';
import { GIcon, Icons } from './Icons';

interface AnimationLabProps {
  state: AppState;
  onExecuteAnimation: (action: string) => void;
  onInterpolate: (id: string) => void;
  onClose: () => void;
}

export const AnimationLab: React.FC<AnimationLabProps> = ({ state, onExecuteAnimation, onInterpolate, onClose }) => {
  const [selectedAnimId, setSelectedAnimId] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [numFrames, setNumFrames] = useState(6);

  const currentAnim = useMemo(() => 
    state.animations.find(a => a.id === selectedAnimId) || state.animations[0],
  [state.animations, selectedAnimId]);

  useEffect(() => {
    if (!currentAnim || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % numFrames);
    }, 1000 / (currentAnim.fps || 12));
    return () => clearInterval(interval);
  }, [currentAnim, isPlaying, numFrames]);

  const actions = ['Idle', 'Walk', 'Run', 'Attack', 'Hit', 'Die'];

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500 overflow-hidden">
      
      {/* Header Fijo */}
      <div className="flex justify-between items-center shrink-0 border-b border-white/5 p-6 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <GIcon d={Icons.Refresh} size={20} className="text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Motion_Unit</h2>
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Skeletal_Sequence_Generator</span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
        {/* Visor de Animación */}
        <div className="w-full aspect-square bg-[#050505] rounded-[2.5rem] border border-white/5 relative flex flex-col items-center justify-center tech-grid overflow-hidden">
           <div className="absolute top-4 left-4 z-10 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">F:{currentFrame + 1}/{numFrames} | {currentAnim?.fps || 12}FPS</span>
           </div>

           <div className="relative w-48 h-48 rounded-full border border-white/5 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 checker-bg opacity-5" />
              {currentAnim?.spritesheetUrl ? (
                <div 
                  className="w-full h-full pixelated"
                  style={{
                    backgroundImage: `url(${currentAnim.spritesheetUrl})`,
                    backgroundSize: `${numFrames * 100}% 100%`,
                    backgroundPosition: `-${currentFrame * 100}% 0%`,
                    transform: 'scale(2)'
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 opacity-20">
                   <GIcon d={Icons.Refresh} size={40} className="text-white" />
                   <span className="text-[7px] font-black uppercase tracking-widest">Sin Animación</span>
                </div>
              )}
           </div>

           {currentAnim && (
             <div className="absolute bottom-4 flex gap-4">
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-90 transition-all">
                   <GIcon d={isPlaying ? Icons.Lock : Icons.Unlock} size={16} />
                </button>
                <button onClick={() => onInterpolate(currentAnim.id)} className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all">
                  Smooth_Motion
                </button>
             </div>
           )}
        </div>

        {/* Acciones Generativas */}
        <div className="space-y-4">
           <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 px-2">Sintetizar Secuencia</h3>
           <div className="grid grid-cols-2 gap-3">
              {actions.map(act => (
                <button 
                  key={act}
                  onClick={() => onExecuteAnimation(act)}
                  disabled={state.isGenerating}
                  className={`py-5 rounded-2xl border flex flex-col items-center gap-2 transition-all active:scale-95
                    ${currentAnim?.action === act ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-[#0d0d0d] border-white/5 text-slate-500'}`}
                >
                   <span className="text-[10px] font-black uppercase tracking-widest">{act}</span>
                   <span className="text-[6px] font-bold uppercase tracking-widest opacity-40">Generate</span>
                </button>
              ))}
           </div>
        </div>

        {/* Lista de Buffers */}
        {state.animations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 px-2">Secuencias Forjadas</h3>
            <div className="space-y-2">
               {state.animations.map(anim => (
                 <button 
                   key={anim.id} 
                   onClick={() => setSelectedAnimId(anim.id)}
                   className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all
                     ${selectedAnimId === anim.id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-white/[0.02] border-white/5 text-slate-600'}`}
                 >
                    <span className="text-[9px] font-black uppercase tracking-widest">{anim.action}</span>
                    <span className="text-[7px] font-mono">{anim.fps}fps</span>
                 </button>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
