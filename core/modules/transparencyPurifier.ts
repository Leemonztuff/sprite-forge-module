
import { PixelData } from '../types';

/**
 * Purifica el canal alfa eliminando el antialiasing generado por la IA.
 * Asegura que el sprite sea 100% opaco o 100% transparente.
 */
export function transparencyPurifier(img: PixelData, threshold: number = 128): PixelData {
  const { data } = img;
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = data[i + 3] >= threshold ? 255 : 0;
  }
  return img;
}
