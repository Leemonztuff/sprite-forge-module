
import React from 'react';
import { AppState, ForgeMode } from '../../types';
import { IconButton, ParameterBox } from '../UI';
import { GIcon, Icons } from '../Icons';

interface NeuralMatrixProps {
  config: AppState['config'];
  onToggleNode: (id: string) => void;
  onUpdateMutation: (v: number) => void;
  onSetMode: (m: ForgeMode) => void;
  onExtractBase: () => void;
  onClose: () => void;
}

export const NeuralMatrix: React.FC<NeuralMatrixProps> = ({ 
  config, onToggleNode, onUpdateMutation, onSetMode, onExtractBase, onClose 
}) => {
  return (
    <>
      <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 bg-[#0d0d0d] border-t border-white/10 p-8 pt-4 pb-24 z-[3100] animate-in slide-in-from-bottom duration-300 rounded-t-[3rem] shadow-2xl max-h-[85dvh] overflow-y-auto no-scrollbar">
         <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
         <div className="flex justify-between items-center mb-8 px-2">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Neural_Matrix</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Ajuste de parámetros del motor</span>
            </div>
            <IconButton onClick={onClose} className="w-12 h-12 bg-white/5">
              <GIcon d={Icons.Grid} size={20} />
            </IconButton>
         </div>
         
         <div className="grid grid-cols-2 gap-3 mb-8">
            {config.neuralChain.map((node) => (
               <button 
                key={node.id} 
                onClick={() => onToggleNode(node.id)} 
                className={`p-6 rounded-3xl border flex flex-col items-center justify-center gap-4 transition-all active:scale-95 ${node.isActive ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 shadow-lg' : 'bg-black border-white/5 text-slate-700'}`}
               >
                  <div className="scale-110">{node.icon}</div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{node.label}</span>
               </button>
            ))}
         </div>
         
         <div className="space-y-6 px-2">
           <ParameterBox 
             label="Mutación" 
             description="Intensidad de desviación del diseño base."
             value={config.mutationStrength} 
             icon={Icons.Dna}
             onChange={onUpdateMutation} 
           />
           
           <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={() => onSetMode(config.mode === 'Orthographic' ? 'Master' : 'Orthographic')} className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${config.mode === 'Orthographic' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                 Orthographic
              </button>
              <button onClick={onExtractBase} className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                 Extraer DNA
              </button>
           </div>
         </div>
      </div>
    </>
  );
};
