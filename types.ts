
import React from 'react';

export type ImageSize = '1K' | '2K' | '4K';
export type ModelType = 'gemini-2.5-flash-image' | 'gemini-3-flash-preview';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type BackgroundStyle = 'magenta' | 'white' | 'gray' | 'gradient' | 'dungeon' | 'forest' | 'ui';
export type ForgeMode = 'Draft' | 'Master' | 'Spritesheet' | 'Orthographic' | 'Animation';

export type GenderType = 'male' | 'female' | 'neutral';
export type BuildType = 'slim' | 'average' | 'muscular' | 'small';

export type MorphPart = 'head' | 'torso' | 'arms' | 'legs' | 'all';

export interface Archetype {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'process';
  timestamp: number;
}

export interface MannequinParams {
  gender: GenderType;
  build: BuildType;
}

export interface MorphConfig {
  part: MorphPart;
  scale: number; // 0 to 100
  mass: number;  // 0 to 100
  definition: number; // 0 to 100
}

export interface Joint {
  id: string;
  label: string;
  x: number; // 0-100
  y: number; // 0-100
}

export interface RiggingData {
  joints: Joint[];
  lastAnalysisTimestamp?: number;
}

export interface AnimationSequence {
  id: string;
  action: string;
  frames: string[]; // base64 urls
  fps: number;
  spritesheetUrl?: string;
}

export interface NeuralNode {
  id: string;
  label: string;
  description: string;
  instruction: string;
  isActive: boolean;
  isLocked?: boolean;
  icon?: React.ReactNode;
}

export interface NeuralMacro {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  nodesToDisable: string[];
  mutationStrength: number;
  promptSuffix: string;
  color: string;
}

export interface RenderingProtocols {
  backgroundStyle: BackgroundStyle;
  pixelPerfect: boolean;
  strongOutline: boolean;
  hd2dStyle: boolean;
}

export interface GeneratedOutfit {
  id: string;
  url: string;
  originalUrl: string;
  parentId?: string;
  prompt: string;
  timestamp: number;
  model: string;
  aspectRatio: AspectRatio;
  evolutionStep: number;
  mode: ForgeMode;
  mutationStrength?: number;
  seed?: number;
}

export interface ForgeConfig {
  model: ModelType;
  size: ImageSize;
  aspectRatio: AspectRatio;
  mutationStrength: number;
  mode: ForgeMode;
  protocols: RenderingProtocols;
  neuralChain: NeuralNode[];
  activeMacroId?: string;
  seed: number;
  isSeedLocked: boolean;
}

export interface AppState {
  baseImage: string | null;
  referenceAsset: string | null;
  activeParent: GeneratedOutfit | null;
  pendingOutfit: GeneratedOutfit | null;
  outfits: GeneratedOutfit[];
  archetypes: Archetype[];
  isGenerating: boolean;
  config: ForgeConfig;
  error: string | null;
  logs: LogEntry[];
  morph: MorphConfig;
  rigging: RiggingData | null;
  animations: AnimationSequence[];
}
