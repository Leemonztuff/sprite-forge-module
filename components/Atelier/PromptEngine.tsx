
import React, { useRef } from 'react';
import { IconButton } from '../UI';
import { GIcon, Icons } from '../Icons';
import { OUTFIT_PRESETS } from '../../constants';

interface PromptEngineProps {
  prompt: string;
  setPrompt: (v: string) => void;
  onForge: () => void;
  isGenerating: boolean;
  referenceAsset: string | null;
  onUploadReference: (url: string | null) => void;
  onToggleConfig: () => void;
  showConfig: boolean;
}

export const PromptEngine: React.FC<PromptEngineProps> = ({ 
  prompt, setPrompt, onForge, isGenerating, referenceAsset, onUploadReference, onToggleConfig, showConfig 
}) => {
  const refAssetInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col shrink-0">
      {/* Presets Horizontal Strip */}
      <div className="h-14 shrink-0 flex items-center gap-3 px-6 overflow-x-auto no-scrollbar bg-black/80 border-t border-white/5 backdrop-blur-xl">
         {OUTFIT_PRESETS.map(p => (
           <button key={p.name} onClick={() => setPrompt(p.prompt)} className="px-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-2xl text-[9px] font-black text-slate-500 active:text-indigo-400 active:border-indigo-500/40 transition-all whitespace-nowrap uppercase tracking-widest">
             {p.name}
           </button>
         ))}
      </div>

      {/* Input Core */}
      <div className="min-h-24 bg-[#0d0d0d] border-t border-white/5 flex flex-col p-4 gap-4 pb-12 sm:pb-4 z-50">
        <div className="flex gap-4 w-full">
           <IconButton variant={showConfig ? 'active' : 'ghost'} onClick={onToggleConfig} className="w-14 h-14">
              <GIcon d={Icons.Settings} size={22} />
           </IconButton>
           
           <div className="flex-1 flex gap-2 bg-black border border-white/10 rounded-3xl p-2 pl-6 focus-within:border-indigo-500/50 transition-all">
              <input 
                type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onForge()}
                placeholder="Directiva neural..."
                className="flex-1 bg-transparent text-[14px] text-white outline-none font-mono-tech placeholder:text-slate-800"
              />
              <button 
                onClick={onForge} 
                disabled={isGenerating || !prompt} 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isGenerating || !prompt ? 'bg-white/5 text-slate-800' : 'bg-indigo-600 text-white shadow-xl active:scale-90'}`}
              >
                 <GIcon d={Icons.Forge} size={24} />
              </button>
           </div>

           <div className="relative">
              <input type="file" ref={refAssetInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const r = new FileReader();
                  r.onload = (ev) => onUploadReference(ev.target?.result as string);
                  r.readAsDataURL(file);
                }
              }} />
              <IconButton onClick={() => refAssetInputRef.current?.click()} variant={referenceAsset ? 'active' : 'ghost'} className="w-14 h-14">
                {referenceAsset ? (
                  <img src={referenceAsset} className="w-full h-full object-contain pixelated p-1" alt="Ref" />
                ) : (
                  <GIcon d={Icons.Alchemy} size={22} />
                )}
              </IconButton>
              {referenceAsset && (
                <button onClick={(e) => {e.stopPropagation(); onUploadReference(null);}} className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center border border-black text-[10px] font-bold">×</button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
