
import React from 'react';
import { GIcon, Icons } from './Icons';
import { useForgeStore } from '../store/forgeStore';

export const Settings: React.FC = () => {
  const store = useForgeStore();

  return (
    <div className="h-full w-full bg-[#050505] tech-grid p-6 sm:p-10 overflow-y-auto no-scrollbar flex flex-col gap-10">
      <div className="space-y-4 pt-10">
        <h2 className="text-[14px] font-black uppercase tracking-[0.6em] text-white">NEURAL_DIAGNOSTICS</h2>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-4">Estado del Sistema y Motor de Síntesis</p>
      </div>

      <div className="grid grid-cols-1 gap-8 pb-32">
        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black text-white uppercase tracking-widest block">Active Neural Engine</span>
             <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-mono text-emerald-500">OPTIMIZED_FLASH_READY</span>
             </div>
          </div>
          
          <div className="p-8 rounded-[2rem] border border-indigo-500/20 bg-indigo-600/5 flex items-center gap-6">
             <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
                <GIcon d={Icons.Forge} size={32} className="text-indigo-400" />
             </div>
             <div className="flex flex-col">
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Standalone Mode</span>
                <span className="text-[7px] font-bold text-slate-600 uppercase mt-1">Sincronizado con API Key del Servidor</span>
             </div>
          </div>

          <p className="text-[9px] font-mono text-slate-500 uppercase leading-relaxed">
            SpriteForge está operando de manera autónoma. No se requiere intervención manual de credenciales mientras la cuota global del servidor sea válida.
          </p>
        </div>

        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-10 space-y-6 shadow-2xl">
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocolos Activos</span>
          <div className="grid grid-cols-2 gap-4">
            <ProtocolItem label="Transparency_Purge" status="ACTIVE" />
            <ProtocolItem label="Outline_Unification" status="ACTIVE" />
            <ProtocolItem label="Anatomical_Lock" status="ACTIVE" />
            <ProtocolItem label="Deterioration_Check" status="ACTIVE" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtocolItem = ({ label, status }: { label: string, status: string }) => (
  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col gap-1">
    <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-[8px] font-mono text-emerald-500">{status}</span>
  </div>
);
