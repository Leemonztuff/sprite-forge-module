
import { PixelData } from '../types';

/**
 * Módulo 28: Clona profundamente un asset base para evitar mutaciones accidentales en el buffer original.
 */
export function reuseBase(img: PixelData): PixelData {
  return {
    width: img.width,
    height: img.height,
    data: new Uint8ClampedArray(img.data)
  };
}
