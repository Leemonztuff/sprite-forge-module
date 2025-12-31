
import { PixelData } from '../types';

/**
 * Extrae todos los colores únicos presentes en el sprite (excluyendo transparentes).
 */
export function extractPalette(img: PixelData): number[][] {
  const { data } = img;
  const set = new Map<string, boolean>();
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      set.set(key, true);
    }
  }
  
  return Array.from(set.keys()).map(k => k.split(',').map(Number));
}
