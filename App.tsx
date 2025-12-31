
import React, { useState, useCallback, useEffect } from 'react';
import { useSpriteForge } from './hooks/useSpriteForge';
import { Atelier } from './components/Atelier';
import { EvolutionTree } from './components/EvolutionTree';
import { ImageModal } from './components/ImageModal';
import { HarmonizerGate } from './components/HarmonizerGate';
import { ForgeOracle } from './components/ForgeOracle';
import { MorphLab } from './components/MorphLab';
import { RiggingLab } from './components/RiggingLab';
import { AnimationLab } from './components/AnimationLab';
import { EvolutionTimeline } from './components/EvolutionTimeline';
import { Settings } from './components/Settings';
import { GeneratedOutfit } from './types';
import { Frame } from './components/Layout/Frame';
import { SystemAlerts } from './components/Layout/SystemAlerts';
import { GIcon, Icons } from './components/Icons';

const App: React.FC = () => {
  const forge = useSpriteForge();
  const { state } = forge;
  
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'forge' | 'tree' | 'evolution' | 'settings' | 'morph' | 'rigging' | 'animation'>('forge');
  const [selectedOutfit, setSelectedOutfit] = useState<GeneratedOutfit | null>(null);
  const [isHarmonizerOpen, setIsHarmonizerOpen] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showKeySelector, setShowKeySelector] = useState(false);

  const isApiKeyInvalid = !process.env.API_KEY || process.env.API_KEY.includes('placeholder');

  useEffect(() => {
    const checkAuth = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) setShowKeySelector(true);
      }
    };
    checkAuth();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setShowKeySelector(false); 
    }
  };

  const handleForge = useCallback(async () => {
    if (isApiKeyInvalid) {
      setShowKeySelector(true);
      return;
    }
    forge.setError(null);
    try {
      await forge.executeSynthesis(prompt);
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes('429')) msg = "CUOTA_AGOTADA: Cambia tu API Key.";
      forge.setError(msg);
      if (msg.includes("401") || msg.includes("not found")) setShowKeySelector(true);
    }
  }, [forge, prompt, isApiKeyInvalid]);

  const handleSelectAsParent = useCallback((o: GeneratedOutfit) => {
    forge.setActiveParent(o); 
    setPrompt(o.prompt || ''); 
    setActiveTab('forge');
    setSelectedOutfit(null);
  }, [forge]);

  return (
    <Frame activeTab={activeTab} onTabChange={setActiveTab} isGenerating={state.isGenerating} isZenMode={isZenMode}>
      <SystemAlerts 
        error={state.error} 
        onClearError={() => forge.setError(null)} 
        isSettingsPage={activeTab === 'settings'} 
        onOpenKeySelector={handleOpenKeySelector} 
      />

      {showKeySelector && (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-10 text-center space-y-8 shadow-2xl">
            <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl mx-auto flex items-center justify-center border border-indigo-500/20">
              <GIcon d={Icons.Lock} size={40} className="text-indigo-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-white">Nucleus Activation</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Se requiere una API Key de Gemini Pro para habilitar el motor de forja neural.</p>
            </div>
            <button onClick={handleOpenKeySelector} className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/40 active:scale-95 transition-all">Configurar API Key</button>
          </div>
        </div>
      )}

      {activeTab === 'forge' && (
        <>
          <Atelier 
            state={state} 
            prompt={prompt} 
            setPrompt={setPrompt} 
            onUpload={forge.setBaseImage} 
            onUploadReference={forge.uploadReferenceAsset} 
            onForge={handleForge} 
            onCommit={() => setIsHarmonizerOpen(true)} 
            onExtractBase={() => console.log('DNA extraction legacy...')} 
            onGenerateMannequin={forge.generateMannequin} 
            onResetParent={() => forge.setActiveParent(null)} 
            onUpdateMutation={(v) => forge.updateConfig({ mutationStrength: v })} 
            onToggleNode={(id) => forge.toggleNode(id)} 
            onSetMode={(m) => forge.updateConfig({ mode: m })} 
            onApplyMacro={(macro) => forge.updateConfig({ activeMacroId: macro.id })} 
            onPromoteToBase={(url) => forge.setBaseImage(url)} 
            onUpdateConfig={(conf) => forge.updateConfig(conf)} 
            hasApiKey={!isApiKeyInvalid} 
            isZenMode={isZenMode} 
            setIsZenMode={setIsZenMode} 
          />
          <button onClick={() => setIsOracleOpen(true)} className={`absolute right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] z-[250] hover:scale-110 active:scale-95 transition-all border-2 border-indigo-400 ${isZenMode ? 'bottom-6' : 'bottom-32'}`}><GIcon d={Icons.Crystal} size={24} /></button>
        </>
      )}
      
      {activeTab === 'tree' && <EvolutionTree outfits={state.outfits} baseImage={state.baseImage} activeId={state.activeParent?.id} onSelect={setSelectedOutfit} />}
      {activeTab === 'evolution' && <EvolutionTimeline state={state} onExecuteHybrid={() => {}} onClose={() => setActiveTab('forge')} />}
      {activeTab === 'morph' && state.baseImage && <MorphLab state={state} onUpdateMorph={() => {}} onExecute={() => {}} onClose={() => setActiveTab('forge')} />}
      {activeTab === 'rigging' && <RiggingLab state={state} onUpdateJoint={() => {}} onExecuteAnalysis={forge.executeRiggingAnalysis} onClose={() => setActiveTab('forge')} />}
      {activeTab === 'animation' && <AnimationLab state={state} onExecuteAnimation={() => {}} onInterpolate={() => {}} onClose={() => setActiveTab('forge')} />}
      {activeTab === 'settings' && <Settings isApiKeyInvalid={isApiKeyInvalid} onOpenKeySelector={handleOpenKeySelector} />}

      {isOracleOpen && <ForgeOracle archetypes={state.archetypes} onInject={setPrompt} onSaveArchetype={forge.saveArchetype} onDeleteArchetype={forge.deleteArchetype} onClose={() => setIsOracleOpen(false)} />}
      
      {isHarmonizerOpen && state.pendingOutfit && (
        <HarmonizerGate 
          outfit={state.pendingOutfit} 
          isHarmonizing={state.isGenerating} 
          onHarmonize={forge.finalizeAndHarmonize} 
          onCleanOrphans={() => {}} 
          onCommit={() => { forge.commitToTree(); setIsHarmonizerOpen(false); }} 
          onCancel={() => { forge.setPendingOutfit(null); setIsHarmonizerOpen(false); }} 
        />
      )}
      
      {selectedOutfit && (
        <ImageModal 
          outfit={selectedOutfit} 
          onClose={() => setSelectedOutfit(null)} 
          onDelete={forge.deleteAsset} 
          onSelectAsParent={handleSelectAsParent} 
        />
      )}
    </Frame>
  );
};

export default App;
