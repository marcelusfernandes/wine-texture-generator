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
 */
export const testImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // If the URL is a data URL, resolve immediately
    if (url.startsWith('data:')) {
      resolve(true);
      return;
    }
    
    // For regular URLs, try to load through the proxy first
    getProxiedImageUrl(url)
      .then(() => resolve(true))
      .catch(() => {
        // If proxy fails, try direct loading as fallback
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        
        // Set a timeout to prevent hanging on slow resources
        setTimeout(() => resolve(false), 5000);
      });
  });
};

/**
 * Proxy an image URL to bypass CORS restrictions
 * @param url The original image URL
 * @returns Promise with the proxied URL
 */
export const getProxiedImageUrl = async (url: string): Promise<string> => {
  // If already a data URL or a local proxy URL, return it unchanged
  if (url.startsWith('data:') || url.includes('localhost:3000/proxy')) {
    return url;
  }
  
  try {
    // Use our local proxy server
    const proxyUrl = `http://localhost:3000/proxy?url=${encodeURIComponent(url)}`;
    console.log(`[getProxiedImageUrl] Using proxy: ${proxyUrl}`);
    
    // Test if the proxy is working by making a HEAD request
    const testResponse = await fetch(proxyUrl, { method: 'HEAD' }).catch(() => null);
    
    if (!testResponse || !testResponse.ok) {
      console.error('[getProxiedImageUrl] Proxy server not available');
      throw new Error('Proxy server not available');
    }
    
    // Return the proxy URL directly - we'll stream the image through the proxy
    return proxyUrl;
  } catch (error) {
    console.error('[getProxiedImageUrl] Error:', error);
    // Return the original URL as fallback
    return url;
  }
};

/**
 * Returns a processed URL for displaying images
 * Uses proxy service to bypass CORS if needed
 */
export const decodeComplexUrl = (url: string): string => {
  // Return the URL unchanged for now
  // The actual proxying happens when the image is loaded
  console.log("URL original:", url);
  return url;
};
