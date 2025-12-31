
import { PixelData } from '../types';

/**
 * Detecta los bordes del sprite y les aplica un color unificado (habitualmente negro).
 * Esto previene outlines de colores extraños generados por la IA.
 */
export function outlineUnifier(img: PixelData, outlineColor: number[] = [0, 0, 0]): PixelData {
  const { width, height, data } = img;
  const newData = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 0) {
        // Comprobar si es un píxel de borde (tiene al menos un vecino transparente)
        let isEdge = false;
        const neighbors = [
          [0, 1], [0, -1], [1, 0], [-1, 0]
        ];

        for (const [dx, dy] of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (data[(ny * width + nx) * 4 + 3] === 0) {
              isEdge = true;
              break;
            }
          } else {
            isEdge = true; // Borde del canvas
            break;
          }
        }

        if (isEdge) {
          newData[i] = outlineColor[0];
          newData[i + 1] = outlineColor[1];
          newData[i + 2] = outlineColor[2];
          newData[i + 3] = 255;
        }
      }
    }
  }
  data.set(newData);
  return img;
}
