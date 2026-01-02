
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

  return (
    <div className="fixed top-0 inset-x-0 z-[100] pointer-events-none">
      {error && (
        <div className="pointer-events-auto bg-black/90 backdrop-blur-xl border-b border-rose-500/30 px-6 py-4 flex items-center justify-between gap-6 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest truncate max-w-[280px] sm:max-w-none">
              SYSTEM_FAULT: {error}
            </span>
          </div>
          <button onClick={onClearError} className="text-white/40 hover:text-white font-black text-[18px] p-2 transition-colors">&times;</button>
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
