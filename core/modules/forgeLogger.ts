
/**
 * Módulo 35: Registra cada evento de síntesis para auditoría técnica.
 */
export function logForge(userId: string, prompt: string, status: 'SUCCESS' | 'FAILURE'): void {
  console.log(`[FORGE_AUDIT] User: ${userId} | Prompt: ${prompt.slice(0, 30)}... | Status: ${status}`);
}
