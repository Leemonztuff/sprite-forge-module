
import React from 'react';
import { GIcon, Icons } from '../Icons';

interface FrameProps {
  children: React.ReactNode;
  activeTab: string;
  isGenerating: boolean;
  isZenMode: boolean;
  onTabChange: (tab: any) => void;
}

export const Frame: React.FC<FrameProps> = ({ children, activeTab, isGenerating, isZenMode, onTabChange }) => {
  return (
    <div className="h-full w-full bg-[#050505] flex flex-col overflow-hidden selection:bg-indigo-500/30">
      {/* Dynamic Header */}
      <header className={`h-12 sm:h-14 shrink-0 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-black/40 backdrop-blur-2xl z-50 transition-transform duration-500 ${isZenMode ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-indigo-600 rounded-md flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <GIcon d={Icons.Forge} size={14} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] leading-none text-white">SpriteForge</h1>
            <span className="text-[5px] sm:text-[6px] font-mono-tech text-indigo-400 mt-0.5 uppercase tracking-widest">CLEAN_CORE_v5</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className={`px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[7px] font-black uppercase tracking-widest ${isGenerating ? 'text-indigo-400' : 'text-slate-600'}`}>
             {isGenerating ? 'Synthesizing...' : 'Core_Ready'}
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>

      {/* Navigation Shell - Optimized for more items */}
      <nav className={`h-16 sm:h-20 shrink-0 border-t border-white/5 bg-black flex items-center justify-around px-2 sm:px-4 safe-area-inset-bottom z-50 transition-transform duration-500 ${isZenMode ? 'translate-y-full' : 'translate-y-0'}`}>
        <NavButton active={activeTab === 'forge'} label="Forja" icon={Icons.Forge} onClick={() => onTabChange('forge')} />
        <NavButton active={activeTab === 'morph'} label="Anatomía" icon={Icons.Alchemy} onClick={() => onTabChange('morph')} />
        <NavButton active={activeTab === 'rigging'} label="Rigging" icon={Icons.Circuitry} onClick={() => onTabChange('rigging')} />
        <NavButton active={activeTab === 'animation'} label="Motion" icon={Icons.Refresh} onClick={() => onTabChange('animation')} />
        <NavButton active={activeTab === 'evolution'} label="Genética" icon={Icons.Dna} onClick={() => onTabChange('evolution')} />
        <NavButton active={activeTab === 'tree'} label="Linaje" icon={Icons.Tree} onClick={() => onTabChange('tree')} />
        <NavButton active={activeTab === 'settings'} label="Core" icon={Icons.Settings} onClick={() => onTabChange('settings')} />
      </nav>
    </div>
  );
};

const NavButton = ({ active, label, icon, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 px-1 sm:px-4 transition-all duration-300 ${active ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}>
    <div className={`p-1.5 sm:p-2 rounded-xl transition-all ${active ? 'bg-indigo-600/10 neon-shadow' : 'bg-transparent'}`}>
      <GIcon d={icon} size={18} />
    </div>
    <span className={`text-[6px] sm:text-[8px] font-black uppercase tracking-[0.15em] transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);
