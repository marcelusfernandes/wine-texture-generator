
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
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Set a timeout to prevent hanging on slow resources
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Converts a remote URL to a data URL to bypass CORS
 * @param url The remote image URL
 * @returns Promise with data URL or null if failed
 */
export const urlToDataUrl = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    // Create a proxy URL if needed for CORS
    const proxyUrl = url.startsWith('http') 
      ? `https://cors-anywhere.herokuapp.com/${url}` 
      : url;
      
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        try {
          // Create canvas to convert to data URL
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error("Failed to get canvas context");
            resolve(null);
            return;
          }
          
          // Draw image to canvas and convert to data URL
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (err) {
          console.error("Error converting to data URL:", err);
          resolve(null);
        }
      };
      
      img.onerror = () => {
        console.error("Error loading image with proxy");
        // Try directly without proxy as fallback
        if (proxyUrl !== url) {
          const directImg = new Image();
          directImg.crossOrigin = "anonymous";
          
          directImg.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = directImg.width;
              canvas.height = directImg.height;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(null);
                return;
              }
              
              ctx.drawImage(directImg, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } catch (err) {
              console.error("Direct load error:", err);
              resolve(null);
            }
          };
          
          directImg.onerror = () => {
            console.error("Failed to load image directly");
            resolve(null);
          };
          
          directImg.src = url;
        } else {
          resolve(null);
        }
      };
      
      img.src = proxyUrl;
    } catch (error) {
      console.error("Error in urlToDataUrl:", error);
      resolve(null);
    }
  });
};

/**
 * Decodes an image URL for download
 */
export const decodeImageForDownload = (
  imageUrl: string, 
  altText: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if already a data URL
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        const filename = `${altText.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
        return;
      }
      
      // Try to convert URL to data URL
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          
          const link = document.createElement('a');
          link.href = dataUrl;
          const filename = `${altText.toLowerCase().replace(/\s+/g, '-')}.png`;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = (err) => {
        reject(err);
      };
      
      img.src = imageUrl;
    } catch (error) {
      reject(error);
    }
  });
};
