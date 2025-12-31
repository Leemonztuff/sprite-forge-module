
/**
 * Módulo 31: Determina el multiplicador de super-sampling basado en el preset.
 */
export function applyQualityPreset(preset: 'draft' | 'masterpiece'): number {
  return preset === "masterpiece" ? 2 : 1;
}
