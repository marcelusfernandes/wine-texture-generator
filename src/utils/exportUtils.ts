
import { WineInfo } from '@/components/TextInputs';
import { drawWineLabel, drawErrorState, CANVAS_CONFIG } from '@/utils/canvasUtils';

/**
 * Exports a wine label to an image file using the thumbnail URL
 */
export const exportWineLabel = (
  thumbnailUrl: string, 
  wineInfo: WineInfo, 
  labelName: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not create canvas context'));
      return;
    }

    // Set canvas dimensions
    exportCanvas.width = CANVAS_CONFIG.width;
    exportCanvas.height = CANVAS_CONFIG.height;
    
    // Create image and handle loading
    const img = new Image();
    img.crossOrigin = "anonymous"; // Handle CORS
    
    // Set up timeout for slow loading images
    const timeoutId = setTimeout(() => {
      console.error(`Timeout loading export image for "${labelName}"`);
      drawErrorState(ctx, exportCanvas.width, exportCanvas.height);
      
      // Still attempt export with error state
      const link = document.createElement('a');
      link.download = `${labelName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      resolve();
    }, 10000); // 10 second timeout
    
    // Image loaded successfully
    img.onload = () => {
      clearTimeout(timeoutId);
      console.log(`Successfully loaded export image for "${labelName}"`);
      
      // Draw wine label
      drawWineLabel(ctx, img, wineInfo);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${labelName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      resolve();
    };
    
    // Error handling
    img.onerror = (err) => {
      clearTimeout(timeoutId);
      console.error(`Error loading export image for "${labelName}":`, err);
      console.log("Failed URL:", thumbnailUrl);
      
      // Draw error state
      drawErrorState(ctx, exportCanvas.width, exportCanvas.height);
      
      // Still attempt export with error state
      const link = document.createElement('a');
      link.download = `${labelName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      resolve();
    };
    
    // Set image source to the thumbnail URL directly
    img.src = thumbnailUrl;
  });
};
