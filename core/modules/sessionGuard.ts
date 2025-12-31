
import { UserSession } from '../types';

/**
 * Módulo 33: Valida que la sesión actual sea válida para realizar forjas.
 */
export function validateSession(session: UserSession | null): boolean {
  return !!session?.user;
}
