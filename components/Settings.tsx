
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

export const Settings: React.FC<SettingsProps> = ({ onOpenKeySelector, hasBridge }) => {
  const store = useForgeStore();
  const { billingMode } = store.config;
  const apiKeyLabel = process.env.API_KEY ? `SISTEMA_STANDBY` : 'SIN_CLAVE';

  const handleModeToggle = (mode: BillingMode) => {
    store.updateConfig({ 
      billingMode: mode,
      model: mode === 'ultra' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image'
    });
  };

  return (
    <div className="h-full w-full bg-[#050505] tech-grid p-6 sm:p-10 overflow-y-auto no-scrollbar flex flex-col gap-10">
      <div className="space-y-4 pt-10">
        <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-white">Neural_Command_Center</h2>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-4">Gestión de Motor y Credenciales</p>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-20">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
          <span className="text-[10px] font-black text-white uppercase tracking-widest block">Selección de Motor</span>
          <div className="grid grid-cols-2 gap-4">
             <button 
              onClick={() => handleModeToggle('standard')}
              className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${billingMode === 'standard' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-black border-white/5 text-slate-600'}`}
             >
                <GIcon d={Icons.Forge} size={20} />
                <span className="text-[10px] font-black uppercase">Standard (Gratis)</span>
                <span className="text-[6px] font-bold uppercase opacity-50">API Pública Activa</span>
             </button>

             <button 
              onClick={() => handleModeToggle('ultra')}
              className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${billingMode === 'ultra' ? 'bg-amber-600/10 border-amber-500 text-amber-400' : 'bg-black border-white/5 text-slate-600'}`}
             >
                <GIcon d={Icons.Crystal} size={20} />
                <span className="text-[10px] font-black uppercase">Ultra (Pago)</span>
                <span className="text-[6px] font-bold uppercase opacity-50">Requiere Google Key</span>
             </button>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Estado de Conexión</span>
            <span className={`text-[8px] font-mono ${hasBridge ? 'text-emerald-500' : 'text-amber-500'}`}>
              {hasBridge ? 'PUENTE_ACTIVO' : 'MODO_SOLITARIO'}
            </span>
          </div>
          
          <p className="text-[8px] font-mono text-slate-500 uppercase leading-relaxed">
            {hasBridge 
              ? "Conectado al ecosistema Google AI Studio. Puedes rotar tus llaves pagas libremente."
              : "No se detecta el puente de AI Studio. El sistema usará la llave preconfigurada del servidor."}
          </p>

          <button 
            onClick={onOpenKeySelector}
            className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
          >
            Sincronizar nueva llave
          </button>
        </div>
      </div>
    </div>
  );
};
