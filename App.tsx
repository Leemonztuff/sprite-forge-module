
import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useSpriteForge } from './hooks/useSpriteForge';
import { ImageModal } from './components/ImageModal';
import { HarmonizerGate } from './components/HarmonizerGate';
import { Frame } from './components/Layout/Frame';
import { SystemAlerts } from './components/Layout/SystemAlerts';
import { GIcon, Icons } from './components/Icons';
import { GeminiService } from './services/geminiService';
import { ApiKeyManagerUI } from './components/ApiKeyManager';
import { ErrorBoundary } from './components/ErrorBoundarySimple';

// Lazy load heavy components
const Atelier = lazy(() => import('./components/Atelier').then(module => ({ default: module.Atelier })));
const EvolutionTree = lazy(() => import('./components/EvolutionTree').then(module => ({ default: module.EvolutionTree })));
const ForgeOracle = lazy(() => import('./components/ForgeOracle').then(module => ({ default: module.ForgeOracle })));
const MorphLab = lazy(() => import('./components/MorphLab').then(module => ({ default: module.MorphLab })));
const RiggingLab = lazy(() => import('./components/RiggingLab').then(module => ({ default: module.RiggingLab })));
const AnimationLab = lazy(() => import('./components/AnimationLab').then(module => ({ default: module.AnimationLab })));
const EvolutionTimeline = lazy(() => import('./components/EvolutionTimeline').then(module => ({ default: module.EvolutionTimeline })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));

// Types
interface GeneratedOutfit {
  id: string;
  url: string;
  originalUrl: string;
  parentId?: string;
  prompt: string;
  timestamp: number;
  model: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  evolutionStep: number;
  mode: "Draft" | "Master" | "Spritesheet" | "Orthographic" | "Animation";
  mutationStrength?: number;
  seed?: number;
}

const App: React.FC = () => {
  const forge = useSpriteForge();
  const { state } = forge;
  
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'forge' | 'tree' | 'evolution' | 'settings' | 'morph' | 'rigging' | 'animation'>('forge');
  const [selectedOutfit, setSelectedOutfit] = useState<GeneratedOutfit | null>(null);
  const [isHarmonizerOpen, setIsHarmonizerOpen] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);

  // Inicialización del sistema de API keys
  useEffect(() => {
    const initializeApiKeys = async () => {
      try {
        await GeminiService.initializeRotation();
      } catch (error) {
        console.error('Failed to initialize API key rotation:', error);
        forge.setError("Error al inicializar el sistema de API Keys. Por favor, configura tus API Keys.");
      }
    };
    initializeApiKeys();
  }, []);

  // Escuchar eventos de API keys
  useEffect(() => {
    const handleRequireKey = (event: CustomEvent) => {
      setIsApiKeyManagerOpen(true);
    };

    window.addEventListener('require-api-key', handleRequireKey as EventListener);
    return () => {
      window.removeEventListener('require-api-key', handleRequireKey as EventListener);
    };
  }, []);

  const handleForge = useCallback(async () => {
    forge.setError(null);
    try {
      await forge.executeSynthesis(prompt);
    } catch (error: any) {
      // El error ya es capturado y procesado por el hook
    }
  }, [forge, prompt]);

  const handleSelectAsParent = useCallback((o: GeneratedOutfit) => {
    forge.setActiveParent(o); 
    setPrompt(o.prompt || ''); 
    setActiveTab('forge');
    setSelectedOutfit(null);
  }, [forge]);

    return (
      <ErrorBoundary fallback={
        <div className="h-full w-full flex items-center justify-center text-slate-500">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Application Error</h2>
            <p>Please refresh the page to continue</p>
          </div>
        </div>
      }>
        <Frame activeTab={activeTab} onTabChange={setActiveTab} isGenerating={state.isGenerating} isZenMode={isZenMode}>
          <SystemAlerts 
            error={state.error} 
            onClearError={() => forge.setError(null)} 
            isSettingsPage={activeTab === 'settings'} 
          />

          {activeTab === 'forge' && (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading Forge...</div>}>
              <>
                <Atelier 
                  state={state} 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  onUpload={forge.setBaseImage} 
                  onUploadReference={() => {}} 
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
                <button onClick={() => setIsApiKeyManagerOpen(true)} className={`absolute right-6 w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.5)] z-[250] hover:scale-110 active:scale-95 transition-all border-2 border-purple-400 ${isZenMode ? 'bottom-24' : 'bottom-20'}`}>
                  <GIcon d={Icons.Settings} size={20} />
                </button>
              </>
            </Suspense>
          )}
        </Frame>
      </ErrorBoundary>
    );
  };
};
      
      {activeTab === 'tree' && (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>}>
          <EvolutionTree outfits={state.outfits} baseImage={state.baseImage} activeId={state.activeParent?.id} onSelect={setSelectedOutfit} />
        </Suspense>
      )}
      {activeTab === 'evolution' && (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>}>
          <EvolutionTimeline state={state} onExecuteHybrid={() => {}} onClose={() => setActiveTab('forge')} />
        </Suspense>
      )}
      {activeTab === 'morph' && state.baseImage && (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>}>
          <MorphLab state={state} onUpdateMorph={() => {}} onExecute={() => {}} onClose={() => setActiveTab('forge')} />
        </Suspense>
      )}
      {activeTab === 'rigging' && (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>}>
          <RiggingLab state={state} onUpdateJoint={() => {}} onExecuteAnalysis={forge.executeRiggingAnalysis} onClose={() => setActiveTab('forge')} />
        </Suspense>
      )}
      {activeTab === 'animation' && (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>}>
          <AnimationLab state={state} onExecuteAnimation={() => {}} onInterpolate={() => {}} onClose={() => setActiveTab('forge')} />
        </Suspense>
      )}
      {activeTab === 'settings' && (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>}>
          <Settings />
        </Suspense>
      )}

      {isOracleOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 text-slate-500">Loading...</div>}>
          <ForgeOracle archetypes={state.archetypes} onInject={setPrompt} onSaveArchetype={forge.saveArchetype} onDeleteArchetype={forge.deleteArchetype} onClose={() => setIsOracleOpen(false)} />
        </Suspense>
      )}
      
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

      {isApiKeyManagerOpen && (
        <ApiKeyManagerUI
          isOpen={isApiKeyManagerOpen}
          onClose={() => setIsApiKeyManagerOpen(false)}
          onKeyAdded={() => {
            forge.setError(null);
            // Reinicializar sistema de API keys
            GeminiService.initializeRotation();
          }}
        />
      )}
    </Frame>
  );
};

export default App;
