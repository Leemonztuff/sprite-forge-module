
/**
 * Módulo 13: Genera las restricciones negativas para el motor de IA.
 * Asegura que la anatomía y rasgos base permanezcan inalterados.
 */
export function buildNegativePrompt(): string {
  return `
    no anatomy change,
    no body reshape,
    no face change,
    no eye change,
    no hair change,
    no pose change,
    no silhouette change,
    blur, low quality, artifacts, distorted pixels
  `.trim();
}
