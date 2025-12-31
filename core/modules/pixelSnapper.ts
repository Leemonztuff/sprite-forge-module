
import { PixelData } from '../types';

/**
 * Módulo 20: Asegura que todos los colores sean nítidos y sin antialiasing 
 * no deseado producto de la generación por IA.
 */
export function snapPixels(img: PixelData): PixelData {
  const { data } = img;
  for (let i = 0; i < data.length; i += 4) {
    // Redondear valores de color para mayor nitidez en pixel art
    data[i] = Math.round(data[i] / 5) * 5;
    data[i + 1] = Math.round(data[i + 1] / 5) * 5;
    data[i + 2] = Math.round(data[i + 2] / 5) * 5;
    // Forzar alfa binario si está cerca de los bordes
    if (data[i + 3] > 128) data[i + 3] = 255;
    else if (data[i + 3] < 50) data[i + 3] = 0;
  }
  return img;
}
