import { ForgeConfig, MannequinParams, RiggingData } from '../../types';
import { PixelData } from '../types';

export interface AIExecutionResult {
  success: boolean;
  data?: PixelData;
  error?: string;
  metadata?: {
    processingTime: number;
    tokensUsed: number;
    modelVersion: string;
  };
}

export interface AIExecutorConfig {
  maxRetries: number;
  timeoutMs: number;
  qualityPreset: 'fast' | 'balanced' | 'high';
}

export class AIExecutor {
  private static readonly DEFAULT_CONFIG: AIExecutorConfig = {
    maxRetries: 3,
    timeoutMs: 30000,
    qualityPreset: 'balanced'
  };

  /**
   * Executes AI-based sprite generation with the given parameters
   * @param prompt User description of the desired sprite
   * @param baseImage Base pixel data to work with
   * @param mask Optional mask for selective processing
   * @param config Generation configuration
   * @returns Promise<AIExecutionResult>
   */
  static async executeSpriteGeneration(
    prompt: string,
    baseImage: PixelData,
    mask?: Uint8Array,
    config: Partial<AIExecutorConfig> = {}
  ): Promise<AIExecutionResult> {
    const executionConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now();

    try {
      // Validate inputs
      this.validateInputs(prompt, baseImage);

      // Execute with retry logic
      const result = await this.executeWithRetry(
        () => this.performGeneration(prompt, baseImage, mask, executionConfig),
        executionConfig.maxRetries
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        metadata: {
          processingTime,
          tokensUsed: this.estimateTokenUsage(prompt),
          modelVersion: 'gemini-2.5-flash'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          modelVersion: 'gemini-2.5-flash'
        }
      };
    }
  }

  /**
   * Generates a base mannequin sprite for character creation
   * @param params Physical characteristics of the mannequin
   * @param config Generation configuration
   */
  static async generateMannequin(
    params: MannequinParams,
    config: Partial<AIExecutorConfig> = {}
  ): Promise<AIExecutionResult> {
    const executionConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now();

    try {
      // Build mannequin prompt based on parameters
      const prompt = this.buildMannequinPrompt(params);

      // Create base image data (transparent background)
      const baseImage: PixelData = {
        width: 512,
        height: 512,
        data: new Uint8ClampedArray(512 * 512 * 4).fill(0)
      };

      // Execute with retry logic
      const result = await this.executeWithRetry(
        () => this.performGeneration(prompt, baseImage, undefined, executionConfig),
        executionConfig.maxRetries
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        metadata: {
          processingTime,
          tokensUsed: this.estimateTokenUsage(prompt),
          modelVersion: 'gemini-2.5-flash'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate mannequin',
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          modelVersion: 'gemini-2.5-flash'
        }
      };
    }
  }

  /**
   * Analyzes sprite rigging points for skeletal animation
   * @param imageData Sprite image to analyze
   * @param config Analysis configuration
   */
  static async analyzeRigging(
    imageData: PixelData,
    config: Partial<AIExecutorConfig> = {}
  ): Promise<{ success: boolean; data?: RiggingData; error?: string }> {
    const executionConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now();

    try {
      // Convert image data to base64 for analysis
      const base64Image = this.pixelDataToBase64(imageData);

      // Build rigging analysis prompt
      const prompt = "Identify standard RPG sprite joints for 2D skeletal rigging. Return JSON with joint coordinates.";

      // Execute with retry logic
      const analysis = await this.executeWithRetry(
        () => this.performTextAnalysis(prompt, base64Image, executionConfig),
        executionConfig.maxRetries
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: JSON.parse(analysis),
        metadata: {
          processingTime,
          tokensUsed: this.estimateTokenUsage(prompt),
          modelVersion: 'gemini-3-flash-preview'
        }
      } as any;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze rigging',
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          modelVersion: 'gemini-3-flash-preview'
        }
      } as any;
    }
  }

  /**
   * Enhances and optimizes user prompts for better AI generation results
   * @param originalPrompt Raw user input prompt
   * @param config Enhancement configuration
   */
  static async enhancePrompt(
    originalPrompt: string,
    config: Partial<AIExecutorConfig> = {}
  ): Promise<AIExecutionResult> {
    const executionConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now();

    try {
      // Validate prompt
      if (!originalPrompt || originalPrompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty');
      }

      // Build enhancement prompt
      const enhancementPrompt = `Analyze and expand this RPG equipment concept: "${originalPrompt}". Focus on pixel art materials (metal, leather, rune fabric). Return only the optimized prompt.`;

      // Execute with retry logic
      const enhancedPrompt = await this.executeWithRetry(
        () => this.performTextGeneration(enhancementPrompt, executionConfig),
        executionConfig.maxRetries
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: enhancedPrompt as any,
        metadata: {
          processingTime,
          tokensUsed: this.estimateTokenUsage(originalPrompt) + this.estimateTokenUsage(enhancementPrompt),
          modelVersion: 'gemini-3-flash-preview'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enhance prompt',
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          modelVersion: 'gemini-3-flash-preview'
        }
      };
    }
  }

  // Private helper methods

  private static validateInputs(prompt: string, baseImage: PixelData): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (!baseImage || !baseImage.data || baseImage.data.length === 0) {
      throw new Error('Base image data is required');
    }

    if (baseImage.width <= 0 || baseImage.height <= 0) {
      throw new Error('Invalid image dimensions');
    }

    const expectedLength = baseImage.width * baseImage.height * 4;
    if (baseImage.data.length !== expectedLength) {
      throw new Error('Image data length does not match dimensions');
    }
  }

  private static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    currentAttempt: number = 0
  ): Promise<T> {
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), 30000)
        )
      ]);
    } catch (error) {
      if (currentAttempt >= maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, currentAttempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.executeWithRetry(operation, maxRetries, currentAttempt + 1);
    }
  }

  private static async performGeneration(
    prompt: string,
    baseImage: PixelData,
    mask: Uint8Array | undefined,
    config: AIExecutorConfig
  ): Promise<PixelData> {
    // This would integrate with the actual AI service
    // For now, return a mock implementation
    const { GeminiService } = await import('../../services/geminiService');
    
    return await GeminiService.callAI(prompt, baseImage, mask || new Uint8Array(), {
      mode: 'Draft',
      model: 'gemini-2.5-flash-image',
      aspectRatio: '1:1',
      mutationStrength: 50,
      seed: Math.floor(Math.random() * 1000000),
      protocols: {
        backgroundStyle: 'magenta',
        pixelPerfect: true,
        strongOutline: false,
        hd2dStyle: false
      },
      neuralChain: [],
      isSeedLocked: false,
      size: '1K'
    });
  }

  private static async performTextGeneration(
    prompt: string,
    config: AIExecutorConfig
  ): Promise<string> {
    const { GeminiService } = await import('../../services/geminiService');
    return await GeminiService.enhancePrompt(prompt);
  }

  private static async performTextAnalysis(
    prompt: string,
    imageData: string,
    config: AIExecutorConfig
  ): Promise<string> {
    const { GeminiService } = await import('../../services/geminiService');
    
    // Create a mock pixel data for analysis
    const mockPixelData: PixelData = {
      width: 512,
      height: 512,
      data: new Uint8ClampedArray(512 * 512 * 4).fill(0)
    };

    const riggingData = await GeminiService.analyzeRigging(imageData);
    return JSON.stringify(riggingData);
  }

  private static buildMannequinPrompt(params: MannequinParams): string {
    return `SPRITE_BASE_MANNEQUIN: A featureless, grey humanoid dummy, ${params.gender}, ${params.build} build, standing front view, no clothes, no hair, no eyes. 2D RPG pixel art style. Background solid #FF00FF. High quality game asset.`;
  }

  private static estimateTokenUsage(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private static pixelDataToBase64(pixelData: PixelData): string {
    // Convert pixel data to base64 image
    const canvas = document.createElement('canvas');
    canvas.width = pixelData.width;
    canvas.height = pixelData.height;
    
    const ctx = canvas.getContext('2d')!;
    const imageData = new ImageData(pixelData.data, pixelData.width, pixelData.height);
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL('image/png');
  }
}

// Export singleton instance for backward compatibility
export const aiExecutor = {
  execute: AIExecutor.executeSpriteGeneration,
  generateMannequin: AIExecutor.generateMannequin,
  analyzeRigging: AIExecutor.analyzeRigging,
  enhancePrompt: AIExecutor.enhancePrompt
};