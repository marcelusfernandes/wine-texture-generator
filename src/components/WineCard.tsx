
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
      
      // Calculate dimensions
      const width = img.width;
      const height = img.height;
      
      // Left side bar for grape variety
      const leftBarWidth = width * 0.25;
      
      // Draw burgundy background for grape variety
      ctx.fillStyle = '#8C1C3C';
      ctx.fillRect(0, 0, leftBarWidth, height * 0.5);
      
      // Draw gray background for country of origin
      ctx.fillStyle = '#555555';
      ctx.fillRect(0, height * 0.5, leftBarWidth, height * 0.5);
      
      // Draw grape variety text vertically
      ctx.save();
      ctx.translate(leftBarWidth / 2, height * 0.25);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.max(width * 0.06, 24)}px Inter`;
      ctx.fillStyle = 'white';
      ctx.fillText(wineInfo.type.toUpperCase(), 0, 0);
      ctx.restore();
      
      // Draw country of origin text vertically
      ctx.save();
      ctx.translate(leftBarWidth / 2, height * 0.75);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.max(width * 0.05, 20)}px Inter`;
      ctx.fillStyle = 'white';
      ctx.fillText(wineInfo.origin.toUpperCase(), 0, 0);
      ctx.restore();
      
      // Right side for closure type with icon
      const rightSide = width * 0.75;
      const iconSize = width * 0.15;
      const iconX = rightSide + (width - rightSide) / 2 - iconSize / 2;
      
      // Draw closure type icon (simplified circle)
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, height * 0.25, iconSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#4A1616';
      ctx.lineWidth = width * 0.005;
      ctx.stroke();
      
      // Draw closure type text
      ctx.font = `bold ${Math.max(width * 0.05, 20)}px Inter`;
      ctx.fillStyle = '#4A1616';
      ctx.textAlign = 'center';
      ctx.fillText(wineInfo.corkType.toUpperCase() || 'ROLHA', iconX + iconSize / 2, height * 0.4);
      
      // Draw country flag icon (simplified circle)
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, height * 0.65, iconSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#4A1616';
      ctx.lineWidth = width * 0.005;
      ctx.stroke();
      
      // Draw origin name below flag (repeated for visibility)
      ctx.font = `bold ${Math.max(width * 0.05, 20)}px Inter`;
      ctx.fillStyle = '#4A1616';
      ctx.textAlign = 'center';
      ctx.fillText(wineInfo.origin.toUpperCase(), iconX + iconSize / 2, height * 0.8);
      
      // Draw sweetness level at bottom if provided
      if (wineInfo.taste) {
        ctx.font = `italic ${Math.max(width * 0.03, 14)}px Inter`;
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(`Sweetness: ${wineInfo.taste}`, width / 2, height * 0.95);
      }
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
