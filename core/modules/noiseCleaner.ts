
import { PixelData } from '../types';

/**
 * Módulo 21: Elimina píxeles aislados (ruido) que no tienen vecinos conectados.
 */
export function cleanNoise(img: PixelData): PixelData {
  const { width, height, data } = img;
  const newData = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 0) {
        // Contar vecinos activos
        let neighbors = 0;
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
          if (data[((y + dy) * width + (x + dx)) * 4 + 3] > 0) neighbors++;
        }
        // Si no tiene vecinos, es ruido
        if (neighbors === 0) {
          newData[i + 3] = 0;
        }
      }
    }
  }
  img.data.set(newData);
  return img;
}
