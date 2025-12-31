
import { PixelData } from '../types';

/**
 * Módulo 25: Une múltiples poses en una sola tira horizontal (Spritesheet).
 */
export function composeSpriteSheet(poses: PixelData[]): PixelData {
  if (poses.length === 0) throw new Error("No poses provided");
  
  const w = poses[0].width;
  const h = poses[0].height;
  const sheetWidth = w * poses.length;
  const sheetData = new Uint8ClampedArray(sheetWidth * h * 4);

  poses.forEach((img, index) => {
    for (let y = 0; y < h; y++) {
      const sourceStart = y * w * 4;
      const targetStart = (y * sheetWidth + index * w) * 4;
      sheetData.set(img.data.subarray(sourceStart, sourceStart + w * 4), targetStart);
    }
  });

  return { width: sheetWidth, height: h, data: sheetData };
}
