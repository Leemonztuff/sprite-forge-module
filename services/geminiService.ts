
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
      contents: `OUTFIT_ENGINEER_PROTOCOL: Convert this outfit request into a technical layer description: "${prompt}". 
      Focus on naming specific gear: chestplate, greaves, tunics, materials. 
      CRITICAL: State that the equipment must be fitted to a standard humanoid mannequin.`,
      config: {
        systemInstruction: "You are a lead character designer for a 2D RPG. Your job is to describe how armor and clothes sit on a character base."
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
          { text: `SPRITE_EQUIPMENT_OVERLAY_PROTOCOL.
            TARGET: The provided character mannequin.
            ACTION: Paint the following equipment OVER the body: ${userIntent}.
            STRICT_CONSTRAINTS: 
            1. DO NOT change the body pose, skin color, or proportions.
            2. The background must remain pure Magenta (#FF00FF).
            3. Style must be 2D Pixel Art, game-ready, sharp edges.
            4. Only add clothes, armor, and accessories. Keep the head shape and limb positions identical.` }
        ]
      },
      config: model === 'gemini-3-pro-image-preview' ? { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } } : undefined
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("ERROR_SINTESIS: La IA no devolvió una imagen válida. Reintenta con un prompt más simple.");

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

    // Prompt extremadamente específico para el maniquí base sin nada
    const prompt = `BASE_MANNEQUIN_GENESIS: Technical 2D pixel art character sprite. 
    A naked, hairless humanoid mannequin, neutral gender features, ${params.build} build. 
    POSE: Standing straight, strictly front view, arms slightly away from sides.
    MATERIAL: Smooth grey clay / anatomical dummy style.
    BACKGROUND: Solid technical Magenta #FF00FF.
    No clothes, no face details, no hair. Professional game asset quality.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: model === 'gemini-3-pro-image-preview' ? { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } } : { imageConfig: { aspectRatio: '1:1' } },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("ERROR_GENESIS: No se pudo generar la base. Asegúrate de que el motor esté listo.");
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
        systemInstruction: "You are the SpriteForge Oracle. Your goal is to help users design armor, clothing, and equipment sets for their base characters." 
      }
    });
    return response.text || "";
  }
}
