
import { PixelData } from '../types';

/**
 * Elimina píxeles que coinciden exactamente con el color del primer píxel (0,0).
 */
export function backgroundIsolator(img: PixelData): PixelData {
  const { data } = img;
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  for (let i = 0; i < data.length; i += 4) {
    const isSame = 
      data[i] === bgR && 
      data[i + 1] === bgG && 
      data[i + 2] === bgB;
    
    if (isSame) {
      data[i + 3] = 0;
    }
  }
  return img;
}
