
import { GoogleGenAI, Type } from "@google/genai";
import { ForgeConfig, MannequinParams, RiggingData, ChatMessage } from "../types";
import { PixelData } from "../core/types";

export class GeminiService {
  private static readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private static readonly IMAGE_MODEL = 'gemini-2.5-flash-image';

  /**
   * Verifica y asegura la conexión con la API Key.
   * Si no hay llave, intenta disparar el selector oficial.
   */
  private static async ensureAuth(): Promise<string> {
    const key = process.env.API_KEY;
    
    // Si la llave ya existe, procedemos
    if (key && key.length > 5) return key;

    // Si no hay llave, intentamos verificar con el bridge de AI Studio
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Tras abrir el selector, el usuario debe elegir. 
        // Lanzamos error para que la UI se actualice y el usuario reintente.
        throw new Error("AUTH_REQUIRED: Por favor, selecciona tu API Key en el diálogo de Google AI Studio.");
      }
    }

    if (!key) {
      throw new Error("AUTH_REQUIRED: API Key no detectada. Haz clic en 'Vincular API Key'.");
    }

    return key;
  }

  private static handleAIError(error: any): never {
    console.error("[AI_CORE_FAULT]:", error);
    const msg = error.message || "";
    
    if (msg.includes("API key is missing") || msg.includes("AUTH_REQUIRED")) {
      throw new Error("AUTH_REQUIRED: Enlace neuronal fallido. Vincula tu API Key de AI Studio.");
    }
    
    if (msg.includes("429")) {
      throw new Error("LIMITE_EXCEDIDO: Demasiadas peticiones. Espera 60 segundos.");
    }

    if (msg.includes("not found")) {
      if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
        (window as any).aistudio.openSelectKey();
      }
      throw new Error("SESIÓN_CADUCADA: Re-vincula tu API Key.");
    }

    throw new Error(msg || "ERROR_SINTESIS_IA");
  }

  static async enhancePrompt(prompt: string): Promise<string> {
    try {
      const apiKey = await this.ensureAuth();
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: `Analiza y expande este concepto de equipo RPG: "${prompt}". Enfócate en materiales de pixel art (metal, cuero, tela rúnica). Devuelve solo el prompt optimizado.`,
      });
      return response.text?.trim() || prompt;
    } catch (e) {
      this.handleAIError(e);
    }
  }

  static async callAI(userIntent: string, img: PixelData, mask: Uint8Array, config: ForgeConfig): Promise<PixelData> {
    try {
      const apiKey = await this.ensureAuth();
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
