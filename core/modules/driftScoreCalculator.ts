
/**
 * Módulo 26: Calcula un puntaje de 0 a 1 basado en la varianza de píxeles.
 * 1 = Identidad perfecta, 0 = Deriva total.
 */
export function calculateDriftScore(delta: Uint8Array): number {
  let driftCount = 0;
  for (let i = 0; i < delta.length; i++) {
    if (delta[i] > 0) driftCount++;
  }
  return 1 - (driftCount / delta.length);
}
