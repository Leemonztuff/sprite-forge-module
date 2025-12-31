
import { PixelData } from '../types';

function countAlpha(img: PixelData, y0: number, y1: number): number {
  const { width, height, data } = img;
  let count = 0;
  const startY = Math.floor(height * y0);
  const endY = Math.floor(height * y1);
  
  for (let y = startY; y < endY; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) count++;
    }
  }
  return count;
}

/**
 * Módulo 10: Ratio de masa craneal.
 */
export function headRatio(img: PixelData): number {
  const total = countAlpha(img, 0, 1);
  if (total === 0) return 0;
  return countAlpha(img, 0, 0.2) / total;
}

/**
 * Módulo 11: Ratio de volumen torácico.
 */
export function bustRatio(img: PixelData): number {
  const total = countAlpha(img, 0, 1);
  if (total === 0) return 0;
  return countAlpha(img, 0.30, 0.45) / total;
}

/**
 * Módulo 12: Ratio de volumen pélvico.
 */
export function hipRatio(img: PixelData): number {
  const total = countAlpha(img, 0, 1);
  if (total === 0) return 0;
  return countAlpha(img, 0.50, 0.65) / total;
}
