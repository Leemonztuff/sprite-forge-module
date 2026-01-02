
import { GoogleGenAI, Type } from "@google/genai";
import { ForgeConfig, MannequinParams, RiggingData, ChatMessage } from "../types";
import { PixelData } from "../core/types";

export class GeminiService {
  private static readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private static readonly IMAGE_MODEL = 'gemini-2.5-flash-image';

  /**
   * Asegura que el usuario tenga una llave seleccionada antes de proceder.
   */
  private static async ensureKeyConnection() {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Según documentación: "assume the key selection was successful after triggering openSelectKey and proceed"
      }
    }
  }

  private static handleAIError(error: any): never {
    console.error("[AI_FAULT]:", error);
    const msg = error.message || "";
    if (msg.includes("429")) throw new Error("MOTOR_SATURADO: Límite de ráfaga alcanzado. Espera 60s.");
    if (msg.includes("not found")) {
      // Si la entidad no se encuentra, es probable que la llave no esté vinculada correctamente
      if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
        (window as any).aistudio.openSelectKey();
      }
      throw new Error("RECONEXIÓN_REQUERIDA: Selecciona una API Key válida.");
    }
    throw new Error(msg || "ERROR_SINTESIS_IA");
  }

  static async enhancePrompt(prompt: string): Promise<string> {
    try {
      await this.ensureKeyConnection();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: `Analiza y mejora este prompt de pixel art para RPG: "${prompt}". Devuelve solo la descripción mejorada.`,
      });
      return response.text?.trim() || prompt;
    } catch (e) {
      this.handleAIError(e);
    }
  }

  static async callAI(userIntent: string, img: PixelData, mask: Uint8Array, config: ForgeConfig): Promise<PixelData> {
    try {
      await this.ensureKeyConnection();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
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
            { text: `SPRITE_LAYER: Paint the following outfit over the mannequin: ${userIntent}. 
              Keep pose and silhouette. Solid #FF00FF background. 2D pixel art asset.` }
          ]
        },
        config: { imageConfig: { aspectRatio: '1:1' } }
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!part?.inlineData?.data) throw new Error("No se recibió imagen.");

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
      this.handleAIError(e);
    }
  }

  static async generateBaseMannequin(config: ForgeConfig, params: MannequinParams): Promise<string> {
    try {
      await this.ensureKeyConnection();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      const prompt = `SPRITE_BASE: Humanoid mannequin dummy, ${params.gender}, ${params.build} build, standing pose, front view, 2D pixel art. No clothes. Background #FF00FF.`;
      
      const response = await ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: '1:1' } },
      });
      
      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
      throw new Error("Fallo al generar base.");
    } catch (e) {
      this.handleAIError(e);
    }
  }

  static async analyzeRigging(url: string): Promise<RiggingData> {
    try {
      await this.ensureKeyConnection();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: { 
          parts: [
            { inlineData: { data: url.split(',')[1], mimeType: 'image/png' } }, 
            { text: "Identify joints for 2D rigging in JSON." }
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
                    x: { type: Number },
                    y: { type: Number }
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
      await this.ensureKeyConnection();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: messages.map(m => ({ 
          role: m.role === 'assistant' ? 'model' : 'user', 
          parts: [{ text: m.content }] 
        })),
        config: { systemInstruction: "Ayuda a diseñar descripciones precisas para sprites de RPG." }
      });
      return response.text || "";
    } catch (e) {
      this.handleAIError(e);
    }
  }
}
