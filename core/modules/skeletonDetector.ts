
import { PixelData, Skeleton } from '../types';

/**
 * Extrae un esqueleto simplificado basado en el centroide de masa de píxeles activos.
 */
export function detectSkeleton(img: PixelData): Skeleton {
  const { width, height, data } = img;
  if (height <= 0) {
    const mid = width / 2;
    return { head: [mid, 0], shoulders: [mid, 0], hips: [mid, 0], knees: [mid, 0], feet: [mid, 0] };
  }

  const rows: number[][] = Array.from({ length: height }, () => []);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 0) rows[y].push(x);
    }
  }

  // Robust check for undefined or empty rows to avoid crashes
  const avgX = (r: number[] | undefined) => (!r || r.length === 0) ? width / 2 : r.reduce((a, b) => a + b, 0) / r.length;

  return {
    head: [avgX(rows[Math.floor(height * 0.15)]), Math.floor(height * 0.15)],
    shoulders: [avgX(rows[Math.floor(height * 0.30)]), Math.floor(height * 0.30)],
    hips: [avgX(rows[Math.floor(height * 0.55)]), Math.floor(height * 0.55)],
    knees: [avgX(rows[Math.floor(height * 0.75)]), Math.floor(height * 0.75)],
    feet: [avgX(rows[Math.floor(height * 0.95)]), Math.floor(height * 0.95)]
  };
}
