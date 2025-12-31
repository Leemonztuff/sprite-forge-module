
import React from 'react';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface SystemAlertsProps {
  error: string | null;
  onClearError: () => void;
  isSettingsPage: boolean;
  onOpenKeySelector?: () => void;
}

export const SystemAlerts: React.FC<SystemAlertsProps> = ({ error, onClearError, isSettingsPage, onOpenKeySelector }) => {
  const isQuotaError = error?.includes('Límite');

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

      {!isSupabaseConfigured && !error && !isSettingsPage && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">
            MODO LOCAL: Los assets se perderán al refrescar (Supabase no detectado).
          </span>
        </div>
      )}
    </div>
  );
};
