
import React, { useState, useRef } from 'react';
import { AppState, ForgeMode, NeuralMacro, MannequinParams, BackgroundStyle } from '../types';
import { GIcon, Icons } from './Icons';
import { PromptEngine } from './Atelier/PromptEngine';
import { Viewport } from './Atelier/Viewport';
import { NeuralMatrix } from './Atelier/NeuralMatrix';
import { GenesisModal } from './Atelier/GenesisModal';

interface AtelierProps {
  state: AppState;
  prompt: string;
  setPrompt: (v: string) => void;
  onUpload: (url: string) => void;
  onUploadReference: (url: string | null) => void;
  onForge: () => void;
  onCommit: () => void;
  onExtractBase: (url: string) => void;
  onResetParent: () => void;
  onUpdateMutation: (v: number) => void;
  onToggleNode: (id: string) => void;
  onSetMode: (mode: ForgeMode) => void;
  onApplyMacro: (macro: NeuralMacro) => void;
  onPromoteToBase: (url: string) => void;
  onGenerateMannequin: (params: MannequinParams) => void;
  hasApiKey: boolean;
  onUpdateConfig: (config: Partial<AppState['config']>) => void;
  isZenMode: boolean;
  setIsZenMode: (v: boolean) => void;
}

export const Atelier: React.FC<AtelierProps> = (props) => {
  const { state, prompt, setPrompt, onUpload, onForge, onCommit, onUpdateMutation, onToggleNode, onGenerateMannequin, onExtractBase, onUpdateConfig, isZenMode, setIsZenMode } = props;
  
  const [showConfig, setShowConfig] = useState(false);
  const [previewStage, setPreviewStage] = useState<BackgroundStyle>('magenta');
  const [isGenesisOpen, setIsGenesisOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Empty State / Genesis Flow
  if (!state.baseImage) {
    return (
      <div className="h-full w-full bg-[#050505] tech-grid flex flex-col items-center justify-center p-8 text-center gap-12 overflow-y-auto no-scrollbar">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const r = new FileReader();
            r.onload = (ev) => onUpload(ev.target?.result as string);
            r.readAsDataURL(file);
          }
        }} />
        
        {isGenesisOpen && <GenesisModal onCancel={() => setIsGenesisOpen(false)} onGenerate={(p) => { onGenerateMannequin(p); setIsGenesisOpen(false); }} />}

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl pulse-active">
              <GIcon d={Icons.Alchemy} size={40} className="text-indigo-500" />
           </div>
           <div className="space-y-2">
            <h2 className="text-[14px] font-black uppercase tracking-[0.5em] text-white">SpriteForge_Core</h2>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest max-w-[260px] mx-auto leading-relaxed opacity-60">Inicialice un maniquí base o cargue su propia silueta para comenzar.</p>
           </div>
        </div>
        
        <div className="flex flex-col w-full max-w-[280px] gap-4">
           <button onClick={() => setIsGenesisOpen(true)} className="p-6 bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] flex items-center gap-6 active:scale-95 transition-all active:bg-indigo-600/5 active:border-indigo-500/30">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center">
                <GIcon d={Icons.Crystal} size={24} className="text-indigo-400" />
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-white">Genesis IA</span>
                <span className="block text-[8px] font-bold text-slate-700 uppercase tracking-widest">Generar Maniquí</span>
              </div>
           </button>
           <button onClick={() => fileInputRef.current?.click()} className="p-6 bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] flex items-center gap-6 active:scale-95 transition-all active:bg-white/[0.05]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                <GIcon d={Icons.Upload} size={24} className="text-slate-600" />
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-white">Cargar DNA</span>
                <span className="block text-[8px] font-bold text-slate-700 uppercase tracking-widest">Archivo Imagen</span>
              </div>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col relative bg-[#050505] select-none">
      <Viewport 
        state={state}
        previewStage={previewStage}
        isZenMode={isZenMode}
        onToggleZen={() => setIsZenMode(!isZenMode)}
        onCommit={onCommit}
        onUpdateConfig={onUpdateConfig}
        onSetStage={setPreviewStage}
      />

      <div className={`transition-all duration-500 ease-in-out ${isZenMode ? 'translate-y-full opacity-0 max-h-0' : 'translate-y-0 opacity-100'}`}>
        <PromptEngine 
          prompt={prompt}
          setPrompt={setPrompt}
          onForge={onForge}
          isGenerating={state.isGenerating}
          referenceAsset={state.referenceAsset}
          onUploadReference={props.onUploadReference}
          onToggleConfig={() => setShowConfig(!showConfig)}
          showConfig={showConfig}
        />
      </div>

      {showConfig && (
        <NeuralMatrix 
          config={state.config}
          onToggleNode={onToggleNode}
          onUpdateMutation={onUpdateMutation}
          onSetMode={props.onSetMode}
          onExtractBase={() => onExtractBase(state.activeParent?.url || state.baseImage!)}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
};
