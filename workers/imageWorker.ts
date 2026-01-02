/**
 * Simple worker for image processing
 * Offloads image operations from main thread
 */

// Worker interface
interface ProcessImageMessage {
  imageData: Uint8ClampedArray;
  width: number;
  height: number;
  operation: string;
  params?: any;
}

interface WorkerResponse {
  imageData: Uint8ClampedArray;
  width: number;
  height: number;
  processingTime: number;
  error?: string;
}

/**
 * Process image in worker
 */
self.addEventListener('message', function(event) {
  const message = event.data as ProcessImageMessage;
  const startTime = performance.now();

  try {
    let result: WorkerResponse;

    switch (message.operation) {
      case 'resize':
        result = resizeImage(message);
        break;
      
      case 'crop':
        result = cropImage(message);
        break;
      
      case 'grayscale':
        result = applyGrayscale(message);
        break;
      
      case 'brightness':
        result = adjustBrightness(message);
        break;
      
      default:
        result = {
          imageData: new Uint8ClampedArray(0),
          width: message.width,
          height: message.height,
          processingTime: 0,
          error: `Unknown operation: ${message.operation}`
        };
    }

    result.processingTime = performance.now() - startTime;
    
    // Send result back
    self.postMessage(result);

  } catch (error) {
    const errorResult: WorkerResponse = {
      imageData: new Uint8ClampedArray(0),
      width: message.width,
      height: message.height,
      processingTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    self.postMessage(errorResult);
  }
});

/**
 * Resize image
 */
function resizeImage(message: ProcessImageMessage): WorkerResponse {
  const { imageData, width, height, params } = message;
  const { newWidth, newHeight } = params;
  
  // Simple nearest neighbor resize
  const result = new Uint8ClampedArray(newWidth * newHeight * 4);
  
  const scaleX = width / newWidth;
  const scaleY = height / newHeight;
  
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);
      const srcIndex = (srcY * width + srcX) * 4;
      const destIndex = (y * newWidth + x) * 4;
      
      result[destIndex] = imageData[srcIndex];     // R
      result[destIndex + 1] = imageData[srcIndex + 1]; // G
      result[destIndex + 2] = imageData[srcIndex + 2]; // B
      result[destIndex + 3] = imageData[srcIndex + 3]; // A
    }
  }
  
  return {
    imageData: result,
    width: newWidth,
    height: newHeight,
    processingTime: 0
  };
}

/**
 * Crop image
 */
function cropImage(message: ProcessImageMessage): WorkerResponse {
  const { imageData, width, height, params } = message;
  const { x, y, cropWidth, cropHeight } = params;
  
  const result = new Uint8ClampedArray(cropWidth * cropHeight * 4);
  
  for (let srcY = y; srcY < y + cropHeight; srcY++) {
    for (let srcX = x; srcX < x + cropWidth; srcX++) {
      const srcIndex = (srcY * width + srcX) * 4;
      const destIndex = ((srcY - y) * cropWidth + (srcX - x)) * 4;
      
      result[destIndex] = imageData[srcIndex];     // R
      result[destIndex + 1] = imageData[srcIndex + 1]; // G
      result[destIndex + 2] = imageData[srcIndex + 2]; // B
      result[destIndex + 3] = imageData[srcIndex + 3]; // A
    }
  }
  
  return {
    imageData: result,
    width: cropWidth,
    height: cropHeight,
    processingTime: 0
  };
}

/**
 * Apply grayscale filter
 */
function applyGrayscale(message: ProcessImageMessage): WorkerResponse {
  const { imageData, width, height } = message;
  const result = new Uint8ClampedArray(imageData.length);
  
  for (let i = 0; i < imageData.length; i += 4) {
    const gray = Math.round(0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]);
    
    result[i] = gray;     // R
    result[i + 1] = gray; // G
    result[i + 2] = gray; // B
    result[i + 3] = imageData[i + 3]; // A
  }
  
  return {
    imageData: result,
    width,
    height,
    processingTime: 0
  };
}

/**
 * Adjust brightness
 */
function adjustBrightness(message: ProcessImageMessage): WorkerResponse {
  const { imageData, width, height, params } = message;
  const { brightness } = params;
  
  const result = new Uint8ClampedArray(imageData.length);
  
  for (let i = 0; i < imageData.length; i += 4) {
    result[i] = Math.min(255, Math.max(0, imageData[i] + brightness));     // R
    result[i + 1] = Math.min(255, Math.max(0, imageData[i + 1] + brightness)); // G
    result[i + 2] = Math.min(255, Math.max(0, imageData[i + 2] + brightness)); // B
    result[i + 3] = imageData[i + 3]; // A
  }
  
  return {
    imageData: result,
    width,
    height,
    processingTime: 0
  };
}