
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { WineInfo } from './TextInputs';

interface WineCardProps {
  imageUrl: string | null;
  wineInfo: WineInfo;
  className?: string;
}

const WineCard: React.FC<WineCardProps> = ({ imageUrl, wineInfo, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Add semi-transparent overlay at the bottom for better text visibility
      const overlayHeight = img.height * 0.4;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, img.height - overlayHeight, img.width, overlayHeight);
      
      // Set text style
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      
      // Calculate positions
      const padding = img.width * 0.05;
      const startY = img.height - overlayHeight + padding;
      const lineHeight = overlayHeight / 5;
      
      // Draw all text elements
      ctx.font = `bold ${Math.max(img.width * 0.05, 16)}px Inter`;
      ctx.fillText(`Type: ${wineInfo.type}`, padding, startY);
      
      ctx.font = `${Math.max(img.width * 0.04, 14)}px Inter`;
      ctx.fillText(`Origin: ${wineInfo.origin}`, padding, startY + lineHeight);
      ctx.fillText(`Taste: ${wineInfo.taste}`, padding, startY + lineHeight * 2);
      ctx.fillText(`Cork Type: ${wineInfo.corkType}`, padding, startY + lineHeight * 3);
    };
    
    img.src = imageUrl;
  }, [imageUrl, wineInfo]);

  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-white shadow-xl animate-fade-in", className)}>
      {imageUrl ? (
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[600px] object-contain"
        />
      ) : (
        <div className="aspect-[3/4] bg-muted flex items-center justify-center p-6">
          <p className="text-muted-foreground text-center">Upload an image to preview</p>
        </div>
      )}
    </div>
  );
};

export default WineCard;
