
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
  const [bridgeReady, setBridgeReady] = useState(false);

  useEffect(() => {
    const checkBridge = () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio) setBridgeReady(true);
    };
    const itv = setInterval(checkBridge, 2000);
    return () => clearInterval(itv);
  }, []);

  const handleOpenKeySelector = useCallback(async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio?.openSelectKey) {
      await aiStudio.openSelectKey();
      forge.setError(null);
    } else {
      forge.setError("MODO_STANDALONE: Usando clave del servidor.");
      setTimeout(() => forge.setError(null), 3000);
    }
  }, [forge]);

  const handleForge = useCallback(async () => {
    forge.setError(null);
    
    // Si es modo Ultra, verificamos si hay llave seleccionada según reglas
    if (state.config.billingMode === 'ultra') {
      const aiStudio = (window as any).aistudio;
      if (aiStudio && !(await aiStudio.hasSelectedApiKey())) {
        await handleOpenKeySelector();
        // Según reglas, procedemos asumiendo éxito tras abrir el diálogo
      }
    }

    try {
      await forge.executeSynthesis(prompt);
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("429") || msg.includes("Quota")) {
        forge.setError("CUOTA_AGOTADA: Cambia el motor en CORE.");
      } else {
        forge.setError(msg);
      }
    }
  }, [forge, prompt, state.config.billingMode, handleOpenKeySelector]);

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
            onExtractBase={() => {}} 
            onGenerateMannequin={forge.generateMannequin} 
            onResetParent={() => forge.setActiveParent(null)} 
            onUpdateMutation={(v) => forge.updateConfig({ mutationStrength: v })} 
            onToggleNode={(id) => forge.toggleNode(id)} 
            onSetMode={(m) => forge.updateConfig({ mode: m })} 
            onApplyMacro={(macro) => forge.updateConfig({ activeMacroId: macro.id })} 
            onPromoteToBase={(url) => forge.setBaseImage(url)} 
            onUpdateConfig={(conf) => forge.updateConfig(conf)} 
            hasApiKey={true} 
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
      {activeTab === 'settings' && (
        <Settings 
          isApiKeyInvalid={false} 
          onOpenKeySelector={handleOpenKeySelector} 
          hasBridge={bridgeReady} 
        />
      )}

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
