
import { GoogleGenAI, Type } from "@google/genai";
import { ForgeConfig, MannequinParams, RiggingData, ChatMessage } from "../types";
import { PixelData } from "../core/types";

export class GeminiService {
  private static readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private static readonly IMAGE_MODEL = 'gemini-2.5-flash-image';

  private static getAI() {
    // Se usa la clave del entorno directamente sin validación previa para evitar bloqueos en Vercel
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  static async enhancePrompt(prompt: string): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: this.TEXT_MODEL,
      contents: `OUTFIT_ANALYST: Analyze this equipment request: "${prompt}". 
      List only visible garments and materials. Ensure they are designed to be worn over a humanoid base.`,
      config: {
        systemInstruction: "You are a professional game artist specialized in character equipment and sprites."
      }
    });
    return response.text?.trim() || prompt;
  }

  static async callAI(userIntent: string, img: PixelData, mask: Uint8Array, config: ForgeConfig): Promise<PixelData> {
    const ai = this.getAI();
    
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
          { text: `SPRITE_LAYER_SYSTEM: Paint the following outfit over the character: ${userIntent}.
            RULES: 
            1. Preserve character pose, skin color, and silhouette.
            2. Background MUST be solid #FF00FF (Magenta).
            3. 2D pixel art style, no anti-aliasing, clean edges.
            4. Add clothing and armor directly over the base mannequin.` }
        ]
      },
      config: { imageConfig: { aspectRatio: '1:1' } }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("ERROR_SINTESIS: No se recibió imagen del motor.");

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
  }

  static async generateBaseMannequin(config: ForgeConfig, params: MannequinParams): Promise<string> {
    const ai = this.getAI();

    const prompt = `SPRITE_BASE_GENESIS: Technical 2D pixel art character base.
    A featureless grey clay humanoid mannequin, anatomical dummy, standing pose, front view.
    CRITICAL: NO CLOTHES, NO HAIR, NO ACCESSORIES, NO FACE.
    Background: SOLID MAGENTA (#FF00FF).
    Sharp 2D sprite asset for game development.`;
    
    const response = await ai.models.generateContent({
      model: this.IMAGE_MODEL,
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: '1:1' } },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("GENESIS_FAILED: Fallo al generar el maniquí base.");
  }

  static async analyzeRigging(url: string): Promise<RiggingData> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: this.TEXT_MODEL,
      contents: { 
        parts: [
          { inlineData: { data: url.split(',')[1], mimeType: 'image/png' } }, 
          { text: "Identify joints for standard 2D rigging: head, neck, shoulders, elbows, wrists, pelvis, knees, ankles." }
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
  }

  static async getStructuredPrompt(messages: ChatMessage[]): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: this.TEXT_MODEL,
      contents: messages.map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      })),
      config: { 
        systemInstruction: "You are the SpriteForge Oracle. Help create precise equipment descriptions for character bases." 
      }
    });
    return response.text || "";
  }
}
