
import { PixelData } from '../types';

/**
 * Limpia píxeles con baja opacidad para asegurar bordes nítidos.
 */
export function alphaCleaner(img: PixelData, threshold: number = 30): PixelData {
  const { data } = img;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < threshold) {
      data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
    }
  }
  return img;
}
