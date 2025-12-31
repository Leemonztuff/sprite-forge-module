
import { UserSession } from '../types';

/**
 * Módulo 34: Verifica si el usuario tiene créditos disponibles para la operación.
 */
export function checkQuota(session: UserSession): boolean {
  if (!session.user) return false;
  return session.user.credits > 0;
}
