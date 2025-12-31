
import { create } from 'zustand';
import { AppState, GeneratedOutfit, ForgeConfig, MorphConfig, RiggingData, LogEntry, Archetype, Joint } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface ForgeStore extends AppState {
  // Actions
  setBaseImage: (url: string | null) => void;
  setActiveParent: (outfit: GeneratedOutfit | null) => void;
  setPendingOutfit: (outfit: GeneratedOutfit | null) => void;
  addOutfit: (outfit: GeneratedOutfit) => void;
  setOutfits: (outfits: GeneratedOutfit[]) => void;
  removeOutfit: (id: string) => void;
  setArchetypes: (archetypes: Archetype[]) => void;
  addLog: (message: string, type: LogEntry['type']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateConfig: (update: Partial<ForgeConfig>) => void;
  updateMorph: (update: Partial<MorphConfig>) => void;
  setRigging: (rigging: RiggingData | null) => void;
  updateJoint: (joint: Joint) => void;
}

export const useForgeStore = create<ForgeStore>((set) => ({
  // State
  baseImage: null,
  referenceAsset: null,
  activeParent: null,
  pendingOutfit: null,
  outfits: [],
  archetypes: [],
  isGenerating: false,
  config: DEFAULT_CONFIG,
  error: null,
  logs: [],
  morph: { part: 'all', scale: 50, mass: 50, definition: 50 },
  rigging: null,
  animations: [],

  // Reducers
  setBaseImage: (url) => set({ 
    baseImage: url, 
    activeParent: null, 
    pendingOutfit: null, 
    rigging: null, 
    animations: [] 
  }),
  
  setActiveParent: (outfit) => set({ 
    activeParent: outfit, 
    pendingOutfit: null, 
    rigging: null, 
    animations: [] 
  }),

  setPendingOutfit: (outfit) => set({ pendingOutfit: outfit }),

  addOutfit: (outfit) => set((state) => ({ 
    outfits: [outfit, ...state.outfits] 
  })),

  setOutfits: (outfits) => set({ outfits }),

  removeOutfit: (id) => set((state) => ({ 
    outfits: state.outfits.filter(o => o.id !== id) 
  })),

  setArchetypes: (archetypes) => set({ archetypes }),

  addLog: (message, type) => set((state) => ({
    logs: [{ 
      id: Math.random().toString(36), 
      message, 
      type, 
      timestamp: Date.now() 
    }, ...state.logs].slice(0, 50)
  })),

  setLoading: (isGenerating) => set({ isGenerating }),
  
  setError: (error) => set({ error }),

  updateConfig: (update) => set((state) => ({ 
    config: { ...state.config, ...update } 
  })),

  updateMorph: (update) => set((state) => ({ 
    morph: { ...state.morph, ...update } 
  })),

  setRigging: (rigging) => set({ rigging }),

  updateJoint: (joint) => set((state) => {
    if (!state.rigging) return state;
    return {
      rigging: {
        ...state.rigging,
        joints: state.rigging.joints.map(j => j.id === joint.id ? joint : j)
      }
    };
  })
}));
