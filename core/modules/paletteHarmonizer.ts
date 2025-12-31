
import { PixelData } from '../types';
import { paletteNormalize } from './paletteNormalizer';
import { extractPalette } from './paletteExtractor';

/**
 * Módulo 19: Forza los colores de la imagen generada por IA para que coincidan 
 * con la paleta original.
 */
export function harmonizePalette(baseImg: PixelData, generatedImg: PixelData, targetPalette?: number[][]): PixelData {
  const palette = targetPalette || extractPalette(baseImg);
  return paletteNormalize(generatedImg, palette);
}
