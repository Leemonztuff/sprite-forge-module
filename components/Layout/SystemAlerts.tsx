
import React from 'react';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { useForgeStore } from '../../store/forgeStore';

interface SystemAlertsProps {
  error: string | null;
  onClearError: () => void;
  isSettingsPage: boolean;
  onOpenKeySelector?: () => void;
}

export const SystemAlerts: React.FC<SystemAlertsProps> = ({ error, onClearError, isSettingsPage, onOpenKeySelector }) => {
  const store = useForgeStore();
  const isQuotaError = error?.includes('LLAVE_AGOTADA') || error?.includes('Límite');
  const hasBase = !!store.baseImage;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] pointer-events-none">
      {error && (
        <div className="pointer-events-auto bg-rose-500/10 border-b border-rose-500/20 px-4 py-3 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest truncate max-w-[200px] sm:max-w-none">
              SISTEMA: {error}
            </span>
            {isQuotaError && onOpenKeySelector && (
              <button 
                onClick={onOpenKeySelector}
                className="ml-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[7px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
              >
                Cambiar Key
              </button>
            )}
          </div>
          <button onClick={onClearError} className="text-rose-500/50 hover:text-rose-500 font-black text-[12px] p-2">&times;</button>
        </div>
      )}

      {!error && !isSettingsPage && (
        <div className={`pointer-events-auto transition-all duration-500 border-b px-4 py-1.5 flex items-center justify-center gap-3 ${hasBase ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${hasBase ? 'bg-indigo-500' : 'bg-amber-500'}`} />
          <span className={`text-[7px] font-black uppercase tracking-widest ${hasBase ? 'text-indigo-400' : 'text-amber-500'}`}>
            {hasBase 
              ? 'FASE_2: Personaje base cargado. Escribe una directiva de atuendo para equiparlo.' 
              : 'FASE_1: Inicia con "Genesis IA" para crear tu maniquí base.'}
          </span>
          {!isSupabaseConfigured && (
            <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest opacity-40 ml-4 hidden sm:inline">
              [Modo_Volátil]
            </span>
          )}
        </div>
      )}
    </div>
  );
};
