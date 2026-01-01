
import React from 'react';
import { GIcon, Icons } from './Icons';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { BillingMode } from '../types';
import { useForgeStore } from '../store/forgeStore';

interface SettingsProps {
  isApiKeyInvalid: boolean;
  onOpenKeySelector: () => void;
  hasBridge: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ isApiKeyInvalid, onOpenKeySelector, hasBridge }) => {
  const store = useForgeStore();
  const { billingMode } = store.config;
  const apiKeyLabel = process.env.API_KEY ? `****${process.env.API_KEY.slice(-4)}` : 'SISTEMA_BASE';

  const handleModeToggle = (mode: BillingMode) => {
    store.updateConfig({ 
      billingMode: mode,
      model: mode === 'ultra' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image'
    });
    if (mode === 'ultra' && isApiKeyInvalid) {
      onOpenKeySelector();
    }
  };

  return (
    <div className="h-full w-full bg-[#050505] tech-grid p-6 sm:p-10 overflow-y-auto no-scrollbar flex flex-col gap-10">
      <div className="space-y-4 pt-10">
        <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-white">Neural_Command_Center</h2>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-4">Gestión de Motor y Rotación de Credenciales</p>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-20">
        {/* Engine Level Selector */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Engine Selection</span>
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Define el nivel de inteligencia artificial</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <button 
              onClick={() => handleModeToggle('standard')}
              className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${billingMode === 'standard' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-black border-white/5 text-slate-600'}`}
             >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <GIcon d={Icons.Forge} size={20} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest">Standard</span>
                  <span className="text-[6px] font-bold uppercase opacity-60">Gratis / Flash</span>
                </div>
             </button>

             <button 
              onClick={() => handleModeToggle('ultra')}
              className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${billingMode === 'ultra' ? 'bg-amber-600/10 border-amber-500 text-amber-400' : 'bg-black border-white/5 text-slate-600'}`}
             >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <GIcon d={Icons.Crystal} size={20} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest">Ultra</span>
                  <span className="text-[6px] font-bold uppercase opacity-60">Pago / Pro 3</span>
                </div>
             </button>
          </div>
        </div>

        {/* API Gateway Status & Key Rotation */}
        <div className={`bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden group transition-all ${billingMode === 'standard' ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
             <GIcon d={Icons.Lock} size={120} />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${!hasBridge ? 'bg-rose-600/10 text-rose-400 border-rose-500/20' : isApiKeyInvalid ? 'bg-amber-600/10 text-amber-400 border-amber-500/20' : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'}`}>
                <GIcon d={Icons.Lock} size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase tracking-widest text-white">Ultra Gateway</span>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${!hasBridge ? 'text-rose-500' : isApiKeyInvalid ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {!hasBridge ? 'BRIDGE_DISCONNECTED' : isApiKeyInvalid ? 'KEY_REQUIRED_OR_EXHAUSTED' : 'CORE_LINK_STABLE'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4 relative z-10">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ID de Llave Actual</span>
              <span className="text-[8px] font-mono text-emerald-500 uppercase">{apiKeyLabel}</span>
            </div>
            <p className="text-[7px] font-mono text-slate-500 uppercase leading-relaxed">
              Si tu cuota se ha agotado o la llave no responde, pulsa el botón inferior para seleccionar un nuevo proyecto de Google Cloud.
            </p>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            <button 
              onClick={onOpenKeySelector}
              className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition-all"
            >
              {isApiKeyInvalid ? 'Vincular API Key' : 'Rotar / Cambiar API Key'}
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white/5 text-slate-500 rounded-[1.2rem] text-[8px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5"
            >
              Forzar Reseteo de Conexión
            </button>
          </div>
          
          <div className="flex justify-center pt-2">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              className="text-[7px] font-bold text-slate-600 uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors"
            >
              Obtener nueva Key en AI Studio
            </a>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl opacity-60">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <GIcon d={Icons.Tree} size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black uppercase tracking-widest text-white">Supabase Cloud Vault</span>
              <span className={`text-[8px] font-bold uppercase tracking-widest ${isSupabaseConfigured ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isSupabaseConfigured ? 'Sync_Active' : 'Offline_Archive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
