
import React from 'react';
import { GIcon, Icons } from './Icons';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface SettingsProps {
  isApiKeyInvalid: boolean;
  onOpenKeySelector: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isApiKeyInvalid, onOpenKeySelector }) => {
  return (
    <div className="h-full w-full bg-[#050505] tech-grid p-8 overflow-y-auto no-scrollbar flex flex-col gap-10">
      <div className="space-y-4 pt-12">
        <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">System_Core</h2>
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Infraestructura y Seguridad</p>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-20">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isApiKeyInvalid ? 'bg-rose-600/10 text-rose-400 border-rose-500/20' : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'}`}>
              <GIcon d={Icons.Lock} size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Gemini API Gateway</span>
              <span className={`text-[7px] font-bold uppercase tracking-widest ${isApiKeyInvalid ? 'text-rose-500' : 'text-emerald-500'}`}>
                {isApiKeyInvalid ? 'STATUS: OFFLINE / UNAUTHORIZED' : 'STATUS: CORE_LINK_ACTIVE'}
              </span>
            </div>
          </div>
          
          <div className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-3">
            <p className="text-[8px] font-mono text-slate-500 uppercase leading-relaxed">
              El motor requiere una llave de pago para modelos de imagen (Gemini 2.5/3). Si tienes problemas, pulsa el botón inferior para re-autenticar tu sesión.
            </p>
            {process.env.API_KEY && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[7px] font-mono text-emerald-500/60 uppercase">System Key Detected: ****{process.env.API_KEY.slice(-4)}</span>
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onOpenKeySelector();
            }}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] cursor-pointer relative z-20"
          >
            Vincular Google AI Studio Key
          </button>
          
          <div className="flex justify-center flex-col items-center gap-2">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[7px] font-bold text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors"
            >
              Consultar Facturación de API
            </a>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl opacity-60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <GIcon d={Icons.Tree} size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Supabase Cloud Sync</span>
              <span className={`text-[7px] font-bold uppercase tracking-widest ${isSupabaseConfigured ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isSupabaseConfigured ? 'Status: Local + Cloud' : 'Status: Sandbox Mode'}
              </span>
            </div>
          </div>
          <p className="text-[8px] font-mono text-slate-600 uppercase leading-relaxed">
            Sincronización de activos entre dispositivos. El modo Sandbox guarda los datos solo en la memoria local del navegador.
          </p>
        </div>
      </div>
    </div>
  );
};
