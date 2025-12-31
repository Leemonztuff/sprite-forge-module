
/**
 * Módulo 18: Valida si los cambios ocurrieron fuera de la zona permitida (máscara).
 * Si un píxel cambió (delta > 0) pero la máscara dice que no debía tocarse (mask === 0),
 * se considera una "deriva" (drift) y el asset es marcado para rechazo.
 */
export function validateDrift(delta: Uint8Array, mask: Uint8Array): boolean {
  for (let i = 0; i < delta.length; i++) {
    if (delta[i] > 0 && mask[i] === 0) {
      return false; // Violación de integridad detectada
    }
  }
  return true; // Integridad mantenida
}
