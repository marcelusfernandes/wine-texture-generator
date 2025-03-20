
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WineInfo } from './TextInputs';
import WineCard from './WineCard';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  imageUrl: string | null;
  wineInfo: WineInfo;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  imageUrl, 
  wineInfo, 
  className 
}) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    
    // Find the canvas element rendered by WineCard
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    // Create a download link for the canvas content
    const link = document.createElement('a');
    const filename = `${wineInfo.type.toLowerCase().replace(/\s+/g, '-')}-${wineInfo.origin.toLowerCase().replace(/\s+/g, '-')}.png`;
    
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium">Preview</h3>
        <Button 
          onClick={handleDownload} 
          disabled={!imageUrl}
          size="sm"
          className="gap-2"
        >
          <Download size={16} />
          Download Image
        </Button>
      </div>
      
      <WineCard imageUrl={imageUrl} wineInfo={wineInfo} />
      
      {imageUrl && (
        <div className="text-sm text-muted-foreground mt-2 animate-fade-up">
          <p>The image will be downloaded with the text overlay as shown in the preview.</p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
