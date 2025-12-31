
import { GoogleGenAI, Type } from "@google/genai";
import { ForgeConfig, MannequinParams, RiggingData, ChatMessage } from "../types";
import { PixelData } from "../core/types";

export class GeminiService {
  /**
   * Genera el cliente usando exclusivamente la variable de entorno protegida.
   */
  private static getClient(): GoogleGenAI {
    return new GoogleGenAI({ apiKey: process.env.API_KEY! });
  }

  static async enhancePrompt(prompt: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Enhance this RPG character outfit description for a 2D pixel art generator: "${prompt}". Focus on visual details, materials, and specific RPG elements. Keep it concise.`,
      config: {
        systemInstruction: "You are a specialized RPG asset prompt engineer. You take simple descriptions and turn them into detailed prompts for pixel art synthesis."
      }
    });
    return response.text?.trim() || prompt;
  }

  /**
   * Ejecuta el repintado quirúrgico (in-painting) para añadir atuendos.
   * Utiliza gemini-2.5-flash-image para manipulación de imagen.
   */
  static async callAI(userIntent: string, img: PixelData, mask: Uint8Array): Promise<PixelData> {
    const ai = this.getClient();
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(new ImageData(img.data, img.width, img.height), 0, 0);
    const base64Image = canvas.toDataURL('image/png').split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/png' } },
          { text: `OUTFIT_SYNTHESIS_PROTOCOL. 
            CHARACTER_BASE: Provided in image.
            DIRECTIVE: Dress this character with: ${userIntent}. 
            CONSTRAINTS: Strictly maintain the base anatomy, pose, and skin tone. Only modify or add clothing/equipment over the base. 
            STYLE: 2D Pixel Art, game-ready, sharp outlines. 
            BACKGROUND: Keep solid magenta #FF00FF.` }
        ]
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("AI_SYNTHESIS_REJECTED: El modelo no pudo procesar el atuendo.");

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
    const ai = this.getClient();
    const prompt = `RPG CHARACTER BASE: Full body ${params.gender} anatomy mannequin, ${params.build} build. Static T-Pose, front view. Neutral grey skin material, no facial features, no hair, NO clothes. Background: SOLID MAGENTA #FF00FF. High quality 2D pixel art asset.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: '1:1' } },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("GENESIS_FAILED: No se pudo generar el maniquí base.");
  }

  static async getStructuredPrompt(messages: ChatMessage[]): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: messages.map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      })),
      config: { 
        systemInstruction: "Eres el Oráculo de SpriteForge. Ayuda al usuario a diseñar atuendos RPG profesionales detallando materiales y capas." 
      }
    });
    return response.text || "";
  }

  static async analyzeRigging(url: string): Promise<RiggingData> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { inlineData: { data: url.split(',')[1], mimeType: 'image/png' } }, 
          { text: "Identify the main skeletal joints for this 2D character and return them in the requested JSON format." }
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
    return JSON.parse(response.text || "{}");
  }
}
