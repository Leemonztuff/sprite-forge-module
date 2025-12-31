
import { PixelData } from '../types';

/**
 * Crea una máscara binaria de la silueta del personaje.
 */
export function buildSilhouetteMask(img: PixelData): Uint8Array {
  const { width, height, data } = img;
  const mask = new Uint8Array(width * height);
  
  for (let i = 0; i < data.length; i += 4) {
    mask[Math.floor(i / 4)] = data[i + 3] > 0 ? 255 : 0;
  }
  
  return mask;
}
