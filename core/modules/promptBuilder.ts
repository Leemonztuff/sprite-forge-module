
interface PromptParams {
  outfit: string;
  classType: string;
  theme: string;
}

/**
 * Módulo 14: Construye la directiva de forja para la IA.
 * Establece el rol de "cirujano de sprites" para limitar la intervención.
 */
export function buildPrompt({ outfit, classType, theme }: PromptParams): string {
  return `
    You are a pixel art sprite surgeon.
    Paint ONLY inside the mask.
    Keep original palette and lighting direction.
    Only repaint clothing and accessories.
    Outfit specification: ${outfit}
    Character Class: ${classType}
    Atmospheric Theme: ${theme}
    Style: Sharp 2D RPG pixel art, clean outlines.
  `.trim();
}
