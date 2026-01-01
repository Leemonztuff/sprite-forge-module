
import { GoogleGenAI, Type } from "@google/genai";
import { ForgeConfig, MannequinParams, RiggingData, ChatMessage, BillingMode } from "../types";
import { PixelData } from "../core/types";

export class GeminiService {
  private static getTextModel(mode: BillingMode): string {
    return mode === 'ultra' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  }

  private static getImageModel(mode: BillingMode): string {
    return mode === 'ultra' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  }

  static async enhancePrompt(prompt: string, mode: BillingMode = 'standard'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: this.getTextModel(mode),
      contents: `TECHNICAL_OUTFIT_DECODER: Convert the following user request into a layered clothing description for a character sprite: "${prompt}". 
      List only the garments, armor pieces, and materials. 
      CRITICAL: The equipment must be designed to fit a standard humanoid base.`,
      config: {
        systemInstruction: "You are a professional game character artist. You define outfits that can be painted over an anatomical base."
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

    const model = this.getImageModel(config.billingMode);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/png' } },
          { text: `OUTFIT_SYNTHESIS_PROTOCOL.
            OUTFIT: ${userIntent}.
            ACTION: Paint the outfit OVER the provided mannequin.
            CONSTRAINTS: 
            1. DO NOT change skin tone, pose, face, or limb proportions.
            2. The character must remain in the same exact spot.
            3. Background MUST be solid Magenta (#FF00FF).
            4. Style: Sharp 2D pixel art, game-ready sprite.
            5. ONLY add the equipment requested.` }
        ]
      },
      config: model === 'gemini-3-pro-image-preview' ? { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } } : undefined
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("La IA no pudo procesar la vestimenta. Reintenta.");

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
    const model = this.getImageModel(config.billingMode);

    // Prompt mandatorio para base desnuda
    const prompt = `SPRITE_GENESIS: Technical 2D pixel art character asset. 
    A grey clay anatomical humanoid mannequin. 
    STRICT_REQUIREMENT: NAKED, NO CLOTHES, NO HAIR, NO ACCESSORIES. 
    BUILD: ${params.build} body type. 
    POSE: T-pose or neutral frontal stance.
    BACKGROUND: Solid Magenta (#FF00FF).
    Professional game art, clean pixel edges, anatomical dummy.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: model === 'gemini-3-pro-image-preview' ? { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } } : { imageConfig: { aspectRatio: '1:1' } },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("No se pudo sintetizar el maniquí base. Verifica la cuota de la API.");
  }

  static async analyzeRigging(url: string, mode: BillingMode = 'standard'): Promise<RiggingData> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: this.getTextModel(mode),
      contents: { 
        parts: [
          { inlineData: { data: url.split(',')[1], mimeType: 'image/png' } }, 
          { text: "Locate joints: head, neck, shoulders, elbows, wrists, pelvis, knees, ankles." }
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

  static async getStructuredPrompt(messages: ChatMessage[], mode: BillingMode = 'standard'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: this.getTextModel(mode),
      contents: messages.map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      })),
      config: { 
        systemInstruction: "You are the SpriteForge Oracle. Help users design outfits for character bases." 
      }
    });
    return response.text || "";
  }
}
