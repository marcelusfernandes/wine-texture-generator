
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WineInfo } from './TextInputs';
import WineCard from './WineCard';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  imageUrl: string | null;
  wineInfo: WineInfo;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  imageUrl, 
  wineInfo, 
  className 
}) => {
  // Use imageUrl as primary source, fall back to wineInfo.imageUrl
  const effectiveImageUrl = imageUrl || wineInfo.imageUrl || null;
  
  console.log("ImagePreview using URL:", effectiveImageUrl);

  const handleDownload = () => {
    if (!effectiveImageUrl) return;
    
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
          disabled={!effectiveImageUrl}
          size="sm"
          className="gap-2"
        >
          <Download size={16} />
          Download Image
        </Button>
      </div>
      
      <WineCard imageUrl={effectiveImageUrl} wineInfo={wineInfo} />
      
      {effectiveImageUrl && (
        <div className="text-sm text-muted-foreground mt-2 animate-fade-up">
          <p>The image will be downloaded with the text overlay as shown in the preview.</p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
