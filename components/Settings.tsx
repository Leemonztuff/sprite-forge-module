
import React from 'react';
import { GIcon, Icons } from './Icons';
import { BillingMode } from '../types';
import { useForgeStore } from '../store/forgeStore';

interface SettingsProps {
  isApiKeyInvalid: boolean;
  onOpenKeySelector: () => void;
  hasBridge: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ onOpenKeySelector, hasBridge }) => {
  const store = useForgeStore();
  const { billingMode } = store.config;

  const handleModeToggle = (mode: BillingMode) => {
    store.updateConfig({ 
      billingMode: mode,
      model: mode === 'ultra' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image'
    });
  };

  return (
    <div className="h-full w-full bg-[#050505] tech-grid p-6 sm:p-10 overflow-y-auto no-scrollbar flex flex-col gap-10">
      <div className="space-y-4 pt-10">
        <h2 className="text-[14px] font-black uppercase tracking-[0.6em] text-white">Neural_Command_Center</h2>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-4">Gestión de Motor y Despliegue de IA</p>
      </div>

      <div className="grid grid-cols-1 gap-8 pb-32">
        {/* Engine Selection */}
        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black text-white uppercase tracking-widest block">Neural Engine Selector</span>
             <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[7px] font-mono text-emerald-500">SYSTEM_READY</span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button 
              onClick={() => handleModeToggle('standard')}
              className={`group p-8 rounded-[2rem] border flex flex-col items-center gap-4 transition-all ${billingMode === 'standard' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-black border-white/5 text-slate-700'}`}
             >
                <GIcon d={Icons.Forge} size={28} className={billingMode === 'standard' ? 'animate-pulse' : ''} />
                <div className="text-center">
                  <span className="block text-[11px] font-black uppercase tracking-widest">Standard Engine</span>
                  <span className="block text-[7px] font-bold opacity-40 uppercase mt-1">Gratis / Flash-Image</span>
                </div>
             </button>

             <button 
              onClick={() => handleModeToggle('ultra')}
              className={`group p-8 rounded-[2rem] border flex flex-col items-center gap-4 transition-all ${billingMode === 'ultra' ? 'bg-amber-600/10 border-amber-500 text-amber-400' : 'bg-black border-white/5 text-slate-700'}`}
             >
                <GIcon d={Icons.Crystal} size={28} className={billingMode === 'ultra' ? 'animate-bounce' : ''} />
                <div className="text-center">
                  <span className="block text-[11px] font-black uppercase tracking-widest">Ultra Engine</span>
                  <span className="block text-[7px] font-bold opacity-40 uppercase mt-1">Pago / Pro-Image</span>
                </div>
             </button>
          </div>
        </div>

        {/* Credentials Status */}
        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Estado del Vínculo</span>
            <span className={`text-[8px] font-mono px-3 py-1 rounded-full border ${hasBridge ? 'border-emerald-500/20 text-emerald-500' : 'border-amber-500/20 text-amber-500'}`}>
              {hasBridge ? 'BRIDGE_LINKED' : 'LOCAL_STANDALONE'}
            </span>
          </div>
          
          <p className="text-[9px] font-mono text-slate-500 uppercase leading-relaxed max-w-md">
            El sistema detecta automáticamente si estás usando el puente de Google AI Studio. En modo local, usaremos la infraestructura redundante del servidor para asegurar que tu forja nunca se detenga.
          </p>

          <button 
            onClick={onOpenKeySelector}
            className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            <GIcon d={Icons.Refresh} size={18} />
            Sincronizar Credenciales Pro
          </button>
        </div>
      </div>
    </div>
  );
};
