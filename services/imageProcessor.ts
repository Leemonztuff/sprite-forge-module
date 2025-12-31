
import { SpriteForgePipeline } from '../core/pipeline';
import { PixelData, Skeleton } from '../core/types';
import { buildEdgeMap } from '../core/modules/edgeMapBuilder';
import { extractPalette } from '../core/modules/paletteExtractor';

export class ImageProcessor {
  /**
   * Convierte un DataURL a PixelData.
   */
  static async getPixelData(url: string): Promise<PixelData> {
    const img = await this.loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return {
      width: canvas.width,
      height: canvas.height,
      data: imageData.data
    };
  }

  /**
   * Convierte PixelData a DataURL.
   */
  static pixelsToDataUrl(pixels: PixelData): string {
    const canvas = document.createElement('canvas');
    canvas.width = pixels.width;
    canvas.height = pixels.height;
    const ctx = canvas.getContext('2d')!;
    const imgData = new ImageData(pixels.data, pixels.width, pixels.height);
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  static async processCore(url: string, palette?: number[][]): Promise<string> {
    const pixels = await this.getPixelData(url);
    const processed = SpriteForgePipeline.processGameReady(pixels, palette);
    return this.pixelsToDataUrl(processed);
  }

  static async analyzeAsset(url: string) {
    const pixels = await this.getPixelData(url);
    return SpriteForgePipeline.analyzeIdentity(pixels);
  }

  static async getEdgeMapUrl(url: string): Promise<string> {
    const pixels = await this.getPixelData(url);
    const edges = buildEdgeMap(pixels);
    
    const canvas = document.createElement('canvas');
    canvas.width = pixels.width;
    canvas.height = pixels.height;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(pixels.width, pixels.height);
    
    for (let i = 0; i < edges.length; i++) {
      const val = edges[i];
      const idx = i * 4;
      imgData.data[idx] = val;     // R
      imgData.data[idx + 1] = val; // G
      imgData.data[idx + 2] = val; // B
      imgData.data[idx + 3] = 255; // A
    }
    
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL();
  }

  static async getPalette(url: string): Promise<number[][]> {
    const pixels = await this.getPixelData(url);
    return extractPalette(pixels);
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Error al cargar la imagen."));
    });
  }

  static async cleanOrphans(sourceUrl: string): Promise<string> {
    const pixels = await this.getPixelData(sourceUrl);
    // Usar el pipeline core para limpiar
    const cleaned = SpriteForgePipeline.processGameReady(pixels);
    return this.pixelsToDataUrl(cleaned);
  }
}
