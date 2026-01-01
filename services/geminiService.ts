
import { GoogleGenAI, Type } from "@google/genai";
import { ForgeConfig, MannequinParams, RiggingData, ChatMessage, BillingMode } from "../types";
import { PixelData } from "../core/types";

export class GeminiService {
  /**
   * Determina el modelo de texto a usar según el modo.
   */
  private static getTextModel(mode: BillingMode): string {
    return mode === 'ultra' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  }

  /**
   * Determina el modelo de imagen a usar según el modo.
   */
  private static getImageModel(mode: BillingMode): string {
    return mode === 'ultra' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  }

  static async enhancePrompt(prompt: string, mode: BillingMode = 'standard'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: this.getTextModel(mode),
      contents: `OUTFIT_ENGINEER_PROTOCOL: Create a technical description for a character outfit: "${prompt}". 
      Focus on clothing layers, materials (leather, silk, steel), and equipment placement. 
      Constraint: Ensure the description is compatible with a 2D pixel art character in static pose.`,
      config: {
        systemInstruction: "You are a professional RPG game artist specializing in sprite design and layered equipment systems."
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
          { text: `TECHNICAL_SPRITE_FORGE. 
            BASE_MANNEQUIN: Provided image.
            DIRECTIVE: Apply this outfit/equipment: ${userIntent}. 
            EXECUTION: Only paint the clothing/armor over the body. Do not change the pose, height, or skin tone.
            STYLE: Clean 2D Pixel Art, game-ready. 
            BACKGROUND: Solid Magenta (#FF00FF).` }
        ]
      },
      config: model === 'gemini-3-pro-image-preview' ? { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } } : undefined
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("API_REJECTED: No se pudo generar el sprite. Revisa tu conexión o créditos.");

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

    const prompt = `GENESIS_MANNEQUIN: Professional 2D pixel art game asset. 
    Full body ${params.gender} anatomy, ${params.build} build. 
    POSE: Static T-Pose, strictly front view. 
    APPEARANCE: Naked anatomy mannequin, smooth grey-clay material, no clothes, no hair, no face. 
    TECHNICAL: Sharp edges, pure Magenta background #FF00FF. High quality game-ready asset.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: model === 'gemini-3-pro-image-preview' ? { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } } : { imageConfig: { aspectRatio: '1:1' } },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("GENESIS_FAILED: No se pudo crear la base.");
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
        systemInstruction: "You are the SpriteForge Oracle. Help the user design epic RPG outfits by providing structured technical descriptions." 
      }
    });
    return response.text || "";
  }
}
