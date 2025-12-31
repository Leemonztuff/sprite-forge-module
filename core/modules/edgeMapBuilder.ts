
import { PixelData } from '../types';

/**
 * Genera un mapa binario (Uint8Array) de los bordes basado en cambios de opacidad.
 */
export function buildEdgeMap(img: PixelData): Uint8Array {
  const { width, height, data } = img;
  const edges = new Uint8Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      
      // Comprobar vecinos (derecha y abajo) para detectar bordes de silueta
      const alphaRight = data[i + 7];
      const alphaDown = data[(y + 1) * width * 4 + x * 4 + 3];
      
      if (Math.abs(alpha - alphaRight) > 20 || Math.abs(alpha - alphaDown) > 20) {
        edges[y * width + x] = 255;
      }
    }
  }
  return edges;
}
