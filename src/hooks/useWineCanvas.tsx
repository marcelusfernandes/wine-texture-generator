
import { useEffect, useRef, useState } from 'react';
import { drawWineLabel, drawErrorState, CANVAS_CONFIG } from '@/utils/canvasUtils';
import { WineInfo } from '@/components/TextInputs';

export const useWineCanvas = (imageUrl: string | null, wineInfo: WineInfo) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!imageUrl);

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsLoading(true);
    setLoadError(false);

    // Log the actual URL for debugging
    console.log(`WineCard attempting to load image from: ${imageUrl}`);

    const img = new Image();
    img.crossOrigin = "anonymous"; // Add crossOrigin to handle CORS issues
    
    img.onload = () => {
      // Reset error state if image loads successfully
      setLoadError(false);
      setIsLoading(false);
      
      // Draw the wine label
      canvas.width = CANVAS_CONFIG.width;
      canvas.height = CANVAS_CONFIG.height;
      drawWineLabel(ctx, img, wineInfo);
    };
    
    img.onerror = (err) => {
      console.error("Error loading image in WineCard:", err);
      console.log("Failed URL:", imageUrl);
      
      // Set error state
      setLoadError(true);
      setIsLoading(false);
      
      // Set canvas dimensions and draw error state
      canvas.width = CANVAS_CONFIG.width;
      canvas.height = CANVAS_CONFIG.height;
      drawErrorState(ctx, canvas.width, canvas.height);
    };
    
    // Use the raw URL without processing
    img.src = imageUrl;
    
    // Set a timeout for slow-loading images
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log(`Image load timeout for ${imageUrl}`);
        setLoadError(true);
        setIsLoading(false);
        // Draw error state on timeout
        canvas.width = CANVAS_CONFIG.width;
        canvas.height = CANVAS_CONFIG.height;
        drawErrorState(ctx, canvas.width, canvas.height);
      }
    }, 10000); // 10 second timeout
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [imageUrl, wineInfo, isLoading]);

  return { canvasRef, loadError, isLoading };
};
