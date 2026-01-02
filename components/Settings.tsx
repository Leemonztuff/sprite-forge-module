
import React from 'react';
import { GIcon, Icons } from './Icons';
import { useForgeStore } from '../store/forgeStore';

export const Settings: React.FC = () => {
  const store = useForgeStore();

  return (
    <div className="h-full w-full bg-[#050505] tech-grid p-6 sm:p-10 overflow-y-auto no-scrollbar flex flex-col gap-10">
      <div className="space-y-4 pt-10">
        <h2 className="text-[14px] font-black uppercase tracking-[0.6em] text-white">SISTEMA_CORE_V5</h2>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-4">Diagnóstico Operativo</p>
      </div>

      <div className="grid grid-cols-1 gap-8 pb-32">
        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black text-white uppercase tracking-widest block">Neural Engine Status</span>
             <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <span className="text-[8px] font-mono text-emerald-500">OPERATIVO</span>
             </div>
          </div>
          
          <div className="p-8 rounded-[2rem] border border-indigo-500/20 bg-indigo-600/5 flex items-center gap-6">
             <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
                <GIcon d={Icons.Crystal} size={32} className="text-indigo-400" />
             </div>
             <div className="flex flex-col">
                <span className="text-[11px] font-black text-white uppercase tracking-widest">FLASH_ENGINE_v3</span>
                <span className="text-[7px] font-bold text-slate-600 uppercase mt-1">Sincronizado con Vercel ENV</span>
             </div>
          </div>

          <div className="space-y-4">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Módulos Activos</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SpecItem label="Mannequin_Gen" value="gemini-2.5-flash-image" />
              <SpecItem label="Outfit_Forge" value="gemini-2.5-flash-image" />
              <SpecItem label="Identity_Lock" value="Neural_Mask_Projector" />
              <SpecItem label="Transparency" value="Alpha_Purifier_v1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecItem = ({ label, value }: { label: string; value: string }) => (
  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
    <span className="text-[7px] font-bold text-slate-500 uppercase">{label}</span>
    <span className="text-[7px] font-mono text-indigo-400">{value}</span>
  </div>
);
