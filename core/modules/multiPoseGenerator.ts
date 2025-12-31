
import { PixelData, Skeleton } from '../types';

/**
 * Módulos 22-24: Genera variaciones de pose (Front, Profile, Back) 
 * utilizando el esqueleto detectado como guía de transformación.
 */
export function generatePoses(img: PixelData, skeleton: Skeleton): PixelData[] {
  // En una fase avanzada, esto aplicaría transformaciones afines o warping.
  // Por ahora, devolvemos la pose base y una versión espejada como placeholder funcional.
  const mirror = (source: PixelData): PixelData => {
    const { width, height, data } = source;
    const flipped = new Uint8ClampedArray(data.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destIdx = (y * width + (width - 1 - x)) * 4;
        flipped[destIdx] = data[srcIdx];
        flipped[destIdx + 1] = data[srcIdx + 1];
        flipped[destIdx + 2] = data[srcIdx + 2];
        flipped[destIdx + 3] = data[srcIdx + 3];
      }
    }
    return { width, height, data: flipped };
  };

  return [img, mirror(img)];
}
