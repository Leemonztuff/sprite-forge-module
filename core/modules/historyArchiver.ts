
import { PixelData } from '../types';

/**
 * Módulo 27: Archiva un estado de imagen en el historial de linaje.
 */
export async function archiveState(history: PixelData[], currentState: PixelData): Promise<PixelData[]> {
  // En una implementación real, esto podría interactuar con IndexedDB o persistencia
  const newHistory = [...history, structuredClone(currentState)];
  return newHistory;
}
