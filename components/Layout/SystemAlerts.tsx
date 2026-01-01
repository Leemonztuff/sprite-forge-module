
import React from 'react';
import { useForgeStore } from '../../store/forgeStore';

interface SystemAlertsProps {
  error: string | null;
  onClearError: () => void;
  isSettingsPage: boolean;
  onOpenKeySelector?: () => void;
}

export const SystemAlerts: React.FC<SystemAlertsProps> = ({ error, onClearError, isSettingsPage, onOpenKeySelector }) => {
  const store = useForgeStore();
  const hasBase = !!store.baseImage;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] pointer-events-none">
      {error && (
        <div className="pointer-events-auto bg-black/90 backdrop-blur-xl border-b border-rose-500/30 px-6 py-4 flex items-center justify-between gap-6 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest truncate max-w-[280px] sm:max-w-none">
              DIAGNOSTIC_ERR: {error}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {error.includes('CUOTA') && onOpenKeySelector && (
              <button 
                onClick={onOpenKeySelector}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
              >
                Rotar Engine
              </button>
            )}
            <button onClick={onClearError} className="text-white/40 hover:text-white font-black text-[18px] p-2 transition-colors">&times;</button>
          </div>
        </div>
      )}

      {!error && !isSettingsPage && (
        <div className={`pointer-events-auto transition-all duration-700 border-b px-6 py-2.5 flex items-center justify-center gap-4 ${hasBase ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-amber-500/5 border-amber-500/10'}`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${hasBase ? 'bg-indigo-500' : 'bg-amber-500'}`} />
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${hasBase ? 'text-indigo-400' : 'text-amber-500'}`}>
            {hasBase 
              ? 'SISTEMA: DNA cargado. Procede a la síntesis de atuendos.' 
              : 'DIRECTIVA: Inicia "Genesis IA" para generar tu maniquí técnico.'}
          </span>
        </div>
      )}
    </div>
  );
};
