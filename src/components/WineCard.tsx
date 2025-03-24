
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
    const corkIcon = new Image();
    corkIcon.src = '/lovable-uploads/2a593e39-a1f3-44d0-ad7e-c030ea3547f0.png';
    
    // Load both images before rendering
    Promise.all([
      new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = imageUrl;
      }),
      new Promise<void>((resolve) => {
        corkIcon.onload = () => resolve();
      })
    ]).then(() => {
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
      ctx.translate(84 + 120, 587/2); // Center horizontally in the burgundy box and vertically
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle'; // Center text vertically relative to the rotation point
      ctx.font = 'bold 110px "Arial Rounded MT Bold", Arial, sans-serif';
      ctx.fillStyle = 'white';
      // Use the sweetness text from wineInfo, uppercase and use a placeholder if empty
      const sweetText = wineInfo.taste.toUpperCase() || 'SWEET';
      ctx.fillText(sweetText, 0, 0); // Center the text at the rotation point
      ctx.restore();
      
      // Draw the grape variety text (vertically) with word wrapping
      ctx.save();
      
      // Set up the font for grape variety text
      ctx.font = 'bold 62px "Arial Rounded MT Bold", Arial, sans-serif';
      ctx.fillStyle = 'white';
      
      // Get grape text with placeholder if needed
      const originalGrapeText = wineInfo.type.toUpperCase() || 'GRAPE VARIETY';
      
      // Calculate available height for text (with padding)
      const grapeBoxHeight = 492;
      const paddingTopBottom = 16; // Minimum padding of 16px at top and bottom
      const availableHeight = grapeBoxHeight - (paddingTopBottom * 2);
      
      // Split text into words to enable word wrapping
      const words = originalGrapeText.split(' ');
      const lines = [];
      let currentLine = words[0];
      
      // Simple word-wrapping algorithm
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const testWidth = ctx.measureText(testLine).width;
        
        // If adding this word would make the line too long, start a new line
        // We use 460 as a limit (492 - padding) for the available height 
        // when rotated it becomes the width for the text
        if (testWidth > availableHeight) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine); // Add the last line
      
      // Position and draw the wrapped text
      // Center in the gray box
      ctx.translate(109 + 95, 587 + 492/2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw multi-line text centered vertically
      const lineHeight = 64; // Line height for 62px font
      const totalTextHeight = lines.length * lineHeight;
      const startY = -totalTextHeight / 2 + lineHeight / 2;
      
      // Draw each line of text
      lines.forEach((line, index) => {
        const yPos = startY + index * lineHeight;
        ctx.fillText(line, 0, yPos);
      });
      
      ctx.restore();
      
      // Draw the cork icon (top right) instead of the gray rectangle
      const corkIconX = 700 + (336 - 209) / 2;
      const corkIconY = 151;
      const corkIconSize = 210;
      ctx.drawImage(corkIcon, corkIconX, corkIconY, corkIconSize, corkIconSize);
      
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
    });
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
