
/**
 * Utility functions for image manipulation
 */

/**
 * Validates if a file is an image
 * @param file The file to validate
 * @returns Boolean indicating if file is an image
 */
export const isImageFile = (file: File): boolean => {
  // Explicitly check for common image types including webp
  const validTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp'
  ];
  
  return validTypes.includes(file.type);
};

/**
 * Creates an image data URL from a file
 * @param file The image file
 * @returns Promise with the image data URL
 */
export const createImageUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Resizes an image while maintaining aspect ratio
 * @param dataUrl The image data URL
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @returns Promise with the resized image data URL
 */
export const resizeImage = (
  dataUrl: string,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create canvas and resize
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get new data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = dataUrl;
  });
};

/**
 * Tests if a URL can be loaded
 * @param url URL to test
 * @returns Promise that resolves if URL is valid and loadable
 */
export const testImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Set a timeout to prevent hanging on slow resources
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Decodes and cleans a URL with encoded parameters
 * @param url The encoded URL to clean
 * @returns Cleaned URL
 */
export const decodeComplexUrl = (url: string): string => {
  try {
    // For debugging
    console.log("Original URL:", url);
    
    // Just return the URL as-is for now
    // This will help us diagnose issues with complex URLs
    return url;
  } catch (error) {
    console.error("Error decoding URL:", error);
    return url;
  }
};

