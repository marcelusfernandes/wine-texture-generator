
import React from "react";
import { Image } from "lucide-react";

interface WineImageDisplayProps {
  imageUrl: string | null;
  alt: string;
}

const WineImageDisplay: React.FC<WineImageDisplayProps> = ({ 
  imageUrl, 
  alt 
}) => {
  return (
    <div className="flex items-center text-xs text-muted-foreground">
      <Image className="h-4 w-4 mr-2 text-muted-foreground" />
      <span className="truncate max-w-[150px]" title={imageUrl || 'Sem URL'}>
        {imageUrl || 'Sem URL'}
      </span>
    </div>
  );
};

export default WineImageDisplay;
