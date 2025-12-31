
import { PixelData } from '../types';

/**
 * Módulo 17: Genera un mapa de delta (diferencias) entre dos imágenes.
 * Detecta qué píxeles han mutado más allá de un umbral de tolerancia.
 */
export function deltaMap(a: PixelData, b: PixelData): Uint8Array {
  const length = a.data.length / 4;
  const d = new Uint8Array(length);
  
  for (let i = 0; i < a.data.length; i += 4) {
    // Calculamos diferencia absoluta en el canal rojo (suficiente para detectar cambio en pixel art)
    // o podemos promediar RGB.
    const diff = Math.abs(a.data[i] - b.data[i]) + 
                 Math.abs(a.data[i+1] - b.data[i+1]) + 
                 Math.abs(a.data[i+2] - b.data[i+2]);
    
    // Umbral de 20 por canal (aprox 60 total) para ignorar ruidos mínimos
    d[i / 4] = diff > 60 ? 255 : 0;
  }
  return d;
}
