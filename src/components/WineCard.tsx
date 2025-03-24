
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
      // Set canvas dimensions to 1080x1080 for the format requested
      canvas.width = 1080;
      canvas.height = 1080;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the base image, centered and scaled to fit the canvas
      let imgWidth = img.width;
      let imgHeight = img.height;
      let x = 0;
      let y = 0;
      
      // Make sure the image covers the entire canvas
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      
      if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        imgHeight = canvas.height;
        imgWidth = img.width * (canvas.height / img.height);
        x = (canvas.width - imgWidth) / 2;
      } else {
        // Image is taller than canvas
        imgWidth = canvas.width;
        imgHeight = img.height * (canvas.width / img.width);
        y = (canvas.height - imgHeight) / 2;
      }
      
      // Draw the image
      ctx.drawImage(img, x, y, imgWidth, imgHeight);
      
      // Draw the top left burgundy panel for sweetness
      ctx.fillStyle = '#890045';
      ctx.fillRect(84, 0, 240, 587);
      
      // Draw the bottom left gray panel for grape variety
      ctx.fillStyle = '#666666';
      ctx.fillRect(109, 587, 190, 492);
      
      // Draw the sweetness text (vertically)
      ctx.save();
      ctx.translate(84 + 24 + 50, 0 + 50);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.font = 'bold 110px "Arial Rounded MT Bold", Arial, sans-serif';
      ctx.fillStyle = 'white';
      // Calculate text width to center it properly
      const sweetText = wineInfo.taste.toUpperCase() || 'SWEET';
      const textWidth = ctx.measureText(sweetText).width;
      ctx.fillText(sweetText, -textWidth / 2, 0);
      ctx.restore();
      
      // Draw the grape variety text (vertically)
      ctx.save();
      ctx.translate(109 + 24 + 48, 587 + 48);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.font = 'bold 62px "Arial Rounded MT Bold", Arial, sans-serif';
      ctx.fillStyle = 'white';
      // Calculate text width to center it properly
      const grapeText = wineInfo.type.toUpperCase() || 'GRAPE VARIETY';
      const grapeTextWidth = ctx.measureText(grapeText).width;
      ctx.fillText(grapeText, -grapeTextWidth / 2, 0);
      ctx.restore();
      
      // Draw the closure type icon (top right)
      ctx.fillStyle = '#D9D9D9';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.rect(700 + (336 - 209) / 2, 151, 209, 210);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Draw closure type text
      ctx.font = 'bold 56px "Arial Rounded MT Bold", Arial, sans-serif';
      ctx.fillStyle = '#3F0E09';
      ctx.textAlign = 'center';
      
      // Draw multi-line closure type text
      const closureText = wineInfo.corkType.toUpperCase() || 'CLOSURE\nTYPE';
      const closureLines = closureText.split('\n');
      if (closureLines.length === 1) {
        ctx.fillText(closureLines[0], 700 + 336 / 2, 151 + 210 + 34 + 56);
      } else {
        ctx.fillText('CLOSURE', 700 + 336 / 2, 151 + 210 + 34 + 56);
        ctx.fillText('TYPE', 700 + 336 / 2, 151 + 210 + 34 + 56 + 64);
      }
      
      // Draw the country icon (bottom right)
      ctx.fillStyle = '#D9D9D9';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.rect(668 + (412 - 209) / 2, 708, 209, 210);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Draw country text
      ctx.font = 'bold 56px "Arial Rounded MT Bold", Arial, sans-serif';
      ctx.fillStyle = '#3F0E09';
      ctx.textAlign = 'center';
      ctx.fillText(wineInfo.origin.toUpperCase() || 'COUNTRY', 668 + 412 / 2, 708 + 210 + 18 + 56);
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
        <div className="aspect-[1/1] bg-muted flex items-center justify-center p-6">
          <p className="text-muted-foreground text-center">Upload an image to preview</p>
        </div>
      )}
    </div>
  );
};

export default WineCard;
