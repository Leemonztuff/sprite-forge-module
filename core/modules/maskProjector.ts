
/**
 * Módulo 15: Normaliza una máscara a valores binarios puros (0 o 255).
 */
export function projectMask(mask: Uint8Array): Uint8Array {
  const projected = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i++) {
    projected[i] = mask[i] > 0 ? 255 : 0;
  }
  return projected;
}
