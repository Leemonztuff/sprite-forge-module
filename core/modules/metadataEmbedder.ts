
import { PixelData, SpriteMetadata } from '../types';

/**
 * Módulo 30: Adjunta metadatos técnicos al objeto de imagen para trazabilidad.
 */
export function embedMetadata(img: PixelData, meta: SpriteMetadata): PixelData & { meta: SpriteMetadata } {
  return {
    ...img,
    meta
  };
}
