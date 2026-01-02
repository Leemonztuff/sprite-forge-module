
import { GoogleGenAI, Type } from "@google/genai";
import { ForgeConfig, MannequinParams, RiggingData, ChatMessage } from "../types";
import { PixelData } from "../core/types";

export class GeminiService {
  private static readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private static readonly IMAGE_MODEL = 'gemini-2.5-flash-image';

  static async enhancePrompt(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: this.TEXT_MODEL,
      contents: `TECHNICAL_OUTFIT_ANALYST: Analyze this clothing request: "${prompt}". 
      List only the garments, armor pieces, and materials. 
      CRITICAL: Designs must fit over a standard humanoid character base.`,
      config: {
        systemInstruction: "You are a professional game character artist specializing in equipment design."
      }
    });
    return response.text?.trim() || prompt;
  }

  static async callAI(userIntent: string, img: PixelData, mask: Uint8Array, config: ForgeConfig): Promise<PixelData> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
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
          { text: `SPRITE_OVERLAY_ENGINE.
            OUTFIT: ${userIntent}.
            RULES: 
            1. Maintain original character silhouette, face, and skin tone.
            2. Paint the new outfit directly OVER the mannequin.
            3. Background MUST remain SOLID MAGENTA (#FF00FF).
            4. 2D pixel art style, high contrast, clean edges.` }
        ]
      },
      config: { imageConfig: { aspectRatio: '1:1' } }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("IA_ERROR: No se pudo sintetizar la ropa.");

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const prompt = `MANNEQUIN_GENESIS: Technical 2D sprite asset. 
    A grey clay anatomical humanoid mannequin, ${params.build} build, front view. 
    STRICTLY NAKED, NO HAIR, NO CLOTHES. 
    Background: SOLID MAGENTA (#FF00FF).
    Professional anatomical dummy, pixel art style.`;
    
    const response = await ai.models.generateContent({
      model: this.IMAGE_MODEL,
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: '1:1' } },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("GENESIS_FAIL: No se pudo generar la base.");
  }

  static async analyzeRigging(url: string): Promise<RiggingData> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: this.TEXT_MODEL,
      contents: { 
        parts: [
          { inlineData: { data: url.split(',')[1], mimeType: 'image/png' } }, 
          { text: "Map joints for character rigging: head, neck, shoulders, elbows, wrists, pelvis, knees, ankles." }
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: this.TEXT_MODEL,
      contents: messages.map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      })),
      config: { 
        systemInstruction: "You are the SpriteForge Oracle. Help users define perfect clothing descriptions." 
      }
    });
    return response.text || "";
  }
}
