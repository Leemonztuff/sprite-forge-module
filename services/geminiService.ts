
import { GoogleGenAI, Type } from "@google/genai";
import { ForgeConfig, MannequinParams, RiggingData, ChatMessage } from "../types";
import { PixelData } from "../core/types";
import { ApiKeyManager, RotationConfig } from "./apiKeyManager";

export class GeminiService {
  private static readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private static readonly IMAGE_MODEL = 'gemini-2.5-flash-image';
  private static isInitialized = false;

  /**
   * Inicializa el sistema de rotación de API keys
   */
  static async initializeRotation(config?: RotationConfig): Promise<void> {
    if (this.isInitialized) return;

    if (!config) {
      // Configuración por defecto con keys de entorno
      const envKeys = [
        { key: process.env.API_KEY, name: "Primary", priority: 10 },
        { key: process.env.GEMINI_API_KEY_2, name: "Secondary", priority: 8 },
        { key: process.env.GEMINI_API_KEY_3, name: "Tertiary", priority: 6 },
      ].filter(k => k.key && k.key.length > 5);

      config = {
        keys: envKeys.map(k => ({
          id: crypto.randomUUID(),
          name: k.name,
          key: k.key!,
          quotaUsed: 0,
          quotaLimit: 15000, // Límite diario para free tier
          lastUsed: Date.now(),
          isActive: true,
          priority: k.priority
        })),
        strategy: 'priority',
        autoRotate: true,
        quotaThreshold: 80,
        retryWithDifferentKey: true,
        maxRetriesPerKey: 3
      };
    }

    ApiKeyManager.initialize(config);
    this.isInitialized = true;
  }

  /**
   * Verifica y asegura la conexión con API Key con rotación automática.
   */
  private static async ensureAuth(): Promise<string> {
    if (!this.isInitialized) {
      await this.initializeRotation();
    }

    // Intentar obtener una key disponible
    let apiKey = await ApiKeyManager.getNextAvailableKey();
    
    if (apiKey) {
      return apiKey;
    }

    // Si no hay keys disponibles, intentar con el bridge de AI Studio
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // Disparar evento para que la UI muestre diálogo de añadir key
        window.dispatchEvent(new CustomEvent('require-api-key', {
          detail: { 
            message: "Se necesitan más API keys para continuar operando",
            showAddKeyDialog: true
          }
        }));
        
        throw new Error("QUOTA_EXHAUSTED: Todas las API keys han agotado su cuota. Por favor, añade una nueva key.");
      }
      
      // Obtener key del bridge
      await (window as any).aistudio.openSelectKey();
      throw new Error("AUTH_REQUIRED: Por favor, selecciona tu API Key en el diálogo de Google AI Studio.");
    }

    throw new Error("AUTH_REQUIRED: No hay API keys disponibles. Añade al menos una key para continuar.");
  }

  private static async handleAIError(error: any, usedApiKey?: string): Promise<never> {
    console.error("[AI_CORE_FAULT]:", error);
    const msg = error.message || "";
    
    // Marcar key como fallida si aplica
    if (usedApiKey) {
      await ApiKeyManager.markKeyFailed(usedApiKey, error);
    }
    
    if (msg.includes("API key is missing") || msg.includes("AUTH_REQUIRED")) {
      if (usedApiKey) {
        await ApiKeyManager.markKeyFailed(usedApiKey, error);
      }
      throw new Error("AUTH_REQUIRED: Enlace neuronal fallido. Vincula tu API Key de AI Studio.");
    }
    
    if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      if (usedApiKey) {
        await ApiKeyManager.markKeyFailed(usedApiKey, error);
      }
      
      // Intentar con otra key si está habilitado
      const nextKey = await ApiKeyManager.getNextAvailableKey();
      if (nextKey) {
        throw new Error("QUOTA_ROTATION: Rotando a siguiente API Key disponible...");
      }
      
      throw new Error("QUOTA_EXHAUSTED: Todas las API keys han agotado su cuota. Añade una nueva key para continuar.");
    }

    if (msg.includes("not found") || msg.includes("INVALID_ARGUMENT")) {
      if (usedApiKey) {
        await ApiKeyManager.markKeyFailed(usedApiKey, error);
      }
      throw new Error("SESIÓN_CADUCADA: Re-vincula tu API Key.");
    }

    throw new Error(msg || "ERROR_SINTESIS_IA");
  }

  static async enhancePrompt(prompt: string): Promise<string> {
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const apiKey = await this.ensureAuth();
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: this.TEXT_MODEL,
          contents: `Analiza y expande este concepto de equipo RPG: "${prompt}". Enfócate en materiales de pixel art (metal, cuero, tela rúnica). Devuelve solo el prompt optimizado.`,
        });
        
        // Marcar uso exitoso
        await ApiKeyManager.markKeyUsage(apiKey, 1);
        
        return response.text?.trim() || prompt;
        
      } catch (e: any) {
        if (e.message.includes("QUOTA_ROTATION") && retries < maxRetries - 1) {
          retries++;
          continue; // Reintentar con siguiente key
        }
        await this.handleAIError(e, undefined);
      }
    }
    
    throw new Error("RETRY_EXHAUSTED: No se pudo completar la operación después de reintentar con todas las keys.");
  }

  static async callAI(userIntent: string, img: PixelData, mask: Uint8Array, config: ForgeConfig): Promise<PixelData> {
    let retries = 0;
    const maxRetries = 3;
    let lastUsedApiKey: string | undefined;
    
    while (retries < maxRetries) {
      try {
        const apiKey = await this.ensureAuth();
        lastUsedApiKey = apiKey;
        const ai = new GoogleGenAI({ apiKey });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(new ImageData(img.data, img.width, img.height), 0, 0);
        const base64Image = canvas.toDataURL('image/png').split(',')[1];

        const response = await ai.models.generateContent({
          model: this.IMAGE_MODEL,
          contents: {
            parts: [
              { inlineData: { data: base64Image, mimeType: 'image/png' } },
              { text: `SPRITE_EQUIPMENT: Add the following outfit to this character base: ${userIntent}. 
                Keep the exact skin color and pose. Solid #FF00FF background. Output must be a clean 2D pixel art asset for a game.` }
            ]
          },
          config: { 
            imageConfig: { aspectRatio: '1:1' },
            thinkingConfig: { thinkingBudget: 0 } // Flash doesn't need high thinking for this
          }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (!part?.inlineData?.data) throw new Error("La IA no devolvió datos visuales.");

        const resultImg = new Image();
        resultImg.src = `data:image/png;base64,${part.inlineData.data}`;
        await new Promise(r => resultImg.onload = r);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(resultImg, 0, 0);
        
        // Marcar uso exitoso (estimar tokens para imagen)
        await ApiKeyManager.markKeyUsage(apiKey, 100); // Estimación de tokens para generación de imagen
        
        return { 
          width: canvas.width, 
          height: canvas.height, 
          data: ctx.getImageData(0, 0, canvas.width, canvas.height).data 
        };
        
      } catch (e: any) {
        if (e.message.includes("QUOTA_ROTATION") && retries < maxRetries - 1) {
          retries++;
          continue; // Reintentar con siguiente key
        }
        await this.handleAIError(e, lastUsedApiKey);
      }
    }
    
    throw new Error("RETRY_EXHAUSTED: No se pudo completar la operación después de reintentar con todas las keys.");
  }

  static async generateBaseMannequin(config: ForgeConfig, params: MannequinParams): Promise<string> {
    try {
      const apiKey = await this.ensureAuth();
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `SPRITE_BASE_MANNEQUIN: A featureless, grey humanoid dummy, ${params.gender}, ${params.build} build, standing front view, no clothes, no hair, no eyes. 2D RPG pixel art style. Background solid #FF00FF. High quality game asset.`;
      
      const response = await ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: '1:1' } },
      });
      
      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
      throw new Error("No se pudo sintetizar la base biológica.");
    } catch (e) {
      this.handleAIError(e);
    }
  }

  static async analyzeRigging(url: string): Promise<RiggingData> {
    try {
      const apiKey = await this.ensureAuth();
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: { 
          parts: [
            { inlineData: { data: url.split(',')[1], mimeType: 'image/png' } }, 
            { text: "Identify standard RPG sprite joints for 2D skeletal rigging." }
          ] 
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              joints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || '{"joints":[]}');
    } catch (e) {
      this.handleAIError(e);
    }
  }

  static async getStructuredPrompt(messages: ChatMessage[]): Promise<string> {
    try {
      const apiKey = await this.ensureAuth();
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: messages.map(m => ({ 
          role: m.role === 'assistant' ? 'model' : 'user', 
          parts: [{ text: m.content }] 
        })),
        config: { systemInstruction: "Eres un experto en diseño de personajes pixel art para videojuegos. Ayuda al usuario a definir outfits detallados." }
      });
      return response.text || "";
    } catch (e) {
      this.handleAIError(e);
    }
  }
}
