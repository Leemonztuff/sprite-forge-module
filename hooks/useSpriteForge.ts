
import { useCallback } from 'react';
import { useForgeStore } from '../store/forgeStore';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { ImageProcessor } from '../services/imageProcessor';
import { SpriteForgePipeline } from '../core/pipeline';
import { MannequinParams } from '../types';

export function useSpriteForge() {
  const store = useForgeStore();

  const addLog = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' | 'process' = 'info') => {
    store.addLog(message, type);
  }, [store]);

  const executeSynthesis = useCallback(async (prompt: string) => {
    if (!store.baseImage) return;
    
    store.setLoading(true);
    store.setError(null);
    addLog(`INIT_NEURAL_FORGE: Sintetizando nueva variante (${store.config.billingMode})...`, 'process');
    
    try {
      const enhancedPrompt = await GeminiService.enhancePrompt(prompt, store.config.billingMode);
      const pixels = await ImageProcessor.getPixelData(store.activeParent?.url || store.baseImage);
      
      const result = await SpriteForgePipeline.forgeSprite({
        baseImage: pixels,
        outfit: enhancedPrompt,
        classType: 'RPG_Specimen',
        theme: 'Production_Asset',
        sheetMode: store.config.mode === 'Spritesheet',
        aiExecutor: (p, img, mask) => GeminiService.callAI(p, img, mask, store.config)
      });

      const url = ImageProcessor.pixelsToDataUrl(result.image);
      const newAsset = {
        id: crypto.randomUUID(),
        url,
        originalUrl: url,
        parentId: store.activeParent?.id,
        prompt,
        timestamp: Date.now(),
        model: store.config.model,
        aspectRatio: store.config.aspectRatio,
        evolutionStep: (store.activeParent?.evolutionStep || 0) + 1,
        mode: store.config.mode,
        mutationStrength: store.config.mutationStrength,
        seed: store.config.seed
      };
      
      store.setPendingOutfit(newAsset);
      addLog(`FORGE_SUCCESS: Drift_Score: ${(result.drift * 100).toFixed(1)}%`, 'success');
    } catch (error: any) {
      let errorMsg = error.message;
      if (errorMsg === "IDENTITY_DRIFT") errorMsg = "DRIFT_DETECTED: Anatomía comprometida.";
      if (errorMsg.includes("fetch")) errorMsg = "NETWORK_ERROR: Verifica tu conexión o API Key.";
      
      store.setError(errorMsg);
      addLog(errorMsg, 'error');
    } finally {
      store.setLoading(false);
    }
  }, [store, addLog]);

  const generateMannequin = useCallback(async (params: MannequinParams) => {
    store.setLoading(true);
    addLog(`GENERATING_BASE: ${params.gender}_${params.build} [${store.config.billingMode}]`, 'process');
    try {
      const url = await GeminiService.generateBaseMannequin(store.config, params);
      store.setBaseImage(url);
      addLog('BASE_GENESIS_COMPLETE', 'success');
    } catch (e: any) {
      store.setError(e.message);
      addLog(e.message, 'error');
    } finally {
      store.setLoading(false);
    }
  }, [store, addLog]);

  const commitToTree = useCallback(async () => {
    if (!store.pendingOutfit) return;
    try {
      await StorageService.saveOutfit(store.pendingOutfit);
      store.addOutfit(store.pendingOutfit);
      store.setActiveParent(store.pendingOutfit);
      store.setPendingOutfit(null);
      addLog(`ASSET_COMMITTED_TO_LINEAGE`, 'success');
    } catch (e: any) {
      addLog(`SYNC_ERROR: ${e.message}`, 'error');
    }
  }, [store, addLog]);

  return { 
    state: store, 
    uploadBaseDNA: store.setBaseImage,
    uploadReferenceAsset: (url: string | null) => store.updateConfig({ activeMacroId: url || undefined }),
    generateMannequin,
    executeSynthesis,
    deleteAsset: store.removeOutfit,
    commitToTree,
    updateConfig: store.updateConfig,
    setActiveParent: store.setActiveParent,
    setError: store.setError,
    setBaseImage: store.setBaseImage,
    setPendingOutfit: store.setPendingOutfit,
    toggleNode: (id: string) => {
      const chain = store.config.neuralChain.map(n => 
        n.id === id ? { ...n, isActive: !n.isActive } : n
      );
      store.updateConfig({ neuralChain: chain });
    },
    saveArchetype: async (name: string, content: string) => {
      const arc = { id: crypto.randomUUID(), name, content, timestamp: Date.now() };
      await StorageService.saveArchetype(arc);
      const all = await StorageService.getAllArchetypes();
      store.setArchetypes(all);
    },
    deleteArchetype: async (id: string) => {
      await StorageService.deleteArchetype(id);
      const all = await StorageService.getAllArchetypes();
      store.setArchetypes(all);
    },
    executeRiggingAnalysis: async () => {
      const url = store.activeParent?.url || store.baseImage;
      if (!url) return;
      store.setLoading(true);
      try {
        const data = await GeminiService.analyzeRigging(url, store.config.billingMode);
        store.setRigging(data);
        addLog('RIGGING_ANALYSIS_COMPLETE', 'success');
      } catch (e: any) {
        addLog(`RIG_ERROR: ${e.message}`, 'error');
      } finally {
        store.setLoading(false);
      }
    },
    finalizeAndHarmonize: async () => {
      if (!store.pendingOutfit) return;
      store.setLoading(true);
      try {
        const cleanedUrl = await ImageProcessor.cleanOrphans(store.pendingOutfit.url);
        store.setPendingOutfit({ ...store.pendingOutfit, url: cleanedUrl });
        addLog('HARMONIZATION_COMPLETE', 'success');
      } catch (e: any) {
        addLog(`HARMONIZER_ERR: ${e.message}`, 'error');
      } finally {
        store.setLoading(false);
      }
    }
  };
}
