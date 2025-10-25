// Image preprocessing utilities for TensorFlow.js inference

/**
 * Crop and resize image to 224x224 for MobileNetV3 input
 * @param imageElement - HTML Image element
 * @returns Canvas element with processed image
 */
export const preprocessImage = (imageElement: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set canvas size to model input requirements
  canvas.width = 224;
  canvas.height = 224;
  
  // Calculate crop dimensions to maintain aspect ratio
  const { width, height } = imageElement;
  const size = Math.min(width, height);
  const startX = (width - size) / 2;
  const startY = (height - size) / 2;
  
  // Draw cropped and resized image
  ctx.drawImage(
    imageElement,
    startX, startY, size, size, // source crop
    0, 0, 224, 224 // destination resize
  );
  
  return canvas;
};

/**
 * Convert canvas to tensor for TensorFlow.js
 * @param canvas - Preprocessed canvas element
 * @returns Promise<tf.Tensor3D> - Normalized tensor ready for inference
 */
export const canvasToTensor = async (canvas: HTMLCanvasElement) => {
  const tf = await import('@tensorflow/tfjs');
  
  // Convert canvas to tensor and normalize to [0,1]
  const tensor = tf.browser.fromPixels(canvas)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255.0)
    .expandDims(0); // Add batch dimension
  
  return tensor;
};

/**
 * Create image element from file
 * @param file - Image file from input
 * @returns Promise<HTMLImageElement>
 */
export const createImageElement = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file type and size
 * @param file - File to validate
 * @returns boolean
 */
export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

/**
 * Generate data URL from canvas for storage
 * @param canvas - Canvas element
 * @returns string - Data URL
 */
export const canvasToDataURL = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/jpeg', 0.8);
};