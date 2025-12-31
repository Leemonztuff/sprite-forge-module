
import { GoogleGenAI } from "@google/genai";
import { SpriteForgePipeline } from "../../core/pipeline";
import { supabase } from "../../services/supabaseClient";

// Forzamos el uso de Node.js Runtime para tener suficiente memoria para procesar píxeles
export const runtime = 'nodejs'; 

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  
  try {
    const body = await req.json();
    const { baseImage, outfit, classType, theme, sheetMode, userId } = body;

    if (!baseImage) {
      return new Response(JSON.stringify({ error: "BASE_IMAGE_REQUIRED" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Inicializamos el cliente de IA dentro de la función para usar la última clave inyectada
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    // El pipeline core se ejecuta en el servidor para mayor seguridad y consistencia
    const result = await SpriteForgePipeline.forgeSprite({
      baseImage, // baseImage ya es PixelData enviado desde el cliente
      outfit,
      classType,
      theme,
      sheetMode,
      aiExecutor: async (prompt, img, mask) => {
        // Ejecución de Gemini 3 para el repintado quirúrgico
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: body.base64Image, mimeType: 'image/png' } },
              { text: prompt }
            ]
          }
        });
        
        // Aquí el pipeline manejaría la reconstrucción del PixelData
        // (Nota: En un entorno real, el pipeline debe ser capaz de procesar
        // los bytes devueltos por la IA)
        return img; 
      }
    });

    // Sincronización con base de datos si existe sesión
    if (supabase && userId) {
      await supabase.from("outfits").insert({
        id: requestId,
        user_id: userId,
        identity: result.identity,
        drift: result.drift,
        url: result.image // Esto debería ser una URL de storage en prod
      });
    }

    return new Response(JSON.stringify({ ...result, requestId }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error(`[API_ERROR] ${requestId}:`, error.message);
    return new Response(JSON.stringify({ 
      error: "INTERNAL_CORE_FAULT",
      message: error.message,
      requestId 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
