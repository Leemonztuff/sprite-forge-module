
import { PixelData } from '../types';

/**
 * Mapea cada píxel al color más cercano de una paleta dada.
 */
export function paletteNormalize(img: PixelData, palette: number[][]): PixelData {
  if (palette.length === 0) return img;
  
  const { data } = img;
  
  const findNearest = (r: number, g: number, b: number) => {
    let minIdx = 0;
    let minDist = Infinity;
    
    for (let i = 0; i < palette.length; i++) {
      const p = palette[i];
      const dist = Math.pow(r - p[0], 2) + Math.pow(g - p[1], 2) + Math.pow(b - p[2], 2);
      if (dist < minDist) {
        minDist = dist;
        minIdx = i;
      }
    }
    return palette[minIdx];
  };

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      const [r, g, b] = findNearest(data[i], data[i + 1], data[i + 2]);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }
  return img;
}
