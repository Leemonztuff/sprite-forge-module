/**
 * Canvas Pool Manager - simplified version
 * Manages canvas elements to prevent memory leaks
 */

export interface SimpleCanvasPool {
  acquire: (width: number, height: number) => HTMLCanvasElement;
  release: (canvas: HTMLCanvasElement) => void;
  clear: () => void;
  getStats: () => { total: number; active: number; idle: number };
}

/**
 * Create a simple canvas pool
 */
export function createCanvasPool(): SimpleCanvasPool {
  const pool: HTMLCanvasElement[] = [];
  const active = new Set<HTMLCanvasElement>();
  
  const acquire = (width: number, height: number): HTMLCanvasElement => {
    // Try to reuse an existing canvas
    let canvas = pool.find(c => !active.has(c) && c.width >= width && c.height >= height);
    
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      pool.push(canvas);
    }
    
    active.add(canvas);
    return canvas;
  };
  
  const release = (canvas: HTMLCanvasElement): void => {
    // Clear the canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    active.delete(canvas);
  };
  
  const clear = (): void => {
    pool.forEach(canvas => {
      if (!active.has(canvas)) {
        canvas.width = 1;
        canvas.height = 1;
      }
    });
  };
  
  const getStats = () => ({
    total: pool.length,
    active: active.size,
    idle: pool.length - active.size
  });
  
  return { acquire, release, clear, getStats };
}

// Create global canvas pool instance
export const canvasPool = createCanvasPool();

/**
 * Worker wrapper for image processing
 */
export class ImageWorker {
  private worker: Worker | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeWorker();
  }

  private async initializeWorker(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create worker from blob
      const workerCode = `
        // Worker code
        self.addEventListener('message', function(e) {
          const { imageData, width, height, operation, params } = e.data;
          const startTime = performance.now();
          
          try {
            let result;
            switch (operation) {
              case 'resize':
                result = resizeImage(imageData, width, height, params);
                break;
              case 'grayscale':
                result = applyGrayscale(imageData, width, height);
                break;
              default:
                result = { imageData: imageData, width, height };
            }
            
            result.processingTime = performance.now() - startTime;
            self.postMessage({ success: true, result });
          } catch (error) {
            self.postMessage({ 
              success: false, 
              error: error.message || 'Unknown error',
              processingTime: performance.now() - startTime
            });
          }
        });
        
        function resizeImage(imageData, width, height, params) {
          const { newWidth, newHeight } = params;
          const scaleX = width / newWidth;
          const scaleY = height / newHeight;
          const result = new Uint8ClampedArray(newWidth * newHeight * 4);
          
          for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
              const srcX = Math.floor(x * scaleX);
              const srcY = Math.floor(y * scaleY);
              const srcIndex = (srcY * width + srcX) * 4;
              const destIndex = (y * newWidth + x) * 4;
              
              result[destIndex] = imageData[srcIndex];
              result[destIndex + 1] = imageData[srcIndex + 1];
              result[destIndex + 2] = imageData[srcIndex + 2];
              result[destIndex + 3] = imageData[srcIndex + 3];
            }
          }
          
          return { imageData: result, width: newWidth, height: newHeight };
        }
        
        function applyGrayscale(imageData, width, height) {
          const result = new Uint8ClampedArray(imageData.length);
          
          for (let i = 0; i < imageData.length; i += 4) {
            const gray = Math.round(0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]);
            result[i] = gray;
            result[i + 1] = gray;
            result[i + 2] = gray;
            result[i + 3] = imageData[i + 3];
          }
          
          return { imageData: result, width, height };
        }
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      this.isInitialized = true;

    } catch (error) {
      console.warn('Failed to initialize worker:', error);
      // Fallback to main thread processing
      this.worker = null;
      this.isInitialized = true;
    }
  }

  async processImage(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    operation: string,
    params?: any
  ): Promise<{ imageData: Uint8ClampedArray; width: number; height: number; processingTime: number }> {
    if (!this.isInitialized) {
      await this.initializeWorker();
    }

    if (this.worker) {
      return new Promise((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          const { success, result, error, processingTime } = e.data;
          
          this.worker!.removeEventListener('message', handler);
          
          if (success) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        };

        this.worker.addEventListener('message', handler);
        this.worker.postMessage({ imageData, width, height, operation, params });
      });
    } else {
      // Fallback: process in main thread
      return this.processInMainThread(imageData, width, height, operation, params);
    }
  }

  private async processInMainThread(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    operation: string,
    params?: any
  ): Promise<{ imageData: Uint8ClampedArray; width: number; height: number; processingTime: number }> {
    const startTime = performance.now();

    let result;
    switch (operation) {
      case 'resize':
        result = this.resizeImageMainThread(imageData, width, height, params);
        break;
      case 'grayscale':
        result = this.applyGrayscaleMainThread(imageData, width, height);
        break;
      default:
        result = { imageData, width, height };
    }

    return {
      ...result,
      processingTime: performance.now() - startTime
    };
  }

  private resizeImageMainThread(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    params: { newWidth: number; newHeight: number }
  ): { imageData: Uint8ClampedArray; width: number; height: number } {
    const { newWidth, newHeight } = params;
    const scaleX = width / newWidth;
    const scaleY = height / newHeight;
    const result = new Uint8ClampedArray(newWidth * newHeight * 4);

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const srcIndex = (srcY * width + srcX) * 4;
        const destIndex = (y * newWidth + x) * 4;

        result[destIndex] = imageData[srcIndex];
        result[destIndex + 1] = imageData[srcIndex + 1];
        result[destIndex + 2] = imageData[srcIndex + 2];
        result[destIndex + 3] = imageData[srcIndex + 3];
      }
    }

    return { imageData: result, width: newWidth, height: newHeight };
  }

  private applyGrayscaleMainThread(
    imageData: Uint8ClampedArray,
    width: number,
    height: number
  ): { imageData: Uint8ClampedArray; width: number; height: number } {
    const result = new Uint8ClampedArray(imageData.length);

    for (let i = 0; i < imageData.length; i += 4) {
      const gray = Math.round(0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]);
      result[i] = gray;
      result[i + 1] = gray;
      result[i + 2] = gray;
      result[i + 3] = imageData[i + 3];
    }

    return { imageData: result, width, height };
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
  }
}

// Create global image worker instance
export const imageWorker = new ImageWorker();