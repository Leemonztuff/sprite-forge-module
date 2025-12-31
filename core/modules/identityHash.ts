
import { PixelData } from '../types';

/**
 * Genera un Perceptual Hash (pHash) simplificado.
 * Reduce la imagen a una cuadrícula de 8x8 y calcula la luminancia media
 * para detectar cambios estructurales, ignorando variaciones leves de color.
 */
export function buildIdentityHash(img: PixelData): string {
  const { width, height, data } = img;
  const GRID_SIZE = 8;
  const blockW = Math.floor(width / GRID_SIZE);
  const blockH = Math.floor(height / GRID_SIZE);
  
  let luminances: number[] = [];
  let totalLuminance = 0;

  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      let sum = 0;
      let count = 0;
      
      for (let y = gy * blockH; y < (gy + 1) * blockH; y++) {
        for (let x = gx * blockW; x < (gx + 1) * blockW; x++) {
          const i = (y * width + x) * 4;
          // Luminancia estándar (rec 601)
          const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
          sum += lum;
          count++;
        }
      }
      const avg = count > 0 ? sum / count : 0;
      luminances.push(avg);
      totalLuminance += avg;
    }
  }

  const mean = totalLuminance / (GRID_SIZE * GRID_SIZE);
  // Convertir a cadena de bits (1 si está por encima de la media, 0 si no)
  const hash = luminances.map(l => (l > mean ? '1' : '0')).join('');
  
  // Incluimos dimensiones para evitar colisiones de escala
  return `${width}x${height}-${parseInt(hash, 2).toString(16)}`;
}
