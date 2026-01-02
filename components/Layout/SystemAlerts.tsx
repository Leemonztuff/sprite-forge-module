
import React from 'react';
import { useForgeStore } from '../../store/forgeStore';

interface SystemAlertsProps {
  error: string | null;
  onClearError: () => void;
  isSettingsPage: boolean;
}

export const SystemAlerts: React.FC<SystemAlertsProps> = ({ error, onClearError, isSettingsPage }) => {
  const store = useForgeStore();
  const hasBase = !!store.baseImage;
  
  const handleFixKey = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
      try {
        await (window as any).aistudio.openSelectKey();
        onClearError(); // Limpiamos el error inmediatamente para permitir el reintento
      } catch (e) {
        console.error("No se pudo abrir el selector de llaves", e);
      }
    }
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[9000] pointer-events-none">
      {error && (
        <div className="pointer-events-auto bg-black/95 backdrop-blur-2xl border-b border-rose-500/30 px-6 py-5 flex items-center justify-between gap-6 animate-in slide-in-from-top duration-500 shadow-2xl">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-3 h-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_15px_currentColor]`} />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                SISTEMA_ALERTA
              </span>
              <span className="text-[9px] font-mono text-slate-400 truncate opacity-80">
                {error}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={handleFixKey}
              className="px-5 py-2.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Vincular API Key
            </button>
            <button onClick={onClearError} className="text-white/40 hover:text-white font-black text-[20px] p-2">&times;</button>
          </div>
        </div>
      )}

      {!error && !isSettingsPage && (
        <div className={`pointer-events-auto transition-all duration-700 border-b px-6 py-2.5 flex items-center justify-center gap-4 ${hasBase ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${hasBase ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${hasBase ? 'text-indigo-400' : 'text-emerald-500'}`}>
            {hasBase 
              ? 'CORE_ENGINE: ANALYTICS_READY' 
              : 'DIRECTIVE: INITIALIZE_GENESIS'}
          </span>
        </div>
      )}
    </div>
  );
};
