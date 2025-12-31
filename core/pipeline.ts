
import { PixelData, Skeleton } from './types';
import { alphaCleaner } from "./modules/alphaCleaner";
import { backgroundIsolator } from "./modules/backgroundIsolator";
import { extractPalette } from "./modules/paletteExtractor";
import { buildSilhouetteMask } from "./modules/silhouetteMasker";
import { detectSkeleton } from "./modules/skeletonDetector";
import { buildIdentityHash } from "./modules/identityHash";
import { buildNegativePrompt } from "./modules/negativePromptBuilder";
import { buildPrompt } from "./modules/promptBuilder";
import { projectMask } from "./modules/maskProjector";
import { deltaMap } from "./modules/deltaPixelAnalyzer";
import { validateDrift } from "./modules/driftRejector";
import { harmonizePalette } from "./modules/paletteHarmonizer";
import { snapPixels } from "./modules/pixelSnapper";
import { cleanNoise } from "./modules/noiseCleaner";
import { generatePoses } from "./modules/multiPoseGenerator";
import { composeSpriteSheet } from "./modules/spriteSheetComposer";
import { calculateDriftScore } from "./modules/driftScoreCalculator";
import { lockPose } from "./modules/poseLock";
import { headRatio, bustRatio, hipRatio } from "./modules/ratioLocks";
import { transparencyPurifier } from "./modules/transparencyPurifier";
import { outlineUnifier } from "./modules/outlineUnifier";

export interface ForgeResult {
  image: PixelData;
  identity: string;
  drift: number;
}

/**
 * SpriteForge Neural Pipeline - Versión Final Modular
 */
export class SpriteForgePipeline {
  static async forgeSprite({ 
    baseImage, 
    outfit, 
    classType, 
    theme, 
    sheetMode,
    aiExecutor 
  }: {
    baseImage: PixelData,
    outfit: string,
    classType: string,
    theme: string,
    sheetMode: boolean,
    aiExecutor: (prompt: string, img: PixelData, mask: Uint8Array) => Promise<PixelData>
  }): Promise<ForgeResult> {

    // 1-2. Limpieza determinista
    let img = alphaCleaner(baseImage);
    img = backgroundIsolator(img);

    // 3-6. Extracción genómica
    const palette = extractPalette(img);
    const mask = buildSilhouetteMask(img);
    const skeleton = detectSkeleton(img);
    const identity = buildIdentityHash(img);

    // 13-14. Preparación de directivas IA
    const prompt = buildPrompt({ outfit, classType, theme });
    const negative = buildNegativePrompt();

    // 15-16. Ejecución quirúrgica (In-painting)
    const aiResult = await aiExecutor(prompt + "\n" + negative, img, projectMask(mask));

    // 17-18. Auditoría de integridad (Drift Rejector)
    const delta = deltaMap(img, aiResult);
    const newSkeleton = detectSkeleton(aiResult);

    // Validación cruzada: Delta de píxeles + Cambio de postura
    if (!validateDrift(delta, mask) || !lockPose(skeleton, newSkeleton)) {
      throw new Error("IDENTITY_DRIFT");
    }

    // 19-21. Post-procesado Game-Ready
    let final = harmonizePalette(img, aiResult, palette);
    final = snapPixels(final);
    final = cleanNoise(final);
    
    // Purificadores de consistencia técnica
    final = transparencyPurifier(final);
    final = outlineUnifier(final);

    // 22-25. Ensamblado de plataforma
    if (sheetMode) {
      const poses = generatePoses(final, skeleton);
      final = composeSpriteSheet(poses);
    }

    // 26. Cálculo de score de fidelidad
    return {
      image: final,
      identity,
      drift: calculateDriftScore(delta)
    };
  }

  static analyzeIdentity(img: PixelData) {
    return {
      hash: buildIdentityHash(img),
      skeleton: detectSkeleton(img),
      ratios: {
        head: headRatio(img),
        bust: bustRatio(img),
        hip: hipRatio(img)
      }
    };
  }

  static processGameReady(img: PixelData, targetPalette?: number[][]): PixelData {
    let result = backgroundIsolator(img);
    result = alphaCleaner(result);
    result = transparencyPurifier(result);
    result = snapPixels(result);
    return result;
  }
}
