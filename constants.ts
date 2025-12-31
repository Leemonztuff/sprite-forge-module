
import React from 'react';
import { NeuralNode, ForgeConfig, NeuralMacro } from './types';
import { Icons, GIcon } from './components/Icons';

export const ANATOMICAL_MACROS: NeuralMacro[] = [
  {
    id: 'macro-spritesheet',
    name: 'Spritesheet',
    icon: React.createElement(GIcon, { d: Icons.Grid, size: 16 }),
    description: 'Genera una tira de 4 frames (frente, perfiles, espalda).',
    nodesToDisable: [], 
    mutationStrength: 40,
    promptSuffix: 'horizontal spritesheet strip, 4 separate frames: front, side, back, diagonal. 2D pixel art game asset.',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'macro-armor',
    name: 'Battle Ready',
    icon: React.createElement(GIcon, { d: Icons.Armor, size: 16 }),
    description: 'Prioriza armaduras pesadas y materiales metálicos.',
    nodesToDisable: ['m2'],
    mutationStrength: 80,
    promptSuffix: 'highly detailed battle plate armor, shiny metallic textures, professional RPG gear.',
    color: 'from-pink-600 to-indigo-600'
  }
];

export const OUTFIT_PRESETS = [
  { name: 'Paladín', prompt: 'Armadura de placas plateada, capa blanca, detalles dorados' },
  { name: 'Sombra', prompt: 'Ropajes de cuero negro, capucha, dagas en el cinturón, sigiloso' },
  { name: 'Archimago', prompt: 'Túnicas de seda púrpura con bordados rúnicos brillantes, cinturón de cuero' },
  { name: 'Ciber-Soldado', prompt: 'Traje táctico negro con luces de neón cian, visor tecnológico, placas metálicas' }
];

export const INITIAL_NEURAL_CHAIN: NeuralNode[] = [
  { id: 'm1', label: 'Engine', description: 'Motor principal de forja.', instruction: 'ROLE: RPG Pixel Art Forge.', isActive: true, isLocked: true, icon: React.createElement(GIcon, { d: Icons.Crystal, size: 18 }) },
  { id: 'm2', label: 'DNA_Lock', description: 'Mantiene la cara y proporciones originales.', instruction: 'DNA_LOCK: Strictly preserve skin tone, pose, and face.', isActive: true, icon: React.createElement(GIcon, { d: Icons.Dna, size: 18 }) },
  { id: 'm6', label: 'Gear_Only', description: 'Solo modifica la ropa.', instruction: 'Only modify attire and equipment.', isActive: true, icon: React.createElement(GIcon, { d: Icons.Armor, size: 18 }) },
  { id: 'm34', label: 'Outline', description: 'Contornos definidos para sprites.', instruction: 'Use strong black pixel outlines.', isActive: true, icon: React.createElement(GIcon, { d: Icons.Circuitry, size: 18 }) },
  { id: 'm-ortho', label: 'Ortho_Sync', description: 'Sincronización multi-ángulo.', instruction: 'ORTHO_SYNC: Generate synchronized orthographic character sheet (front, back, left, right). Ensure absolute design coherence across all views.', isActive: false, icon: React.createElement(GIcon, { d: Icons.Grid, size: 18 }) },
];

export const DEFAULT_CONFIG: ForgeConfig = {
  model: 'gemini-2.5-flash-image',
  size: '1K',
  aspectRatio: '1:1',
  mutationStrength: 50,
  mode: 'Master',
  protocols: {
    backgroundStyle: 'magenta',
    pixelPerfect: true,
    strongOutline: true,
    hd2dStyle: true
  },
  neuralChain: INITIAL_NEURAL_CHAIN,
  seed: Math.floor(Math.random() * 1000000),
  isSeedLocked: false
};
