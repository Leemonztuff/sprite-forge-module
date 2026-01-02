
import { GoogleGenAI, Type } from "@google/genai";
import { ForgeConfig, MannequinParams, RiggingData, ChatMessage } from "../types";
import { PixelData } from "../core/types";

/**
 * GeminiService Reconstruido v2.0
 * Implementa el protocolo BYOK (Bring Your Own Key) para entornos Vercel/Browser.
 */
export class GeminiService {
  private static readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private static readonly IMAGE_MODEL = 'gemini-2.5-flash-image';

  /**
   * Obtiene una instancia fresca del SDK.
   * Si no hay llave, solicita la apertura del selector de AI Studio.
   */
  private static async getAIInstance(): Promise<GoogleGenAI> {
    // 1. Verificar si ya tenemos una llave seleccionada
    const isKeySelected = typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey 
      ? await (window as any).aistudio.hasSelectedApiKey() 
      : !!process.env.API_KEY;

    // 2. Si no hay llave y estamos en el navegador, abrimos el selector
    if (!isKeySelected && typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // El flujo continua asumiendo que el usuario seleccionará una llave
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("ENLACE_REQUERIDO: Por favor, selecciona tu API Key de Google AI Studio para activar la forja.");
    }

    return new GoogleGenAI({ apiKey });
  }

  /**
   * Manejador de errores estandarizado para la industria.
   */
  private static handleError(error: any): never {
    console.error("[AI_CORE_ERROR]:", error);
    const msg = error.message || "";
    
    if (msg.includes("429")) throw new Error("MOTOR_SATURADO: Límite de ráfaga (Free Tier). Espera 60s.");
    if (msg.includes("403")) throw new Error("ACCESO_DENEGADO: Tu API Key no tiene permisos o es inválida.");
    if (msg.includes("ENLACE_REQUERIDO")) throw error;
    
    throw new Error(`FALLO_SINTESIS: ${msg.slice(0, 50)}...`);
  }

  static async enhancePrompt(prompt: string): Promise<string> {
    try {
      const ai = await this.getAIInstance();
      const response = await ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: `OUTFIT_ANALYST: Improve this game asset prompt: "${prompt}". Focus on pixel art materials.`,
        config: { systemInstruction: "Expert pixel art game designer." }
      });
      return response.text?.trim() || prompt;
    } catch (e) {
      this.handleError(e);
    }
  }

  static async callAI(userIntent: string, img: PixelData, mask: Uint8Array, config: ForgeConfig): Promise<PixelData> {
    try {
      const ai = await this.getAIInstance();
      
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
            { text: `SPRITE_EQUIPMENT_SYSTEM: Paint this outfit: ${userIntent}. 
              Maintain silhouette and skin. Solid #FF00FF background. 2D pixel art.` }
          ]
        },
        config: { imageConfig: { aspectRatio: '1:1' } }
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!part?.inlineData?.data) throw new Error("La IA no devolvió datos visuales.");

      const resultImg = new Image();
      resultImg.src = `data:image/png;base64,${part.inlineData.data}`;
      await new Promise(r => resultImg.onload = r);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(resultImg, 0, 0);
      return { 
        width: canvas.width, 
        height: canvas.height, 
        data: ctx.getImageData(0, 0, canvas.width, canvas.height).data 
      };
    } catch (e) {
      this.handleError(e);
    }
  }

  static async generateBaseMannequin(config: ForgeConfig, params: MannequinParams): Promise<string> {
    try {
      const ai = await this.getAIInstance();
      const prompt = `SPRITE_BASE_GENESIS: Featureless grey dummy, 2D pixel art, standing, front view. Background solid magenta #FF00FF.`;
      
      const response = await ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: '1:1' } },
      });
      
      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
      throw new Error("No se pudo generar el maniquí.");
    } catch (e) {
      this.handleError(e);
    }
  }

  static async getStructuredPrompt(messages: ChatMessage[]): Promise<string> {
    try {
      const ai = await this.getAIInstance();
      const response = await ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: messages.map(m => ({ 
          role: m.role === 'assistant' ? 'model' : 'user', 
          parts: [{ text: m.content }] 
        })),
        config: { systemInstruction: "SpriteForge Oracle: Describe outfits for 2D sprites." }
      });
      return response.text || "";
    } catch (e) {
      this.handleError(e);
    }
  }

  static async analyzeRigging(url: string): Promise<RiggingData> {
    try {
      const ai = await this.getAIInstance();
      const response = await ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: { 
          parts: [
            { inlineData: { data: url.split(',')[1], mimeType: 'image/png' } }, 
            { text: "Identify standard 2D rigging joints." }
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
      this.handleError(e);
    }
  }
}
