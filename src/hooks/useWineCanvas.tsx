
import { useEffect, useRef, useState } from 'react';
import { drawWineLabel, drawErrorState, CANVAS_CONFIG } from '@/utils/canvasUtils';
import { WineInfo } from '@/components/TextInputs';

export const useWineCanvas = (imageUrl: string | null, wineInfo: WineInfo) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Log the actual URL for debugging
    console.log(`WineCard attempting to load image from: ${imageUrl}`);

    const img = new Image();
    img.crossOrigin = "anonymous"; // Add crossOrigin to handle CORS issues
    
    img.onload = () => {
      // Reset error state if image loads successfully
      setLoadError(false);
      
      // Draw the wine label
      drawWineLabel(ctx, img, wineInfo);
    };
    
    img.onerror = (err) => {
      console.error("Error loading image in WineCard:", err);
      console.log("Failed URL:", imageUrl);
      
      // Set error state
      setLoadError(true);
      
      // Set canvas dimensions and draw error state
      canvas.width = CANVAS_CONFIG.width;
      canvas.height = CANVAS_CONFIG.height;
      drawErrorState(ctx, canvas.width, canvas.height);
    };
    
    // Use the raw URL without processing
    img.src = imageUrl;
  }, [imageUrl, wineInfo]);

  return { canvasRef, loadError };
};
