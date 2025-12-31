
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
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Gestión de identidad y sincronización</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <GIcon d={Icons.Lock} size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Gemini API Gateway</span>
              <span className={`text-[7px] font-bold uppercase tracking-widest ${isApiKeyInvalid ? 'text-rose-500' : 'text-emerald-500'}`}>
                {isApiKeyInvalid ? 'Status: Key Missing' : 'Status: Connected'}
              </span>
            </div>
          </div>
          <p className="text-[8px] font-mono text-slate-600 uppercase leading-relaxed">
            El motor de síntesis requiere una API Key válida de Google AI Studio. Si has alcanzado el límite de cuota (429), puedes cambiar a una nueva llave aquí.
          </p>
          <button 
            onClick={onOpenKeySelector}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
          >
            Cambiar / Seleccionar API Key
          </button>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <GIcon d={Icons.Tree} size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Supabase Cloud Sync</span>
              <span className={`text-[7px] font-bold uppercase tracking-widest ${isSupabaseConfigured ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isSupabaseConfigured ? 'Status: Synced' : 'Status: Local Mode'}
              </span>
            </div>
          </div>
          <p className="text-[8px] font-mono text-slate-600 uppercase leading-relaxed">
            Almacenamiento persistente de linajes y arqueotipos. {isSupabaseConfigured ? 'Tus datos están seguros en la nube.' : 'Configura las variables de entorno para activar el guardado permanente.'}
          </p>
        </div>
      </div>
    </div>
  );
};
