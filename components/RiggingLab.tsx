
import React, { useRef, useState, useMemo } from 'react';
import { AppState, Joint } from '../types';
import { GIcon, Icons } from './Icons';

interface RiggingLabProps {
  state: AppState;
  onUpdateJoint: (joint: Joint) => void;
  onExecuteAnalysis: () => void;
  onClose: () => void;
}

// Definición de la jerarquía esquelética para dibujar los "huesos"
const SKELETON_CONNECTIONS = [
  ['head', 'neck'],
  ['neck', 'l_shoulder'],
  ['neck', 'r_shoulder'],
  ['neck', 'pelvis'],
  ['l_shoulder', 'l_elbow'],
  ['l_elbow', 'l_wrist'],
  ['r_shoulder', 'r_elbow'],
  ['r_elbow', 'r_wrist'],
  ['pelvis', 'l_hip'],
  ['pelvis', 'r_hip'],
  ['l_hip', 'l_knee'],
  ['l_knee', 'l_ankle'],
  ['r_hip', 'r_knee'],
  ['r_knee', 'r_ankle']
];

export const RiggingLab: React.FC<RiggingLabProps> = ({ state, onUpdateJoint, onExecuteAnalysis, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedJointId, setSelectedJointId] = useState<string | null>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!selectedJointId || !containerRef.current || !state.rigging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    const joint = state.rigging.joints.find(j => j.id === selectedJointId);
    if (joint) {
      onUpdateJoint({ ...joint, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }
  };

  const handleExportJson = () => {
    if (!state.rigging) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.rigging, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "sprite_rigging.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const bones = useMemo(() => {
    if (!state.rigging) return [];
    return SKELETON_CONNECTIONS.map(([parent, child]) => {
      const p = state.rigging?.joints.find(j => j.id === parent);
      const c = state.rigging?.joints.find(j => j.id === child);
      if (p && c) return { id: `${parent}-${child}`, x1: p.x, y1: p.y, x2: c.x, y2: c.y };
      return null;
    }).filter(Boolean);
  }, [state.rigging]);

  const currentSprite = state.pendingOutfit?.url || state.activeParent?.url || state.baseImage;

  return (
    <div className="absolute inset-0 z-[600] bg-black/95 backdrop-blur-3xl p-6 sm:p-10 flex flex-col gap-8 animate-in fade-in duration-500 overflow-y-auto pb-32">
      <div className="flex justify-between items-center shrink-0 border-b border-white/5 pb-6 sticky top-0 bg-black/60 backdrop-blur-md z-[70]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <GIcon d={Icons.Circuitry} size={20} className="text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Auto_Rigging_Lab</h2>
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Skeletal_Structure_Extraction</span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 min-h-full">
        {/* Visualizer Canvas */}
        <div 
          ref={containerRef}
          onMouseMove={handleDrag}
          onTouchMove={handleDrag}
          onMouseUp={() => setSelectedJointId(null)}
          onTouchEnd={() => setSelectedJointId(null)}
          className="w-full lg:flex-1 min-h-[400px] sm:min-h-[600px] bg-[#050505] rounded-[2.5rem] border border-white/5 relative flex items-center justify-center overflow-hidden tech-grid select-none shrink-0"
        >
          <img src={currentSprite!} className="max-h-[80%] max-w-[80%] object-contain pixelated pointer-events-none opacity-60 scale-125" alt="Rigging Target" />
          
          {/* Skeleton Line Layer */}
          {state.rigging && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-[75]" viewBox="0 0 100 100" preserveAspectRatio="none">
              {bones.map(bone => (
                <line 
                  key={bone!.id} 
                  x1={bone!.x1} y1={bone!.y1} x2={bone!.x2} y2={bone!.y2} 
                  stroke="rgba(99, 102, 241, 0.4)" 
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          )}

          {/* Joint Overlays */}
          {state.rigging?.joints.map(joint => (
            <div 
              key={joint.id}
              onMouseDown={(e) => { e.stopPropagation(); setSelectedJointId(joint.id); }}
              onTouchStart={(e) => { e.stopPropagation(); setSelectedJointId(joint.id); }}
              style={{ left: `${joint.x}%`, top: `${joint.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all cursor-move z-[80] flex items-center justify-center
                ${selectedJointId === joint.id ? 'bg-indigo-500 border-white scale-125 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-black border-indigo-500 hover:scale-110'}`}
            >
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 rounded-md border border-white/10 text-[6px] font-black text-white uppercase tracking-widest whitespace-nowrap pointer-events-none">
                {joint.label}
              </div>
            </div>
          ))}

          {!state.rigging && !state.isGenerating && (
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-sm z-40">
                <div className="w-16 h-16 rounded-full border border-indigo-500/20 flex items-center justify-center animate-pulse">
                   <GIcon d={Icons.Circuitry} size={32} className="text-indigo-500/40" />
                </div>
                <button onClick={onExecuteAnalysis} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                   Analizar Estructura Ósea
                </button>
             </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6 pb-10">
           <div className="bg-[#121212] rounded-3xl border border-white/5 p-6 space-y-4">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Estado del Esqueleto</h3>
              <div className="space-y-2">
                 {state.rigging ? (
                   <div className="flex items-center gap-3 text-emerald-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Sincronizado ({state.rigging.joints.length} nodos)</span>
                   </div>
                 ) : (
                   <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-slate-800" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Esperando análisis...</span>
                   </div>
                 )}
              </div>
              <p className="text-[7px] font-mono text-slate-500 uppercase leading-relaxed">
                Arrastra los puntos azules para ajustar las articulaciones. Las líneas muestran la jerarquía de huesos actual.
              </p>
           </div>

           <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 px-1">Joint_List</h3>
              <div className="grid grid-cols-1 gap-2">
                 {state.rigging?.joints.map(j => (
                    <div key={j.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">{j.label}</span>
                       <span className="text-[7px] font-mono text-indigo-500 font-bold">[{j.x.toFixed(0)}, {j.y.toFixed(0)}]</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="mt-auto space-y-3 pt-6">
              <button 
                onClick={onExecuteAnalysis}
                disabled={state.isGenerating}
                className="w-full py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                 {state.isGenerating ? 'Analizando...' : 'Re-analizar'}
              </button>
              <button 
                onClick={handleExportJson}
                disabled={!state.rigging}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-30"
              >
                 Exportar Rigging JSON
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
