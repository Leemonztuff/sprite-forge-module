
import { PixelData } from '../types';

/**
 * Elimina el fondo basándose en el color del primer píxel o el Magenta técnico.
 * Incluye una pequeña tolerancia para evitar halos rosas.
 */
export function backgroundIsolator(img: PixelData): PixelData {
  const { data } = img;
  
  // Color objetivo (Magenta técnico por defecto en SpriteForge)
  const targetR = 255;
  const targetG = 0;
  const targetB = 255;
  
  // También detectamos el color del primer píxel como respaldo
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  const tolerance = 45; // Tolerancia para capturar halos cerca de los bordes

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Comprobamos si el píxel es cercano al magenta o al color de fondo detectado
    const isMagenta = 
      Math.abs(r - targetR) < tolerance && 
      Math.abs(g - targetG) < tolerance && 
      Math.abs(b - targetB) < tolerance;
      
    const isBackground = 
      Math.abs(r - bgR) < tolerance && 
      Math.abs(g - bgG) < tolerance && 
      Math.abs(b - bgB) < tolerance;
    
    if (isMagenta || isBackground) {
      data[i + 3] = 0;
    }
  }
  return img;
}
