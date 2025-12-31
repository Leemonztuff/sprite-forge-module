
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { GeneratedOutfit } from '../types';

interface TreeNodeProps {
  outfit: GeneratedOutfit;
  onSelect: (o: GeneratedOutfit) => void;
  isActive: boolean;
  isAncestor?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ outfit, onSelect, isActive, isAncestor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      id={`node-${outfit.id}`}
      onClick={() => onSelect(outfit)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative shrink-0 w-32 h-32 sm:w-44 sm:h-44 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center ${
        isActive 
        ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.4)] z-20 scale-110' 
        : isAncestor
        ? 'border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)] z-15'
        : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] z-10'
      }`}
    >
      {/* Node Metadata (Gene-Bar) */}
      <div className="absolute top-4 inset-x-4 flex justify-between items-center px-1 pointer-events-none">
        <div className="flex flex-col gap-0.5">
          <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Mutation</span>
          <div className="flex gap-0.5">
             {Array.from({length: 5}).map((_, i) => (
               <div key={i} className={`w-1 h-1 rounded-full ${i < ((outfit.mutationStrength || 50)/20) ? 'bg-indigo-500' : 'bg-slate-800'}`} />
             ))}
          </div>
        </div>
        <span className="text-[6px] font-mono text-slate-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
          S-{outfit.evolutionStep}
        </span>
      </div>

      {/* Actual Sprite */}
      <div className="relative w-full h-full p-8 sm:p-10 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-[2rem] transition-opacity duration-500 ${isActive ? 'opacity-10' : 'opacity-[0.02]'} checker-bg pointer-events-none`} />
        <img 
          src={outfit.url} 
          className={`w-full h-full object-contain relative z-10 transition-all duration-700 ${isActive ? 'scale-110 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'group-hover:scale-105'}`} 
          style={{ imageRendering: 'pixelated' }}
          alt="Gen"
        />
      </div>

      {/* Floating Prompt Preview */}
      {isHovered && !isActive && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl z-50 pointer-events-none shadow-3xl animate-in fade-in zoom-in-95">
          <p className="text-[7px] font-mono text-slate-300 leading-tight line-clamp-2 uppercase">"{outfit.prompt}"</p>
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute -bottom-2 px-3 py-1 bg-black border border-white/10 rounded-full shadow-2xl z-30">
        <span className={`text-[6px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
          {isActive ? 'ACTIVE_SPECIMEN' : `V_${outfit.id.slice(0,4)}`}
        </span>
      </div>

      {/* Glow Effects */}
      {isActive && (
        <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
      )}
    </div>
  );
};

interface EvolutionTreeProps {
  outfits: GeneratedOutfit[];
  baseImage: string | null;
  activeId?: string;
  onSelect: (o: GeneratedOutfit) => void;
}

export const EvolutionTree: React.FC<EvolutionTreeProps> = ({ outfits, baseImage, activeId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<{ x1: number; y1: number; x2: number; y2: number; id: string; isActive: boolean }[]>([]);

  // Find ancestors of the active node for path highlighting
  const activeAncestors = useMemo(() => {
    const ancestors = new Set<string>();
    let currentId = activeId;
    while (currentId) {
      const outfit = outfits.find(o => o.id === currentId);
      if (outfit?.parentId) {
        ancestors.add(outfit.parentId);
        currentId = outfit.parentId;
      } else {
        currentId = undefined;
      }
    }
    return ancestors;
  }, [activeId, outfits]);

  const levels = useMemo(() => {
    const map = new Map<number, GeneratedOutfit[]>();
    outfits.forEach(o => {
      const step = o.evolutionStep || 1;
      const current = map.get(step) || [];
      current.push(o);
      map.set(step, current);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [outfits]);

  useEffect(() => {
    const updateConnections = () => {
      if (!containerRef.current) return;
      const newConnections: any[] = [];
      const containerRect = containerRef.current.getBoundingClientRect();
      const scrollL = containerRef.current.scrollLeft;
      const scrollT = containerRef.current.scrollTop;

      const getPos = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - containerRect.left + scrollL,
          y: r.top + r.height / 2 - containerRect.top + scrollT
        };
      };

      // Root to level 1
      const rootEl = document.getElementById('node-root');
      if (rootEl) {
        const rootPos = getPos(rootEl);
        outfits.filter(o => !o.parentId || o.evolutionStep === 1).forEach(child => {
          const childEl = document.getElementById(`node-${child.id}`);
          if (childEl) {
            const childPos = getPos(childEl);
            newConnections.push({
              x1: rootPos.x, y1: rootPos.y + 80, 
              x2: childPos.x, y2: childPos.y - 80, 
              id: `root-${child.id}`,
              isActive: activeAncestors.has(child.id) || activeId === child.id
            });
          }
        });
      }

      // Parent to child
      outfits.forEach(child => {
        if (!child.parentId) return;
        const parentEl = document.getElementById(`node-${child.parentId}`);
        const childEl = document.getElementById(`node-${child.id}`);
        if (parentEl && childEl) {
          const pPos = getPos(parentEl);
          const cPos = getPos(childEl);
          newConnections.push({
            x1: pPos.x, y1: pPos.y + 80,
            x2: cPos.x, y2: cPos.y - 80,
            id: `${child.parentId}-${child.id}`,
            isActive: (activeAncestors.has(child.id) || activeId === child.id) && (activeAncestors.has(child.parentId) || activeId === child.parentId)
          });
        }
      });

      setConnections(newConnections);
    };

    updateConnections();
    const observer = new ResizeObserver(updateConnections);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateConnections);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateConnections);
    };
  }, [outfits, levels, activeId, activeAncestors]);

  if (!baseImage) {
    return (
      <div className="h-full w-full bg-[#050505] flex flex-col items-center justify-center p-12 text-center space-y-8">
        <div className="w-24 h-24 bg-indigo-600/5 rounded-full flex items-center justify-center text-indigo-500 animate-pulse border border-indigo-500/10">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-[0.5em] text-white/40">DNA Vault Locked</h3>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest max-w-xs leading-relaxed">No genetic history detected. Initialize character genesis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#020202] flex flex-col overflow-hidden relative">
      {/* HUD HEADER */}
      <header className="shrink-0 z-50 px-10 py-10 border-b border-white/5 bg-black/40 backdrop-blur-3xl flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-[14px] font-black uppercase tracking-[0.8em] text-white">Lineage_Explorer.exe</h2>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,1)]" />
              Genetic Stream Live
            </span>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Branches: {outfits.length}</span>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] border border-white/5 px-5 py-2.5 rounded-full bg-white/[0.01]">
              Engine: Pro_2.5_Mapping
           </div>
        </div>
      </header>

      {/* CANVAS AREA */}
      <div ref={containerRef} className="flex-1 overflow-auto relative p-20 scroll-smooth no-scrollbar select-none">
        
        {/* SVG NEURAL PATHWAYS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
            </marker>
          </defs>
          {connections.map(conn => (
            <g key={conn.id}>
              {/* Active Path Glow */}
              {conn.isActive && (
                <path 
                  d={`M ${conn.x1} ${conn.y1} C ${conn.x1} ${conn.y1 + 100}, ${conn.x2} ${conn.y2 - 100}, ${conn.x2} ${conn.y2}`}
                  stroke="rgba(99, 102, 241, 0.3)"
                  strokeWidth="8"
                  fill="none"
                  className="animate-pulse"
                />
              )}
              {/* Base Line */}
              <path 
                d={`M ${conn.x1} ${conn.y1} C ${conn.x1} ${conn.y1 + 100}, ${conn.x2} ${conn.y2 - 100}, ${conn.x2} ${conn.y2}`}
                stroke={conn.isActive ? "#6366f1" : "rgba(255, 255, 255, 0.05)"}
                strokeWidth={conn.isActive ? "3" : "1.5"}
                fill="none"
                strokeDasharray={conn.isActive ? "" : "6 4"}
                className="transition-all duration-700"
              />
            </g>
          ))}
        </svg>

        {/* TREE CONTENT */}
        <div className="relative z-20 flex flex-col items-center gap-40 pb-64">
          
          {/* ROOT DNA SPECIMEN */}
          <div id="node-root" className="relative group flex flex-col items-center">
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-indigo-500/20 bg-indigo-500/[0.03] p-12 relative transition-all duration-1000 hover:border-indigo-500/40 hover:bg-indigo-500/[0.08] hover:scale-105">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full opacity-30 group-hover:opacity-60 transition-opacity" />
              <img 
                src={baseImage} 
                className="w-full h-full object-contain relative z-10 grayscale group-hover:grayscale-0 group-hover:opacity-100 opacity-60 transition-all duration-1000 scale-125 pixelated" 
                alt="Original DNA" 
              />
              {/* Genetic Pulse Ring */}
              <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-ping opacity-20" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
              <span className="text-[12px] font-black text-white uppercase tracking-[1em]">ROOT_DNA</span>
              <div className="flex gap-2">
                 <div className="w-2 h-0.5 bg-indigo-500" />
                 <div className="w-8 h-0.5 bg-indigo-500" />
                 <div className="w-2 h-0.5 bg-indigo-500" />
              </div>
            </div>
          </div>

          {/* EVOLUTIONARY BRANCHES */}
          {levels.map(([step, nodes]) => (
            <div key={step} className="flex flex-col items-center gap-12 w-full reveal-view">
              <div className="flex gap-20 sm:gap-32 justify-center flex-wrap px-8">
                {nodes.map(node => (
                  <TreeNode 
                    key={node.id} 
                    outfit={node} 
                    onSelect={onSelect} 
                    isActive={activeId === node.id} 
                    isAncestor={activeAncestors.has(node.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* ARCHIVE FOOTER */}
          <div className="mt-20 flex flex-col items-center opacity-10">
            <div className="w-px h-32 bg-gradient-to-b from-indigo-500 to-transparent" />
            <span className="text-[10px] font-black uppercase tracking-[1.5em] mt-10">End of Genetic Chain</span>
          </div>
        </div>
      </div>

      {/* SIDE HUD HUD DETAILS */}
      <div className="absolute bottom-12 left-12 pointer-events-none z-50 hidden md:flex flex-col gap-3">
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-lg border border-white/5 p-4 rounded-2xl shadow-2xl">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Visual Logic</span>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Directed Acyclic Graph</span>
           </div>
        </div>
      </div>
    </div>
  );
};
