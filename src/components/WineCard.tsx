
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
      
      // Left side bar width
      const leftBarWidth = width * 0.25;
      
      // Draw burgundy background for sweetness level (top left)
      ctx.fillStyle = '#8C1C3C';
      ctx.fillRect(0, 0, leftBarWidth, height * 0.5);
      
      // Draw gray background for grape variety (bottom left)
      ctx.fillStyle = '#666666';
      ctx.fillRect(0, height * 0.5, leftBarWidth, height * 0.5);
      
      // Draw sweetness level text vertically (top left) - display user input
      ctx.save();
      ctx.translate(leftBarWidth / 2, height * 0.25);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.max(width * 0.06, 24)}px Inter`;
      ctx.fillStyle = 'white';
      ctx.fillText(wineInfo.taste.toUpperCase() || 'SWEET', 0, 0);
      ctx.restore();
      
      // Draw grape variety text vertically (bottom left)
      ctx.save();
      ctx.translate(leftBarWidth / 2, height * 0.75);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.max(width * 0.05, 20)}px Inter`;
      ctx.fillStyle = 'white';
      ctx.fillText(wineInfo.type.toUpperCase() || 'GRAPE VARIETY', 0, 0);
      ctx.restore();
      
      // Right side for closure type with icon (top right)
      const rightSide = width * 0.75;
      const iconSize = width * 0.15;
      const iconX = rightSide + (width - rightSide) / 2 - iconSize / 2;
      
      // Draw closure type icon (top right)
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, height * 0.25, iconSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#4A1616';
      ctx.lineWidth = width * 0.005;
      ctx.stroke();
      
      // Draw closure type text (top right)
      ctx.font = `bold ${Math.max(width * 0.04, 18)}px Inter`;
      ctx.fillStyle = '#4A1616';
      ctx.textAlign = 'center';
      ctx.fillText('CLOSURE', iconX + iconSize / 2, height * 0.45 - 12);
      ctx.fillText('TYPE', iconX + iconSize / 2, height * 0.45 + 12);
      
      // Show the actual closure type value below the label
      ctx.font = `${Math.max(width * 0.03, 14)}px Inter`;
      ctx.fillStyle = '#4A1616';
      ctx.fillText(`(${wineInfo.corkType || 'Not specified'})`, iconX + iconSize / 2, height * 0.45 + 36);
      
      // Draw country flag icon (bottom right)
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, height * 0.75, iconSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#4A1616';
      ctx.lineWidth = width * 0.005;
      ctx.stroke();
      
      // Draw country text (bottom right)
      ctx.font = `bold ${Math.max(width * 0.04, 18)}px Inter`;
      ctx.fillStyle = '#4A1616';
      ctx.textAlign = 'center';
      ctx.fillText('COUNTRY', iconX + iconSize / 2, height * 0.95 - 12);
      
      // Show the actual country value below the label
      ctx.font = `${Math.max(width * 0.03, 14)}px Inter`;
      ctx.fillStyle = '#4A1616';
      ctx.fillText(`(${wineInfo.origin || 'Not specified'})`, iconX + iconSize / 2, height * 0.95 + 12);
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
