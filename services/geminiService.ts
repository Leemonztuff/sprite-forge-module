
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
      contents: `OUTFIT_SPECIFICATION_PROTOCOL: Analyze this clothing request: "${prompt}". 
      Translate it into a technical description of garments for a 2D sprite. 
      Focus on layers: base layer, armor pieces, fabrics, and color palette. 
      CRITICAL: The outfit must be wearable by a standard humanoid character.`,
      config: {
        systemInstruction: "You are a master concept artist for high-end RPGs. Your output is used to guide an image synthesis engine."
      }
    });
    return response.text?.trim() || prompt;
  }

  static async callAI(userIntent: string, img: PixelData, mask: Uint8Array, config: ForgeConfig): Promise<PixelData> {
    // Instancia fresca para capturar la clave más reciente del entorno o bridge
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
          { text: `SPRITE_OVERLAY_SYNTHESIS.
            OUTFIT_DIRECTIVE: ${userIntent}.
            TECHNICAL_CONSTRAINTS: 
            1. Preserve original anatomy, pose, and proportions.
            2. Background MUST be solid Magenta (#FF00FF).
            3. Paint garments and equipment directly onto the character.
            4. 2D Pixel art style, sharp definition, production-ready quality.` }
        ]
      },
      config: model === 'gemini-3-pro-image-preview' ? { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } } : undefined
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("Synthesis Failed: No image data returned.");

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

    const prompt = `SPRITE_BASE_GENESIS: Technical anatomical dummy for game development. 
    A grey-skinned humanoid mannequin, ${params.build} build, front view. 
    Strictly NAKED, no hair, no accessories. 
    Background: SOLID MAGENTA (#FF00FF). 
    2D High-quality pixel art, clean borders.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: model === 'gemini-3-pro-image-preview' ? { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } } : { imageConfig: { aspectRatio: '1:1' } },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("Genesis Error: Infrastructure quota exceeded.");
  }

  static async analyzeRigging(url: string, mode: BillingMode = 'standard'): Promise<RiggingData> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: this.getTextModel(mode),
      contents: { 
        parts: [
          { inlineData: { data: url.split(',')[1], mimeType: 'image/png' } }, 
          { text: "Output JSON joint mapping for: head, neck, shoulders, elbows, wrists, spine, pelvis, knees, ankles." }
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

  static async getStructuredPrompt(messages: ChatMessage[], mode: BillingMode = 'standard'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: this.getTextModel(mode),
      contents: messages.map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      })),
      config: { 
        systemInstruction: "You are the SpriteForge Oracle. You translate creative ideas into game-asset ready technical prompts." 
      }
    });
    return response.text || "";
  }
}
