
import React from 'react';
import { MannequinParams, GenderType, BuildType } from '../../types';

interface GenesisModalProps {
  onGenerate: (params: MannequinParams) => void;
  onCancel: () => void;
}

export const GenesisModal: React.FC<GenesisModalProps> = ({ onGenerate, onCancel }) => {
  const [params, setParams] = React.useState<MannequinParams>({ gender: 'male', build: 'average' });

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#0d0d0d] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 space-y-8 shadow-2xl animate-in slide-in-from-bottom-10">
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto sm:hidden mb-4" />
        <div className="space-y-2">
          <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-400 text-center">Neural_Genesis</h3>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">Especificaciones del espécimen</p>
        </div>

        <div className="space-y-4">
          <span className="text-[9px] font-black uppercase text-slate-600 px-1 tracking-widest">Género</span>
          <div className="grid grid-cols-3 gap-3">
            {['male', 'female', 'neutral'].map(g => (
              <button key={g} onClick={() => setParams({...params, gender: g as GenderType})} className={`py-4 rounded-2xl border text-[9px] font-black uppercase transition-all ${params.gender === g ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/[0.02] border-white/5 text-slate-600'}`}>{g}</button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-[9px] font-black uppercase text-slate-600 px-1 tracking-widest">Complexión</span>
          <div className="grid grid-cols-2 gap-3">
            {['slim', 'average', 'muscular', 'small'].map(b => (
              <button key={b} onClick={() => setParams({...params, build: b as BuildType})} className={`py-4 rounded-2xl border text-[9px] font-black uppercase transition-all ${params.build === b ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/[0.02] border-white/5 text-slate-600'}`}>{b}</button>
            ))}
          </div>
        </div>

        <div className="pt-6 flex gap-4 pb-8 sm:pb-0">
          <button onClick={onCancel} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-600">Cancelar</button>
          <button onClick={() => onGenerate(params)} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all">Sintetizar Base</button>
        </div>
      </div>
    </div>
  );
};
